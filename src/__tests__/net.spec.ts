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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { assert } from "chai";
import * as net from "../react.force.net";
import { registerTest, testDone } from "../react.force.test";
import { promiser } from "../react.force.util";

// Promised based bridge functions for more readable tests
const netVersions = promiser(net.versions);
const netResources = promiser(net.resources);
const netDescribeGlobal = promiser(net.describeGlobal);
const netMetadata = promiser(net.metadata);
const netDescribe = promiser(net.describe);
const netDescribeLayout = promiser(net.describeLayout);
const netCreate = promiser(net.create);
const netRetrieve = promiser(net.retrieve);
const netUpsert = promiser(net.upsert);
const netUpdate = promiser(net.update);
const netDel = promiser(net.del);
const netQuery = promiser(net.query);
const netSearch = promiser(net.search);

const apiVersion = "v46.0";

const sendUnAuthenticatedNetRequest = (url, callback, error) => {
  return net.sendRequest(null, url, callback, error, "GET", null, null, null, false, true);
};

const netSendRequest = promiser(sendUnAuthenticatedNetRequest);

const testGetApiVersion = () => {
  assert.equal(net.getApiVersion(), apiVersion);
  testDone();
};

const testVersions = () => {
  netVersions().then((response) => {
    assert.deepInclude(
      response,
      { label: "Summer '19", url: "/services/data/v46.0", version: "46.0" },
      "Wrong version response",
    );
    testDone();
  });
};

const testResources = () => {
  netResources().then((response) => {
    assert.equal(response.connect, "/services/data/" + apiVersion + "/connect", "Wrong url for connect resource");
    testDone();
  });
};

const testDescribeGlobal = () => {
  netDescribeGlobal().then((response) => {
    assert.isArray(response.sobjects, "Expected sobjects array");
    testDone();
  });
};

const testMetaData = () => {
  netMetadata("account").then((response) => {
    assert.isObject(response.objectDescribe, "Expected objectDescribe object");
    assert.isArray(response.recentItems, "Expected recentItems array");
    testDone();
  });
};

const testDescribe = () => {
  netDescribe("account").then((response) => {
    assert.isFalse(response.custom, "Expected custom to be false");
    assert.isArray(response.fields, "Expected fields array");
    testDone();
  });
};

const testDescribeLayout = () => {
  netDescribe("account")
    .then((response) => {
      const recordId = response.recordTypeInfos[0].recordTypeId;
      return netDescribeLayout("account", recordId);
    })
    .then((response) => {
      assert.isArray(response.relatedLists, "Expected relatedLists array");
      testDone();
    });
};

const testCreateRetrieve = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const firstName = "First_" + uniq;
  const lastName = "Last_" + uniq;
  let contactId: string;

  netCreate("contact", { FirstName: firstName, LastName: lastName })
    .then((response) => {
      assert.isTrue(response.success, "Create failed");
      contactId = response.id;
      return netRetrieve("contact", contactId, "firstName,lastName");
    })
    .then((response) => {
      assert.equal(response.Id, contactId, "Wrong id");
      assert.equal(response.FirstName, firstName, "Wrong first name");
      assert.equal(response.LastName, lastName, "Wrong last name");

      // Cleanup
      return netDel("contact", contactId);
    })
    .then(() => {
      testDone();
    });
};

const testUpsertUpdateRetrieve = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const firstName = "First_" + uniq;
  const lastName = "Last_" + uniq;
  const lastNameUpdated = lastName + "_updated";
  let contactId: string;

  netUpsert("contact", "Id", "", { FirstName: firstName, LastName: lastName })
    .then((response) => {
      assert.isTrue(response.success, "Upsert failed");
      contactId = response.id;
      return netUpdate("Contact", contactId, { LastName: lastNameUpdated });
    })
    .then(() => {
      return netRetrieve("contact", contactId, "firstName,lastName");
    })
    .then((response) => {
      assert.equal(response.Id, contactId, "Wrong id");
      assert.equal(response.FirstName, firstName, "Wrong first name");
      assert.equal(response.LastName, lastNameUpdated, "Wrong last name");

      // Cleanup
      return netDel("contact", contactId);
    })
    .then(() => {
      testDone();
    });
};

const testCreateDelRetrieve = () => {
  const uniq = Math.floor(Math.random() * 1000000);
  const firstName = "First_" + uniq;
  const lastName = "Last_" + uniq;
  let contactId;

  netCreate("contact", { FirstName: firstName, LastName: lastName })
    .then((response) => {
      assert.isTrue(response.success, "Create failed");
      contactId = response.id;
      return netDel("contact", contactId);
    })
    .then(() => {
      return netRetrieve("contact", contactId, "firstName,lastName");
    })
    .then((response) => {
      throw "Retrieve following delete should have 404ed";
    })
    .catch((error) => {
      assert.include(
        JSON.stringify(error),
        "The requested resource does not exist",
        "Retrieve following delete should have 404ed",
      );
      testDone();
    });
};

const testQuery = () => {
  netQuery("SELECT FirstName, LastName FROM Contact LIMIT 5").then((response) => {
    assert.isArray(response.records, "Expected records");
    assert.isTrue(response.done, "Expected done to be true");
    assert.isNumber(response.totalSize, "Expected totalSize");
    testDone();
  });
};

const testSearch = () => {
  netSearch("FIND {Joe} IN NAME FIELDS RETURNING Contact").then((response) => {
    assert.isArray(response.searchRecords, "Expected searchRecords");
    testDone();
  });
};

const testPublicApiCall = () => {
  netSendRequest("https://api.ipify.org?format=json")
    .then((response) => {
      assert.isObject(response, "Expected A successful response");
      testDone();
    })
    .catch((error) => {
      assert.include(JSON.stringify(error), "The requested resource failed", "");
      testDone();
    });
};

registerTest(testGetApiVersion);
registerTest(testVersions);
registerTest(testResources);
registerTest(testDescribeGlobal);
registerTest(testMetaData);
registerTest(testDescribe);
registerTest(testDescribeLayout);
registerTest(testCreateRetrieve);
registerTest(testUpsertUpdateRetrieve);
registerTest(testCreateDelRetrieve);
registerTest(testQuery);
registerTest(testSearch);
registerTest(testPublicApiCall);
