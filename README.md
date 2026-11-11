# DecodeKey

A tiny client-side toolbox for developers: JWT inspector, Base64, URL, hex, HTML entities and JSON formatter.

Everything runs in the browser. No backend, no analytics, no third-party scripts.

## Structure

```
index.html            landing page with the tools
about.html            about the project
privacy.html          privacy policy
articles/             short practical articles
css/style.css         styles
js/app.js             all tool logic (vanilla JS, no build step)
favicon.svg           icon
robots.txt            crawler rules
sitemap.xml           sitemap
```

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

## Deployment

Pushes to `main` are deployed to the production server by GitHub Actions
(`.github/workflows/deploy.yml`) over rsync + SSH. Secrets used by the workflow:

- `DEPLOY_HOST` — server address
- `DEPLOY_USER` — SSH user
- `DEPLOY_KEY` — private key authorized on the server

Manual deploy:

```bash
rsync -az --delete --exclude='.git' --exclude='.github' ./ user@host:/var/www/html/
```

## License

MIT
