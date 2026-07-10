<div align="center">

# 🔥 MaxoPerf Agent Skill

### The performance-testing engineer that lives in your AI agent.

**It reads your code, finds what will break under load, builds the test, runs it on real infrastructure, and tells you exactly why it failed — end to end, no dashboards, no YAML, no guesswork.**

[![npm](https://img.shields.io/npm/v/@maxoperf/agent-skill?color=%23e10098&label=%40maxoperf%2Fagent-skill)](https://www.npmjs.com/package/@maxoperf/agent-skill)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-ready-8A5CF6)](https://github.com/MaxoPerf/mcp)
[![Cursor](https://img.shields.io/badge/Cursor-ready-000)](https://github.com/MaxoPerf/mcp)
[![Codex](https://img.shields.io/badge/Codex-ready-10a37f)](https://github.com/MaxoPerf/mcp)

```bash
npx @maxoperf/agent-skill install
```

</div>

---

## Point it at your app. Watch it hunt.

Most load-testing tools hand you an empty script editor and a shrug. This is the opposite. Drop the skill into your AI agent and just say **"help me load-test this."** It runs a real engineer's playbook:

| Step | What it does |
| --- | --- |
| 🎯 **Intake** | Asks one sharp question at a time until it knows your goal — baseline, breaking point, soak, or "just show me the numbers." No jargon; you never have to speak in "virtual users." |
| 🔍 **Hotspot hunt** | *Opt-in:* scans your repo for the endpoints that will fold first — N+1 queries, unbounded reads, fan-out calls, blocking work on the request path — and ranks them by blast radius. Framed as opportunities, never criticism. |
| 🧠 **Engine choice** | Picks the right load generator for the job — **k6**, **JMeter**, **Playwright**, **Selenium**, Gatling, Locust — with a one-line rationale you can override. |
| ✍️ **Builds the test** | Writes the actual script into your repo, with your pass/fail SLOs baked in as thresholds. Secrets go to the vault, never inline. |
| 🚀 **Runs it for real** | Uploads and fires the run on MaxoPerf's managed cloud runners — hundreds of thousands of VUs if you want them — and streams you the console link so you can watch live. |
| 🕵️ **Root-cause analysis** | When something breaks, it doesn't just say "failed." It correlates error bodies, status codes, engine logs, and **runner health** to tell you *why* — app error vs. failed SLO vs. under-provisioned load vs. a flaky dependency. |
| 📈 **Anomaly detection** | A deterministic outlier scan (robust median/MAD, tuned for near-zero false positives) flags the latency spikes and throughput cliffs you'd have missed — and it knows to run *after* the test ends, when the data is real. |

Every result comes with the numbers **and** a one-click breakout to the full MaxoPerf console. You're never locked in the chat.

## Why it's different

- **It knows the platform cold.** Every executor, every load-profile field, every KPI — pinned to the real MaxoPerf engine and drift-guarded, so it never invents a capability that doesn't exist.
- **It finds work you didn't know you had.** The hotspot scan turns "I guess I'll test the homepage" into "these three write paths will melt on Black Friday — here's proof."
- **It catches the lie in the numbers.** A run that "passed" at 40% of target load isn't a pass. The skill checks `vuShortfallPct` before it ever blames your app.
- **Secrets stay secret.** Credentials are pushed to MaxoPerf's workspace vault and injected at runtime — structurally unable to land in a script, a log, or a chat message.

## Install

**Any AI agent (Claude Code, Cursor, Codex):**
```bash
npx @maxoperf/agent-skill install
```

**Prefer the one-click bundle?** Install it together with the MCP server via the [Claude Code plugin](https://github.com/MaxoPerf/mcp):
```
/plugin marketplace add MaxoPerf/mcp
/plugin install maxoperf
```

You'll need a MaxoPerf API key (console → **Settings → API keys**) — the skill will walk you through wiring it the first time.

## How it works

The skill is the **brain**; the [MaxoPerf MCP server](https://github.com/MaxoPerf/mcp) is the **hands**. The skill does the thinking — reading your code, choosing engines, writing tests, diagnosing failures — and drives the hosted MCP server's tools to actually create, upload, run, and analyze on MaxoPerf's platform. One connects to the other automatically.

---

<div align="center">

**[Get started →](https://maxoperf.com)** · **[MCP server →](https://github.com/MaxoPerf/mcp)** · **[Docs →](https://maxoperf.com/docs)**

<sub>Read-only mirror of the MaxoPerf monorepo. File issues at [maxoperf.com](https://maxoperf.com).</sub>

</div>
