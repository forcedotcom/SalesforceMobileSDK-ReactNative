/*
 * Copyright (c) 2015-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { NativeModules } from "react-native";
import { exec as forceExec, ExecErrorCallback, ExecSuccessCallback } from "./react.force.common";
import { sdkConsole } from "./react.force.log";
import { HttpMethod } from "./typings";
const { SalesforceNetReactBridge, SFNetReactBridge } = NativeModules;

var  apiVersion = 'v55.0';

/**
 * Set apiVersion to be used
 */
export const setApiVersion = (version: string): void => {
  apiVersion = version;
};

/**
 * Return apiVersion used
 */
export const getApiVersion = (): string => apiVersion;

/**
 * Send arbitray force.com request
 */
export const sendRequest = <T>(
  endPoint: string,
  path: string,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
  method?: HttpMethod,
  payload?: Record<string, unknown> | null,
  headerParams?: Record<string, unknown> | null,
  fileParams?: unknown,
  returnBinary?: boolean,
  doesNotRequireAuthentication?: boolean,
): void => {
  method = method || "GET";
  payload = payload || {};
  headerParams = headerParams || {};
  fileParams = fileParams || {}; // File params expected to be of the form: {<fileParamNameInPost>: {fileMimeType:<someMimeType>, fileUrl:<fileUrl>, fileName:<fileNameForPost>}}
  returnBinary = !!returnBinary;
  doesNotRequireAuthentication = !!doesNotRequireAuthentication;
  const args = {
    endPoint,
    path,
    method,
    queryParams: payload,
    headerParams,
    fileParams,
    returnBinary,
    doesNotRequireAuthentication,
  };
  forceExec(
    "SFNetReactBridge",
    "SalesforceNetReactBridge",
    SFNetReactBridge,
    SalesforceNetReactBridge,
    successCB,
    errorCB,
    "sendRequest",
    args,
  );
};

/**
 * Lists summary information about each Salesforce.com version currently
 * available, including the version, label, and a link to each version's
 * root.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const versions = <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", "/", successCB, errorCB);

/**
 * Lists available resources for the client's API version, including
 * resource name and URI.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const resources = <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", `/${apiVersion}/`, successCB, errorCB);

/**
 * Lists the available objects and their metadata for your organization's
 * data.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const describeGlobal = <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", `/${apiVersion}/sobjects/`, successCB, errorCB);

/**
 * Describes the individual metadata for the specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const metadata = <T>(objtype: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", `/${apiVersion}/sobjects/${objtype}/`, successCB, errorCB);

/**
 * Completely describes the individual metadata at all levels for the
 * specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const describe = <T>(objtype: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", `/${apiVersion}/sobjects/${objtype}/describe/`, successCB, errorCB);

/**
 * Fetches the layout configuration for a particular sobject type and record type id.
 * @param objtype object type; e.g. "Account"
 * @param (Optional) recordTypeId Id of the layout's associated record type
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const describeLayout = <T>(
  objtype: string,
  recordTypeId: string,
  // todo: add describe typings
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => {
  recordTypeId = recordTypeId ? recordTypeId : "";
  return sendRequest(
    "/services/data",
    `/${apiVersion}/sobjects/${objtype}/describe/layouts/${recordTypeId}`,
    successCB,
    errorCB,
  );
};

/**
 * Creates a new record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param fields an object containing initial field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const create = <T>(
  objtype: string,
  fields: Record<string, unknown>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/sobjects/${objtype}/`, successCB, errorCB, "POST", fields);


type RetrieveOverload = {
  <T>(
    objtype: string,
    id: string,
    fieldlist: string[],
    successCB: ExecSuccessCallback<T>,
    errorCB: ExecErrorCallback,
  ): void;
  <T>(objtype: string, id: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
};

/**
 * Retrieves field values for a record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param [fields=null] list of fields for which
 *               to return values; e.g. Name,Industry,TickerSymbol
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const retrieve: RetrieveOverload = <T>(
  objtype: string,
  id: string,
  x: string[] | ExecSuccessCallback<T>,
  y: ExecSuccessCallback<T> | ExecErrorCallback,
  z?: ExecErrorCallback,
): void => {
  let fieldlist;
  let successCB: ExecSuccessCallback<T>;
  let errorCB: ExecErrorCallback;

  if (typeof x === "function") {
    fieldlist = null;
    successCB = x as ExecSuccessCallback<T>;
    errorCB = y as ExecErrorCallback;
  } else {
    fieldlist = x;
    successCB = y as ExecSuccessCallback<T>;
    errorCB = z as ExecErrorCallback;
  }

  const fields = fieldlist ? { fields: fieldlist } : null;
  return sendRequest("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "GET", fields);
};

/**
 * Upsert - creates or updates record of the given type, based on the
 * given external Id.
 * @param objtype object type; e.g. "Account"
 * @param externalIdField external ID field name; e.g. "accountMaster__c"
 * @param externalId the record's external ID value
 * @param fields an object containing field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const upsert = <T>(
  objtype: string,
  externalIdField: string,
  externalId: string,
  fields: Record<string, unknown>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void =>
  sendRequest(
    "/services/data",
    `/${apiVersion}/sobjects/${objtype}/${externalIdField}/${externalId ? externalId : ""}`,
    successCB,
    errorCB,
    externalId ? "PATCH" : "POST",
    fields,
  );

/**
 * Updates field values on a record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param fields an object containing initial field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const update = <T>(
  objtype: string,
  id: string,
  fields: Record<string, unknown>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void =>
  sendRequest("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "PATCH", fields);

/**
 * Deletes a record of the given type. Unfortunately, 'delete' is a
 * reserved word in JavaScript.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const del = <T>(
  objtype: string,
  id: string,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "DELETE");

/**
 * Executes the specified SOQL query.
 * @param soql a string containing the query to execute - e.g. "SELECT Id,
 *             Name from Account ORDER BY Name LIMIT 20"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const query = <T>(soql: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", `/${apiVersion}/query`, successCB, errorCB, "GET", { q: soql });

/**
 * Queries the next set of records based on pagination.
 * <p>This should be used if performing a query that retrieves more than can be returned
 * in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm</p>

 * @param url - the url retrieved from nextRecordsUrl or prevRecordsUrl
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const queryMore = <T>(url: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void => {
  const pathFromUrl = url.match(/https:\/\/[^/]*(.*)/);
  if (pathFromUrl && pathFromUrl.length === 2) {
    return sendRequest("", pathFromUrl[1], successCB, errorCB);
  } else {
    sdkConsole.error(`queryMore failed: url must be a valid`);
  }
};

/**
 * Executes the specified SOSL search.
 * @param sosl a string containing the search to execute - e.g. "FIND
 *             {needle}"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const search = <T>(sosl: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void =>
  sendRequest("/services/data", `/${apiVersion}/search`, successCB, errorCB, "GET", { q: sosl });

/**
 * Convenience function to retrieve an attachment
 * @param id
 * @param callback function to which response will be passed (attachment is returned as {encodedBody:"base64-encoded-response", contentType:"content-type"})
 * @param [error=null] function called in case of error
 */
export const getAttachment = <T>(
  id: string,
  // todo: add attachment typings
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void =>
  sendRequest(
    "/services/data",
    `/${apiVersion}/sobjects/Attachment/${id}/Body`,
    successCB,
    errorCB,
    "GET",
    null,
    null,
    null,
    true /* return binary */,
  );

/**
 * Creates up to 2000 new records in one roundtrip to the server.
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const collectionCreate = <T>(
  allOrNone: boolean,
  records: Array<Record<string, unknown>>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "POST", {allOrNone: allOrNone, records: records});

/**
 * Updates up to 200 records in one roundtrip to the server.
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const collectionUpdate= <T>(
  allOrNone: boolean,
  records: Array<Record<string, unknown>>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "PATCH", {allOrNone: allOrNone, records: records});

/**
 * Upserts up to 200 records in one roundtrip to the server.
 * @param objectType object type; e.g. "Account"
 * @param externalIdField  name of ID field in source data
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const collectionUpsert = <T>(
  allOrNone: boolean,
  objectType: string,
  externalIdField: string,
  records: Array<Record<string, unknown>>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/composite/sobjects/${objectType}/${externalIdField}`, successCB, errorCB, "PATCH", {allOrNone: allOrNone, records: records});

/**
 * Retrieves up to 2000 records in one roundtrip to the server.
 * @param objectType object type; e.g. "Account"
 * @param ids the ids of records to retrieve
 * @param fields list of fields for which to return values; e.g. ["Name", "Industry"]
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const collectionRetrieve = <T>(
  objectType: string,
  ids: Array<string>,
  fields: Array<string>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/composite/sobjects/${objectType}`, successCB, errorCB, "POST", {ids: ids, fields: fields});

/**
 * Delete up to 200 records in one roundtrip to the server.
 * @param ids the ids of records to delete
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export const collectionDelete = <T>(
  ids: Array<string>,
  successCB: ExecSuccessCallback<T>,
  errorCB: ExecErrorCallback,
): void => sendRequest("/services/data", `/${apiVersion}/composite/sobjects?ids=${ids.join(',')}`, successCB, errorCB, "DELETE");

