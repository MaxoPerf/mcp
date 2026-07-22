# Browser tests — every supported shape, and the traps

Grounded in TASK-1218's live browser matrix (`e2e/browser-matrix/`, 7 forms × chrome/edge/firefox
× happy/fail = 42 cells). Every claim here was confirmed on a real run against a real browser,
not inferred from source. Where something is NOT supported, that is stated plainly.

## The forms, and when to use each

| Form | What the user uploads | Pick it when |
| --- | --- | --- |
| **Playwright spec** | `.ts`/`.js` importing `@playwright/test`, with `test(...)` blocks | New browser test, no existing asset. **Default.** |
| **Playwright library script** | `.ts`/`.js` importing `playwright`, driving `chromium.launch()` itself | The user already has a plain Playwright automation script |
| **Playwright IIFE script** | Library script whose work is inside `(async () => { … })()` | Same as above — extremely common real-world shape |
| **Selenium test script** | `.py` with a `def test_*()` function | The user has a Selenium script already written as a test |
| **Selenium bare script** | `.py` with top-level code or `if __name__ == '__main__':` | The user has an ordinary Selenium automation script |
| **Interactive (scriptless)** | No file at all — `authoringMode: 'interactive'` + `browserSteps` | The user has no code and wants to describe a journey |
| **Taurus YAML** | `entrypoint.yaml` referencing a script | Multiple scenarios/executions in one test |

**All of these are supported. Upload the user's script as-is** — never ask them to rewrite it into
a different shape. The platform detects the shape from content and wraps it when needed:

- A Playwright **library** script is wrapped in a generated one-test spec so `playwright test` can
  run it (a library script declares no tests; unwrapped it fails with `No tests found`).
- A Selenium **bare** script is wrapped in a generated `test_maxoperf_entry.py` using
  `runpy.run_path(..., run_name='__main__')` — the `run_name` is what makes an
  `if __name__ == '__main__':` guard actually fire (unwrapped: `Nothing to test`).

## Browser selection

`browser` on the test is `chrome` | `edge` | `firefox`. All three are live-validated across every
scripted form.

- **`chrome` means real vendor Google Chrome**, not Chromium. A script calling `chromium.launch()`
  gets vendor Chrome automatically (the runner injects `channel: 'chrome'`); `edge` maps to
  `channel: 'msedge'`. Firefox is a separate engine, not a channel.
- For a **Selenium** script the browser the script itself constructs wins (`webdriver.Chrome()` vs
  `webdriver.Firefox()`); the platform pins the matching driver binary but cannot launch a
  different browser than the code asks for. Say so if the user's `browser` selection and their
  script disagree.
- Multi-browser: run N separate runs, one per browser. There is no single run that drives several
  browser types.

## What a healthy browser run produces

Assert these when validating; a run missing any of them is not healthy even if it says `passed`:

| Signal | Notes |
| --- | --- |
| **samples** | KPI rows. Zero samples means nothing was measured, regardless of verdict. |
| **video** | Live HLS. Requires a *headful* browser — see traps. |
| **browser registered** | A `browserId` must resolve, and its name must match the selected browser. Video with no browser behind it means no per-browser views. |
| **steps** | REAL steps. `Before Hooks`/`After Hooks` alone is an empty Steps view. |
| **HAR** | In-browser requests, with usable labels. |
| **console** | Only present if the page actually logs — absence is not automatically a bug. |
| **transactions** | Transaction labels back the Transactions view and every label filter. |

## Traps — each of these shipped as a real bug

**`headless: true` is overridden when the run records.** Video is an ffmpeg grab of the Xvfb
framebuffer, so a headless browser paints nothing → no video → no browser registers → the
per-browser Steps/HAR/console/transaction views are all empty. Do not "fix" a user's script by
removing `headless: true`; the runner handles it.

**An un-awaited top-level IIFE.** `(async () => { … })();` is not awaited by the module, so a naive
wrapper's `await import(...)` resolves the instant the IIFE *starts* and the browser is torn down
mid-journey. The platform waits for the script's browsers to close. Do not tell the user to
restructure their script.

**Top-level `await` needs ESM.** A library script using `const b = await chromium.launch()` at
module scope only parses as a module; the generated bundle ships `package.json {"type":"module"}`.
A CommonJS `.js` using `require()` should be named `.cjs`.

**A bare `webdriver.Chrome()` needs container flags.** The runner injects `--no-sandbox` and
`--disable-dev-shm-usage` itself. User scripts do not need them; harmless if present.

**Never spell out the word `apiritif` inside a Selenium `.py`** — not even in a comment. Engine
classification content-sniffs the whole file for it and will silently reclassify the test.

**A criterion's `label` is a scope filter, not a display name.** Use `''` to match all labels; a
human-readable label matches zero KPI rows and the criterion can never breach.

**`apiritif` is not browser-capable.** Its executor never translates the `actions:` DSL into
browser-driving code, and the API rejects `browser` for that engine. Use `selenium` for a
steps-DSL browser test.

**`.side` (Selenium IDE) and TypeScript *Selenium* scripts do not run.** bzt rejects `.side`
outright and routes `.ts` to Playwright's runner. Tell the user to export a Selenium **Python**
script, or use the interactive builder. Do not promise these.

## Failure criteria for browser tests

- Plan tiers are **per engine class**: browser engines get a single-digit VUs-per-runner ceiling
  (typically 3–10), protocol engines hundreds to thousands. Enforcement follows the **detected**
  engine, so a browser test always gets the browser tier.
- A criterion evaluated server-side (`evaluator: global-backend`) is ignored under
  `verdictMode: 'per_runner'`. If the test carries only backend-evaluated criteria, its settings
  must use `either`/`combined`, or the gates are inert — the run reports `passed` at 100% error
  rate. Tests created through the API get this right by default.
- Evaluate cumulatively rather than on a narrow rolling window, or a sparse browser journey never
  trips the criterion.
- A failure buried at the end of one long transaction cannot be observed until that transaction
  closes. Prefer several short transactions over one long one.

## Interactive (scriptless) browser tests

`authoringMode: 'interactive'` + `interactiveKind: 'browser'` + `browserSteps`. No file upload.
Use it when the user has no code. It produces the same live signals as a scripted run.

## Validating a browser test you just built

Run it, then confirm samples + video + a correctly-named browser + real steps + HAR + transactions.
If steps show only hooks, or video exists with no browser behind it, the run is not healthy — say
so rather than reporting success.
