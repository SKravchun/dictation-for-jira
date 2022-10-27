# Dictation for jira, compose your text by voice

## Quick start

- Modify your app by editing the files in `static/speech-to-text/src/`.


```
cd static/speech-to-text
```
```
npm install
```
npm run build
```

- Deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.
