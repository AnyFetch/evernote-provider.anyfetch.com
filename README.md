# Evernote Anyfetch Provider
> Visit http://developers.anyfetch.com for details about Anyfetch.

Evernote provider fetching notes via Evernote API.

# How to install?

You'll need to define some environment variables:

```bash
# Go to http://dev.evernote.com/doc/ to ask for an API key
export EVERNOTE_CONSUMER_KEY="evernote-key"
export EVERNOTE_CONSUMER_SECRET="evernote-secret"
export EVERNOTE_CALLBACK="http://your-provider-server/init/callback"
# change to https://sandbox.evernote.com for production
# create a sandbox account for test : https://sandbox.evernote.com/Login.action?targetUrl=%2FHome.action
export EVERNOTE_DOMAINROOT="https://sandbox.evernote.com"
```

```bash
# Go to https://dev.evernote.com/#apikey to ask for app id and secret
export EVERNOTE_CONSUMER_KEY="root127"
export EVERNOTE_CONSUMER_SECRET="679e19222719114b"

# Provider URL, most probably https://your-host
export PROVIDER_URL="http://localhost:3001"
export PORT=3001

# AnyFetch app id and secret.
export ANYFETCH_API_ID="anyfetch-app-id"
export ANYFETCH_API_SECRET="anyfetch-app-secret"

export MANAGER_URL="https://manager.anyfetch.com"
export API_URL="https://api.anyfetch.com"

# Change this to "https://evernote.com" for production
export EVERNOTE_DOMAINROOT="https://sandbox.evernote.com"

# Create a sandbox account for test: https://sandbox.evernote.com/Registration.action
# You can use its developer token here
export EVERNOTE_TEST_TOKEN="evernote-test-token"

```


# How does it works?
AnyFetch Core will call `/init/connect` with anyfetch authorization code. We will generate a `request_token` and transparently redirect the user to Evernote consentment page.
Evernote will then call us back on  `/init/callback`. We'll check our `request_token` has been granted approval, and store this.

We can now sync data between Evernote and AnyFetch.

This is where the upload `helper` comes into play.
Every time upload is called, the function will retrieve, for all the accounts, the files modified since the last run, and upload the data to AnyFetch. Deleted files will also be deleted from AnyFetch.

The computation of the delta (between last run and now) is done by Evernote.


# How to test?
Unfortunately, testing this module is not easy. This project is basically a simple bridge between Evernote and AnyFetch, so testing requires tiptoeing with the network and Evernote Server / AnyFetch server.

You will have to create a developer token on your sandbox account. If you don't have one yet, sign-up [here](https://sandbox.evernote.com/Registration.action).
Go to the [Developer Tokens page](https://sandbox.evernote.com/api/DeveloperToken.action) to generate a new developer token.

You can now register it as the test token:
```bash
export EVERNOTE_TEST_TOKEN="evernote-developer-token"
```

You should be able to run the tests now.

Support: `support@anyfetch.com`.
