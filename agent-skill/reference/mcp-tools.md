# MCP tool reference

The exact tool/prompt names and argument shapes shipped by `apps/mcp-server` (subtasks 01/02/06).
`SKILL.md` drives these; this page documents them verbatim so the skill never has to guess a name
or argument. If any of these ever seem out of date vs. what `tools/list` actually returns, trust
the live server — but this doc is kept in sync with the shipped source at authoring time.

All tools are called over `POST /mcp` (Streamable HTTP), authenticated with
`Authorization: Bearer <mpak_...>`. Reads default to `response_format: "concise"` (pass
`"detailed"` for the full payload). Write tools require a non-read-only session.

## Context

| Tool | Args | Returns |
| --- | --- | --- |
| `whoami` | *(none)* | Account identity + default workspace. |
| `list_workspaces` | *(none)* | Workspaces visible to the account. |
| `set_active_workspace` | `{ workspace_id }` | Sets the active workspace for the rest of the session; validates visibility first. |

## Projects

| Tool | Args | Returns |
| --- | --- | --- |
| `list_projects` | `{ workspace_id? }` | Projects visible in the account, with `canEdit`/`canDelete` flags. |
| `create_project` | `{ workspace_id, name }` | New project. Requires workspace editor access. |

## Tests

| Tool | Args | Returns |
| --- | --- | --- |
| `list_tests` | `{ project_id?, workspace_id?, type?: 'single'\|'vario'\|'all', response_format? }` | Test list. |
| `get_test` | `{ test_id, response_format? }` | One test, incl. validation summary (status/reason/checkedAt/engineKind). |
| `create_test` | `{ project_id, name, type?: 'single'\|'vario', engine_kind? }` | New test shell. Then use `upload_test_file` to attach the entrypoint script. |
| `get_test_overview` | `{ test_id }` | Run-history overview (console Overview tab). |

## Test files (upload / list / download)

| Tool | Args | Returns |
| --- | --- | --- |
| `upload_test_file` (write) | `{ test_id, filename, content? \| local_path?, role: 'entrypoint'\|'test_asset', content_type? }` — exactly one of `content` (inline text) or `local_path` (repo-relative, must resolve inside cwd) | `{ fileId, uploadState, sizeBytes }`. Wraps the real 3-step presigned flow (initiate → PUT bytes → complete) in one call — `call_platform_api` cannot do this (the middle hop is an off-base presigned URL). One `entrypoint` per test; supporting files use `test_asset`. Never logs the presigned URL or file bytes. |
| `list_test_files` | `{ test_id }` | `{ files: [{ fileId, filename, fileRole, uploadState, sizeBytes }] }` |
| `download_test_file` | `{ test_id, file_id }` | `{ downloadUrl, expiresInSeconds, filename }` — a short-lived presigned GET URL, not raw bytes. |

## Runs

| Tool | Args | Returns |
| --- | --- | --- |
| `start_run` (write) | `{ test_id, engine_kind?, recording_layout?: 'tiled'\|'solo' }` | `{ runId, status }`. Idempotent — identical retry reuses the run instead of double-launching. |
| `get_run_status` | `{ run_id, response_format? }` | Lifecycle status: `queued \| allocating \| starting \| running \| stopping \| passed \| failed \| cancelled`. Poll this after `start_run`/`rerun_run`. |
| `list_runs` | `{ workspace_id?, test_id?, status?, engine?, q?, from?, to?, page?, response_format? }` | Paginated run list; concise by default. |
| `cancel_run` (write, **destructive**) | `{ run_id, mode?: 'graceful'\|'kill', reason? }` | Cancels a run — cannot be undone. **Always confirm with the user before calling.** Not registered at all in read-only sessions. |
| `rerun_run` (write) | `{ run_id, source: 'run_snapshot'\|'current_test' }` | New run derived from an existing one. `run_snapshot` (recommended) reproduces exactly what ran; `current_test` rebuilds from the test as it exists today. Idempotent like `start_run`. |
| `add_runners` (write) | `{ run_id, additions: [{ location_plan_row_id, count }] }` | Scales up a live run at existing location-plan rows; added runners inherit the run's resolved size. |

## Results

| Tool | Args | Returns |
| --- | --- | --- |
| `get_run_results` | `{ run_id, ...optional time-range/location/label/runner/scenario filters }` | KPI summary cards (throughput, latency, error rate, duration) — the run dashboard Overview tab. **Always pair this with the console deep link.** |
| `query_run_metrics` | `{ run_id, queries: [{ category: 'latency'\|'throughput'\|'errors'\|'load'\|'data'\|'health', aggregation, alignment?, filters?, group_by? }] }` (≤8 queries, ≤5 filters/query, ≤3 group-bys/query; server caps each series at 300 groups) | Time series for the requested metric descriptors. Use `get_run_results` first to discover metric ids. |
| `get_run_errors` | `{ run_id, response_format? }` | Grouped error rows (message/count/code). Concise default: top 25 groups. |

## Escape hatch (complete surface)

| Tool | Args | Returns |
| --- | --- | --- |
| `call_platform_api` | `{ method: 'GET'\|'POST'\|'PATCH'\|'DELETE', path, body? }` | Reaches any long-tail public endpoint not covered above (billing, **secrets** — see below, BYOC, notifications, schedules, data-entities). Admin/internal/key-management paths are always rejected locally before any upstream call. Read-only sessions may only `GET`. |
| `get_openapi` | *(none)* | The public OpenAPI document (cached). Large — prefer `search_endpoints`. |
| `search_endpoints` | `{ query }` | Keyword/tag search over the OpenAPI document — use before `call_platform_api` to find the right path/method. |

### Secrets & bindings via the escape hatch

There is no curated secrets tool — use `call_platform_api` for these, and never inline a secret
value into an uploaded script:

```jsonc
// Create/update a workspace secret (value is never echoed back)
{ "name": "call_platform_api", "arguments": {
  "method": "POST", "path": "/workspaces/{workspaceId}/secrets",
  "body": { "name": "STRIPE_SECRET", "value": "<user-provided, never printed back>" } } }

// Bind secrets to a test — injected as env vars at run time
{ "name": "call_platform_api", "arguments": {
  "method": "PUT", "path": "/tests/{testId}/secret-bindings",
  "body": { "bindings": [ { "secretId": "sec-0123456789", "envName": "SECRET_STRIPE_KEY" } ] } } }
```

`envName` (optional) must match `^SECRET_[A-Za-z0-9_]{1,120}$`; omit it to inherit the secret's
own name. Never print a secret's value back to the user — only confirm a binding exists.

## Diagnostics & RCA

Post-run root-cause and anomaly tools (TASK-1172) — see `reference/diagnostics.md` for the full
signal catalog, the VU-shortfall check, and the anomaly method's false-positive controls.
`SKILL.md` Step 8.5 drives these after every terminal run.

| Tool | Args | Returns |
| --- | --- | --- |
| `get_run_summary` | `{ run_id, transactions?, response_format? }` | Executive summary: headline outcome + which failure criteria tripped. |
| `get_run_error_bodies` | `{ run_id, row_id?, from?, to?, runner?, label?, scenario?, error_key?, limit?, response_format? }` | Sampled error request/response bodies + status codes. Full body text only via `row_id` detail; never printed wholesale. |
| `get_run_logs` | `{ run_id, severity?: 'error'\|'warn', stream?: 'all'\|'system'\|'engine', from?, to?, limit?, cursor?, response_format? }` | Error-level engine/system log lines for the run. |
| `get_runner_health` | `{ run_id, from?, to?, runners?, response_format? }` | Runner heartbeat/CPU/mem trend + `targetVus`/`peakAchievedVus`/`vuShortfallPct`. |
| `detect_run_anomalies` | `{ run_id, metric_ids?, sensitivity?: 'low'\|'normal'\|'high', allow_partial? }` | Robust MAD outliers on the run's charts; terminal-gated (`RUN_NOT_TERMINAL` otherwise). |

## Guided prompts (chat-only clients: Claude Desktop, ChatGPT)

Text-only recipes (no network calls) for clients that cannot read a filesystem, so they still get
the intake → build → run workflow:

| Prompt | Args | Purpose |
| --- | --- | --- |
| `plan-and-build-test` | `{ goal, target? }` | Turns a plain-language goal into the project → test → upload_test_file → run sequence. |
| `choose-executor` | `{ test_kind }` | Recommends an engine/executor with rationale (mirrors `reference/engines.md`'s decision table). |
| `scan-endpoints-for-hotspots` | `{ openapi_or_paste }` | Ranks likely hotspots from an OpenAPI spec or pasted endpoint list. |
| `setup-secrets-and-envs` | `{ test_id }` | Guides secrets/multi-env setup before the first run. |
| `diagnose-run-failure` | `{ run_id }` | Ranked root cause: app error vs failed assertion/SLO vs runner under-provisioning (VU shortfall) vs external dependency. |
| `explain-run-anomalies` | `{ run_id }` | Explains each outlier with a likely cause, correlated to errors/runner health. |

## Response shaping

Read tools default to `response_format: "concise"` (small, agent-legible field sets) and truncate
oversized series to stay under the token budget; pass `response_format: "detailed"` when the full
payload is genuinely needed (e.g. debugging a specific field).

## Error envelope

Every tool error is `{ isError: true, content: [{ type: "text", text: "<status> <code>: <detail>" }], structuredContent: { status, code, detail } }`.
Common codes: `READ_ONLY_MODE` (write attempted in a read-only session), `FORBIDDEN_PATH`
(`call_platform_api` deny-listed path), `TOO_MANY_QUERIES`/`TOO_MANY_FILTERS`/`TOO_MANY_SERIES`
(`query_run_metrics` limits), `UPLOAD_FAILED`, `PATH_NOT_ALLOWED` (`upload_test_file` local_path
traversal), `INVALID_ARGUMENTS`.
