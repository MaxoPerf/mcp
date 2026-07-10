/**
 * Single source of truth for the canonical public MCP server URL.
 *
 * The MCP server is **path-routed** on the console's public origin (see subtask-03:
 * `deploy/helm/maxoperf/values.yaml` — `MCP_PUBLIC_URL: '{{ printf "%s/mcp"
 * (include "maxoperf.publicWebOrigin" .) }}'` — and `deploy/helm/maxoperf/charts/edge/
 * {templates/httproutes.yaml,values.yaml}` — HTTPRoute `/mcp` -> `mcp-server:{{ .Values
 * .backendPorts.mcpServer }}`). There is no separate `mcp.*` subdomain; `publicMcpServerOrigin`
 * IS `publicWebOrigin`, and the advertised endpoint is `<publicWebOrigin>/mcp`.
 *
 * This module reads the *real* deployed value straight out of the Helm values files (no
 * hand-copied literal) so packaging manifests and their tests can never drift from the actual
 * SSOT. Every packaging manifest must derive its server URL from `PROD_MCP_URL` below (or from
 * this module directly), never from a hard-coded string.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

/**
 * Reads `global.maxoperf.publicWebOrigin` out of a Helm values file by locating the literal
 * `publicWebOrigin: '<value>'` line. Deliberately dependency-free (no `js-yaml`) — this repo's
 * values files always quote the scalar on one line, matching the pattern used by every other
 * ad-hoc reader in this codebase (see `agent-skill/install/installer.mjs`).
 */
export function readPublicWebOrigin(valuesFile = 'deploy/helm/maxoperf/values-prod.yaml') {
  const path = join(REPO_ROOT, valuesFile);
  const text = readFileSync(path, 'utf8');
  const match = text.match(/publicWebOrigin:\s*'([^']*)'/);
  if (!match || !match[1]) {
    throw new Error(`publicWebOrigin not found (or empty) in ${valuesFile}`);
  }
  return match[1].replace(/\/$/, '');
}

/** The canonical prod MCP server URL, derived live from the Helm SSOT. */
export const PROD_PUBLIC_WEB_ORIGIN = readPublicWebOrigin('deploy/helm/maxoperf/values-prod.yaml');
export const PROD_MCP_URL = `${PROD_PUBLIC_WEB_ORIGIN}/mcp`;
