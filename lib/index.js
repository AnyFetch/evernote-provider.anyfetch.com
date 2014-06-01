'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var config = require('../config/configuration.js');

var Evernote = require('evernote').Evernote;

var initAccount = function(req, next) {
  // Redirect user to provider consentment page
  next(null, {code: req.params.code}, 'http://PROVIDER.com');
};

var connectAccountRetrievePreDatasIdentifier = function(req, next) {
  // Retrieve identifier for current request
  next(null, {'datas.code': req.params.state});
};

var connectAccountRetrieveAuthDatas = function(req, preDatas, next) {
  // Store new datas
  next(null, {some: "datas"});
};

var updateAccount = function(datas, cursor, next) {
  // Update documents from provider
  // You may define this as an helper function
  // this function is pinged on update, with the datas stored by connectAccountRetrieveAuthDatas()
  next(null, [], new Date());
};

var queueWorker = function(task, AnyFetchClient, cb) {
  // Send datas to AnyFetch.
  // You may define this as an helper function
  // Task is an item from the array returned by updateAccount
  cb();
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
