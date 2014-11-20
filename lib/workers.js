'use strict';

var uploadNote = require('./helpers/upload.js');
var deleteNote = require('./helpers/delete.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  uploadNote(job.task, job.anyfetchClient, job.serviceData.token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  deleteNote(job.task, job.anyfetchClient, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  });
};
