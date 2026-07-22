# Cursor install

Cursor supports a one-click install deeplink (no extension needed) — the same mechanism the
subtask-04 connect page renders for the "Add to Cursor" button.

## Deeplink format

```
cursor://anysphere.cursor-deeplink/mcp/install?name=<name>&config=<base64 JSON>
```

`config` is base64 of a JSON object with the server's `url` (and any `headers`). The user's own API
key is **never** baked into a shared/committed deeplink — the placeholder below leaves a value for the
user to paste in Cursor's MCP settings after install, matching subtask-04's connect-page pattern (no
secret is pre-filled in a link anyone could share).

Regenerate from the SSOT:

```bash
node packaging/cursor/generate-deeplink.mjs
```

Current deeplink (`https://app.maxoperf.com/mcp`, derived from
`deploy/helm/maxoperf/values-prod.yaml` `publicWebOrigin`):

```
cursor://anysphere.cursor-deeplink/mcp/install?name=MaxoPerf&config=eyJ1cmwiOiJodHRwczovL2FwcC5tYXhvcGVyZi5jb20vbWNwIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfTUFYT1BFUkZfQVBJX0tFWSJ9fQ==
```

Decoded `config`:

```json
{
  "url": "https://app.maxoperf.com/mcp",
  "headers": { "Authorization": "Bearer YOUR_MAXOPERF_API_KEY" }
}
```

Markdown install badge:

```markdown
[![Add to Cursor](https://img.shields.io/badge/Cursor-Add_MaxoPerf_MCP-000000)](cursor://anysphere.cursor-deeplink/mcp/install?name=MaxoPerf&config=eyJ1cmwiOiJodHRwczovL2FwcC5tYXhvcGVyZi5jb20vbWNwIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfTUFYT1BFUkZfQVBJX0tFWSJ9fQ==)
```

## Manual install

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "maxoperf": {
      "url": "https://app.maxoperf.com/mcp",
      "headers": { "Authorization": "Bearer ${env:MAXOPERF_API_KEY}" }
    }
  }
}
```

(This is also what `npx @maxoperf/agent-skill install --client=cursor` writes — see
`agent-skill/install/installer.mjs`.)
