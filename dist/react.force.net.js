"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionDelete = exports.collectionRetrieve = exports.collectionUpsert = exports.collectionUpdate = exports.collectionCreate = exports.getAttachment = exports.search = exports.queryMore = exports.query = exports.del = exports.update = exports.upsert = exports.retrieve = exports.create = exports.describeLayout = exports.describe = exports.metadata = exports.describeGlobal = exports.resources = exports.versions = exports.sendRequest = exports.getApiVersion = exports.setApiVersion = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
const { SalesforceNetReactBridge, SFNetReactBridge } = react_native_1.NativeModules;
var apiVersion = 'v59.0';
const setApiVersion = (version) => {
    apiVersion = version;
};
exports.setApiVersion = setApiVersion;
const getApiVersion = () => apiVersion;
exports.getApiVersion = getApiVersion;
const sendRequest = (endPoint, path, successCB, errorCB, method, payload, headerParams, fileParams, returnBinary, doesNotRequireAuthentication) => {
    method = method || "GET";
    payload = payload || {};
    headerParams = headerParams || {};
    fileParams = fileParams || {};
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
    (0, react_force_common_1.exec)("SFNetReactBridge", "SalesforceNetReactBridge", SFNetReactBridge, SalesforceNetReactBridge, successCB, errorCB, "sendRequest", args);
};
exports.sendRequest = sendRequest;
const versions = (successCB, errorCB) => (0, exports.sendRequest)("/services/data", "/", successCB, errorCB);
exports.versions = versions;
const resources = (successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/`, successCB, errorCB);
exports.resources = resources;
const describeGlobal = (successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/`, successCB, errorCB);
exports.describeGlobal = describeGlobal;
const metadata = (objtype, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/`, successCB, errorCB);
exports.metadata = metadata;
const describe = (objtype, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/describe/`, successCB, errorCB);
exports.describe = describe;
const describeLayout = (objtype, recordTypeId, successCB, errorCB) => {
    recordTypeId = recordTypeId ? recordTypeId : "";
    return (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/describe/layouts/${recordTypeId}`, successCB, errorCB);
};
exports.describeLayout = describeLayout;
const create = (objtype, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/`, successCB, errorCB, "POST", fields);
exports.create = create;
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
    const fields = fieldlist ? { fields: fieldlist } : null;
    return (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "GET", fields);
};
exports.retrieve = retrieve;
const upsert = (objtype, externalIdField, externalId, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${externalIdField}/${externalId ? externalId : ""}`, successCB, errorCB, externalId ? "PATCH" : "POST", fields);
exports.upsert = upsert;
const update = (objtype, id, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "PATCH", fields);
exports.update = update;
const del = (objtype, id, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/${objtype}/${id}`, successCB, errorCB, "DELETE");
exports.del = del;
const query = (soql, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/query`, successCB, errorCB, "GET", { q: soql });
exports.query = query;
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
const search = (sosl, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/search`, successCB, errorCB, "GET", { q: sosl });
exports.search = search;
const getAttachment = (id, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/Attachment/${id}/Body`, successCB, errorCB, "GET", null, null, null, true);
exports.getAttachment = getAttachment;
const collectionCreate = (allOrNone, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "POST", { allOrNone: allOrNone, records: records });
exports.collectionCreate = collectionCreate;
const collectionUpdate = (allOrNone, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "PATCH", { allOrNone: allOrNone, records: records });
exports.collectionUpdate = collectionUpdate;
const collectionUpsert = (allOrNone, objectType, externalIdField, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects/${objectType}/${externalIdField}`, successCB, errorCB, "PATCH", { allOrNone: allOrNone, records: records });
exports.collectionUpsert = collectionUpsert;
const collectionRetrieve = (objectType, ids, fields, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects/${objectType}`, successCB, errorCB, "POST", { ids: ids, fields: fields });
exports.collectionRetrieve = collectionRetrieve;
const collectionDelete = (allOrNone, ids, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects?allOrNone=${allOrNone}&ids=${ids.join(',')}`, successCB, errorCB, "DELETE");
exports.collectionDelete = collectionDelete;
//# sourceMappingURL=react.force.net.js.map