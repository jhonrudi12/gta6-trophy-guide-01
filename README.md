# Leonida Platinum

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jhonrudi12/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jhonrudi12/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that guides you to the Grand Theft Auto VI platinum trophy: all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with own-words guides, a 3-stage road to the platinum, a missables warning, and a spoiler-safe checklist that tracks your progress locally. Built for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **55 trophies, verified:** names, descriptions and grades checked against the official list on Exophase and PSNProfiles on 2026-11-19 — 0 missing, 0 extra. Each trophy carries a guide in this app's own words with a named source (PowerPyx, GTA Zone, and others). The 5 trophies no published guide has confirmed yet are marked honestly as unconfirmed instead of inventing a location.
- **Checklist + progress:** tick trophies off, see PSN rarity counters, filter by kind (story / missable / collectibles / activities), grade or status, and search. Progress lives in localStorage; export and import it, or load the demo seed.
- **Spoiler-safe:** 28 hidden trophies stay covered until you earn them (or turn spoilers on).
- **Roadmap:** a 3-stage plan — story (Chapters 1–5), the 100% Completion checklist, then Strangers & Freaks and cleanup — about 200 hours at difficulty 4/10, one playthrough, no New Game+ needed.
- **Missables:** exactly one trophy is potentially missable — Positive Mental Attitude (the Chapter 1 meditation at Jason's house). Everything else can still be earned in free-roam after the story.
- **Offline:** the app runs fully offline from its own static files; the only absolute URLs are 5 citation links in the trophy data.

## Run it

```bash
# Regenerate app/ + screenshots/ + dossier.json (deterministic)
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

# Serve the app and open it in desktop Chrome
npx serve out/app   # or any static server pointed at out/app
```

Or open `app/index.html` from a static server directly — the app works fully offline, with no network requests.

All guides are this app's own words; no Rockstar Games logo or artwork is used.
