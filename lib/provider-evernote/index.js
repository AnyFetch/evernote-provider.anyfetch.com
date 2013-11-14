'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var config = require('../../config/configuration.js');

var initAccount = function(req, next) {
  // Redirect user to provider consentment page
  next(null, {code: req.params.code}, 'http://evernote.com/connect...');
};

var connectAccountRetrievePreDatasIdentifier = function(req, next) {
  // Retrieve identifier for current request
};

var connectAccountRetrieveAuthDatas = function(req, preDatas, next) {
  // Store new datas
};

var updateAccount = function(refreshToken, cursor, next) {
  // Update documents from provider
  // You may define this as an helper function
};

var queueWorker = function(mail, CluestrClient, cb) {
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
