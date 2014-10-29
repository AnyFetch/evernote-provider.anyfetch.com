/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

var defaultEvernoteRoot = (node_env === 'development' || node_env === 'test') ? 'https://sandbox.evernote.com' : 'https://www.evernote.com';

var config = {
  env: node_env,
  port: process.env.PORT || default_port,
  workers: process.env.WORKERS || 1, // Number of workers for upload tasks

  evernoteKey: process.env.EVERNOTE_API_ID,
  evernoteSecret: process.env.EVERNOTE_API_SECRET,
  evernoteRoot: process.env.EVERNOTE_DOMAINROOT || defaultEvernoteRoot,

  appId: process.env.ANYFETCH_API_ID,
  appSecret: process.env.ANYFETCH_API_SECRET,

  providerUrl: process.env.PROVIDER_URL,

  testToken: process.env.EVERNOTE_TEST_TOKEN || (process.env.EVERNOTE_TEST_TOKEN_PART1 + process.env.EVERNOTE_TEST_TOKEN_PART2),

  kue: {
    attempts: 2,
    backoff: {delay: 20 * 1000, type: 'fixed'}
  },

  opbeat: {
    organizationId: process.env.OPBEAT_ORGANIZATION_ID,
    appId: process.env.OPBEAT_APP_ID,
    secretToken: process.env.OPBEAT_SECRET_TOKEN
  }
};

config.clientConfig = {
  consumerKey: config.evernoteKey,
  consumerSecret: config.evernoteSecret,
  sandbox: (config.env === "development" || config.env === "test")
};

// Exports configuration for use by app.js
module.exports = config;
