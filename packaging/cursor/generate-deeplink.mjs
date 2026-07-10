#!/usr/bin/env node
/**
 * Regenerates the Cursor "Add to Cursor" install deeplink from the SSOT server URL — matches the
 * format used by subtask-04's connect page. Verified 2026-07-09 (Cursor's documented
 * `cursor://anysphere.cursor-deeplink/mcp/install?name=<name>&config=<base64 JSON>` shape).
 *
 * Usage: node packaging/cursor/generate-deeplink.mjs
 */
import { PROD_MCP_URL } from '../mcp/ssot.mjs';

export function buildCursorInstallConfig(url = PROD_MCP_URL) {
  return { url, headers: { Authorization: 'Bearer YOUR_MAXOPERF_API_KEY' } };
}

export function buildCursorDeeplink(url = PROD_MCP_URL) {
  const config = buildCursorInstallConfig(url);
  const b64 = Buffer.from(JSON.stringify(config)).toString('base64');
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=maxoperf&config=${b64}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(buildCursorDeeplink());
}
