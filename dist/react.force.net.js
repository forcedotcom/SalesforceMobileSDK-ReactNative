"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttachment = exports.search = exports.queryMore = exports.query = exports.del = exports.update = exports.upsert = exports.retrieve = exports.collectionCreate = exports.create = exports.describeLayout = exports.describe = exports.metadata = exports.describeGlobal = exports.resources = exports.versions = exports.sendRequest = exports.getApiVersion = exports.setApiVersion = void 0;
const react_native_1 = require("react-native");
const react_force_common_1 = require("./react.force.common");
const react_force_log_1 = require("./react.force.log");
const { SalesforceNetReactBridge, SFNetReactBridge } = react_native_1.NativeModules;
var apiVersion = 'v55.0';
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
const collectionCreate = (allOrNone, records, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/composite/sobjects`, successCB, errorCB, "POST", { allOrNone: allOrNone, records: records });
exports.collectionCreate = collectionCreate;
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
        react_force_log_1.sdkConsole.error(`queryMore failed: url must be a valid`);
    }
};
exports.queryMore = queryMore;
const search = (sosl, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/search`, successCB, errorCB, "GET", { q: sosl });
exports.search = search;
const getAttachment = (id, successCB, errorCB) => (0, exports.sendRequest)("/services/data", `/${apiVersion}/sobjects/Attachment/${id}/Body`, successCB, errorCB, "GET", null, null, null, true);
exports.getAttachment = getAttachment;
//# sourceMappingURL=react.force.net.js.map