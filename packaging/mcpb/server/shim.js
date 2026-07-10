// Placeholder entry_point required by the .mcpb manifest_version 0.3 schema (`server.entry_point`).
// Unused at runtime: `manifest.json`'s `mcp_config.command` runs `npx -y mcp-remote ...` directly,
// which bridges Claude Desktop's local stdio transport to MaxoPerf's remote Streamable-HTTP MCP
// server. This file exists only so `mcpb pack`/schema validation sees a resolvable entry_point path.
process.stderr.write(
  'This entry point is not used at runtime — the .mcpb manifest runs `npx -y mcp-remote` directly. ' +
    'See packaging/mcpb/manifest.json _meta.io.maxoperf/packaging for rationale.\n',
);
process.exit(1);
