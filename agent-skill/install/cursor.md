# Install into Cursor

1. Get an API key (Console → Settings → API Keys → "Get an API key" docs link if you're new).

2. Add the MCP server to `.cursor/mcp.json` in your project (or your global Cursor MCP config):

   ```jsonc
   {
     "mcpServers": {
       "maxoperf": {
         "url": "https://app.maxoperf.com/mcp",
         "headers": { "Authorization": "Bearer ${env:MAXOPERF_API_KEY}" }
       }
     }
   }
   ```

   Set `MAXOPERF_API_KEY` in your environment (or your OS keychain via Cursor's env-var support) —
   never hard-code the raw key into a committed `mcp.json`.

3. Install this skill into your Cursor rules/skills directory:

   ```bash
   npx @maxoperf/agent-skill install
   ```

   The installer writes `SKILL.md` + `reference/` where Cursor discovers project skills, and can
   auto-write the `.cursor/mcp.json` snippet above if you pass `MAXOPERF_API_KEY`.

4. Reload the Cursor window, then ask the agent to "help me load-test my API" — it will follow the
   `maxoperf` skill's intake workflow.

## Verifying the connection

Ask the agent to call the `whoami` MaxoPerf tool — a successful response confirms the key and
transport are wired correctly.
