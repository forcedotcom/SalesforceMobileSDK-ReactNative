/*
 * Copyright (c) 2018-present, salesforce.com, inc.
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

import { assert } from 'chai';
import * as smartstore from '../src/react.force.smartstore';
import { registerTest, testDone } from '../src/react.force.test';
import { promiser } from '../src/react.force.util';

// Promised based bridge functions for more readable tests
getDatabaseSize = promiser(smartstore.getDatabaseSize);
registerSoup = promiser(smartstore.registerSoup);
soupExists = promiser(smartstore.soupExists);
removeSoup = promiser(smartstore.removeSoup);
getSoupIndexSpecs = promiser(smartstore.getSoupIndexSpecs);
upsertSoupEntries = promiser(smartstore.upsertSoupEntries);
retrieveSoupEntries = promiser(smartstore.retrieveSoupEntries);
querySoup = promiser(smartstore.querySoup);
runSmartQuery = promiser(smartstore.runSmartQuery);
removeFromSoup = promiser(smartstore.removeFromSoup);
clearSoup = promiser(smartstore.clearSoup);
getAllStores = promiser(smartstore.getAllStores);
getAllGlobalStores = promiser(smartstore.getAllGlobalStores);
removeStore = promiser(smartstore.removeStore);
removeAllStores = promiser(smartstore.removeAllStores);
removeAllGlobalStores = promiser(smartstore.removeAllGlobalStores);
moveCursorToNextPage = promiser(smartstore.moveCursorToNextPage);
moveCursorToPreviousPage = promiser(smartstore.moveCursorToPreviousPage);
closeCursor = promiser(smartstore.closeCursor);

const storeConfig = {isGlobalStore:false};

testGetDatabaseSize = () => {
    getDatabaseSize(storeConfig)
        .then((result) => {
            assert.isNumber(result, 'Expected number');
            testDone();
        });
};

testRegisterExistsRemoveExists = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}, {path:'Id', type:'string'}];    
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return soupExists(storeConfig, soupName);
        })
        .then((result) => {
            assert.isTrue(result, 'Soup should exist');
            return removeSoup(storeConfig, soupName);
        })
        .then(() => {
            return soupExists(storeConfig, soupName);
        })
        .then((result) => {
            assert.isFalse(result, 'Soup should no longer exist');
            testDone();
        });
};

testGetSoupIndexSpecs = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}, {path:'Id', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return getSoupIndexSpecs(storeConfig, soupName)
        })
        .then((result) => {
            assert.deepEqual(result, indexSpecs, 'Wrong index specs');
            testDone();
        });
};

testUpsertRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return upsertSoupEntries(storeConfig, soupName, [{Name:'Aaa'}, {Name:'Bbb'}, {Name:'Ccc'}]);
        })
        .then((result) => {
            assert.equal(result.length, 3, 'Wrong number of entries');
            assert.equal(result[0].Name, 'Aaa');
            assert.equal(result[1].Name, 'Bbb');
            assert.equal(result[2].Name, 'Ccc');

            return retrieveSoupEntries(storeConfig, soupName, [result[0]._soupEntryId,result[2]._soupEntryId]);
        })
        .then((result) => {
            assert.equal(result.length, 2, 'Wrong number of entries');
            assert.equal(result[0].Name, 'Aaa');
            assert.equal(result[1].Name, 'Ccc');
            testDone();
        });
};

testQuerySoup = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return upsertSoupEntries(storeConfig, soupName, [{Name:'Aaa'}, {Name:'Bbb'}, {Name:'Ccc'}]);
        })
        .then((result) => {
            return querySoup(storeConfig, soupName, {queryType:'exact', indexPath:'Name', matchKey:'Bbb', order: 'ascending', pageSize:32});
        })
        .then((result) => {
            assert.equal(result.totalPages, 1);
            assert.isDefined(result.cursorId);
            assert.equal(result.currentPageIndex, 0);
            assert.equal(result.pageSize, 32);
            assert.equal(result.currentPageOrderedEntries.length, 1);
            assert.equal(result.currentPageOrderedEntries[0].Name, 'Bbb');
            testDone();
        });
};

testMoveCursor = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return upsertSoupEntries(storeConfig, soupName, [{Name:'Aaa'}, {Name:'Bbb'}, {Name:'Ccc'}]);
        })
        .then((result) => {
            return querySoup(storeConfig, soupName, {queryType:'range', indexPath:'Name', order: 'ascending', pageSize:2});
        })
        .then((result) => {
            assert.equal(result.totalPages, 2);
            assert.isDefined(result.cursorId);
            assert.equal(result.currentPageIndex, 0);
            assert.equal(result.pageSize, 2);
            assert.equal(result.currentPageOrderedEntries.length, 2);
            assert.equal(result.currentPageOrderedEntries[0].Name, 'Aaa');
            assert.equal(result.currentPageOrderedEntries[1].Name, 'Bbb');
            return moveCursorToNextPage(storeConfig, result);
        })
        .then((result) => {
            assert.equal(result.totalPages, 2);
            assert.isDefined(result.cursorId);
            assert.equal(result.currentPageIndex, 1);
            assert.equal(result.pageSize, 2);
            assert.equal(result.currentPageOrderedEntries.length, 1);
            assert.equal(result.currentPageOrderedEntries[0].Name, 'Ccc');
            return moveCursorToPreviousPage(storeConfig, result);
        })
        .then((result) => {
            assert.equal(result.totalPages, 2);
            assert.isDefined(result.cursorId);
            assert.equal(result.currentPageIndex, 0);
            assert.equal(result.pageSize, 2);
            assert.equal(result.currentPageOrderedEntries.length, 2);
            assert.equal(result.currentPageOrderedEntries[0].Name, 'Aaa');
            assert.equal(result.currentPageOrderedEntries[1].Name, 'Bbb');
            return closeCursor(storeConfig, result);
        })
        .then((result) => {
            testDone();
        });
};


testSmartQuerySoup = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return upsertSoupEntries(storeConfig, soupName, [{Name:'Aaa'}, {Name:'Bbb'}, {Name:'Ccc'}]);
        })
        .then((result) => {
            return runSmartQuery(storeConfig, {queryType:'smart', smartSql:'select {' + soupName + ':Name} from {' + soupName + '} where {' + soupName + ':Name} = "Ccc"', pageSize:32});
        })
        .then((result) => {
            assert.equal(result.totalPages, 1);
            assert.isDefined(result.cursorId);
            assert.equal(result.currentPageIndex, 0);
            assert.equal(result.pageSize, 32);
            assert.deepEqual(result.currentPageOrderedEntries, [['Ccc']]);
            testDone();
        });
};

testRemoveFromSoup = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return upsertSoupEntries(storeConfig, soupName, [{Name:'Aaa'}, {Name:'Bbb'}, {Name:'Ccc'}]);
        })
        .then((result) => {
            return removeFromSoup(storeConfig, soupName, {queryType:'exact', indexPath:'Name', matchKey:'Bbb', order: 'ascending', pageSize:32});
        })
        .then(() => {
            return runSmartQuery(storeConfig, {queryType:'smart', smartSql:'select {' + soupName + ':Name} from {' + soupName + '} order by {' + soupName + ':Name}', pageSize:32});
        })
        .then((result) => {
            assert.deepEqual(result.currentPageOrderedEntries, [['Aaa'], ['Ccc']]);
            testDone();
        });
};

testClearSoup = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    registerSoup(storeConfig, soupName, indexSpecs)
        .then((result) => {
            assert.equal(result, soupName, 'Expected soupName');
            return upsertSoupEntries(storeConfig, soupName, [{Name:'Aaa'}, {Name:'Bbb'}, {Name:'Ccc'}]);
        })
        .then((result) => {
            return clearSoup(storeConfig, soupName);
        })
        .then(() => {
            return runSmartQuery(storeConfig, {queryType:'smart', smartSql:'select {' + soupName + ':Name} from {' + soupName + '} order by {' + soupName + ':Name}', pageSize:32});
        })
        .then((result) => {
            assert.deepEqual(result.currentPageOrderedEntries, []);
            testDone();
        });
};

testGetRemoveStores = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstStoreConfig = {isGlobalStore:false, storeName:'store_1_' + uniq};
    const secondStoreConfig = {isGlobalStore:false, storeName:'store_2_' + uniq};
    const thirdStoreConfig = {isGlobalStore:false, storeName:'store_3_' + uniq};
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    Promise.all([registerSoup(firstStoreConfig, soupName, indexSpecs),
                 registerSoup(secondStoreConfig, soupName, indexSpecs),
                 registerSoup(thirdStoreConfig, soupName, indexSpecs)])
        .then((result) => {
            assert.deepEqual(result, [soupName, soupName, soupName]);
            return getAllStores();
        })
        .then((result) => {
            assert.sameDeepMembers(result, [firstStoreConfig, secondStoreConfig, thirdStoreConfig]);
            return removeStore(secondStoreConfig);
        })
        .then((result) => {
            return getAllStores();
        })
        .then((result) => {
            assert.sameDeepMembers(result, [firstStoreConfig, thirdStoreConfig]);
            return removeAllStores();
        })
        .then((result) => {
            return getAllStores();
        })
        .then((result) => {
            assert.deepEqual(result, []);
            testDone();
        });
};

testGetRemoveGlobalStores = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstStoreConfig = {isGlobalStore:true, storeName:'store_1_' + uniq};
    const secondStoreConfig = {isGlobalStore:true, storeName:'store_2_' + uniq};
    const thirdStoreConfig = {isGlobalStore:true, storeName:'store_3_' + uniq};
    const soupName = 'soup_' + uniq;
    const indexSpecs = [{path:'Name', type:'string'}];
    Promise.all([registerSoup(firstStoreConfig, soupName, indexSpecs),
                 registerSoup(secondStoreConfig, soupName, indexSpecs),
                 registerSoup(thirdStoreConfig, soupName, indexSpecs)])
        .then((result) => {
            assert.deepEqual(result, [soupName, soupName, soupName]);
            return getAllGlobalStores();
        })
        .then((result) => {
            assert.sameDeepMembers(result, [firstStoreConfig, secondStoreConfig, thirdStoreConfig]);
            return removeStore(secondStoreConfig);
        })
        .then((result) => {
            return getAllGlobalStores();
        })
        .then((result) => {
            assert.sameDeepMembers(result, [firstStoreConfig, thirdStoreConfig]);
            return removeAllGlobalStores();
        })
        .then((result) => {
            return getAllGlobalStores();
        })
        .then((result) => {
            assert.deepEqual(result, []);
            testDone();
        });
};


registerTest(testGetDatabaseSize);
registerTest(testRegisterExistsRemoveExists);
registerTest(testGetSoupIndexSpecs);
registerTest(testUpsertRetrieve);
registerTest(testQuerySoup);
registerTest(testMoveCursor);
registerTest(testSmartQuerySoup);
registerTest(testRemoveFromSoup);
registerTest(testClearSoup);
registerTest(testGetRemoveStores);
registerTest(testGetRemoveGlobalStores);
