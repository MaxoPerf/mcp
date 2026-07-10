# Install into Claude Code

1. Get an API key (Console → Settings → API Keys → "Get an API key" docs link if you're new).

2. Register the MaxoPerf MCP server:

   ```bash
   claude mcp add --transport http maxoperf https://app.maxoperf.com/mcp \
     --header "Authorization: Bearer ${MAXOPERF_API_KEY}"
   ```

   Set `MAXOPERF_API_KEY` in your shell env first, or substitute the literal key value.

3. Install this skill so Claude Code loads `SKILL.md` + `reference/` automatically:

   ```bash
   npx @maxoperf/agent-skill install
   ```

   This drops the skill files into your Claude Code skills directory and can auto-write the MCP
   config from step 2 for you if you pass `MAXOPERF_API_KEY` as an env var to the installer.

4. Start a session and ask Claude Code to "load-test my checkout flow" (or similar) — it will use
   the `maxoperf` skill's intake workflow automatically.

## Verifying the connection

Ask Claude Code to call the `whoami` MaxoPerf tool — a successful response confirms the key and
transport are wired correctly.
