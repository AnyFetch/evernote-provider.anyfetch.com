'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var config = require('../config/configuration.js');

var updateAccount = require('./helpers/retrieve.js').updateAccount;
var queueWorker = require('./helpers/retrieve.js').queueWorker;

var Evernote = require('evernote').Evernote;
var client = new Evernote.Client({
  consumerKey: config.evernote_consumer_key,
  consumerSecret: config.evernote_consumer_secret,
  sandbox: (config.env != 'production')
});

var initAccount = function(req, next) {
  //console.log('> initAccount');
  //console.log(req.params);

  // Obtain temporary credentials
  client.getRequestToken(config.evernote_callback, function(err, oauthToken, oauthTokenSecret, results) {

    var preData = {
      code: req.params.code,
      oauthToken: oauthToken,
      oauthTokenSecret: oauthTokenSecret
    }

    // Redirect user to Evernote consentment page
    var consentmentUrl = client.getAuthorizeUrl(oauthToken);
    next(err, preData, consentmentUrl);
  });
};

var connectAccountRetrievePreDatasIdentifier = function(req, next) {
  //console.log('> connectAccountRetrievePreDatasIdentifier');
  //console.log(req.params);

  if(!req.params.oauth_token) {
    throw 'oAuth token unavailable when retrieving pre-data-identifier';
  }

  // Retrieve pre-data (identified by the curent oauth_token)
  next(null, {'datas.oauthToken': req.params.oauth_token});
};

var connectAccountRetrieveAuthDatas = function(req, preDatas, next) {
  //console.log('> connectAccountRetrieveAuthDatas');
  //console.log(req.params);
  //console.log(preDatas);

  client.getAccessToken(preDatas.oauthToken, preDatas.oauthTokenSecret, req.params.oauth_verifier, function(err, oauthAccessToken, oauthAccessTokenSecret, results) {

    // The parameters that are returned by Evernote are url-encoded
    // Note: `oauthAccessTokenSecret` is unused by Evernote, should be empty
    var toStore = {
      oauthAccessToken: oauthAccessToken,
      oauthTokenSecret: oauthAccessTokenSecret,
      evernoteStoreUrl: results.edam_noteStoreUrl,
      evernoteUserId: results.edam_userId
    }

    // Store this useful info
    // Optional third parameter: URL to redirect to
    next(err, toStore);
  });
};


module.exports = {
  initAccount: initAccount,
  connectAccountRetrievePreDatasIdentifier: connectAccountRetrievePreDatasIdentifier,
  connectAccountRetrieveAuthDatas: connectAccountRetrieveAuthDatas,
  updateAccount: updateAccount,
  queueWorker: queueWorker,

  anyfetchAppId: config.anyfetch_id,
  anyfetchAppSecret: config.anyfetch_secret,
  connectUrl: config.connect_url
};
