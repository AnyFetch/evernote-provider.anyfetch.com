/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  workers: process.env.WORKERS || 1, // Number of workers for upload tasks

  evernote_consumer_key: process.env.EVERNOTE_CONSUMER_KEY,
  evernote_consumer_secret: process.env.EVERNOTE_CONSUMER_SECRET,
  evernote_callback: process.env.EVERNOTE_CALLBACK,
  evernote_domainroot: process.env.EVERNOTE_DOMAINROOT,


  connect_url: process.env.EVERNOTE_CONNECT_URL,
  callback_url: process.env.EVERNOTE_CALLBACK_URL,
  anyfetch_id: process.env.EVERNOTE_ANYFETCH_ID,
  anyfetch_secret: process.env.EVERNOTE_ANYFETCH_SECRET,
};
