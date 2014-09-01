'use strict';

var Evernote = require('evernote').Evernote;
var rarity = require('rarity');
var async = require('async');
var enml = require('enml-js');
var parseString = require('xml2js').parseString;

/**
 * Evernote gives us a shitty fake buffer structured as the following one:
 *   buffer: {
 *     _body: {
 *       '1': 135,
 *       '2': 255,
 *       '3': 2,
 *       ...
 *       '156566': 123
 *     },
 *     size: 156566
 *   }
 * We need to parse it in a native node buffer
 */
var convertBuffer = function convertBuffer(evernoteBuffer) {
  var size = evernoteBuffer.size;
  var data = new Array(size);
  Object.keys(evernoteBuffer._body).forEach(function(pos) {
    data[parseInt(pos)] = evernoteBuffer._body[pos];
  });
  return new Buffer(data);
};


var extractRecognition = function extractRecognition(note, keywords, cb) {
  async.reduce(note.resources, keywords, function(keywords, resource, cb) {
    if(!resource.recognition) {
      return cb(null, keywords);
    }
    var xml = convertBuffer(resource.recognition).toString();
    async.waterfall([
      function parseXML(cb) {
        parseString(xml, cb);
      },
      function formatXML(xml, cb) {
        if(!xml.recoIndex || !xml.recoIndex.item || !Array.isArray(xml.recoIndex.item)) {
          return cb(null, []);
        }
        // Build new array from multiple xml.recoIndex.item
        var tmp = xml.recoIndex.item.reduce(function(ret, item) {
          return ret.concat(item.t);
        }, []);
        // Words less than 3 chars are irrelevant.
        tmp = tmp.filter(function(word) {
          return word._.length >= 3;
        });
        cb(null, tmp);
      },
    ], function(err, result) {
      cb(err, keywords.concat(result));
    });
  }, rarity.carry([note], cb));
};


/**
 * Upload `note` (containing note data) onto AnyFetch.
 *
 *
 * @param {Object} note to upload, plus anyfetchClient
 * @param {Object} anyfetchClient Client for upload
 * @param {Object} accessToken Access token of the current account
 * @param {Function} cb Callback to call once contacts has been uploaded.
 */
module.exports = function(task, anyfetchClient, accessToken, cb) {
  console.log("Uploading", task.title);
  var client = new Evernote.Client({ token: accessToken });
  var NoteStore = client.getNoteStore();
  async.waterfall([
    function getNote(cb) {
      NoteStore.getNote(accessToken, task.id, true, true, true, true, cb);
    },
    function getKeywords(note, cb) {
      var keywords = [];
      if(!note.resources) {
        return cb(null, note, keywords);
      }
      extractRecognition(note, keywords, cb);
    },
    function uploadNote(note, keywords, cb) {
      var noteHTML = enml.HTMLOfENML(note.content, note.resources);
      var newNote = {
        identifier: task.id,
        actions: {
          show: task.link
        },
        data: {
          html: noteHTML
        },
        metadata: {
          path: '/' + task.title,
          keywords: keywords
        },
        document_type: 'document',
        creation_date: task.created,
        user_access: [anyfetchClient.accessToken]
      };

      anyfetchClient.postDocument(newNote, rarity.slice(1, cb));
    }
  ], cb);
};
