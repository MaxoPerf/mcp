#!/usr/bin/env node
/**
 * Regenerates the VS Code / Copilot "Add MCP Server" install deeplink from the SSOT server URL —
 * no hand-encoded URL committed, so it can never drift from `packaging/mcp/ssot.mjs`.
 *
 * Format per code.visualstudio.com/docs/agents/reference/mcp-configuration +
 * code.visualstudio.com/docs/agent-customization/mcp-servers (verified 2026-07-09):
 *   vscode:mcp/install?<url-encoded JSON {name,type,url,headers}>
 * (Insiders build: vscode-insiders:mcp/install?...)
 *
 * Usage: node packaging/vscode/generate-deeplink.mjs
 */
import { PROD_MCP_URL } from '../mcp/ssot.mjs';

export function buildVsCodeInstallConfig(url = PROD_MCP_URL) {
  return {
    name: 'maxoperf',
    type: 'http',
    url,
    headers: { Authorization: 'Bearer ${input:maxoperf-api-key}' },
  };
}

export function buildVsCodeDeeplink(url = PROD_MCP_URL) {
  const config = buildVsCodeInstallConfig(url);
  return `vscode:mcp/install?${encodeURIComponent(JSON.stringify(config))}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(buildVsCodeDeeplink());
}
