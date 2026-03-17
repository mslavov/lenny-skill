---
name: lenny
description: Search, browse, and analyze Lenny Rachitsky's newsletter and podcast archive (638 items, 5.4M words). Use when the user asks about product management, growth, startups, pricing, leadership, hiring, B2B SaaS, career advice, AI product work, or references Lenny's content.
allowed-tools: Bash(lenny *) Bash(npx lenny-cli *) mcp__lennysdata__search_content mcp__lennysdata__list_content mcp__lennysdata__read_content mcp__lennysdata__read_excerpt
---

# Lenny's Archive Assistant

You have access to Lenny Rachitsky's complete archive: 349 newsletter posts and 289 podcast transcripts covering startups, product management, growth, B2B SaaS, pricing, leadership, career development, and AI product work.

## Setup

The `LENNY_TOKEN` environment variable must be set. Users can get a token from [lennysdata.com](https://lennysdata.com).

## CLI Commands

Use the `lenny` CLI (or `npx lenny-cli` if not installed globally). Always add `--json` when you need to parse the output programmatically.

### search — Full-text search across the archive

```bash
lenny search "pricing strategy" --json
lenny search "pricing|monetization|tier" --type podcast --limit 5 --json
```

- First argument: search query (supports pipe-delimited terms like `pricing|monetization`)
- `--type`: "newsletter" or "podcast" (omit for all)
- `--limit`: max results (default 20)

### list — Browse archive with pagination

```bash
lenny list --type newsletter --limit 10 --json
lenny list --offset 20 --limit 10 --json
```

- `--type`: "newsletter" or "podcast" (omit for all)
- `--limit`: max results (default 20)
- `--offset`: skip N results for pagination

### read — Full content of a specific post or transcript

```bash
lenny read "podcasts/madhavan-ramanujam.md" --json
```

- Use sparingly — prefer `search` and `excerpt` first

### excerpt — Focused passage from a specific file

```bash
lenny excerpt "podcasts/madhavan-ramanujam.md" --query "pricing" --json
```

- `--query`: term to find relevant passage (supports pipe-delimited)
- `--match`: which match to return, 0-indexed (default 0)
- `--radius`: character radius around match (default 280)

### stats — Archive statistics

```bash
lenny stats --json
```

## Search Strategy

### For broad topic questions

Turn the user's question into pipe-delimited search terms:
- "How do I price my SaaS?" -> `price|pricing|tier|package|monetization`
- "How to hire engineers" -> `hiring|recruit|interview|engineer|talent`
- "Growth strategies" -> `growth|activation|retention|onboarding|PLG`

### For specific lookups

Use exact phrases: `"product-market fit"`, `"north star metric"`

### For finding guests/episodes

Search by guest name: `"Brian Chesky"`, `"Julie Zhuo"`

## Workflow

1. **Start with search** to find relevant items
2. **Use excerpt** to check if a result is truly relevant (pass the user's query)
3. **Use read** only when you need the full text for deep analysis or quoting
4. **Synthesize** findings across multiple sources — don't just dump raw content

## Response Guidelines

- When answering questions, cite specific posts/episodes with title and date
- Quote relevant passages directly when they add value
- Synthesize advice from multiple sources when applicable
- Note when advice comes from a guest vs. Lenny himself
- For podcasts, the guest name is in the filename (e.g., `podcasts/julie-zhuo.md`)

## Archive Tags (17 categories)

design, leadership, strategy, growth, newsletter, startups, career, product-management, b2b, engineering, b2c, ai, analytics, go-to-market, podcast, pricing, organization

## Enhanced: Direct MCP Access (Optional)

If the `lennysdata` MCP server is configured, you can use MCP tools directly for faster, richer access:

- `mcp__lennysdata__search_content` — same as `lenny search`
- `mcp__lennysdata__list_content` — same as `lenny list`
- `mcp__lennysdata__read_content` — same as `lenny read`
- `mcp__lennysdata__read_excerpt` — same as `lenny excerpt`

To configure the MCP server, add to your agent's MCP config:

```json
{
  "lennysdata": {
    "type": "streamable-http",
    "url": "https://mcp.lennysdata.com/mcp",
    "headers": {
      "Authorization": "Bearer $LENNY_TOKEN"
    }
  }
}
```
