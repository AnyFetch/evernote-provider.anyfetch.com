'use strict';
/**
 * This object contains all the handlers to use for this provider
 */
var rarity = require('rarity');
var async = require('async');
var CancelError = require('anyfetch-provider').CancelError;
var Evernote = require('evernote').Evernote;

var config = require('../config/configuration.js');
var client = new Evernote.Client(config.clientConfig);


var redirectToService = function redirectToService(callbackUrl, cb) {
  // Redirect user to provider consentment page
  client.getRequestToken(callbackUrl, function(err, oauthToken, oauthTokenSecret) {
    if(err) {
      return cb(err);
    }

    var redirectUrl = client.getAuthorizeUrl(oauthToken);
    cb(null, redirectUrl, {
      redirectUrl: redirectUrl,
      callbackUrl: callbackUrl,
      oauthTokenSecret: oauthTokenSecret
    });
  });
};

var retrieveTokens = function retrieveTokens(reqParams, storedParams, cb) {
  if(!reqParams.oauth_verifier) {
    return cb(new CancelError());
  }

  async.waterfall([
    function getToken(cb) {
      client.getAccessToken(reqParams.oauth_token, storedParams.oauthTokenSecret, reqParams.oauth_verifier, cb);
    },
    function getUserInfo(token, tokenSecret, results, cb) {
      var client = new Evernote.Client({
        token: token,
        sandbox: config.clientConfig.sandbox
      });
      var userStore = client.getUserStore();
      userStore.getUser(rarity.carry([token], cb));
    },
    function callFinalCb(token, data, cb) {
      cb(null, data.username, {token: token, callbackUrl: storedParams.callbackUrl});
    }
  ], cb);
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },

  config: config
};
