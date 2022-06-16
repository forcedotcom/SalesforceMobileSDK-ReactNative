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

import { assert } from 'chai';
import * as net from '../src/react.force.net';
import { registerTest, testDone } from '../src/react.force.test';
import { promiser } from '../src/react.force.util';

// Promised based bridge functions for more readable tests
netVersions = promiser(net.versions);
netResources = promiser(net.resources);
netDescribeGlobal = promiser(net.describeGlobal);
netMetadata = promiser(net.metadata);
netDescribe = promiser(net.describe);
netDescribeLayout = promiser(net.describeLayout);
netCreate = promiser(net.create);
netRetrieve = promiser(net.retrieve);
netUpsert = promiser(net.upsert);
netUpdate = promiser(net.update);
netDel = promiser(net.del);
netQuery = promiser(net.query);
netSearch = promiser(net.search);
netCollectionCreate = promiser(net.collectionCreate);
netCollectionRetrieve= promiser(net.collectionRetrieve);
netCollectionUpdate = promiser(net.collectionUpdate);
netCollectionUpsert = promiser(net.collectionUpsert);
netCollectionDelete = promiser(net.collectionDelete);

const apiVersion = 'v55.0';

const sendUnAuthenticatedNetRequest = (url, callback, error) => {
    return net.sendRequest(null, url, callback, error,"GET", null, null, null, false, true);
};

netSendRequest = promiser(sendUnAuthenticatedNetRequest);

testGetApiVersion = () => {
    assert.equal(net.getApiVersion(), apiVersion);
    testDone();
};

testVersions = () => {
    netVersions()
        .then((response) => {
            assert.deepInclude(response, {'label':'Summer \'22','url':'/services/data/v55.0','version':'55.0'}, 'Wrong version response');
            testDone();
        });
};

testResources = () => {
    netResources()
        .then((response) => {
            assert.equal(response.connect, '/services/data/' + apiVersion + '/connect', 'Wrong url for connect resource');
            testDone();
        });
};

testDescribeGlobal = () => {
    netDescribeGlobal()
        .then((response) => {
            assert.isArray(response.sobjects, 'Expected sobjects array');
            testDone();
        });
};

testMetaData = () => {
    netMetadata('account')
        .then((response) => {
            assert.isObject(response.objectDescribe, 'Expected objectDescribe object');
            assert.isArray(response.recentItems, 'Expected recentItems array');
            testDone();
        });
};

testDescribe = () => {
    netDescribe('account')
        .then((response) => {
            assert.isFalse(response.custom, 'Expected custom to be false');
            assert.isArray(response.fields, 'Expected fields array');
            testDone();
        });
};

testDescribeLayout = () => {
    netDescribe('account')
        .then((response) => {
            const recordId = response.recordTypeInfos[0].recordTypeId;
            return netDescribeLayout('account', recordId);
        })
        .then((response) => {
            assert.isArray(response.relatedLists, 'Expected relatedLists array');
            testDone();
        });
};

testCreateRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstName = 'First_' + uniq;
    const lastName = 'Last_' + uniq;
    var contactId;

    netCreate('contact', {FirstName: firstName, LastName: lastName})
        .then((response) => {
            assert.isTrue(response.success, 'Create failed');
            contactId = response.id;
            return netRetrieve('contact', contactId, 'firstName,lastName');
        })
        .then((response) => {
            assert.equal(response.Id, contactId, 'Wrong id');
            assert.equal(response.FirstName, firstName, 'Wrong first name');
            assert.equal(response.LastName, lastName, 'Wrong last name');

            // Cleanup
            return netDel('contact', contactId);
        })
        .then(() => {
            testDone();
        });
};

testUpsertUpdateRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstName = 'First_' + uniq;
    const lastName = 'Last_' + uniq;
    const lastNameUpdated = lastName + '_updated';
    var contactId;

    netUpsert('contact', 'Id', '', {FirstName: firstName, LastName: lastName})
        .then((response) => {
            assert.isTrue(response.success, 'Upsert failed');
            contactId = response.id;
            return netUpdate('Contact', contactId, {LastName: lastNameUpdated});
        })
        .then(() => {
            return netRetrieve('contact', contactId, 'firstName,lastName');
        })
        .then((response) => {
            assert.equal(response.Id, contactId, 'Wrong id');
            assert.equal(response.FirstName, firstName, 'Wrong first name');
            assert.equal(response.LastName, lastNameUpdated, 'Wrong last name');

            // Cleanup
            return netDel('contact', contactId);
        })
        .then(() => {
            testDone();
        });
};

testCreateDelRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstName = 'First_' + uniq;
    const lastName = 'Last_' + uniq;
    var contactId;

    netCreate('contact', {FirstName: firstName, LastName: lastName})
        .then((response) => {
            assert.isTrue(response.success, 'Create failed');
            contactId = response.id;
            return netDel('contact', contactId);
        })
        .then(() => {
            return netRetrieve('contact', contactId, 'firstName,lastName');
        })
        .then((response) => {
            throw 'Retrieve following delete should have 404ed';
        })
        .catch((error) => {
            assert.include(JSON.stringify(error), 'The requested resource does not exist', 'Retrieve following delete should have 404ed');
            testDone();
        });
};

testQuery = () => {
    netQuery('SELECT FirstName, LastName FROM Contact LIMIT 5')
        .then((response) => {
            assert.isArray(response.records, 'Expected records');
            assert.isTrue(response.done, 'Expected done to be true');
            assert.isNumber(response.totalSize, 'Expected totalSize');
            testDone();
        });
};

testSearch = () => {
    netSearch('FIND {Joe} IN NAME FIELDS RETURNING Contact')
        .then((response) => {
            assert.isArray(response.searchRecords, 'Expected searchRecords');
            testDone();
        });
};

testPublicApiCall = () => {
    netSendRequest( 'https://api.ipify.org?format=json')
        .then((response) => {
          assert.isObject(response, 'Expected A successful response');
          testDone();
       })
       .catch((error) => {
           assert.include(JSON.stringify(error), 'The requested resource failed', '');
           testDone();
       });

};

testCollectionCreateRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstName = 'First_' + uniq;
    const lastName = 'Last_' + uniq;
    const otherFirstName = firstName + '_2'
    const otherLastName = lastName + '_2'
    var contactId;
    var otherContactId;

    netCollectionCreate(true, [
            {FirstName: firstName, LastName: lastName, attributes: {type: 'Contact'}},
            {FirstName: otherFirstName, LastName: otherLastName, attributes: {type: 'Contact'}},
        ])
        .then((response) => {
            console.log("1  response-->" + JSON.stringify(response));
            assert.isTrue(response[0].success, 'First create failed');
            contactId = response[0].id;
            assert.isTrue(response[1].success, 'Second create failed');
            otherContactId = response[1].id;
            return netCollectionRetrieve('contact', [contactId, otherContactId], ["FirstName", "LastName"]);
        })
        .then((response) => {
            console.log("2  response-->" + JSON.stringify(response));
            assert.equal(response.length, 2, 'Wrong number of sub responses');
            // Checking first sub response
            assert.equal(response[0].Id, contactId, 'Wrong id');
            assert.equal(response[0].FirstName, firstName, 'Wrong first name');
            assert.equal(response[0].LastName, lastName, 'Wrong last name');
            // Checking second sub response
            assert.equal(response[1].Id, otherContactId, 'Wrong id');
            assert.equal(response[1].FirstName, otherFirstName, 'Wrong first name');
            assert.equal(response[1].LastName, otherLastName, 'Wrong last name');

            // Cleanup
            return netCollectionDelete([contactId, otherContactId]);
        })
        .then(() => {
            testDone();
        });
}

testCollectionUpsertUpdateRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstName = 'First_' + uniq;
    const lastName = 'Last_' + uniq;
    const otherFirstName = firstName + '_2'
    const otherLastName = lastName + '_2'
    var contactId;
    var otherContactId;

    netCollectionUpsert(true, 'Contact', 'Id', [
        {FirstName: firstName, LastName: lastName}, 
        {FirstName: otherFirstName, LastName: otherLastName}
    ])
        .then((response) => {
            console.log("1  response-->" + JSON.stringify(response));
            assert.isTrue(response[0].success, 'First upsert failed');
            contactId = response[0].id;
            assert.isTrue(response[1].success, 'Second upsert failed');
            otherContactId = response[1].id;
            return netCollectionUpdate(true, 'Contact', 'Id', [
                {FirstName: firstName + '_u', LastName: lastName + '_u'}, 
                {FirstName: otherFirstName + '_u', LastName: otherLastName + '_u'}
            ]);
        })
        .then((response) => {
            console.log("2  response-->" + JSON.stringify(response));
            assert.isTrue(response[0].success, 'First update failed');
            assert.equal(response[0].id, contactId, 'Wrong id');
            assert.isTrue(response[1].success, 'Second update failed');
            assert.equal(response[1].id, otherContactId);
            return netCollectionRetrieve('contact', [contactId, otherContactId], ["FirstName", "LastName"]);
        })
        .then((response) => {
            console.log("3  response-->" + JSON.stringify(response));
            assert.equal(response.length, 2, 'Wrong number of sub responses');
            // Checking first sub response
            assert.equal(response[0].Id, contactId, 'Wrong id');
            assert.equal(response[0].FirstName, firstName + '_u', 'Wrong first name');
            assert.equal(response[0].LastName, lastName + '_u', 'Wrong last name');
            // Checking second sub response
            assert.equal(response[1].Id, otherContactId, 'Wrong id');
            assert.equal(response[1].FirstName, otherFirstName + '_u', 'Wrong first name');
            assert.equal(response[1].LastName, otherLastName + '_u', 'Wrong last name');

            // Cleanup
            return netCollectionDelete([contactId, otherContactId]);
        })
        .then(() => {
            testDone();
        });
};

testCollectionCreateDeleteRetrieve = () => {
    const uniq = Math.floor(Math.random() * 1000000);
    const firstName = 'First_' + uniq;
    const lastName = 'Last_' + uniq;
    const otherFirstName = firstName + '_2'
    const otherLastName = lastName + '_2'
    var contactId;
    var otherContactId;

    netCollectionCreate(true, [
            {FirstName: firstName, LastName: lastName, attributes: {type: 'Contact'}},
            {FirstName: otherFirstName, LastName: otherLastName, attributes: {type: 'Contact'}},
        ])
        .then((response) => {
            console.log("1  response-->" + JSON.stringify(response));
            assert.isTrue(response[0].success, 'First create failed');
            contactId = response[0].id;
            assert.isTrue(response[1].success, 'Second create failed');
            otherContactId = response[1].id;
            return netCollectionDelete([contactId, otherContactId]);
        })
        .then((response) => {
            console.log("2 response-->" + JSON.stringify(response));
            assert.isTrue(response[0].success, 'First delete failed');
            assert.equal(response[0].id, contactId, 'Wrong id');
            assert.isTrue(response[1].success, 'Second delete failed');
            assert.equal(response[1].id, otherContactId);
            return netCollectionRetrieve('contact', [contactId, otherContactId], ['FirstName', 'LastName']);
        })
        .then((response) => {
            console.log("3 response-->" + JSON.stringify(response));
            assert.isNull(response[0], 'First subresponse should be null');
            assert.isNull(response[1], 'First subresponse should be null');
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
registerTest(testCollectionCreateRetrieve);
registerTest(testCollectionUpsertUpdateRetrieve);
registerTest(testCollectionCreateDeleteRetrieve);
