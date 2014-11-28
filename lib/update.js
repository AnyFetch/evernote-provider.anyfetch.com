'use strict';

var async = require('async');

var config = require('../config/configuration.js');
var retrieveChanges = require('./helpers/retrieve.js');

module.exports = function updateAccount(serviceData, cursor, queues, cb) {
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
          if(cursor) {
            queues.deletion.push({
              title: change.title,
              identifier: change.guid
            });
          }
        }
        else {
          queues.addition.push({
            title: change.title,
            url: config.evernoteRoot + '/Home.action#n=' + change.guid + "&ses=4&sh=2&sds=5",
            created: new Date(change.created),
            updated: new Date(change.updated),
            identifier: change.guid,
          });
        }
      });

      cb(null, newCursor, serviceData);
    }
  ], cb);
};
