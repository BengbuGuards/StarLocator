# Repository Guidelines

## Project Overview

StarLocator (照片测星定位) — a web app that estimates the photographer's geographic location from a night-sky photo plus its capture time (camera-as-sextant celestial navigation). Users mark stars and plumb lines on a fabric.js canvas; the backend solves astrometry via nova.astrometry.net + SIMBAD, then computes position, hour-angle/declination, or observation time from the moon. Accuracy typically < 30 km. AGPL-3.0. Monorepo: vanilla-JS/webpack frontend (`src/`) + Python 3.12 FastAPI backend (`backend/`).

## Architecture & Data Flow

**Frontend** (`src/`, plain JavaScript — no framework, no TypeScript): entry `src/index.js` creates `InteractPhoto` (`src/interface/classes/interact.js`), the central mutable state object (fabric.js canvas, element refs, `CeleArray`/`PLArray` object pools). `EventManager` (`src/interface/init.js`) wires mouse/touch/button events; UI actions live in `src/interface/functions/*` as classes extending `DefaultbuttonFunctioner`; drawable entities in `src/interface/elements/*`. All API calls go through the `post(url, data, 'form'|'json')` helper in `src/interface/utils.js`, which returns a `[results, detail]` tuple — always check `detail == 'success'` before using results.

**Backend** (`backend/`): FastAPI app assembled in `main.py` (CORS, slowapi rate limiting, lifespan-managed shared httpx client). Routers mount at `/api/positioning`, `/api/astrocoord`, `/api/moontime`, `/api/astrometry/{extractstars,submit,jobidstatus/{id},recognize,recognize-stream}`. Domain logic lives in `core/`: `astro_coord` (celestial coordinates, SIMBAD lookups), `astrometry` (star extraction via SEP; astrometry.net submit/poll/recognize), `moon_time` (time-from-moon optimization), `positioning` (geo solver with method suites: `find_z`, `latitude`, `locator`, `top_point`), `stellarium` (ground-truth chart generation).

**Representative flow** (star recognition): photo dropped on canvas → `POST /api/astrometry/extractstars` (SEP extraction in a worker thread) → star positions rendered → `CeleRecognition.js` consumes SSE from `/api/astrometry/recognize-stream` → backend uploads to astrometry.net, polls every 1s, matches solved RA/Dec against SIMBAD (semaphore-limited concurrent queries) and solar-system bodies → streams `hd_names` → positioning/moontime reuse those coordinates for numeric solving.

External services are load-bearing: nova.astrometry.net (plate solving, needs API key) and SIMBAD (star-name resolution). Both are queried over the network by tests too.

## Key Directories

| Path | Purpose |
|---|---|
| `src/index.js` | Frontend entry (webpack bundle) |
| `src/config.js` | `BACKEND_API` base URL — baked into HTML at **build time** via Handlebars |
| `src/interface/functions/`, `elements/` | Button action handlers / drawable entities |
| `backend/main.py` | FastAPI app assembly |
| `backend/routers/` | Route handlers, `limiter.py` (slowapi) |
| `backend/schemas/` | Pydantic v2 request/response models |
| `backend/core/` | Algorithms + external-service clients |
| `backend/core/*/benchmark.py` | Method-comparison benchmarks (run standalone) |
| `backend/tests/` | pytest suite |
| `examples/` | Sample sky photos + marked-star coordinates CSV |
| `dist/` | Webpack build output (gitignored) |

## Development Commands

```bash
# Frontend (repo root)
pnpm install
pnpm dev          # webpack-dev-server on :6974
pnpm build        # production build -> dist/
pnpm serve        # static-serve dist/ on :6974
pnpm lintfix      # eslint --fix
pnpm format       # prettier '**/*.js'

# Backend (backend/)
cp config.example.py config.py   # then edit (needs ASTROMETRY_API_KEY)
uv sync                          # installs from uv.lock incl. dev group
uv run python main.py            # or: uv run uvicorn main:app --port 6975 --reload
uv run pytest tests              # requires backend running first
uvx ruff check .                 # lint (config in pyproject.toml)
uvx pyright                     # type check (config in pyrightconfig.json)
```

CI (`.github/workflows/format-check.yml`) only gates formatting: PRs must be clean after `pnpm lintfix && pnpm format`.

## Code Conventions & Common Patterns

**Backend**
- CPU-bound work inside async handlers MUST use `await asyncio.to_thread(...)`; never block the event loop.
- Shared HTTP: use `get_http_client()` from `core/utils/http.py` (loop-aware singleton; created in FastAPI lifespan). Never construct ad-hoc clients.
- Cache remote lookups with `@alru_cache(maxsize=CACHE_SIZE)` (see `core/astro_coord/remote.py`).
- Error convention: core raises `ValueError` with Chinese messages; routers catch and return `{detail: str, ...}` dicts instead of raising `HTTPException`.
- Every route takes `request: Request` as first param (slowapi requirement); decorators stacked as `@router.post(...)` above `@limiter.limit(LIGHT|MEDIUM|HEAVY_RATE_LIMIT)`.
- Outbound calls to flaky services: retry transient errors with backoff and bound concurrency with `asyncio.Semaphore(3)` (see `find_star` in `core/astrometry/solve.py`).
- Comments/docstrings/user-facing strings are Chinese; camelCase JSON fields (`starNames`, `approxTimestamp`).
- `core/astrometry/client.py` is vendored from astrometry.net — do not restyle it; it is excluded from ruff and pyright.
- Local top-level modules (`config`, `core`, `routers`, `schemas`) are declared in `[tool.ruff.lint.isort] known-first-party` — do not rely on file-presence-based classification: `config.py` is gitignored and may not exist, which would silently flip import sorting.
- Full-width CJK punctuation and Greek letters in comments/star catalogs are intentional; ruff ignores RUF001–003 for this reason.

**Frontend**
- One class per file under `src/interface/`; naming by role suffix (`InteractPhoto`, `CeleArray`, `*buttonFunctioner`); wire handlers with `.bind(eventManager)`.
- Backend URL changes require editing `src/config.js` **and rebuilding** (injected at build time).

## Important Files

- `backend/config.example.py` → copy to `backend/config.py` (gitignored): ports, `BACKEND_API_BASEURL`, `ASTROMETRY_API_KEY`, upload size cap, rate-limit tiers, `MAX_CONNECTIONS`.
- `src/config.js`: frontend's backend URL.
- `webpack.common.js`: entries `main`/`sitecss`, Handlebars HTML injection of `{back_host, version}`.
- `backend/pyproject.toml`: deps, ruff + pytest config, dev group (pytest, matplotlib).
- `NOTICE.md`: third-party attributions (Fabric.js, sep, astrometry.net, Stellarium-derived star data).

## Runtime/Tooling Preferences

- Python ≥ 3.12 managed with **uv** (`uv.lock` is authoritative; older docs mention `pip -r requirements.txt` but no such file exists — use `uv sync`). Lint with `uvx ruff check .`.
- Frontend package manager is **pnpm only** (`package-lock.json` gitignored; pnpm v10 build-approval for `canvas` in `pnpm-workspace.yaml`). The backend is NOT part of the pnpm workspace.
- No TypeScript anywhere (no tsconfig); ESLint flat config (`eslint.config.mjs`) ignores `dist/` and `backend/.venv/`; prettier runs via eslint-plugin-prettier.
- Ports: frontend 6974, backend 6975. Branching: base feature branches off `dev` (main development branch), PRs target `dev`.

## Testing & QA

- pytest ≥ 9 (dev dependency group). Run from `backend/`: `cd backend && uv run pytest tests`. Single file/case works thanks to `tests/__init__.py` and `tests/test_astrometry/__init__.py`.
- Pattern: each module has `test_local()` (calls core functions directly via `asyncio.run(...)`, asserts inline golden values with `pytest.approx`) and `test_remote()` (httpx POST to the same endpoint on a running backend, identical assertions).
- **Remote tests require the backend running first**: start `uv run uvicorn main:app --port 6975` before `pytest tests`, or all `test_remote` fail with connection refused.
- All tests hit live nova.astrometry.net/SIMBAD — network jitter causes occasional failures unrelated to code changes (source retries + concurrency limits mitigate; slow remote calls pass explicit `timeout=60`). `test_recognize` pins a historical astrometry.net job id.
- Frontend has no tests (`pnpm test` is a placeholder that errors). No build/test CI — only the format gate.
