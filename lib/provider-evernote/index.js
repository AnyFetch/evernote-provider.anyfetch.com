'use strict';
/**
 * This object contains all the handlers to use for this provider
 */

var config = require('../../config/configuration.js');
var async = require('async');

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

var updateAccount = function(datas, cursor, next, updateDatas) {
  // Update documents from provider
  // You may define this as an helper function

  // Connect the client & retrieve noteStore Object

  var notes = [];

  var retrieveNotesFromNotebook = function(notebookGuid, noteStore, cb) {
    
    var filter = new Evernote.NoteFilter();
    filter.notebookGuid = notebookGuid;

    var spec = new Evernote.NotesMetadataResultSpec();
        spec.includeTitle = true;
        spec.includeContentLength = false;
        spec.includeCreated = true;
        spec.includeUpdated = true;
        spec.includeDeleted = false;
        spec.includeUpdateSequenceNum = false;
        spec.includeNotebookGuid = true;
        spec.includeTagGuids = true;
        spec.includeAttributes = false;
        spec.includeLargestResourceMime = false;
        spec.includeLargestResourceSize = false;

    noteStore.findNotesMetadata(filter, 0, 100, spec, function(err, noteObjects) {
      if(!noteObjects) return cb(err);
      for (var j = 0; j < noteObjects.notes.length; j++) {
        notes.push({
          accessToken: datas.accessToken, /* HACK #TODO */
          guid: noteObjects.notes[j].guid,
          title: noteObjects.notes[j].title,
          created: noteObjects.notes[j].created,
          updated: noteObjects.notes[j].updated,
          tagGuids: noteObjects.notes[j].tagGuids
        });
        console.log("Getting Note : "+ noteObjects.notes[j].guid);
      }
      cb(err);
    });
  };

  var noteStore = new Evernote.Client({token: datas.accessToken}).getNoteStore();

  // Retrieve all NoteBooks
  noteStore.listNotebooks(function(err, notebookObjects) {
    if(!notebookObjects) return next(err);    
    // TODO : Get from all notebooks
    /*
    var fetchNotes = [];
    // Retrieve from all notebooks
    async.parallel(fetchNotes, function(err, res){
      next(err, notes);
      console.log(err, res);
    });
    */
    console.log("Getting NoteBook : "+ notebookObjects[0].guid);
    retrieveNotesFromNotebook(notebookObjects[0].guid, noteStore, function(err){
      next(err, notes);
    });
  });

};

var getUserShardId = function(userStore, callback) {
  userStore.getUser(function(err, user) {
    if (user.errorCode) {
      console.log("Exception while getting user's shardID:");
      console.log(user);
    } else {
      callback(err, user.shardId);
    }
  });
 
};

var shareSingleNote = function(noteStore, userStore, noteGuid, callback) {
  getUserShardId(userStore, function(err, shardId){
    noteStore.shareNote(noteGuid, function(err, shareKey) {
      if (shareKey.errorCode) {
        console.log("Error sharing note:");
        console.log(shareKey);
      } else {
        callback(err, config.evernote_domainroot + "/shard/" + shardId + "/sh/" + noteGuid + "/" + shareKey);
      }
    });
  });
 
}

var queueWorker = function(noteData, cluestrClient, datas, cb) {
  // Send datas to Cluestr.
  // You may define this as an helper function
  console.log("Getting Note content : "+ noteData.guid);

  var client = new Evernote.Client({token: noteData.accessToken});
  
  var noteStore = client.getNoteStore();
  var userStore = client.getUserStore();

  noteStore.getNoteContent(noteData.guid, function(err, noteBody) {
    console.log("rendering");

    // Build note "the right way"
    shareSingleNote(noteStore, userStore, noteData.guid, function(err, shareURL){
      var note = {
        identifier: noteData.guid,
        metadatas: {
          created : new Date(noteData.created),
          updated : new Date(noteData.updated)
        },
        datas: {
          title : noteData.title,
          body : noteBody
        },
        semantic_document_type: 'file',
        actions: {
          'show': shareURL
        },
        user_access: [cluestrClient.accessToken]
      };
      console.log(note);
      cluestrClient.sendDocument(note, cb);
    });
  });



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
