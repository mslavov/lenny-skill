import chalk from "chalk";
import type { ContentItem, SearchHit, ListResult, SearchResult } from "./client.js";

const TAG_COLORS: Record<string, (s: string) => string> = {
  ai: chalk.magenta,
  growth: chalk.green,
  pricing: chalk.yellow,
  leadership: chalk.cyan,
  startups: chalk.red,
  strategy: chalk.blue,
  career: chalk.hex("#FF8C00"),
  engineering: chalk.hex("#00CED1"),
  design: chalk.hex("#DA70D6"),
  analytics: chalk.hex("#20B2AA"),
  "product-management": chalk.hex("#FF6347"),
  b2b: chalk.hex("#4682B4"),
  b2c: chalk.hex("#32CD32"),
  "go-to-market": chalk.hex("#FFD700"),
  organization: chalk.hex("#8B4513"),
};

function formatTag(tag: string): string {
  const colorFn = TAG_COLORS[tag] || chalk.gray;
  return colorFn(`#${tag}`);
}

function formatDate(date: string): string {
  return chalk.dim(date);
}

function formatType(type: string): string {
  return type === "podcast" ? chalk.blue("podcast") : chalk.green("newsletter");
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}

export function formatListItem(item: ContentItem, index: number): string {
  const lines: string[] = [];
  const num = chalk.dim(`${(index + 1).toString().padStart(3)}.`);
  const title = chalk.bold.white(truncate(item.title, 80));
  const type = formatType(item.type);
  const date = formatDate(item.date);
  const words = chalk.dim(`${(item.word_count / 1000).toFixed(1)}k words`);

  lines.push(`${num} ${title}`);
  lines.push(`     ${type}  ${date}  ${words}`);

  if (item.subtitle) {
    lines.push(`     ${chalk.italic.dim(truncate(item.subtitle, 90))}`);
  }
  if (item.guest) {
    lines.push(`     ${chalk.cyan("Guest:")} ${item.guest}`);
  }

  const tags = item.tags.map(formatTag).join(" ");
  lines.push(`     ${tags}`);
  lines.push(`     ${chalk.dim(item.filename)}`);

  return lines.join("\n");
}

export function formatListResult(result: ListResult): string {
  const lines: string[] = [];

  lines.push(
    chalk.bold(`\nLenny's Archive`) +
      chalk.dim(` (${result.tier} tier)`) +
      chalk.dim(` \u2014 ${result.total} items total\n`)
  );

  result.results.forEach((item, i) => {
    lines.push(formatListItem(item, result.offset + i));
    lines.push("");
  });

  const showing = `${result.offset + 1}\u2013${result.offset + result.results.length}`;
  lines.push(chalk.dim(`Showing ${showing} of ${result.total}`));

  if (result.offset + result.results.length < result.total) {
    lines.push(chalk.dim(`Use --offset ${result.offset + result.results.length} to see more`));
  }

  return lines.join("\n");
}

export function formatSearchHit(hit: SearchHit, index: number): string {
  const lines: string[] = [];
  const num = chalk.dim(`${(index + 1).toString().padStart(3)}.`);
  const title = chalk.bold.white(truncate(hit.title, 80));
  const matches = chalk.yellow(`${hit.match_count} matches`);
  const type = formatType(hit.type);
  const date = formatDate(hit.date);

  lines.push(`${num} ${title}`);
  lines.push(`     ${type}  ${date}  ${matches}`);

  if (hit.snippet) {
    const snippet = hit.snippet
      .replace(/\.\.\./g, "\u2026")
      .replace(/\n/g, " ")
      .trim();
    lines.push(`     ${chalk.dim(truncate(snippet, 120))}`);
  }

  const tags = hit.tags.map(formatTag).join(" ");
  lines.push(`     ${tags}`);
  lines.push(`     ${chalk.dim(hit.filename)}`);

  return lines.join("\n");
}

export function formatSearchResult(result: SearchResult): string {
  const lines: string[] = [];

  lines.push(
    chalk.bold(`\nSearch: `) +
      chalk.cyan(result.query) +
      chalk.dim(` \u2014 ${result.total_results} results\n`)
  );

  result.results.forEach((hit, i) => {
    lines.push(formatSearchHit(hit, i));
    lines.push("");
  });

  if (result.total_results > result.results.length) {
    lines.push(
      chalk.dim(
        `Showing ${result.results.length} of ${result.total_results}. Use --limit to see more.`
      )
    );
  }

  return lines.join("\n");
}

export function formatContent(content: string, filename: string): string {
  const lines: string[] = [];
  lines.push(chalk.dim(`\u2500\u2500\u2500 ${filename} \u2500\u2500\u2500\n`));
  lines.push(content);
  lines.push(chalk.dim(`\n\u2500\u2500\u2500 end \u2500\u2500\u2500`));
  return lines.join("\n");
}

export function formatExcerpt(text: string, filename: string): string {
  const lines: string[] = [];
  lines.push(chalk.dim(`\u2500\u2500\u2500 ${filename} (excerpt) \u2500\u2500\u2500\n`));
  lines.push(text);
  lines.push(chalk.dim(`\n\u2500\u2500\u2500 end \u2500\u2500\u2500`));
  return lines.join("\n");
}

export function formatStats(newsletters: ListResult, podcasts: ListResult): string {
  const lines: string[] = [];
  lines.push(chalk.bold("\nLenny's Archive Stats\n"));
  lines.push(`  ${chalk.green("Newsletters:")} ${newsletters.total}`);
  lines.push(`  ${chalk.blue("Podcasts:")}    ${podcasts.total}`);
  lines.push(`  ${chalk.white("Total:")}       ${newsletters.total + podcasts.total}`);
  lines.push(`  ${chalk.dim("Tier:")}        ${newsletters.tier}`);
  return lines.join("\n");
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
