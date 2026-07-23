# Arkay Management Meeting Notes — Executive Dashboard

A single-page executive dashboard for Arkay monthly management meetings. Latest meeting loads by default; switch months without leaving the page.

## Live site

https://gracemariano.github.io/arkaysite/

## Adding a new month

1. Copy an existing file in `meetings/` (e.g. `july-2026.json`).
2. Update all fields: `id`, `title`, `meetingDate`, `executiveSummary`, `kpis`, `sections`, `actions`, `searchKeywords`.
3. Add an entry to `meetings/index.json` (newest first).
4. Deploy: `node deploy-to-github.mjs` (requires `GITHUB_TOKEN` or `gh auth login`).

Meetings are sorted automatically by `meetingDate` in the app.

## Deploy

```bash
export GITHUB_TOKEN=$(gh auth token)
node deploy-to-github.mjs
```
