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

# How does it works?
Anyfetch Core will call `/init/connect` with authorization code. We will generate a `request_token` and transparently redirect the user to the Evernote consentment page.
Evernote will then call us back on `/init/callback`. We'll check our `request_token` has been granted approval, and store it.

This is where the `upload` helper comes into play.
Every time `upload` is called, the function will retrieve, from all notebooks, the notes and upload them to AnyFetch Core.

# Todo
 - Sync deleted files with AnyFetch
 - Delta computation (between last run and now) is not yet implemented


Support: `support@papiel.fr`.
