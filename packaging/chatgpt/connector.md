# ChatGPT connector setup

ChatGPT (Plus/Pro/Business/Enterprise, Developer Mode / custom connectors) can add a remote MCP
server directly through its Connectors UI — no manifest file, no deeplink; the user pastes the server
URL and an auth token.

> **Plan limits (verified via `developers.openai.com/api/docs/guides/tools-connectors-mcp`,
> 2026-07-09):** full read/write custom MCP connectors require a Business/Enterprise/Edu workspace;
> Plus/Pro individual accounts with Developer Mode are limited to read-only custom connectors even
> though the MaxoPerf server itself exposes write tools (run/upload) — that's a ChatGPT-side
> restriction, not something this packaging controls.

## Steps

1. In MaxoPerf: Console -> Settings -> API keys -> create a key (`mpak_...`).
2. In ChatGPT: Settings -> Connectors (or **Developer Mode** -> **Custom connectors** depending on
   plan) -> **Add connector** / **Add MCP server**.
3. Server URL: `https://app.maxoperf.com/mcp` (Streamable-HTTP).
4. Authentication: choose the API-key / bearer-token option (not OAuth — MaxoPerf issues static API
   keys, it does not run an OAuth authorization server) and paste your key. ChatGPT sends it as
   `Authorization: Bearer <key>` on every MCP request, same as every other client in this packaging
   set.
5. Save, then ask ChatGPT to use a MaxoPerf tool (e.g. "list my MaxoPerf projects") to confirm the
   connection.

## Notes

- The exact menu path ("Connectors" vs "Developer Mode -> Custom connectors") has moved across
  ChatGPT releases; if the steps above don't match your client version, search ChatGPT's in-app help
  for "custom MCP connector" — the underlying wire format (Streamable-HTTP + Bearer header) is stable
  even when the UI isn't.
- Server URL matches `packaging/mcp/ssot.mjs` (subtask-03 SSOT) — if MaxoPerf's public origin
  changes, re-derive this doc rather than hand-editing the URL.
