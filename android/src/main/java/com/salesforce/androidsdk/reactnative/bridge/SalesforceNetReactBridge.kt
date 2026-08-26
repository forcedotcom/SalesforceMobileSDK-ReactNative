/*
 * Copyright (c) 2015-present, salesforce.com, inc.
 * All rights reserved.
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * - Neither the name of salesforce.com, inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission of salesforce.com, inc.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
package com.salesforce.androidsdk.reactnative.bridge

import android.util.Base64
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.salesforce.androidsdk.app.SalesforceSDKManager
import com.salesforce.androidsdk.reactnative.ui.SalesforceReactActivity
import com.salesforce.androidsdk.reactnative.util.SalesforceReactLogger
import com.salesforce.androidsdk.rest.RestClient
import com.salesforce.androidsdk.rest.RestRequest
import com.salesforce.androidsdk.rest.RestResponse
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.net.URI
import java.net.URLEncoder

open class SalesforceNetReactBridge(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), TurboModule {

    companion object {
        private const val METHOD_KEY = "method"
        private const val END_POINT_KEY = "endPoint"
        private const val PATH_KEY = "path"
        private const val QUERY_PARAMS_KEY = "queryParams"
        private const val HEADER_PARAMS_KEY = "headerParams"
        private const val FILE_PARAMS_KEY = "fileParams"
        private const val FILE_MIME_TYPE_KEY = "fileMimeType"
        private const val FILE_URL_KEY = "fileUrl"
        private const val FILE_NAME_KEY = "fileName"
        private const val RETURN_BINARY = "returnBinary"
        private const val ENCODED_BODY = "encodedBody"
        private const val CONTENT_TYPE = "contentType"
        private const val DOES_NOT_REQUIRE_AUTHENTICATION = "doesNotRequireAuthentication"
        private const val TAG = "SFNetReactBridge"
    }

    override fun getName(): String = TAG

    @ReactMethod
    fun sendRequest(args: ReadableMap, callback: Callback) {
        sendRequestWithRetry(args, callback, 5)
    }

    private fun sendRequestWithRetry(args: ReadableMap, callback: Callback, retries: Int) {
        try {
            // Prepare request
            val request = prepareRestRequest(args)
            val returnBinary = args.hasKey(RETURN_BINARY) && args.getBoolean(RETURN_BINARY)
            val doesNotRequireAuth = args.hasKey(DOES_NOT_REQUIRE_AUTHENTICATION)
                    && args.getBoolean(DOES_NOT_REQUIRE_AUTHENTICATION)

            // Sending request
            val restClient = getRestClient(doesNotRequireAuth)
            if (restClient == null) {
                if (retries > 0) {
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        sendRequestWithRetry(args, callback, retries - 1)
                    }, 500)
                    return
                } else {
                    ReactBridgeHelper.invokeError(callback, "SalesforceReactActivity not found")
                    return
                }
            }
            restClient.sendAsync(request, object : RestClient.AsyncRequestCallback {

                override fun onSuccess(request: RestRequest, response: RestResponse) {
                    try {
                        // Not a 2xx status
                        if (!response.isSuccess) {
                            val responseObject = JSONObject()
                            responseObject.put("headers", JSONObject(response.allHeaders))
                            responseObject.put("statusCode", response.statusCode)
                            responseObject.put("body", parsedResponse(response))
                            val errorObject = JSONObject()
                            errorObject.put("response", responseObject)
                            ReactBridgeHelper.invokeError(callback, errorObject.toString())
                        }
                        // Binary response
                        else if (returnBinary) {
                            val result = JSONObject()
                            result.put(CONTENT_TYPE, response.contentType)
                            result.put(ENCODED_BODY, Base64.encodeToString(response.asBytes(), Base64.DEFAULT))
                            ReactBridgeHelper.invokeSuccess(callback, result)
                        }
                        // Other cases
                        else {
                            callback.invoke(null, response.asString())
                        }
                    } catch (e: Exception) {
                        SalesforceReactLogger.e(TAG, "sendRequest failed", e)
                        onError(e)
                    }
                }

                override fun onError(exception: Exception) {
                    val errorObject = JSONObject()
                    try {
                        errorObject.put("error", exception.message)
                    } catch (jsonException: JSONException) {
                        SalesforceReactLogger.e(TAG, "Error creating error object", jsonException)
                    }
                    ReactBridgeHelper.invokeError(callback, errorObject.toString())
                }
            })
        } catch (exception: Exception) {
            val errorObject = JSONObject()
            try {
                errorObject.put("error", exception.message)
            } catch (jsonException: JSONException) {
                SalesforceReactLogger.e(TAG, "Error creating error object", jsonException)
            }
            ReactBridgeHelper.invokeError(callback, errorObject.toString())
        }
    }

    @Throws(IOException::class)
    private fun parsedResponse(response: RestResponse): Any {
        // Is it a JSONObject?
        val responseAsJSONObject = parseResponseAsJSONObject(response)
        if (responseAsJSONObject != null) {
            return responseAsJSONObject
        }

        // Is it a JSONArray?
        val responseAsJSONArray = parseResponseAsJSONArray(response)
        if (responseAsJSONArray != null) {
            return responseAsJSONArray
        }

        // Otherwise return as string
        return response.asString()
    }

    @Throws(IOException::class)
    private fun parseResponseAsJSONObject(response: RestResponse): JSONObject? {
        return try {
            response.asJSONObject()
        } catch (e: JSONException) {
            null
        }
    }

    @Throws(IOException::class)
    private fun parseResponseAsJSONArray(response: RestResponse): JSONArray? {
        return try {
            response.asJSONArray()
        } catch (e: JSONException) {
            null
        }
    }

    private fun prepareRestRequest(args: ReadableMap): RestRequest {
        // Parse args
        val method = RestRequest.RestMethod.valueOf(args.getString(METHOD_KEY)!!)
        val endPoint = if (!args.hasKey(END_POINT_KEY) || args.isNull(END_POINT_KEY)) "" else args.getString(END_POINT_KEY)!!
        val path = args.getString(PATH_KEY)!!
        val queryParams = args.getMap(QUERY_PARAMS_KEY)!!
        val headerParams = args.getMap(HEADER_PARAMS_KEY)!!
        val fileParams = args.getMap(FILE_PARAMS_KEY)!!

        // Preparing request
        val additionalHeaders = ReactBridgeHelper.toJavaStringStringMap(headerParams)
        val queryParamsMap = ReactBridgeHelper.toJavaMap(queryParams)
        val fileParamsMap = ReactBridgeHelper.toJavaStringMapMap(fileParams)
        var urlParams = ""
        var requestBody: RequestBody? = null
        if (method == RestRequest.RestMethod.DELETE || method == RestRequest.RestMethod.GET
            || method == RestRequest.RestMethod.HEAD) {
            urlParams = buildQueryString(queryParamsMap)
        } else {
            requestBody = buildRequestBody(queryParamsMap, fileParamsMap)
        }
        val separator = if (urlParams.isEmpty()) {
            ""
        } else if (path.contains("?")) {
            if (path.endsWith("&")) "" else "&"
        } else {
            "?"
        }
        return RestRequest(method, endPoint + path + separator + urlParams, requestBody, additionalHeaders)
    }

    /**
     * Returns the RestClient instance being used by this bridge.
     *
     * @param doesNotRequireAuth True - if an unauthenticated client should be used, False - otherwise.
     * @return RestClient instance.
     */
    protected open fun getRestClient(doesNotRequireAuth: Boolean): RestClient? {
        val currentActivity = getCurrentActivity() as? SalesforceReactActivity ?: return null
        return if (doesNotRequireAuth) {
            SalesforceSDKManager.getInstance().getUnauthenticatedRestClient()
        } else {
            currentActivity.restClient
        }
    }

    private fun buildQueryString(params: Map<String, Any?>): String {
        val sb = StringBuilder()
        for ((key, value) in params) {
            sb.append(key)
                .append("=")
                .append(URLEncoder.encode(value.toString(), RestRequest.UTF_8))
                .append("&")
        }
        return sb.toString()
    }

    private fun buildRequestBody(params: Map<String, Any?>, fileParams: Map<String, Map<String, String>>): RequestBody {
        val paramsRequestBody = JSONObject(params).toString()
            .toRequestBody(RestRequest.MEDIA_TYPE_JSON)
        if (fileParams.isEmpty()) {
            return paramsRequestBody
        } else {
            val builder = MultipartBody.Builder().setType(MultipartBody.FORM)
            builder.addFormDataPart("", null, paramsRequestBody)

            // File params expected to be of the form:
            // {<fileParamNameInPost>: {fileMimeType:<someMimeType>, fileUrl:<fileUrl>, fileName:<fileNameForPost>}}
            for ((fileParamName, fileParam) in fileParams) {
                val mimeType = fileParam[FILE_MIME_TYPE_KEY]!!
                val name = fileParam[FILE_NAME_KEY]!!
                val url = URI(fileParam[FILE_URL_KEY]!!)
                val file = File(url)
                val mediaType = mimeType.toMediaType()
                builder.addFormDataPart(fileParamName, name, file.asRequestBody(mediaType))
            }
            return builder.build()
        }
    }
}
