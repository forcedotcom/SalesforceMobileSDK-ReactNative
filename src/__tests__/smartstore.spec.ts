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

import { assert } from "chai";
import * as smartstore from "../react.force.smartstore";
import { registerTest, testDone } from "../react.force.test";
import { promiser } from "../react.force.util";

// Promised based bridge functions for more readable tests
const getDatabaseSize = promiser(smartstore.getDatabaseSize);
const registerSoup = promiser(smartstore.registerSoup);
const soupExists = promiser(smartstore.soupExists);
const removeSoup = promiser(smartstore.removeSoup);
const getSoupSpec = promiser(smartstore.getSoupSpec);
const getSoupIndexSpecs = promiser(smartstore.getSoupIndexSpecs);
const upsertSoupEntries = promiser(smartstore.upsertSoupEntries);
const retrieveSoupEntries = promiser(smartstore.retrieveSoupEntries);
const querySoup = promiser(smartstore.querySoup);
const runSmartQuery = promiser(smartstore.runSmartQuery);
const removeFromSoup = promiser(smartstore.removeFromSoup);
const clearSoup = promiser(smartstore.clearSoup);
const getAllStores = promiser(smartstore.getAllStores);
const getAllGlobalStores = promiser(smartstore.getAllGlobalStores);
const removeStore = promiser(smartstore.removeStore);
const removeAllStores = promiser(smartstore.removeAllStores);
const removeAllGlobalStores = promiser(smartstore.removeAllGlobalStores);
const moveCursorToNextPage = promiser(smartstore.moveCursorToNextPage);
const moveCursorToPreviousPage = promiser(smartstore.moveCursorToPreviousPage);
const closeCursor = promiser(smartstore.closeCursor);

const storeConfig = { isGlobalStore: false };

const testGetDatabaseSize = () => {
  getDatabaseSize(storeConfig).then((result) => {
    assert.isNumber(result, "Expected number");
    testDone();
  });
};

const testRegisterExistsRemoveExists = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [
    { path: "Name", type: "string" },
    { path: "Id", type: "string" },
  ];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return soupExists(storeConfig, soupName);
    })
    .then((result) => {
      assert.isTrue(result, "Soup should exist");
      return removeSoup(storeConfig, soupName);
    })
    .then(() => {
      return soupExists(storeConfig, soupName);
    })
    .then((result) => {
      assert.isFalse(result, "Soup should no longer exist");
      testDone();
    });
};

const testGetSoupSpec = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [
    { path: "Name", type: "string" },
    { path: "Id", type: "string" },
  ];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return getSoupSpec(storeConfig, soupName);
    })
    .then((result) => {
      assert.deepEqual(result, { name: soupName, features: [] }, "Wrong soup spec");
      testDone();
    });
};

const testGetSoupIndexSpecs = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [
    { path: "Name", type: "string" },
    { path: "Id", type: "string" },
  ];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return getSoupIndexSpecs(storeConfig, soupName);
    })
    .then((result) => {
      assert.deepEqual(result, indexSpecs, "Wrong index specs");
      testDone();
    });
};

const testUpsertRetrieve = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return upsertSoupEntries(storeConfig, soupName, [{ Name: "Aaa" }, { Name: "Bbb" }, { Name: "Ccc" }]);
    })
    .then((result) => {
      assert.equal(result.length, 3, "Wrong number of entries");
      assert.equal(result[0].Name, "Aaa");
      assert.equal(result[1].Name, "Bbb");
      assert.equal(result[2].Name, "Ccc");

      return retrieveSoupEntries(storeConfig, soupName, [result[0]._soupEntryId, result[2]._soupEntryId]);
    })
    .then((result) => {
      assert.equal(result.length, 2, "Wrong number of entries");
      assert.equal(result[0].Name, "Aaa");
      assert.equal(result[1].Name, "Ccc");
      testDone();
    });
};

const testQuerySoup = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return upsertSoupEntries(storeConfig, soupName, [{ Name: "Aaa" }, { Name: "Bbb" }, { Name: "Ccc" }]);
    })
    .then((result) => {
      return querySoup(storeConfig, soupName, {
        queryType: "exact",
        indexPath: "Name",
        matchKey: "Bbb",
        order: "ascending",
        pageSize: 32,
      });
    })
    .then((result) => {
      assert.equal(result.totalPages, 1);
      assert.isDefined(result.cursorId);
      assert.equal(result.currentPageIndex, 0);
      assert.equal(result.pageSize, 32);
      assert.equal(result.currentPageOrderedEntries.length, 1);
      assert.equal(result.currentPageOrderedEntries[0].Name, "Bbb");
      testDone();
    });
};

const testMoveCursor = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return upsertSoupEntries(storeConfig, soupName, [{ Name: "Aaa" }, { Name: "Bbb" }, { Name: "Ccc" }]);
    })
    .then((result) => {
      return querySoup(storeConfig, soupName, {
        queryType: "range",
        indexPath: "Name",
        order: "ascending",
        pageSize: 2,
      });
    })
    .then((result) => {
      assert.equal(result.totalPages, 2);
      assert.isDefined(result.cursorId);
      assert.equal(result.currentPageIndex, 0);
      assert.equal(result.pageSize, 2);
      assert.equal(result.currentPageOrderedEntries.length, 2);
      assert.equal(result.currentPageOrderedEntries[0].Name, "Aaa");
      assert.equal(result.currentPageOrderedEntries[1].Name, "Bbb");
      return moveCursorToNextPage(storeConfig, result);
    })
    .then((result) => {
      assert.equal(result.totalPages, 2);
      assert.isDefined(result.cursorId);
      assert.equal(result.currentPageIndex, 1);
      assert.equal(result.pageSize, 2);
      assert.equal(result.currentPageOrderedEntries.length, 1);
      assert.equal(result.currentPageOrderedEntries[0].Name, "Ccc");
      return moveCursorToPreviousPage(storeConfig, result);
    })
    .then((result) => {
      assert.equal(result.totalPages, 2);
      assert.isDefined(result.cursorId);
      assert.equal(result.currentPageIndex, 0);
      assert.equal(result.pageSize, 2);
      assert.equal(result.currentPageOrderedEntries.length, 2);
      assert.equal(result.currentPageOrderedEntries[0].Name, "Aaa");
      assert.equal(result.currentPageOrderedEntries[1].Name, "Bbb");
      return closeCursor(storeConfig, result);
    })
    .then((result) => {
      testDone();
    });
};

const testSmartQuerySoup = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return upsertSoupEntries(storeConfig, soupName, [{ Name: "Aaa" }, { Name: "Bbb" }, { Name: "Ccc" }]);
    })
    .then((result) => {
      return runSmartQuery(storeConfig, {
        queryType: "smart",
        smartSql: "select {" + soupName + ":Name} from {" + soupName + "} where {" + soupName + ':Name} = "Ccc"',
        pageSize: 32,
      });
    })
    .then((result) => {
      assert.equal(result.totalPages, 1);
      assert.isDefined(result.cursorId);
      assert.equal(result.currentPageIndex, 0);
      assert.equal(result.pageSize, 32);
      assert.deepEqual(result.currentPageOrderedEntries, [["Ccc"]]);
      testDone();
    });
};

const testRemoveFromSoup = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return upsertSoupEntries(storeConfig, soupName, [{ Name: "Aaa" }, { Name: "Bbb" }, { Name: "Ccc" }]);
    })
    .then((result) => {
      return removeFromSoup(storeConfig, soupName, {
        queryType: "exact",
        indexPath: "Name",
        matchKey: "Bbb",
        order: "ascending",
        pageSize: 32,
      });
    })
    .then(() => {
      return runSmartQuery(storeConfig, {
        queryType: "smart",
        smartSql: "select {" + soupName + ":Name} from {" + soupName + "} order by {" + soupName + ":Name}",
        pageSize: 32,
      });
    })
    .then((result) => {
      assert.deepEqual(result.currentPageOrderedEntries, [["Aaa"], ["Ccc"]]);
      testDone();
    });
};

const testClearSoup = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  registerSoup(storeConfig, soupName, indexSpecs)
    .then((result) => {
      assert.equal(result, soupName, "Expected soupName");
      return upsertSoupEntries(storeConfig, soupName, [{ Name: "Aaa" }, { Name: "Bbb" }, { Name: "Ccc" }]);
    })
    .then((result) => {
      return clearSoup(storeConfig, soupName);
    })
    .then(() => {
      return runSmartQuery(storeConfig, {
        queryType: "smart",
        smartSql: "select {" + soupName + ":Name} from {" + soupName + "} order by {" + soupName + ":Name}",
        pageSize: 32,
      });
    })
    .then((result) => {
      assert.deepEqual(result.currentPageOrderedEntries, []);
      testDone();
    });
};

const testGetRemoveStores = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const firstStoreConfig = {
    isGlobalStore: false,
    storeName: "store_1_" + uniq,
  };
  const secondStoreConfig = {
    isGlobalStore: false,
    storeName: "store_2_" + uniq,
  };
  const thirdStoreConfig = {
    isGlobalStore: false,
    storeName: "store_3_" + uniq,
  };
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  Promise.all([
    registerSoup(firstStoreConfig, soupName, indexSpecs),
    registerSoup(secondStoreConfig, soupName, indexSpecs),
    registerSoup(thirdStoreConfig, soupName, indexSpecs),
  ])
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

const testGetRemoveGlobalStores = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const firstStoreConfig = {
    isGlobalStore: true,
    storeName: "store_1_" + uniq,
  };
  const secondStoreConfig = {
    isGlobalStore: true,
    storeName: "store_2_" + uniq,
  };
  const thirdStoreConfig = {
    isGlobalStore: true,
    storeName: "store_3_" + uniq,
  };
  const soupName = "soup_" + uniq;
  const indexSpecs = [{ path: "Name", type: "string" }];
  Promise.all([
    registerSoup(firstStoreConfig, soupName, indexSpecs),
    registerSoup(secondStoreConfig, soupName, indexSpecs),
    registerSoup(thirdStoreConfig, soupName, indexSpecs),
  ])
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
registerTest(testGetSoupSpec);
registerTest(testGetSoupIndexSpecs);
registerTest(testUpsertRetrieve);
registerTest(testQuerySoup);
registerTest(testMoveCursor);
registerTest(testSmartQuerySoup);
registerTest(testRemoveFromSoup);
registerTest(testClearSoup);
registerTest(testGetRemoveStores);
registerTest(testGetRemoveGlobalStores);
