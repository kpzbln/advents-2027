# Advent calendars

Static HTML/CSS/JavaScript site. Serve the repository over HTTP(S); service workers
do not run when opening HTML through `file://`.

## Progress and dates

`calendar-state.js` is the shared source for progress, available days, labels and
preview selection. PAYOT uses December **2026**, with each day opening at **06:00
in the visitor's local time**. Change `SEASON_YEAR` there for a different season.
Hello Kitty intentionally keeps all 24 gifts available, and Kinder Mix keeps its
existing completed state.

Existing PAYOT test progress is migrated once from `advent-opened-payot-test-v2`
to `advent-opened-payot`. Without a saved value, days 1–4 remain the initial opened
gifts. Opening dates apply to the other days; an already opened gift can always
be viewed again. Progress is local to the browser and is not an account sync.

## Images and offline support

The site uses WebP assets. Original PAYOT PNGs are preserved locally in
`.tools/original-images/advent-payot/` (ignored by Git), and remain recoverable
from earlier Git commits.

After replacing/adding source PAYOT PNGs, run `npm run optimize:images`. It keeps
matching box/product proportions, archives the PNGs, and regenerates
`offline-assets.js`. The image manifest includes every deployed image so a
successful first service-worker installation supports all gifts offline.
When changing site files, also increment the cache version in `service-worker.js`.

All three page loaders stop waiting after five seconds. Google Fonts load
without blocking page scripts, so unavailable fonts fall back to system fonts.

PAYOT's preview includes an open/view action; locked days show their opening date.
Gift cards show available/opened/locked states. Both calendar layouts keep a 360px
board on a 360px screen. `modal-dialog.js` handles focus trapping, Escape/backdrop
closing, returning focus to the trigger, and preserving background `inert` state.

## Checks

Run `npm test` for date boundaries, saved-progress migration and page integration,
resource timeouts, and offline/service-worker behavior. These tests use Node's
built-in test runner and simulated DOM/cache APIs; browser visual checks are
separate.
