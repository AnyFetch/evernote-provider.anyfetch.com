'use strict';

var Evernote = require('evernote').Evernote;
var config = require('../../config/configuration.js');

/**
 * Retrieve changes from Evernote
 *
 *
 * @param {Object} cursor Cursor for Evernote
 * @param {Object} token Token for Evernote
 * @param {Function} cb Callback to call once changes have been retrieved.
 */
module.exports = function retrieveChanges(cursor, token, cb) {
  var spec = new Evernote.SyncChunkFilter();
  spec.includeNotes = true;

  var NoteStore = new Evernote.Client({
    token: token,
    sandbox: config.clientConfig.sandbox
  }).getNoteStore();

  NoteStore.getFilteredSyncChunk(token, cursor, 1000, spec, function(err, syncChunk) {
    cb(err, syncChunk && syncChunk.chunkHighUSN ? syncChunk.chunkHighUSN : cursor, syncChunk.notes);
  });
};
