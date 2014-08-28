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
var deleteNote = require('./helpers/delete.js');
var client = new Evernote.Client({
  consumerKey: config.evernoteKey,
  consumerSecret: config.evernoteSecret,
  sandbox: (config.env !== "production")
});


var redirectToService = function(callbackUrl, cb) {
  // Redirect user to provider consentment page
  client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret) {
    var redirectUrl = client.getAuthorizeUrl(oauthToken);
    cb(null, redirectUrl, {redirectUrl: redirectUrl, callbackUrl: callbackUrl, oauthTokenSecret: oauthTokenSecret});
  });
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  if(!reqParams.oauth_verifier) {
    return cb(new CancelError());
  }

  async.waterfall([
    function getToken(cb) {
      client.getAccessToken(reqParams.oauth_token, storedParams.oauthTokenSecret, reqParams.oauth_verifier, cb);
    },
    function getUserInfo(token, tokenSecret, results, cb) {
      var client = new Evernote.Client({ token: token });
      var userStore = client.getUserStore();
      userStore.getUser(rarity.carry([token], cb));
    },
    function callFinalCb(token, data, cb) {
      cb(null, data.username, {token: token, callbackUrl: storedParams.callbackUrl});
    }
  ], cb);
};

var updateAccount = function(serviceData, cursor, queues, cb) {
  // Retrieve all files since last call
  var time = Date.now();
  console.log((Date.now() - time) + 'ms');
  if(!serviceData.token) {
    return cb('token can\'t be ' + serviceData.token);
  }
  if(!cursor) {
    cursor = new Date('1970');
  }
  async.waterfall([
    function retrieveChanges(cb) {
      var spec = new Evernote.SyncChunkFilter();
      spec.includeNotes = true;
      try {
        var NoteStore = new Evernote.Client({token: serviceData.token}).getNoteStore();
        NoteStore.getFilteredSyncChunk(serviceData.token, cursor.getTime(), 1000, spec, cb);
      }
      catch(err) {
        return cb(err);
      }
    },
    function getNotes(syncChunck, cb) {
      console.log((Date.now() - time) + 'ms');
      cb(null, new Date(syncChunck.currentTime), syncChunck.notes);
    },
    function applyChanges(newCursor, changes, cb) {
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
            url: config.evernoteRoot + '/Home.action?#st=p&n=' + change.guid,
            created: new Date(change.created),
            updated: new Date(change.updated),
            id: change.guid,
          });
        }
      });

      console.log((Date.now() - time) + 'ms');
      cb(null, newCursor, serviceData);
    }
  ], cb);
};

var additionQueueWorker = function(job, cb) {
  uploadNote(job.task, job.anyfetchClient, job.serviceData.token, cb);
};

var deletionQueueWorker = function(job, cb) {
  deleteNote(job.task, job.anyfetchClient, cb);
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
