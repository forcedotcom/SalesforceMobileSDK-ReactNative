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
package com.salesforce.androidsdk.reactnative.bridge;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReactBridgeHelper  {

    /**
     * Invokes callback with success result using single-callback pattern: callback(null, result)
     */
    public static void invokeSuccess(Callback callback, JSONObject json) {
        callback.invoke(null, json == null ? null : json.toString());
    }

    public static void invokeSuccess(Callback callback, JSONArray json) {
        callback.invoke(null, json == null ? null : json.toString());
    }

    public static void invokeSuccess(Callback callback, String value) {
        callback.invoke(null, "\"" + value + "\"");
    }

    public static void invokeSuccess(Callback callback, boolean value) {
        callback.invoke(null, "" + value);
    }

    public static void invokeSuccess(Callback callback, int value) {
        callback.invoke(null, "" + value);
    }

    /**
     * Invokes callback with no result (void success): callback(null)
     */
    public static void invokeSuccess(Callback callback) {
        callback.invoke(null, "null");
    }

    /**
     * Invokes callback with error: callback(errorMessage)
     */
    public static void invokeError(Callback callback, String error) {
        callback.invoke(error);
    }

    public static Map<String, Object> toJavaMap(ReadableMap map) {
        Map<String, Object> result = new HashMap<>();
        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (map.getType(key)) {
                case Null:
                    result.put(key, null);
                    break;
                case Boolean:
                    result.put(key, map.getBoolean(key));
                    break;
                case Number:
                    result.put(key, map.getDouble(key));
                    break;
                case String:
                    result.put(key, map.getString(key));
                    break;
                case Map:
                    result.put(key, toJavaMap(map.getMap(key)));
                    break;
                case Array:
                    result.put(key, toJavaList(map.getArray(key)));
                    break;
            }
        }
        return result;
    }

    public static Map<String, String> toJavaStringStringMap(ReadableMap map) {
        Map<String, String> result = new HashMap<>();
        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (map.getType(key)) {
                case String:
                    result.put(key, map.getString(key));
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    public static Map<String,Map<String,String>> toJavaStringMapMap(ReadableMap map) {
        Map<String, Map<String, String>> result = new HashMap<>();
        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (map.getType(key)) {
                case Map:
                    result.put(key, toJavaStringStringMap(map.getMap(key)));
                    break;
                default:
                    break;
            }
        }
        return result;
    }


    public static List<String> toJavaStringList(ReadableArray array) {
        List<String> result = new ArrayList<>();
        for (int i = 0; i<array.size(); i++) {
            switch (array.getType(i)) {
                case String:
                    result.add(i, array.getString(i));
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    public static List<Object> toJavaList(ReadableArray array) {
        List<Object> result = new ArrayList<>();
        if (array == null) return result;
        for (int i = 0; i<array.size(); i++) {
            switch (array.getType(i)) {
                case Null:
                    result.add(i, null);
                    break;
                case Boolean:
                    result.add(i, array.getBoolean(i));
                    break;
                case Number:
                    result.add(i, array.getDouble(i));
                    break;
                case String:
                    result.add(i, array.getString(i));
                    break;
                case Map:
                    result.add(i, toJavaMap(array.getMap(i)));
                    break;
                case Array:
                    result.add(i, toJavaList(array.getArray(i)));
                    break;
            }
        }
        return result;
    }


}
