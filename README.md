# lenny-skill

CLI + agent skill for searching Lenny Rachitsky's Newsletter & Podcast archive (638 items, 5.4M words) via the [lennysdata](https://lennysdata.com) MCP server.

## Install the Agent Skill

Works with Claude Code, Cursor, Codex, and [40+ other agents](https://agentskills.io):

```bash
npx skills add mslavov/lenny-skill
```

Or via the CLI itself:

```bash
npx lenny-cli --skill export lenny | npx skillflag install
```

## Install the CLI

```bash
npm install -g lenny-cli
```

Or use without installing:

```bash
npx lenny-cli search "pricing" --limit 3
```

## Setup

Get a token from [lennysdata.com](https://lennysdata.com), then:

```bash
export LENNY_TOKEN=your_token_here
```

Or save it permanently:

```bash
lenny config your_token_here
```

## Usage

```bash
# Search the archive
lenny search "pricing strategy" --limit 5
lenny search "growth|activation|retention" --type podcast

# Browse content
lenny list --type newsletter --limit 10

# Read full content
lenny read "podcasts/madhavan-ramanujam.md"

# Read a focused excerpt
lenny excerpt "podcasts/madhavan-ramanujam.md" --query "pricing"

# Archive stats
lenny stats

# JSON output (for scripting or agents)
lenny search "hiring" --json
```

## Agent Usage

Once the skill is installed, just ask your agent naturally:

- "What does Lenny say about pricing?"
- "Find podcast episodes about hiring"
- "Summarize Lenny's advice on product-market fit"

## Optional: MCP Server

For faster, richer access, configure the lennysdata MCP server directly in your agent. Add to your MCP config:

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

## License

MIT
