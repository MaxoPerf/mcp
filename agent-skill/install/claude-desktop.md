# Install into Claude Desktop

Claude Desktop cannot read your repo filesystem, so it cannot drive the full `SKILL.md` build step
directly — instead it uses the **guided MCP prompts** (`plan-and-build-test`, `choose-executor`,
`scan-endpoints-for-hotspots`, `setup-secrets-and-envs`, documented in `reference/mcp-tools.md`) as
a text-only version of the same workflow, and you paste script content in manually for
`upload_test_file`.

1. Get an API key (Console → Settings → API Keys → "Get an API key" docs link if you're new).

2. Add the MaxoPerf connector: Settings → Connectors → Add custom connector, using:

   - **URL:** `https://app.maxoperf.com/mcp`
   - **Authorization header:** `Bearer <your MAXOPERF_API_KEY>`

3. Start a new chat and invoke a guided prompt, e.g.:

   > Use the `plan-and-build-test` prompt with goal "load test my checkout API".

   Claude will walk you through the same intake → executor choice → secrets/multi-env guidance as
   the full skill, then call `create_test` / `upload_test_file` (paste your script when asked) /
   `start_run` / `get_run_status` / `get_run_results` for you, and always show the console link.

## Verifying the connection

Ask Claude to call the `whoami` MaxoPerf tool — a successful response confirms the key and
connector are wired correctly.
