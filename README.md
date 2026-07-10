<div align="center">

# ⚡ MaxoPerf MCP Server

### Drive the entire MaxoPerf platform from any AI agent — with your API key.

**A remote, hosted [Model Context Protocol](https://modelcontextprotocol.io) server that turns Claude, Cursor, Codex, VS Code Copilot, and ChatGPT into a full performance-testing operator. Create tests, launch load runs on managed cloud runners, read results, and get root-cause analysis — all in natural language, all authenticated with your own key.**

[![MCP](https://img.shields.io/badge/MCP-2025--11--25-8A5CF6)](https://modelcontextprotocol.io)
[![Claude](https://img.shields.io/badge/Claude-Code%20%7C%20Desktop-8A5CF6)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-add%20to%20app-000)](https://cursor.com)
[![ChatGPT](https://img.shields.io/badge/ChatGPT-connector-10a37f)](https://chatgpt.com)

```
https://app.maxoperf.com/mcp
```

</div>

---

## Configuration

It's a **remote, hosted** server — nothing to install or run. Add this to your MCP client config and set `MAXOPERF_API_KEY` (create one in the console → **Settings → API keys**):

```json
{
  "mcpServers": {
    "maxoperf": {
      "type": "http",
      "url": "https://app.maxoperf.com/mcp",
      "headers": {
        "Authorization": "Bearer ${MAXOPERF_API_KEY}"
      }
    }
  }
}
```

Your key is validated on every call by the real platform (auth, tenancy, OpenFGA, audit) — the server stores nothing and adds no new trust boundary. Revoke the key, access dies instantly. Send the header `X-MaxoPerf-MCP-Mode: read-only` for a look-but-don't-touch session (write tools hidden).

## Install (pick your client)

**Claude Code** — the plugin bundles the server **and** the agent skill:
```
/plugin marketplace add MaxoPerf/mcp
/plugin install maxoperf
```
Or add just the connector:
```
claude mcp add --transport http maxoperf https://app.maxoperf.com/mcp \
  --header "Authorization: Bearer ${MAXOPERF_API_KEY}"
```

**Cursor** · **VS Code / Copilot** · **Codex** · **ChatGPT** · **Claude Desktop** — one-click deeplinks and copy-paste config in [`packaging/`](./packaging). All use the same `mcpServers` block above.

---

## Tools

29 curated tools. Reads default to `response_format: "concise"` (pass `"detailed"` for the full payload); write tools require a non-read-only session, and `cancel_run` is hidden in read-only mode.

**Context & tenancy**
- `whoami` — Resolve the account + default workspace behind your API key
- `list_workspaces` — List workspaces visible to the account
- `set_active_workspace` — Set the active workspace for the session
- `list_projects` — List projects (with edit/delete permissions)
- `create_project` — Create a project

**Tests**
- `list_tests` — List tests (filter by project / workspace / type)
- `get_test` — Get one test + its validation summary
- `create_test` — Create a test shell (choose the engine/executor)
- `get_test_overview` — Run-history overview for a test

**Test files**
- `upload_test_file` — Upload a script/data file in one call (real 3-step presigned flow)
- `list_test_files` — List a test's files + upload state
- `download_test_file` — Get a short-lived download URL for a file

**Runs**
- `start_run` — Launch a load/browser run on managed cloud runners (idempotent)
- `get_run_status` — Poll lifecycle status (queued → running → passed/failed/cancelled)
- `list_runs` — Paginated run history with filters
- `cancel_run` — Cancel a run (destructive; hidden in read-only)
- `rerun_run` — Re-run from a snapshot or the current test
- `add_runners` — Scale a live run up at existing locations

**Results**
- `get_run_results` — KPI overview: throughput, latency percentiles, error rate
- `query_run_metrics` — Time-series metrics (latency / throughput / errors / load / health)
- `get_run_errors` — Grouped error rows (message / count / code)

**Diagnostics — root-cause & anomaly detection**
- `get_run_summary` — Executive summary + which failure criteria tripped
- `get_run_error_bodies` — Sampled error request/response bodies + status codes
- `get_run_logs` — Error-level engine/system log lines
- `get_runner_health` — Runner CPU/mem trend + targetVus vs peakAchievedVus (vuShortfallPct)
- `detect_run_anomalies` — Deterministic robust-outlier scan (median/MAD); terminal-gated, low false-positive

**Escape hatch & discovery**
- `call_platform_api` — Reach any public `/v1/*` endpoint (secrets, environments, schedules, BYOC); admin/internal deny-listed, SSRF-safe
- `get_openapi` — The public OpenAPI document
- `search_endpoints` — Keyword search over the API to find the right endpoint

## Prompts

Text recipes that encode the correct tool sequence — great for chat-only clients that can't read a repo:

- `run-baseline-load-test` — Start a baseline run and watch it to completion
- `diagnose-latency-regression` — Compare p95 across two runs
- `summarize-run` — Plain-language summary of one run
- `plan-and-build-test` — Turn a goal into project → test → upload → run
- `choose-executor` — Recommend an engine (k6 / JMeter / Playwright / Selenium)
- `scan-endpoints-for-hotspots` — Rank likely hotspots from an OpenAPI spec or pasted list
- `setup-secrets-and-envs` — Wire workspace secrets + multi-env before a run
- `diagnose-run-failure` — Ranked root cause for a failed run
- `explain-run-anomalies` — Explain each detected outlier

## Resources

- `maxoperf://openapi` — The public OpenAPI spec
- `maxoperf://run/{id}` — A run report summary

---

## Try it

- "Load test https://api.example.com/checkout with 500 users for 5 minutes and fail it if p95 goes over 800ms."
- "Scan my repo for the endpoints most worth load-testing, then build and run a test for the riskiest one."
- "Why did run run-0000000001 fail? Check the errors, the logs, and whether the runners actually reached the target load."

## Pair it with the brain

The MCP server is the **hands**. The bundled **[MaxoPerf agent skill](https://github.com/MaxoPerf/agent-skill)** (`npx @maxoperf/agent-skill install`, included in the Claude plugin, or in [`agent-skill/`](./agent-skill) here) is the **brain** — it reads your code, finds the hotspots, builds and runs the test, and diagnoses why it broke, driving these tools automatically.

## What's in this repo

| Path | What |
| --- | --- |
| [`.claude-plugin/`](./.claude-plugin) | Claude Code plugin (bundles the MCP connector + the skill) |
| [`agent-skill/`](./agent-skill) | A copy of the `maxoperf` agent skill (canonical home: [MaxoPerf/agent-skill](https://github.com/MaxoPerf/agent-skill)) |
| [`packaging/`](./packaging) | MCP Registry `server.json`, `.mcpb`, VS Code / Cursor deeplinks, Codex / ChatGPT setup |
| [`LAUNCHGUIDE.md`](./LAUNCHGUIDE.md) | MCP directory listing metadata |

---

<div align="center">

**[Get started →](https://maxoperf.com)** · **[Agent skill →](https://github.com/MaxoPerf/agent-skill)** · **[Docs →](https://maxoperf.com/docs)**

<sub>Read-only mirror of the MaxoPerf monorepo. File issues at [maxoperf.com](https://maxoperf.com).</sub>

</div>
