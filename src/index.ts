#!/usr/bin/env node

import { findSkillsRoot, maybeHandleSkillflag } from "skillflag";

await maybeHandleSkillflag(process.argv, {
  skillsRoot: findSkillsRoot(import.meta.url),
});

import { Command } from "commander";
import { LennyClient } from "./client.js";
import {
  formatListResult,
  formatSearchResult,
  formatContent,
  formatExcerpt,
  formatStats,
  formatJson,
} from "./formatters.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

function getToken(): string {
  // 1. CLI flag (handled by commander, passed via options)
  // 2. Env var
  if (process.env.LENNY_TOKEN) return process.env.LENNY_TOKEN;

  // 3. Config file
  const configPath = join(homedir(), ".config", "lenny-cli", "config.json");
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    if (config.token) return config.token;
  }

  console.error(
    "Error: No auth token found.\n" +
      "Set LENNY_TOKEN env var, use --token flag, or create ~/.config/lenny-cli/config.json"
  );
  process.exit(1);
}

function createClient(opts: { token?: string }): LennyClient {
  const token = opts.token || getToken();
  return new LennyClient({ token });
}

const program = new Command();

program
  .name("lenny")
  .description("CLI for Lenny's Newsletter & Podcast archive")
  .version("1.0.0")
  .option("--token <token>", "Auth token (or set LENNY_TOKEN env var)")
  .option("--json", "Output raw JSON");

program
  .command("search <query>")
  .description("Search the archive for topics or keywords")
  .option("-t, --type <type>", "Filter: newsletter, podcast", "")
  .option("-l, --limit <n>", "Max results", "20")
  .action(async (query: string, opts: { type: string; limit: string }) => {
    const globalOpts = program.opts();
    const client = createClient(globalOpts);
    try {
      const result = await client.search(query, {
        type: opts.type,
        limit: parseInt(opts.limit),
      });
      console.log(globalOpts.json ? formatJson(result) : formatSearchResult(result));
    } finally {
      await client.close();
    }
  });

program
  .command("list")
  .description("List archive content")
  .option("-t, --type <type>", "Filter: newsletter, podcast", "")
  .option("-l, --limit <n>", "Max results", "20")
  .option("-o, --offset <n>", "Skip N results", "0")
  .action(async (opts: { type: string; limit: string; offset: string }) => {
    const globalOpts = program.opts();
    const client = createClient(globalOpts);
    try {
      const result = await client.list({
        type: opts.type,
        limit: parseInt(opts.limit),
        offset: parseInt(opts.offset),
      });
      console.log(globalOpts.json ? formatJson(result) : formatListResult(result));
    } finally {
      await client.close();
    }
  });

program
  .command("read <filename>")
  .description("Read the full content of a post or transcript")
  .action(async (filename: string) => {
    const globalOpts = program.opts();
    const client = createClient(globalOpts);
    try {
      const content = await client.read(filename);
      console.log(globalOpts.json ? formatJson({ filename, content }) : formatContent(content, filename));
    } finally {
      await client.close();
    }
  });

program
  .command("excerpt <filename>")
  .description("Read an excerpt from a post or transcript")
  .option("-q, --query <query>", "Search term to find relevant passage", "")
  .option("-m, --match <n>", "Which match to return (0-indexed)", "0")
  .option("-r, --radius <n>", "Character radius around match", "280")
  .action(
    async (
      filename: string,
      opts: { query: string; match: string; radius: string }
    ) => {
      const globalOpts = program.opts();
      const client = createClient(globalOpts);
      try {
        const content = await client.excerpt(filename, {
          query: opts.query,
          matchIndex: parseInt(opts.match),
          radius: parseInt(opts.radius),
        });
        console.log(
          globalOpts.json
            ? formatJson({ filename, query: opts.query, content })
            : formatExcerpt(content, filename)
        );
      } finally {
        await client.close();
      }
    }
  );

program
  .command("stats")
  .description("Show archive statistics")
  .action(async () => {
    const globalOpts = program.opts();
    const client = createClient(globalOpts);
    try {
      const [newsletters, podcasts] = await Promise.all([
        client.list({ type: "newsletter", limit: 1 }),
        client.list({ type: "podcast", limit: 1 }),
      ]);
      console.log(
        globalOpts.json ? formatJson({ newsletters: newsletters.total, podcasts: podcasts.total, tier: newsletters.tier }) : formatStats(newsletters, podcasts)
      );
    } finally {
      await client.close();
    }
  });

program
  .command("config")
  .description("Save auth token to config file")
  .argument("<token>", "Your lennysdata auth token")
  .action(async (token: string) => {
    const { mkdirSync, writeFileSync } = await import("fs");
    const configDir = join(homedir(), ".config", "lenny-cli");
    mkdirSync(configDir, { recursive: true });
    const configPath = join(configDir, "config.json");
    writeFileSync(configPath, JSON.stringify({ token }, null, 2));
    console.log(`Token saved to ${configPath}`);
  });

program.parseAsync().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
