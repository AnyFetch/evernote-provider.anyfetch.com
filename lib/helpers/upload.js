'use strict';

var Evernote = require('evernote').Evernote;
var config = require('../../../config/configuration.js');

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
};

module.exports = function(noteData, anyfetchClient, datas, cb){

  var client = new Evernote.Client({token: noteData.accessToken});

  var noteStore = client.getNoteStore();
  var userStore = client.getUserStore();

  console.log("Getting note content: " + noteData.guid);

  noteStore.getNoteContent(noteData.guid, function(err, noteBody) {
    // Build note "the right way"

    shareSingleNote(noteStore, userStore, noteData.guid, function(err, shareURL){

      var htmlToText = require('html-to-text');
      var noteBodyText = htmlToText.fromString(noteBody);

      var note = {
        identifier: shareURL,
        metadatas: {
          title : noteData.title,
          text : noteBodyText
        },
        datas: {
          // TODO: getTags
          html : noteBody
        },
        document_type: 'document',
        actions: {
          'show': shareURL
        },
        creation_date : new Date(noteData.created),
        last_modification : new Date(noteData.updated),
        user_access: [anyfetchClient.accessToken]
      };
      console.log(note);
      anyfetchClient.sendDocument(note, cb);
    });
  });
};
