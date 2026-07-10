#!/usr/bin/env node
/**
 * Minimal markdown/format check for the agent-skill bundle: every required file exists and
 * is non-empty, and no file has trailing whitespace on a line. Deliberately dependency-free
 * (no markdownlint/prettier dep) — the bundle is meant to ship with zero runtime dependencies.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_FILES = [
  'SKILL.md',
  'reference/engines.md',
  'reference/hotspot-patterns.md',
  'reference/mcp-tools.md',
  'install/claude-code.md',
  'install/cursor.md',
  'install/claude-desktop.md',
  'install/chatgpt.md',
];

let failed = false;

for (const rel of REQUIRED_FILES) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) {
    console.error(`MISSING: ${rel}`);
    failed = true;
    continue;
  }
  const content = readFileSync(path, 'utf8');
  if (content.trim().length === 0) {
    console.error(`EMPTY: ${rel}`);
    failed = true;
    continue;
  }
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (/[ \t]+$/.test(line)) {
      console.error(`TRAILING WHITESPACE: ${rel}:${i + 1}`);
      failed = true;
    }
  });
}

if (failed) {
  console.error('\nagent-skill lint failed.');
  process.exit(1);
}
console.log(`agent-skill lint OK — ${REQUIRED_FILES.length} files checked.`);
