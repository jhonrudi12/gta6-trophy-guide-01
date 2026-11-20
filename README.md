# Leonida Platinum

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jhonrudi12/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jhonrudi12/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that guides you to the Grand Theft Auto VI platinum trophy on PlayStation 5: all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with their official names, descriptions and grades, a guide in this app's own words for each one with its sources named beside it, a checklist tracker, a three-stage roadmap to the platinum, and a warning for the one potentially missable trophy. Built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **All 55 trophies, with sources:** every trophy shows its official name, description and grade, plus a guide written for this app and the sources each fact comes from — mainly PowerPyx's trophy guide and roadmap, cross-checked against PushSquare, KeenGamer and GameMapa. Where a guide is still unconfirmed (Fair Game's exact animal, and whether the Chapter 1 meditation is required), the app says so instead of inventing a step.
- **Checklist tracker:** tick trophies off as you earn them; progress is saved in the browser (localStorage), and can be exported to a JSON file and imported back. Filter by kind (story, missable, collectibles, activities, side quests & open world, online, platinum), grade or status, and search by name or description. A "Load demo progress" button ticks off a sample set of 12 trophies to try the tracker.
- **Spoiler-safe:** turning on "Hide story spoilers" covers the names, descriptions and guides of the 12 story trophies until you earn them.
- **Roadmap to the platinum:** three stages — story in Chapters 1–5 (60–80 hours), the 100% Completion checklist (about 100 hours), then Strangers & Freaks and cleanup (about 10 hours) — about 200 hours in total at difficulty 4/10, one playthrough, no online trophies, no New Game+ needed (PowerPyx).
- **Missables:** exactly one trophy is potentially missable — Positive Mental Attitude, whose Chapter 1 meditation at Jason's house can only be done before Chapter 1 ends. Everything else can still be earned in free-roam after the story.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Hand it in with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css` — the app shell and its own look (no Rockstar logo or artwork anywhere).
- `app/app.js` — bootstrap: loads the data, wires the toolbar, views and hash routes.
- `app/checklist.js` — renders the checklist rows, filters, search and spoiler masking.
- `app/guide.js` — renders the selected trophy's guide panel with its sources.
- `app/roadmap.js` — renders the roadmap stages, missables and platinum facts.
- `app/progress.js` — localStorage progress, export/import and the demo seed.
- `app/data/trophies.json` — the 55 trophies with official names, descriptions, grades, kinds, targets, guides and sources.
- `app/data/roadmap.json` — the roadmap stages, missable notes and platinum facts.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.
- `serve.ts` — a small static server for local testing.
- `screenshots/` — four real renders of the app in a browser (the first by name is the cover).

## Notes

- The app works with the network off: every script, stylesheet and data file it loads lives under `app/`. Source links are plain anchor links — the app fetches nothing itself.
- Trophy names and descriptions are shown exactly as PlayStation publishes them, including the asterisks in "T**s Ass Drug Money". Everything else is written in this app's own words.
