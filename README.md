# Dictation for jira, compose your text by voice

## Quick start

- You must first have installed the Forge CLI.
- If you don't have it, you can set it up using this lin: https://developer.atlassian.com/platform/forge/getting-started/
- Then follow the instructions below.

```
cd static/speech-to-text
```
```
npm install
```

```
npm run build
```
```
cd ../../
```
```
npm install
```
```
forge deploy
```
```
forge install
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.
