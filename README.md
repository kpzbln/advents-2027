# Advent calendars

Static HTML/CSS/JavaScript site. Serve the repository over HTTP(S); service workers
do not run when opening HTML through `file://`.

## Development

The repository includes a local Node.js runtime in `.tools`, but that folder is
ignored by Git. In PowerShell, from the project root, add it to `PATH` once per
terminal session:

```powershell
$nodeDir = Join-Path (Get-Location) ".tools\node-v22.23.5-win-x64"
$env:Path = "$nodeDir;$env:Path"
```

Then run `npm start` to serve the site at `http://localhost:4173/`, or run
`npm run check` to validate JavaScript, manifest and offline assets before the
test suite. `npm run test:browser` runs real Chromium smoke tests using the
installed Edge/Chrome executable. If `.tools\node-v22.23.5-win-x64` is missing,
install Node.js 22 LTS and reopen the terminal.

## Progress and dates

`app-config.js` is the shared source for the 2026 season and the 2027 PWA cache
version. `calendar-state.js` contains progress, available days, labels and
preview selection. PAYOT uses December **2026**, with each day opening at **06:00
in the visitor's local time**. `calendar-controller.js` shares storage refreshes
and next-opening timers between the calendar pages.
Hello Kitty follows the same daily December schedule as PAYOT, and Kinder Mix
keeps its existing completed state.

PAYOT starts with no opened gifts for a new browser. Opening dates apply to each
day; an already opened gift can always be viewed again. Progress is local to the
browser and is not an account sync.

## Images and offline support

The site uses WebP assets. Original PAYOT PNGs are preserved locally in
`.tools/original-images/advent-payot/` (ignored by Git), and remain recoverable
from earlier Git commits.

Gift descriptions and image mappings live in `calendar-data.js`; page scripts only
contain rendering and interaction logic. After replacing/adding source PAYOT PNGs, run `npm run optimize:images`. It keeps
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

Run `npm test` for date boundaries, saved progress and page integration,
resource timeouts, and offline/service-worker behavior. These tests use Node's
built-in test runner and simulated DOM/cache APIs; browser visual checks are
separate.
