#!/usr/bin/env node

const credentials = {
	"instance_url" : `${process.env.INSTANCE_URL}`,
  	"test_client_id" : `${process.env.TEST_CLIENT_ID}`,
  	"test_redirect_uri" : `${process.env.TEST_REDIRECT_URI}`,
  	"refresh_token" : `${process.env.REFRESH_TOKEN}`,
  	"identity_url" : `${process.env.IDENTITY_URL}`,
  	"test_login_domain" : `${process.env.TEST_LOGIN_DOMAIN}`,
  	"access_token" : `${process.env.ACCESS_TOKEN}`
}

require("fs").writeFile("test_credentials.json",
                        JSON.stringify(credentials),
                        function (err) {
                            if (err) throw err;
                        });
