"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionDelete = exports.collectionRetrieve = exports.collectionUpsert = exports.collectionUpdate = exports.collectionCreate = exports.getAttachment = exports.search = exports.queryMore = exports.query = exports.del = exports.update = exports.upsert = exports.retrieve = exports.create = exports.describeLayout = exports.describe = exports.metadata = exports.describeGlobal = exports.resources = exports.versions = exports.sendRequest = exports.getApiVersion = exports.setApiVersion = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
// New architecture: TurboModuleRegistry first, fall back to NativeModules.
// Lazy lookup - bridgeless mode doesn't have modules ready at import time.
const getSFNetReactBridge = () => react_native_1.TurboModuleRegistry.get("SFNetReactBridge") ?? react_native_1.NativeModules.SFNetReactBridge;
const getSalesforceNetReactBridge = () => react_native_1.TurboModuleRegistry.get("SalesforceNetReactBridge") ??
    react_native_1.NativeModules.SalesforceNetReactBridge;
var apiVersion = 'v66.0';
/**
 * Set apiVersion to be used
 */
const setApiVersion = (version) => {
    apiVersion = version;
};
exports.setApiVersion = setApiVersion;
/**
 * Return apiVersion used
 */
const getApiVersion = () => apiVersion;
exports.getApiVersion = getApiVersion;
/**
 * Send arbitray force.com request
 */
const sendRequest = (endPoint, path, successCB, errorCB, method, payload, headerParams, fileParams, returnBinary, doesNotRequireAuthentication) => {
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
    (0, react_force_common_1.exec)("SFNetReactBridge", "SalesforceNetReactBridge", getSFNetReactBridge(), getSalesforceNetReactBridge(), successCB, errorCB, "sendRequest", args);
};
exports.sendRequest = sendRequest;
/**
 * Lists summary information about each Salesforce.com version currently
 * available, including the version, label, and a link to each version's
 * root.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const versions = (successCB, errorCB) => (0, exports.sendRequest)("/services/data", "/", successCB, errorCB);
exports.versions = versions;
/**
 * Lists available resources for the client's API version, including
 * resource name and URI.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const resources = (successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/`, successCB, errorCB);
exports.resources = resources;
/**
 * Lists the available objects and their metadata for your organization's
 * data.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const describeGlobal = (successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/`, successCB, errorCB);
exports.describeGlobal = describeGlobal;
/**
 * Describes the individual metadata for the specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const metadata = (objtype, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/`, successCB, errorCB);
exports.metadata = metadata;
/**
 * Completely describes the individual metadata at all levels for the
 * specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const describe = (objtype, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/describe/`, successCB, errorCB);
exports.describe = describe;
/**
 * Fetches the layout configuration for a particular sobject type and record type id.
 * @param objtype object type; e.g. "Account"
 * @param (Optional) recordTypeId Id of the layout's associated record type
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const describeLayout = (objtype, recordTypeId, 
// todo: add describe typings
successCB, errorCB) => {
    recordTypeId = recordTypeId ? recordTypeId : "";
    return (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/describe/layouts/${recordTypeId}`, successCB, errorCB);
};
exports.describeLayout = describeLayout;
/**
 * Creates a new record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param fields an object containing initial field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const create = (objtype, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/`, successCB, errorCB, "POST", fields);
exports.create = create;
/**
 * Retrieves field values for a record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param [fields=null] list of fields for which
 *               to return values; e.g. Name,Industry,TickerSymbol
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const retrieve = (objtype, id, x, y, z) => {
    let fieldlist;
    let successCB;
    let errorCB;
    if (typeof x === "function") {
        fieldlist = null;
        successCB = x;
        errorCB = y;
    }
    else {
        fieldlist = x;
        successCB = y;
        errorCB = z;
    }
    // The REST API expects fields as a comma-separated string (e.g. "Name,Industry").
    // Passing a raw string[] across the native bridge produces "[Name, Industry]" on
    // Android (ArrayList.toString) or similar on iOS, both rejected by Salesforce.
    // Join here so the documented string[] signature actually works; a pre-joined string
    // is passed through unchanged for backward compatibility.
    const fieldsValue = Array.isArray(fieldlist) ? fieldlist.join(",") : fieldlist;
    const fields = fieldsValue ? { fields: fieldsValue } : null;
    return (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "GET", fields);
};
exports.retrieve = retrieve;
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
const upsert = (objtype, externalIdField, externalId, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${externalIdField}/${externalId ? externalId : ""}`, successCB, errorCB, externalId ? "PATCH" : "POST", fields);
exports.upsert = upsert;
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
const update = (objtype, id, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "PATCH", fields);
exports.update = update;
/**
 * Deletes a record of the given type. Unfortunately, 'delete' is a
 * reserved word in JavaScript.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const del = (objtype, id, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "DELETE");
exports.del = del;
/**
 * Executes the specified SOQL query.
 * @param soql a string containing the query to execute - e.g. "SELECT Id,
 *             Name from Account ORDER BY Name LIMIT 20"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const query = (soql, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/query`, successCB, errorCB, "GET", { q: soql });
exports.query = query;
/**
 * Queries the next set of records based on pagination.
 * <p>This should be used if performing a query that retrieves more than can be returned
 * in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm</p>

 * @param url - the url retrieved from nextRecordsUrl or prevRecordsUrl
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const queryMore = (url, successCB, errorCB) => {
    const pathFromUrl = url.match(/https:\/\/[^/]*(.*)/);
    if (pathFromUrl && pathFromUrl.length === 2) {
        return (0, exports.sendRequest)("", pathFromUrl[1], successCB, errorCB);
    }
    else {
        return (0, exports.sendRequest)("", url, successCB, errorCB);
    }
};
exports.queryMore = queryMore;
/**
 * Executes the specified SOSL search.
 * @param sosl a string containing the search to execute - e.g. "FIND
 *             {needle}"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const search = (sosl, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/search`, successCB, errorCB, "GET", { q: sosl });
exports.search = search;
/**
 * Convenience function to retrieve an attachment
 * @param id
 * @param callback function to which response will be passed (attachment is returned as {encodedBody:"base64-encoded-response", contentType:"content-type"})
 * @param [error=null] function called in case of error
 */
const getAttachment = (id, 
// todo: add attachment typings
successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/Attachment/${id}/Body`, successCB, errorCB, "GET", null, null, null, true /* return binary */);
exports.getAttachment = getAttachment;
/**
 * Creates up to 2000 new records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const collectionCreate = (allOrNone, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "POST", { allOrNone: allOrNone, records: records });
exports.collectionCreate = collectionCreate;
/**
 * Updates up to 200 records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const collectionUpdate = (allOrNone, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "PATCH", { allOrNone: allOrNone, records: records });
exports.collectionUpdate = collectionUpdate;
/**
 * Upserts up to 200 records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param objectType object type; e.g. "Account"
 * @param externalIdField  name of ID field in source data
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const collectionUpsert = (allOrNone, objectType, externalIdField, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects/${objectType}/${externalIdField}`, successCB, errorCB, "PATCH", { allOrNone: allOrNone, records: records });
exports.collectionUpsert = collectionUpsert;
/**
 * Retrieves up to 2000 records in one roundtrip to the server.
 * @param objectType object type; e.g. "Account"
 * @param ids the ids of records to retrieve
 * @param fields list of fields for which to return values; e.g. ["Name", "Industry"]
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const collectionRetrieve = (objectType, ids, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects/${objectType}`, successCB, errorCB, "POST", { ids: ids, fields: fields });
exports.collectionRetrieve = collectionRetrieve;
/**
 * Delete up to 200 records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param ids the ids of records to delete
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
const collectionDelete = (allOrNone, ids, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects?allOrNone=${allOrNone}&ids=${ids.join(',')}`, successCB, errorCB, "DELETE");
exports.collectionDelete = collectionDelete;
//# sourceMappingURL=react.force.net.js.map