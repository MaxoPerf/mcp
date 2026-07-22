# Platform features beyond the test-run loop

The core workflow in `SKILL.md` is: build a test → upload it → run it → read results. Four more
platform capabilities exist alongside that loop. This page is the conceptual map — when each one
is the right reach, not an API dump (see `reference/mcp-tools.md` for exact args/returns).

## The four things, one line each

- **Reverse tunnel** — makes a target *reachable* (local/undeployed → public URL).
- **Browser fleet** — gives the user raw parallel real-browser capacity to drive *themselves*.
- **Virtual service** — makes a *dependency* of the target predictable (mock/simulate a backend).
- **PDC (execution location)** — decides *where* any of the above physically runs.

## Decision table

| Situation | Reach for | Tool names |
| --- | --- | --- |
| The target is running locally or not deployed yet | A reverse tunnel — exposes it at `tunnel-<name>.maxoperf.com` so a MaxoPerf test can hit it | `create_tunnel`, `list_tunnels`, `get_tunnel`, `stop_tunnel`, `get_tunnel_stats` |
| The user wants parallel real-browser capacity to drive with their **own** script/CI/exploratory automation — not a MaxoPerf-orchestrated test run | A browser fleet — managed Selenium-Grid/Playwright-`connect()`/CDP endpoint | `create_browser_fleet`, `get_browser_fleet`, `list_browser_fleets`, `scale_browser_fleet`, `delete_browser_fleet` |
| The test's target depends on something you don't want to hit for real (a third-party API, a flaky/rate-limited/costly downstream) | A virtual service — deploy a mock/simulated backend, point the test at its `endpointUrl` | `list_virtual_services`, `get_virtual_service`, `create_virtual_service`, `deploy_virtual_service`, `stop_virtual_service`, `delete_virtual_service`, `list_virtual_service_catalog`, `list_virtual_service_bindings` |
| A fleet or virtual service needs a placement — which region/PDC it lands on | List execution locations first, then pass the chosen id | `list_execution_locations` |
| A page is a SPA / client-rendered, and `read_page_dom`/`fetch_url` come back empty or unhelpful (static HTML only, no JS) | On-demand browser inspection — real JS-rendered DOM | `inspect_url` |

Note what's absent from this table: none of these four replace the build → upload → run loop in
`SKILL.md`. A tunnel/fleet/virtual-service/PDC choice is something you resolve *during* intake and
setup (Step 0-3), before `create_test`/`start_run`.

## Reverse tunnels

**What it is.** A public TLS URL (`https://tunnel-<name>.maxoperf.com`) that forwards to a port on
the user's machine once their client connects (`npx @maxoperf/tunnel http <port> --token
<clientToken>`). The tunnel and URL persist; `stop_tunnel` disconnects the client without deleting
either.

**When to reach for it.** As soon as the target turns out to be "running locally" or "not deployed
yet" — offer a tunnel immediately rather than asking the user to deploy something just to test it,
and don't try to test `localhost` directly (the runner is remote and can't reach it).

**The one-time token.** `create_tunnel` shows the client token exactly once. Tell the user to
store it; it is not retrievable again (only rotatable, via `call_platform_api` — not a curated
tool).

## Browser fleets

**What it is.** N `chrome`/`firefox`/`edge` browser sessions, spread across one or more locations,
behind a single endpoint the user's own client drives directly — via Playwright `connect()`,
WebDriver/Selenium Grid, or raw CDP. Billed as browser VUs (1 browser = 1 VU per location).

**When to reach for it vs. a scripted browser test.** A browser fleet is **not** how you run a
MaxoPerf test — it's raw capacity for when the user already has their own test runner/CI/tooling
and just wants managed real-browser infrastructure to point it at. If the user wants MaxoPerf to
run and grade a browser journey (pass/fail, KPIs, video/HAR/steps), that's a Playwright/Selenium
test via the normal build → upload → run flow (`reference/browser-tests.md`), not a fleet.

**The location grammar.** Every browser/location slice uses `<provider>:<region>` (`aws:us-east-1`,
`gcp:europe-west1`, `azure:eastus`) for managed cloud, or `byoc:<pdcId>` to land on a specific PDC
— see `list_execution_locations` below for valid ids.

**The token.** Shown inline only in `create_browser_fleet`'s response; re-fetch it later with
`get_browser_fleet` (omitted once the fleet is terminal).

## Virtual services

**What it is.** A mock/simulated backend, deployed as its own pod on a chosen outpost/PDC, with a
stable `endpointUrl`. It answers according to configured transactions/responses (`noMatch` policy
governs anything unmatched: `passthrough`/`respond`/`reject`/`notFound`). It has an explicit
deploy → running → stop lifecycle — it isn't always-on.

**When to reach for it.** The test's real target depends on something you don't want to exercise
for real during a load/browser test — a third-party payment API, a rate-limited partner service,
a downstream that's flaky or expensive to hit at volume. Deploy a virtual service standing in for
that dependency, then point the test's config/secrets at its `endpointUrl` instead of the real one.

**Placement is required before deploy.** `create_virtual_service` can be created with no PDC chosen
(`placement.private_datacenter_id` unset) as a draft, but `deploy_virtual_service` needs one — pick
it from `list_execution_locations`. Placement can only be changed while stopped.

## PDCs (execution locations)

**What a PDC is.** Private Data Center = an **Outpost site**: a place running the MaxoPerf outpost
agent that can host per-VS pods and browser-fleet runners. Two kinds:

- **`visibility: "system"`** — a shared, MaxoPerf-operated PDC. The **Shared Sandbox** is the
  always-present one: every account can place a fleet or virtual service there with zero
  infrastructure of their own.
- **`visibility: "account"`** — a self-hosted PDC the caller's own workspace registered (BYOC —
  bring your own compute).

`list_execution_locations` returns both kinds merged in `byoc.privateDatacenters`, plus curated
managed cloud regions in `managed.providers` (for protocol-test/run location plans — unrelated to
PDC placement).

**Placement preference order** (cheapest/most-available first): a **shared system-catalog PDC**
(Shared Sandbox — no setup needed) → an **alive, healthy user-owned BYOC PDC** (if the account has
one) → a **managed cloud region** (for run/test location plans that don't use PDCs at all, e.g.
protocol tests). Default to the shared PDC unless the user has their own and prefers it (data
residency, network proximity to their real backend, etc.) — ask rather than assume if it's
unclear which they want.

## On-demand browser inspection (`inspect_url`)

**What it is.** Spins up (or reuses) a real browser — via the same placement preference order
above — navigates to a public URL, and returns the JS-rendered page: DOM/text/outline, same shape
family as `read_page_dom`.

**When to reach for it vs. `fetch_url`/`read_page_dom`.** Those two are static-HTML-only — no
JavaScript execution. They're the first thing to try (cheaper, faster). Reach for `inspect_url`
when the target is a single-page app or otherwise renders its real content client-side, and
`read_page_dom` comes back empty, or you need to see the page as a real browser would while
planning a browser test's selectors.
