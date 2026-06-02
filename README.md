# Management Meeting Notes — Scroll Presentation

Executive-style scroll-snap site for the Kaneff family management session (June 2, 2026).

**Participants:** Michell Kaneff, Josh Kaneff, Max Kaneff, Walter Shiels

## View locally

```bash
cd /Users/gracenicolemariano/Documents/management-meeting-notes
ruby -run -e httpd . -p 8780 -b 127.0.0.1
```

Open [http://127.0.0.1:8780](http://127.0.0.1:8780)

## Features

- **Scroll-stopping** — `scroll-snap-stop: always` on 14 full-screen sections
- **Key numbers panel** — all thresholds and dates in one place
- **Arrow keys** — ↑ / ↓ move between sections
- **Progress bar** — top of viewport while scrolling

## GitHub Pages

After push to `main`, enable **Settings → Pages → Build and deployment → GitHub Actions**.

Live URL: [https://gracemariano.github.io/arkaysite/](https://gracemariano.github.io/arkaysite/)

## Ship to GitHub

Repo: [gracemariano/arkaysite](https://github.com/gracemariano/arkaysite)

```bash
cd /Users/gracenicolemariano/Documents/management-meeting-notes
git push -u origin main
```

If HTTPS asks for credentials, use GitHub CLI once:

```bash
gh auth login
git push -u origin main
```

Or upload via API (personal access token with `repo` scope):

```bash
GITHUB_TOKEN=ghp_YOUR_TOKEN node deploy-to-github.mjs
```
