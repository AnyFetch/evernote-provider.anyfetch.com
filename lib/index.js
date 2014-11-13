'use strict';
/**
 * This object contains all the handlers to use for this provider
 */
var rarity = require('rarity');
var async = require('async');
var CancelError = require('anyfetch-provider').CancelError;
var Evernote = require('evernote').Evernote;

var config = require('../config/configuration.js');
var uploadNote = require('./helpers/upload.js');
var retrieveChanges = require('./helpers/retrieve.js');
var deleteNote = require('./helpers/delete.js');
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

var updateAccount = function updateAccount(serviceData, cursor, queues, cb) {
  // Retrieve all files since last call
  if(!serviceData.token) {
    return cb('token can\'t be ' + serviceData.token);
  }
  if(!cursor) {
    cursor = 0;
  }
  async.waterfall([
    function getChanges(cb) {
      retrieveChanges(cursor, serviceData.token, cb);
    },
    function applyChanges(newCursor, changes, cb) {
      if(!changes) {
        return cb(null, newCursor, serviceData);
      }
      changes.forEach(function(change) {
        if(change.deleted) {
          queues.deletion.push({
            title: change.title,
            id: change.guid
          });
        }
        else {
          queues.addition.push({
            title: change.title,
            url: config.evernoteRoot + '/Home.action#n=' + change.guid + "&ses=4&sh=2&sds=5",
            created: new Date(change.created),
            updated: new Date(change.updated),
            id: change.guid,
          });
        }
      });

      cb(null, newCursor, serviceData);
    }
  ], cb);
};

var additionQueueWorker = function additionQueueWorker(job, cb) {
  uploadNote(job.task, job.anyfetchClient, job.serviceData.token, cb);
};

var deletionQueueWorker = function deletionQueueWorker(job, cb) {
  deleteNote(job.task, job.anyfetchClient, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  });
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },
  updateAccount: updateAccount,
  workers: {
    addition: additionQueueWorker,
    deletion: deletionQueueWorker
  },

  config: config
};
