'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var config = require('../../config/configuration.js');

var retrieveAllNote = require('./helpers/retrieve.js');
var uploadOneNote = require('./helpers/upload.js');

var Evernote = require('evernote').Evernote;
var clientAuth = new Evernote.Client({
  consumerKey: config.evernote_consumer_key,
  consumerSecret: config.evernote_consumer_secret,
  sandbox: (config.env!=="production")
});

var initAccount = function(req, next) {
  // Redirect user to provider consentment page
  clientAuth.getRequestToken(config.evernote_callback, function(error, oauthToken, oauthTokenSecret) {
    next(error, {authTokenSecret: oauthTokenSecret, oauthToken: oauthToken}, clientAuth.getAuthorizeUrl(oauthToken));
  });
};

var connectAccountRetrievePreDatasIdentifier = function(req, next) {
  // Retrieve identifier for current request
  next(null, {'datas.oauthToken': req.params.oauth_token});

};

var connectAccountRetrieveAuthDatas = function(req, preDatas, next) {
  // Store new datas
  clientAuth.getAccessToken(req.params.oauth_token, preDatas.authTokenSecret, req.params.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret) {
    var datas = {
      accessToken: oauthAccessToken,
      accessTokenSecret: oauthAccessTokenSecret
    };
    next(error, datas);
  });
};

module.exports = {
  initAccount: initAccount,
  connectAccountRetrievePreDatasIdentifier: connectAccountRetrievePreDatasIdentifier,
  connectAccountRetrieveAuthDatas: connectAccountRetrieveAuthDatas,
  updateAccount: retrieveAllNote,
  queueWorker: uploadOneNote,

  anyfetchAppId: config.anyfetch_id,
  anyfetchAppSecret: config.anyfetch_secret,
  connectUrl: config.connect_url
};
