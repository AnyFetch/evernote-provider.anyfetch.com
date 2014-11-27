'use strict';

/**
 * Delete file onto AnyFetch.
 *
 *
 * @param {Object} task Data of the task
 * @param {Object} anyfetchClient Client for delete
 * @param {Function} cb Callback to call once file has been deleted.
 */
module.exports = function deleteNote(task, anyfetchClient, cb) {
  anyfetchClient.deleteDocumentByIdentifier(task.identifier, cb);
};
