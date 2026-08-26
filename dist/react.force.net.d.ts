import { ExecErrorCallback, ExecSuccessCallback } from "./react.force.common";
import { HttpMethod } from "./typings";
/**
 * Set apiVersion to be used
 */
export declare const setApiVersion: (version: string) => void;
/**
 * Return apiVersion used
 */
export declare const getApiVersion: () => string;
/**
 * Send arbitray force.com request
 */
export declare const sendRequest: <T>(endPoint: string, path: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback, method?: HttpMethod, payload?: Record<string, unknown> | null, headerParams?: Record<string, unknown> | null, fileParams?: unknown, returnBinary?: boolean, doesNotRequireAuthentication?: boolean) => void;
/**
 * Lists summary information about each Salesforce.com version currently
 * available, including the version, label, and a link to each version's
 * root.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const versions: <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Lists available resources for the client's API version, including
 * resource name and URI.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const resources: <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Lists the available objects and their metadata for your organization's
 * data.
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const describeGlobal: <T>(successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Describes the individual metadata for the specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const metadata: <T>(objtype: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Completely describes the individual metadata at all levels for the
 * specified object.
 * @param objtype object type; e.g. "Account"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const describe: <T>(objtype: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Fetches the layout configuration for a particular sobject type and record type id.
 * @param objtype object type; e.g. "Account"
 * @param (Optional) recordTypeId Id of the layout's associated record type
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const describeLayout: <T>(objtype: string, recordTypeId: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Creates a new record of the given type.
 * @param objtype object type; e.g. "Account"
 * @param fields an object containing initial field names and values for
 *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
 *               "CRM"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const create: <T>(objtype: string, fields: Record<string, unknown>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
type RetrieveOverload = {
    <T>(objtype: string, id: string, fieldlist: string[], successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback): void;
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
export declare const retrieve: RetrieveOverload;
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
export declare const upsert: <T>(objtype: string, externalIdField: string, externalId: string, fields: Record<string, unknown>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
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
export declare const update: <T>(objtype: string, id: string, fields: Record<string, unknown>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Deletes a record of the given type. Unfortunately, 'delete' is a
 * reserved word in JavaScript.
 * @param objtype object type; e.g. "Account"
 * @param id the record's object ID
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const del: <T>(objtype: string, id: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Executes the specified SOQL query.
 * @param soql a string containing the query to execute - e.g. "SELECT Id,
 *             Name from Account ORDER BY Name LIMIT 20"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const query: <T>(soql: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Queries the next set of records based on pagination.
 * <p>This should be used if performing a query that retrieves more than can be returned
 * in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm</p>

 * @param url - the url retrieved from nextRecordsUrl or prevRecordsUrl
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const queryMore: <T>(url: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Executes the specified SOSL search.
 * @param sosl a string containing the search to execute - e.g. "FIND
 *             {needle}"
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const search: <T>(sosl: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Convenience function to retrieve an attachment
 * @param id
 * @param callback function to which response will be passed (attachment is returned as {encodedBody:"base64-encoded-response", contentType:"content-type"})
 * @param [error=null] function called in case of error
 */
export declare const getAttachment: <T>(id: string, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Creates up to 2000 new records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const collectionCreate: <T>(allOrNone: boolean, records: Array<Record<string, unknown>>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Updates up to 200 records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const collectionUpdate: <T>(allOrNone: boolean, records: Array<Record<string, unknown>>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Upserts up to 200 records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param objectType object type; e.g. "Account"
 * @param externalIdField  name of ID field in source data
 * @param records array of objects containing field names and values as well as a "attributes" property with the object type e.g. {type: "Account"}
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const collectionUpsert: <T>(allOrNone: boolean, objectType: string, externalIdField: string, records: Array<Record<string, unknown>>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Retrieves up to 2000 records in one roundtrip to the server.
 * @param objectType object type; e.g. "Account"
 * @param ids the ids of records to retrieve
 * @param fields list of fields for which to return values; e.g. ["Name", "Industry"]
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const collectionRetrieve: <T>(objectType: string, ids: Array<string>, fields: Array<string>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
/**
 * Delete up to 200 records in one roundtrip to the server.
 * @param allOrNone indicates whether to roll back the entire request when one record fails
 * @param ids the ids of records to delete
 * @param callback function to which response will be passed
 * @param [error=null] function called in case of error
 */
export declare const collectionDelete: <T>(allOrNone: boolean, ids: Array<string>, successCB: ExecSuccessCallback<T>, errorCB: ExecErrorCallback) => void;
export {};
