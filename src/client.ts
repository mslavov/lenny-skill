import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export interface LennyConfig {
  token: string;
  serverUrl?: string;
}

export interface ListResult {
  total: number;
  offset: number;
  limit: number;
  tier: string;
  results: ContentItem[];
}

export interface ContentItem {
  title: string;
  filename: string;
  tags: string[];
  word_count: number;
  date: string;
  subtitle?: string;
  type: string;
  guest?: string;
  description?: string;
}

export interface SearchResult {
  query: string;
  terms: string[];
  tier: string;
  total_results: number;
  results: SearchHit[];
}

export interface SearchHit extends ContentItem {
  matched_terms: string[];
  match_count: number;
  snippet: string;
  snippets: Snippet[];
}

export interface Snippet {
  text: string;
  matched_terms: string[];
  match_count: number;
  start_char: number;
  end_char: number;
}

export interface ExcerptResult {
  filename: string;
  query: string;
  match_index: number;
  total_matches: number;
  excerpt: string;
}

export class LennyClient {
  private client: Client;
  private config: LennyConfig;
  private connectPromise: Promise<void> | null = null;

  constructor(config: LennyConfig) {
    this.config = config;
    this.client = new Client({
      name: "lenny-cli",
      version: "1.0.0",
    });
  }

  async connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = (async () => {
      const url = this.config.serverUrl || "https://mcp.lennysdata.com/mcp";
      const transport = new StreamableHTTPClientTransport(new URL(url), {
        requestInit: {
          headers: {
            Authorization: `Bearer ${this.config.token}`,
          },
        },
      });
      await this.client.connect(transport);
    })();

    return this.connectPromise;
  }

  private async callTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
    await this.connect();
    const result = await this.client.callTool({ name, arguments: args });

    const textContent = result.content as Array<{ type: string; text: string }>;
    const text = textContent.find((c) => c.type === "text")?.text;
    if (!text) throw new Error(`No text response from ${name}`);
    return JSON.parse(text) as T;
  }

  async list(options: {
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ListResult> {
    return this.callTool<ListResult>("list_content", {
      content_type: options.type || "",
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
  }

  async search(query: string, options: {
    type?: string;
    limit?: number;
  } = {}): Promise<SearchResult> {
    return this.callTool<SearchResult>("search_content", {
      query,
      content_type: options.type || "",
      limit: options.limit || 20,
    });
  }

  async read(filename: string): Promise<string> {
    await this.connect();
    const result = await this.client.callTool({
      name: "read_content",
      arguments: { filename },
    });
    const textContent = result.content as Array<{ type: string; text: string }>;
    return textContent.find((c) => c.type === "text")?.text || "";
  }

  async excerpt(filename: string, options: {
    query?: string;
    matchIndex?: number;
    radius?: number;
  } = {}): Promise<string> {
    await this.connect();
    const result = await this.client.callTool({
      name: "read_excerpt",
      arguments: {
        filename,
        query: options.query || "",
        match_index: options.matchIndex || 0,
        radius: options.radius || 280,
      },
    });
    const textContent = result.content as Array<{ type: string; text: string }>;
    return textContent.find((c) => c.type === "text")?.text || "";
  }

  async close(): Promise<void> {
    if (this.connectPromise) {
      await this.client.close();
      this.connectPromise = null;
    }
  }
}
