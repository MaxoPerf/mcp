# Engines, executors, and the load-shape schema

This page is the ground truth the `SKILL.md` workflow reads before it builds any test artifact or
calls `create_test`. Never invent an executor name or a `loadProfile` field — every value below is
pinned to the MaxoPerf platform source and is kept honest by an automated lint test
(`agent-skill/scripts/lint-engines.test.ts`) that fails the build if this page drifts from
`SUPPORTED_TAURUS_EXECUTORS`.

## Supported executors (`SUPPORTED_TAURUS_EXECUTORS`)

MaxoPerf runs tests through [Taurus](https://gettaurus.org/docs/ExecutionSettings/). The platform
currently supports exactly these 22 executors. This is the **only** list of valid `engine_kind` /
`executor` values — do not use anything outside it.

<!-- executors:begin -->
ab, apiritif, external, gatling, grinder, jmeter, junit, k6, locust, molotov,
mocha, pbench, playwright, robot, scalable, selenium, siege, taurus, testng,
tsung, vegeta, wdio
<!-- executors:end -->

### Everyday picks (start here)

| Test kind | Executor | Why | Artifact |
| --- | --- | --- | --- |
| REST/HTTP API load or stress | `k6` (default) | Scriptable JS, strong checks/thresholds, great for CI gating | `*.k6.js` |
| REST/HTTP API load, existing JMX assets | `jmeter` | Reuse an existing JMeter test plan as-is | `*.jmx` |
| Browser user journeys (renders pages, runs client JS) | `playwright` (default) | Modern, fast, first-class browser recording/tiering support | Playwright `.ts`/`.js` script |
| Browser user journeys, existing Selenium assets | `selenium` | Reuse an existing Selenium script | Selenium script |
| Simple recorded click-path replay, no custom scripting | `side` recording via `selenium` family | Fastest to produce, no coding required | `.side` file |
| Constant-throughput scripting in Python | `locust` | Python-native, good for teams already on Locust | `locustfile.py` |
| Scala/Akka-style scripted load | `gatling` | Reuse an existing Gatling simulation | `*.scala` |

The remaining executors (`ab`, `apiritif`, `external`, `grinder`, `junit`, `molotov`, `mocha`,
`pbench`, `robot`, `scalable`, `siege`, `taurus`, `testng`, `tsung`, `vegeta`) exist for advanced
or legacy-asset cases — pick them only when the user already has a matching existing asset, or
explicitly asks for that tool by name.

## Browser-recordable executors (`BROWSER_RECORDABLE_ENGINE_KINDS`)

These executor kinds produce browser recordings (video/HAR/console/step timeline), and are the
only ones for which `recordingLayout` (`tiled` | `solo`) is meaningful:

```
selenium, selenium-ts, wdio, side, playwright
```

If the intake target is "browser/UI flow," pick one of these. If it is "API/protocol only,"
pick a protocol engine (`k6`, `jmeter`, `gatling`, `locust`, `vegeta`, `ab`, `siege`, `tsung`,
`pbench`, ...) — do not default a pure API test onto a browser engine.

## `loadProfile` schema (from `apps/api/src/v1/tests/dto/load-profile.dto.ts`)

Pass exactly these field names — never invent alternates (no `vus`, `duration`, `users`, etc.):

| Field | Type | Bounds | Notes |
| --- | --- | --- | --- |
| `virtualUsers` | integer | 1 – 1,000,000 | Total target virtual users across all locations. Required. |
| `agentCount` | integer | 1 – 500 | Total runner instances. Required. |
| `rampUpSeconds` | integer | 0 – 86,400 | Ramp-up duration in seconds. Required. |
| `loadStopMode` | `'duration' \| 'iterations'` | — | Optional; defaults to `duration`. |
| `durationSeconds` | integer | 1 – 864,000 | Required when `loadStopMode` is `duration` (default). |
| `iterations` | integer | 1 – 1,000,000,000 | Required when `loadStopMode` is `iterations`. |
| `maxVirtualUsersPerRunner` | integer | 1 – 100,000 | Optional ceiling used with total VUs to enforce a minimum runner count. |
| `targetRps` | number | 0 – 1,000,000,000 | Optional declared target RPS for minimum-runner math. |

Rule of thumb for a first test: start small (`virtualUsers: 5-20`, `agentCount: 1`,
`rampUpSeconds: 30-60`, `durationSeconds: 120-300`) and scale up once the pass/fail criteria are
validated at low load — this also keeps the user's first run cheap and fast to interpret.

## File roles (from `apps/api/src/v1/test-files/dto/initiate-test-file-upload.dto.ts`)

Exactly one of `entrypoint` (the single script MaxoPerf executes) or `test_asset` (supporting
data/config files, e.g. CSV data sources, included configs) per file. A test has exactly one
`entrypoint`.

## KPI vocabulary (what `get_run_results` / `query_run_metrics` return)

When presenting results, use this vocabulary so it matches what the console shows:

- **Latency percentiles:** `p50`, `p90`, `p95`, `p99` (and average/min/max).
- **Throughput:** requests-per-second / iterations-per-second.
- **Error rate:** percentage of failed requests/transactions.
- **Tiers:** results are reported at `transaction` / `step` / `request` granularity for browser
  tests, and `request`/`label` granularity for protocol tests — mention which tier a number is
  from when it isn't obvious.
