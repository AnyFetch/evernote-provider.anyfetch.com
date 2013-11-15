'use strict';

var Evernote = require('evernote').Evernote;

var notes = [];

var retrieveNotesFromNotebook = function(datas, notebookGuid, noteStore, cb) {
  
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

// Retrieve all NoteBooks

module.exports = function(datas, cursor, next) {
  var noteStore = new Evernote.Client({token: datas.accessToken}).getNoteStore();
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
    retrieveNotesFromNotebook(datas, notebookObjects[0].guid, noteStore, function(err){
      next(err, notes);
    });
  });
};
