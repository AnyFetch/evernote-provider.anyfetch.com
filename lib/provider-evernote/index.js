'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var config = require('../../config/configuration.js');


// Custom Evernote functions
var Evernote = require('evernote').Evernote;
var clientAuth = new Evernote.Client({
  consumerKey: config.evernote_consumer_key,
  consumerSecret: config.evernote_consumer_secret,
  sandbox: (config.env==="development")
});


//

var initAccount = function(req, next) {
  clientAuth.getRequestToken(config.evernote_callback, function(error, oauthToken, oauthTokenSecret, results) {
    console.log("HELLO", clientAuth.getAuthorizeUrl(oauthToken));
    next(error, {authTokenSecret: oauthTokenSecret, oauthToken: oauthToken}, clientAuth.getAuthorizeUrl(oauthToken));
  });

  // Redirect user to provider consentment page
};

var connectAccountRetrievePreDatasIdentifier = function(req, next) {
  // Retrieve identifier for current request
  next(null, {'datas.oauthToken': req.params.oauth_token});

};

var connectAccountRetrieveAuthDatas = function(req, preDatas, next) {
  // Store new datas
  clientAuth.getAccessToken(req.params.oauth_token, preDatas.authTokenSecret, req.params.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    var datas = {
      accessToken: oauthAccessToken
    };
    next(error, datas);
  });
};

var updateAccount = function(datas, cursor, next) {
  // Update documents from provider
  // You may define this as an helper function


};

var queueWorker = function(note, cluestrClient, cb) {
  // Send datas to Cluestr.
  // You may define this as an helper function



};

module.exports = {
  initAccount: initAccount,
  connectAccountRetrievePreDatasIdentifier: connectAccountRetrievePreDatasIdentifier,
  connectAccountRetrieveAuthDatas: connectAccountRetrieveAuthDatas,
  updateAccount: updateAccount,
  queueWorker: queueWorker,

  cluestrAppId: config.cluestr_id,
  cluestrAppSecret: config.cluestr_secret,
  connectUrl: config.connect_url
};
