'use strict';

var Evernote = require('evernote').Evernote;

// TODO: sync documents with the provider

// This function is pinged on update, with the datas stored by connectAccountRetrieveAuthDatas()
var updateAccount = function(datas, cursor, next) {
  console.log('> updateAccount');
  console.log(datas);

  next(null, [], new Date());
};

// Send datas to AnyFetch.
// Task is an item from the array returned by updateAccount
var queueWorker = function(task, AnyFetchClient, cb) {
  cb();
};

exports.updateAccount = updateAccount;
exports.queueWorker = queueWorker;