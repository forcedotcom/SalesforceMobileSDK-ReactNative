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

'use strict';

var { SalesforceNetReactBridge, SFNetReactBridge } = require('react-native').NativeModules;
var forceCommon = require('./react.force.common.js');

var apiVersion = 'v36.0';

/**
 * Set apiVersion to be used
 */
var setApiVersion = function(version) {
    apiVersion = version;
}

/**
 * Return apiVersion used
 */
var getApiVersion = function() {
    return apiVersion;
}

/** 
 * Send arbitray force.com request
 */
var sendRequest = function(endPoint, path, successCB, errorCB, method, payload, headerParams, fileParams) {
    method = method || "GET";
    payload = payload || {};
    headerParams = headerParams || {};
    // File params expected to be of the form:
    // {<fileParamNameInPost>: {fileMimeType:<someMimeType>, fileUrl:<fileUrl>, fileName:<fileNameForPost>}}
    fileParams = fileParams || {}; 
    var args = {endPoint: endPoint, path:path, method:method, queryParams:payload, headerParams:headerParams, fileParams: fileParams};
    forceCommon.exec("SFNetReactBridge", "SalesforceNetReactBridge", SFNetReactBridge, SalesforceNetReactBridge, successCB, errorCB, "sendRequest", args);
};


/*
 * Lists summary information about each Salesforce.com version currently
 * available, including the version, label, and a link to each version's
 * root.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var versions = function(callback, error) {
    return sendRequest('/services/data', '/', callback, error);
};

/*
 * Lists available resources for the client's API version, including
 * resource name and URI.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var resources = function(callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/', callback, error);
};

/*
 * Lists the available objects and their metadata for your organization's
 * data.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var describeGlobal = function(callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/', callback, error);
};

/*
 * Describes the individual metadata for the specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var metadata = function(objtype, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype + '/'
                       , callback, error);
};

/*
 * Completely describes the individual metadata at all levels for the
 * specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var describe = function(objtype, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype
                       + '/describe/', callback, error);
};

/*
 * Fetches the layout configuration for a particular sobject type and record type id.
 * @param objtype object type; e.g. "Account"
 * @param (Optional) recordTypeId Id of the layout's associated record type
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var describeLayout = function(objtype, recordTypeId, callback, error) {
    recordTypeId = recordTypeId ? recordTypeId : '';
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype
                       + '/describe/layouts/' + recordTypeId, callback, error);
};

/*
 * Creates a new record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param fields an object containing initial field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var create = function(objtype, fields, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype + '/'
                       , callback, error, "POST", fields);
};

/*
 * Retrieves field values for a record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param [fields=null] optional comma-separated list of fields for which
 *               to return values; e.g. Name,Industry,TickerSymbol
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var retrieve = function(objtype, id, fieldlist, callback, error) {
    if (arguments.length == 4) {
        error = callback;
        callback = fieldlist;
        fieldlist = null;
    }
    var fields = fieldlist ? {fields:fieldlist} : null;
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype + '/' + id
                       , callback, error, 'GET', fields);
};

/*
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
var upsert = function(objtype, externalIdField, externalId, fields, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype + '/' + externalIdField + '/' + externalId
                       , callback, error, "PATCH", fields);
};

/*
 * Updates field values on a record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param fields an object containing initial field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var update = function(objtype, id, fields, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype + '/' + id
                       , callback, error, "PATCH", fields);
};

/*
 * Deletes a record of the given type. Unfortunately, 'delete' is a
 * reserved word in JavaScript.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var del = function(objtype, id, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/sobjects/' + objtype + '/' + id
                       , callback, error, "DELETE");
};

/*
 * Executes the specified SOQL query.
 * @param soql a string containing the query to execute - e.g. "SELECT Id,
 *             Name from Account ORDER BY Name LIMIT 20"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var query = function(soql, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/query'
                       , callback, error, 'GET', {q: soql});
};

/*
 * Queries the next set of records based on pagination.
 * <p>This should be used if performing a query that retrieves more than can be returned
 * in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm</p>

 * @param url - the url retrieved from nextRecordsUrl or prevRecordsUrl
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var queryMore = function( url, callback, error ){
    var pathFromUrl = url.match(/https:\/\/[^/]*(.*)/)[1];
    return sendRequest('',  pathFromUrl, callback, error );
};

/*
 * Executes the specified SOSL search.
 * @param sosl a string containing the search to execute - e.g. "FIND
 *             {needle}"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
var search = function(sosl, callback, error) {
    return sendRequest('/services/data', '/' + apiVersion + '/search'
                       , callback, error, 'GET', {q: sosl});
};

/**
 * Part of the module that is public
 */
module.exports = {
    setApiVersion: setApiVersion,
    getApiVersion: getApiVersion,
    sendRequest: sendRequest,
    versions: versions,
    resources: resources,
    describeGlobal: describeGlobal,
    metadata: metadata,
    describe: describe,
    describeLayout: describeLayout,
    create: create,
    retrieve: retrieve,
    upsert: upsert,
    update: update,
    del: del,
    query: query,
    queryMore: queryMore,
    search: search
};
