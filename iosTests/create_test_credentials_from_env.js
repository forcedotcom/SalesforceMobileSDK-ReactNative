#!/usr/bin/env node

require("fs").writeFile("ios/test_credentials.json",
                        `${process.env.TEST_CREDENTIALS}`,
                        function (err) {
                            if (err) throw err;
                        });
