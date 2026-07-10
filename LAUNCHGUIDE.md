# MaxoPerf MCP Server

## Tagline
Drive load & browser performance testing from your AI agent — with your own API key.

## Description
The MaxoPerf MCP Server turns any MCP-capable AI agent (Claude Code, Claude Desktop, Cursor, VS Code Copilot, Codex, ChatGPT) into a full performance-testing operator. In natural language, your agent can author tests, launch load and browser runs on MaxoPerf's managed cloud runners (up to hundreds of thousands of virtual users), read KPIs and time-series metrics, and run deep **root-cause analysis** and **anomaly detection** on finished runs. It's a remote, hosted, stateless server: you never install or run anything — you point your client at the endpoint and authenticate with your own MaxoPerf API key, which the platform validates on every call (auth, tenancy, authorization, and audit are delegated to MaxoPerf; the server stores nothing and adds no new trust boundary). Pair it with the `@maxoperf/agent-skill` skill for a fully guided "read my code → find the hotspots → build and run the test → tell me why it broke" workflow.

## Setup Requirements
- `MAXOPERF_API_KEY` (required): Your MaxoPerf API key (`mpak_…`), sent as `Authorization: Bearer`. Create one in the console under **Settings → API keys**. https://app.maxoperf.com
- `X-MaxoPerf-MCP-Mode: read-only` (optional): Send this header (or run a read-only session) to hide all write/execute tools and expose only read tools — useful for a safe, look-but-don't-touch connection. Default is full access.

## Category
Cloud & DevOps

## Use Cases
Load testing, Stress testing, Soak testing, Browser testing, API testing, CI/CD performance gating, Performance regression triage, Root-cause analysis, Capacity planning

## Features
- 29 curated, task-oriented tools covering the full loop: projects, tests, file uploads, runs, results, and diagnostics
- Launch and scale load/browser runs on MaxoPerf's managed cloud runners — up to hundreds of thousands of virtual users
- Every engine supported: k6, JMeter, Playwright, Selenium, Gatling, Locust, and more (Taurus-backed)
- Live run control: start, poll status, scale runners mid-run, cancel, rerun
- Rich results: latency percentiles (p50/p90/p95/p99), throughput, error rates, and time-series metrics
- **Root-cause analysis**: correlates error bodies + status codes, engine logs, and runner health to explain *why* a run failed — app error vs. failed SLO vs. under-provisioned load vs. flaky dependency
- **Anomaly detection**: a deterministic, low-false-positive outlier scan (robust median/MAD) that flags the latency spikes and throughput cliffs humans miss
- **VU-shortfall detection**: knows when your fleet never reached the requested load, so a "slow" verdict isn't blamed on your app by mistake
- Complete-surface escape hatch (`call_platform_api`) reaches the long tail — secrets, environments, schedules, BYOC — deny-listed and SSRF-safe
- API-key auth with full delegation to the platform: revoke the key and access dies instantly; every call rides the existing audit trail

## Getting Started
- "Load test https://api.example.com/checkout with 500 users for 5 minutes and fail it if p95 goes over 800ms."
- "Scan my repo for the endpoints most worth load-testing, then build and run a test for the riskiest one."
- "Why did run run-0000000001 fail? Check the errors, the logs, and whether the runners actually reached the target load."
- Tool: `start_run` — Launch a load or browser run for a test on managed cloud runners; returns a run id to poll.
- Tool: `get_runner_health` — Check achieved vs. target virtual users (`vuShortfallPct`) to catch under-provisioned load before blaming the app.
- Tool: `detect_run_anomalies` — Run a deterministic outlier scan over a finished run's charts; terminal-gated and tuned for near-zero false positives.
- Tool: `call_platform_api` — Reach any public MaxoPerf endpoint the curated tools don't cover (secrets, environments, schedules); admin/internal paths are always blocked.

## Tags
load-testing, performance-testing, stress-testing, browser-testing, api-testing, k6, jmeter, playwright, selenium, gatling, locust, taurus, ci-cd, sre, observability, cloud-runners, anomaly-detection, root-cause-analysis

## Documentation URL
https://github.com/MaxoPerf/mcp

## Health Check URL
https://app.maxoperf.com/mcp
