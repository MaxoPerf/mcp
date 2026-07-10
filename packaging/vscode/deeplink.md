# VS Code / GitHub Copilot install

VS Code and GitHub Copilot Chat can add a remote MCP server with no extension, either via a workspace
`mcp.json` (see [`mcp.json`](./mcp.json), copy to `.vscode/mcp.json`) or via a one-click install
**deeplink**.

## Install badge / deeplink

Format (verified against `code.visualstudio.com/docs/agents/reference/mcp-configuration` +
`code.visualstudio.com/docs/agent-customization/mcp-servers`, 2026-07-09):

```
vscode:mcp/install?<url-encoded JSON {name,type,url,headers}>
```

Regenerate from the SSOT (never hand-edit — the URL below is generated, not authored):

```bash
node packaging/vscode/generate-deeplink.mjs
```

Current deeplink (`https://app.maxoperf.com/mcp`, derived from
`deploy/helm/maxoperf/values-prod.yaml` `publicWebOrigin`):

```
vscode:mcp/install?%7B%22name%22%3A%22maxoperf%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapp.maxoperf.com%2Fmcp%22%2C%22headers%22%3A%7B%22Authorization%22%3A%22Bearer%20%24%7Binput%3Amaxoperf-api-key%7D%22%7D%7D
```

For VS Code Insiders, swap the `vscode:` scheme for `vscode-insiders:`.

Markdown install badge (for the connect page / docs, subtask 08 consumes this):

```markdown
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_MaxoPerf_MCP-0098FF)](vscode:mcp/install?%7B%22name%22%3A%22maxoperf%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fapp.maxoperf.com%2Fmcp%22%2C%22headers%22%3A%7B%22Authorization%22%3A%22Bearer%20%24%7Binput%3Amaxoperf-api-key%7D%22%7D%7D)
```

## Manual install

Copy [`mcp.json`](./mcp.json) into `.vscode/mcp.json` in your workspace (or your VS Code user profile
MCP config) — VS Code will prompt for the `maxoperf-api-key` input on first connect.
