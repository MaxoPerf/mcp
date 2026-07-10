# Install into ChatGPT

ChatGPT (via a custom connector) cannot read your repo filesystem, so — like Claude Desktop — it
drives the workflow through the **guided MCP prompts** (`plan-and-build-test`, `choose-executor`,
`scan-endpoints-for-hotspots`, `setup-secrets-and-envs`, documented in `reference/mcp-tools.md`)
rather than the full file-writing `SKILL.md` flow; paste script content in manually when the
`upload_test_file` tool asks for it.

1. Get an API key (Console → Settings → API Keys → "Get an API key" docs link if you're new).

2. Add the MaxoPerf connector: Settings → Connectors → Add custom connector, using:

   - **URL:** `https://app.maxoperf.com/mcp`
   - **Authorization header:** `Bearer <your MAXOPERF_API_KEY>`

3. Start a new chat and invoke a guided prompt, e.g.:

   > Use the `plan-and-build-test` prompt with goal "load test my signup flow".

   ChatGPT will walk through intake → executor choice → secrets/multi-env guidance, then call
   `create_test` / `upload_test_file` (you paste the script) / `start_run` / `get_run_status` /
   `get_run_results`, and always show the console link so you can see full charts and detail.

## Verifying the connection

Ask ChatGPT to call the `whoami` MaxoPerf tool — a successful response confirms the key and
connector are wired correctly.
