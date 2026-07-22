#!/usr/bin/env node
/**
 * `npx @maxoperf/agent-skill install` — drops SKILL.md + reference/ into the target agent's
 * skills directory, and (F10.6) auto-writes the MCP client config when MAXOPERF_API_KEY is set
 * in the environment. Plain Node (`node:fs`/`node:path`) — no dependencies, dependency-free by
 * design (this bundle ships as markdown + a tiny installer, nothing heavier).
 *
 * Usage:
 *   node installer.mjs install [--client=claude-code|cursor] [--target=<dir>]
 *
 * When published to the public `@maxoperf/agent-skill` package, `npx @maxoperf/agent-skill
 * install` resolves to this script via the package's `bin` entry.
 */
import { mkdirSync, copyFileSync, readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLE_ROOT = resolve(__dirname, '..'); // agent-skill/

/**
 * Canonical prod MCP server URL. The MCP server is path-routed on the console's public origin
 * (`publicWebOrigin` + `/mcp`) — there is no separate `mcp.*` subdomain (see
 * `packaging/mcp/ssot.mjs`, the repo-wide SSOT this literal must stay in sync with). Kept as a
 * plain literal here (not imported) because this installer ships standalone in the published
 * `@maxoperf/agent-skill` package, without the rest of the monorepo on disk.
 */
const PROD_MCP_URL = 'https://app.maxoperf.com/mcp';

const CLIENT_SKILL_DIRS = {
  'claude-code': () => join(process.env.HOME ?? '.', '.claude', 'skills', 'maxoperf'),
  cursor: () => join(process.cwd(), '.cursor', 'skills', 'maxoperf'),
};

function parseArgs(argv) {
  const args = { command: argv[0], client: 'claude-code', target: undefined };
  for (const arg of argv.slice(1)) {
    if (arg.startsWith('--client=')) args.client = arg.slice('--client='.length);
    if (arg.startsWith('--target=')) args.target = arg.slice('--target='.length);
  }
  return args;
}

function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      if (entry === 'install' || entry === 'scripts' || entry === 'node_modules') continue;
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/** Writes (or merges into) the client's MCP config with the MaxoPerf server entry. */
function writeClientConfig(client, apiKeyEnvName) {
  if (client === 'cursor') {
    const configPath = join(process.cwd(), '.cursor', 'mcp.json');
    mkdirSync(dirname(configPath), { recursive: true });
    let config = { mcpServers: {} };
    if (existsSync(configPath)) {
      try {
        config = JSON.parse(readFileSync(configPath, 'utf8'));
      } catch {
        // fall through to overwrite with a fresh config rather than crash the installer
      }
    }
    config.mcpServers = config.mcpServers ?? {};
    config.mcpServers.maxoperf = {
      url: PROD_MCP_URL,
      headers: { Authorization: `Bearer \${env:${apiKeyEnvName}}` },
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
    return configPath;
  }
  // claude-code: the CLI itself owns config storage; print the equivalent command instead of
  // hand-editing an internal file.
  console.log(
    `\nRun this to register the server (Claude Code manages its own MCP config store):\n` +
      `  claude mcp add --transport http maxoperf ${PROD_MCP_URL} \\\n` +
      `    --header "Authorization: Bearer \${${apiKeyEnvName}}"\n`,
  );
  return null;
}

function install(args) {
  const targetDir = args.target ?? CLIENT_SKILL_DIRS[args.client]?.() ?? CLIENT_SKILL_DIRS['claude-code']();
  copyRecursive(join(BUNDLE_ROOT, 'reference'), join(targetDir, 'reference'));
  copyFileSync(join(BUNDLE_ROOT, 'SKILL.md'), join(targetDir, 'SKILL.md'));
  console.log(`Installed MaxoPerf skill (SKILL.md + reference/) to: ${targetDir}`);

  const apiKeyEnvName = 'MAXOPERF_API_KEY';
  if (process.env[apiKeyEnvName]) {
    const written = writeClientConfig(args.client, apiKeyEnvName);
    if (written) console.log(`Wrote MCP client config: ${written}`);
  } else {
    console.log(
      `\nNo ${apiKeyEnvName} found in your environment — set it and re-run, or follow ` +
        `install/${args.client}.md to configure the MCP connection manually.\n` +
        `New to MaxoPerf? See the "Get an API key" docs article linked from the console's API keys page.`,
    );
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command !== 'install') {
    console.log('Usage: npx @maxoperf/agent-skill install [--client=claude-code|cursor] [--target=<dir>]');
    process.exitCode = args.command ? 1 : 0;
    return;
  }
  install(args);
}

main();
