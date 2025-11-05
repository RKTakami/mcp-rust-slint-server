import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Database setup
const DATA_DIR = join(process.cwd(), 'data');
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(join(DATA_DIR, 'rust_slint_dev.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS rust_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    version TEXT,
    repository_url TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS slint_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    repository_url TEXT,
    documentation_url TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS rust_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS slint_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS data_cached_at (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_type TEXT UNIQUE NOT NULL,
    last_cached DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_valid BOOLEAN DEFAULT 1
  );
`);

// Data freshness check on startup
async function checkDataFreshness() {
  console.error('Checking data freshness...');
  
  const cacheTypes = ['rust_packages', 'slint_components', 'rust_news', 'slint_news'];
  const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = Date.now();
  
  for (const cacheType of cacheTypes) {
    const cacheRecord = db.prepare('SELECT last_cached, is_valid FROM data_cached_at WHERE cache_type = ?').get(cacheType);
    
    if (!cacheRecord || !cacheRecord.is_valid || 
        (now - new Date(cacheRecord.last_cached).getTime()) > staleThreshold) {
      console.error(`${cacheType} data is stale, refreshing...`);
      await refreshData(cacheType);
    }
  }
}

// Refresh data based on type
async function refreshData(type: string) {
  try {
    let data;
    switch (type) {
      case 'rust_packages':
        data = await fetchRustPackages();
        await updateRustPackages(data);
        break;
      case 'slint_components':
        data = await fetchSlintComponents();
        await updateSlintComponents(data);
        break;
      case 'rust_news':
        data = await fetchRustNews();
        await updateRustNews(data);
        break;
      case 'slint_news':
        data = await fetchSlintNews();
        await updateSlintNews(data);
        break;
    }
    
    // Update cache timestamp
    db.prepare(`
      INSERT OR REPLACE INTO data_cached_at (cache_type, last_cached, is_valid)
      VALUES (?, CURRENT_TIMESTAMP, 1)
    `).run(type);
    
    console.error(`${type} data refreshed successfully`);
  } catch (error) {
    console.error(`Error refreshing ${type}:`, error);
    // Mark as invalid so it will be retried next time
    db.prepare(`
      INSERT OR REPLACE INTO data_cached_at (cache_type, last_cached, is_valid)
      VALUES (?, CURRENT_TIMESTAMP, 0)
    `).run(type);
  }
}

// GitHub API functions for data gathering
async function fetchRustPackages() {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'language:rust topic:crates.io',
        sort: 'stars',
        order: 'desc',
        per_page: 50
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'rust-slint-dev-mcp'
      }
    });
    
    return response.data.items.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      version: 'latest',
      repository_url: repo.html_url,
      last_updated: repo.updated_at
    }));
  } catch (error) {
    console.error('Error fetching Rust packages:', error);
    return [];
  }
}

async function fetchSlintComponents() {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'slint language:rust',
        sort: 'stars',
        order: 'desc',
        per_page: 30
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'rust-slint-dev-mcp'
      }
    });
    
    return response.data.items.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      category: 'component',
      repository_url: repo.html_url,
      documentation_url: `${repo.html_url}/blob/main/README.md`,
      last_updated: repo.updated_at
    }));
  } catch (error) {
    console.error('Error fetching Slint components:', error);
    return [];
  }
}

async function fetchRustNews() {
  try {
    const rustLangResponse = await axios.get('https://api.github.com/repos/rust-lang/rust/releases', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'rust-slint-dev-mcp'
      }
    });
    
    return rustLangResponse.data.slice(0, 10).map((release: any) => ({
      title: release.name || release.tag_name,
      summary: release.body?.substring(0, 200) + '...' || '',
      url: release.html_url,
      source: 'Rust Lang',
      published_at: release.published_at
    }));
  } catch (error) {
    console.error('Error fetching Rust news:', error);
    return [];
  }
}

async function fetchSlintNews() {
  try {
    const slintResponse = await axios.get('https://api.github.com/repos/slint-ui/slint/releases', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'rust-slint-dev-mcp'
      }
    });
    
    return slintResponse.data.slice(0, 10).map((release: any) => ({
      title: release.name || release.tag_name,
      summary: release.body?.substring(0, 200) + '...' || '',
      url: release.html_url,
      source: 'Slint UI',
      published_at: release.published_at
    }));
  } catch (error) {
    console.error('Error fetching Slint news:', error);
    return [];
  }
}

// Database update functions
async function updateRustPackages(packages: any[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO rust_packages 
    (name, description, version, repository_url, last_updated, is_current)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  
  for (const pkg of packages) {
    stmt.run(pkg.name, pkg.description, pkg.version, pkg.repository_url, pkg.last_updated);
  }
}

async function updateSlintComponents(components: any[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO slint_components 
    (name, description, category, repository_url, documentation_url, last_updated, is_current)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  
  for (const comp of components) {
    stmt.run(comp.name, comp.description, comp.category, comp.repository_url, 
             comp.documentation_url, comp.last_updated);
  }
}

async function updateRustNews(news: any[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO rust_news 
    (title, summary, url, source, published_at, is_current)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  
  for (const item of news) {
    stmt.run(item.title, item.summary, item.url, item.source, item.published_at);
  }
}

async function updateSlintNews(news: any[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO slint_news 
    (title, summary, url, source, published_at, is_current)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  
  for (const item of news) {
    stmt.run(item.title, item.summary, item.url, item.source, item.published_at);
  }
}

// Create an MCP server
const server = new McpServer({
  name: "rust-slint-dev-mcp",
  version: "0.1.0"
});

// Tools for querying Rust information
server.tool(
  "search_rust_packages",
  {
    query: z.string().describe("Search query for Rust packages"),
    limit: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results")
  },
  async ({ query, limit }) => {
    try {
      const stmt = db.prepare(`
        SELECT name, description, version, repository_url, last_updated
        FROM rust_packages 
        WHERE name LIKE ? OR description LIKE ?
        AND is_current = 1
        ORDER BY last_updated DESC
        LIMIT ?
      `);
      
      const results = stmt.all(`%${query}%`, `%${query}%`, limit);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              query,
              results_count: results.length,
              packages: results
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching Rust packages: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "search_slint_components",
  {
    query: z.string().describe("Search query for Slint components"),
    category: z.string().optional().describe("Filter by component category"),
    limit: z.number().min(1).max(100).optional().default(10).describe("Maximum number of results")
  },
  async ({ query, category, limit }) => {
    try {
      let stmt = db.prepare(`
        SELECT name, description, category, repository_url, documentation_url, last_updated
        FROM slint_components 
        WHERE (name LIKE ? OR description LIKE ?)
        AND is_current = 1
      `);
      
      const params: any[] = [`%${query}%`, `%${query}%`];
      
      if (category) {
        stmt = db.prepare(`
          SELECT name, description, category, repository_url, documentation_url, last_updated
          FROM slint_components 
          WHERE (name LIKE ? OR description LIKE ?)
          AND category LIKE ?
          AND is_current = 1
        `);
        params.push(`%${category}%`);
      }
      
      stmt = stmt.prepare(stmt.sql + ' ORDER BY last_updated DESC LIMIT ?');
      params.push(limit.toString());
      
      const results = stmt.all(...params);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              query,
              category_filter: category,
              results_count: results.length,
              components: results
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching Slint components: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_rust_news",
  {
    limit: z.number().min(1).max(50).optional().default(10).describe("Maximum number of news items")
  },
  async ({ limit }) => {
    try {
      const stmt = db.prepare(`
        SELECT title, summary, url, source, published_at
        FROM rust_news 
        WHERE is_current = 1
        ORDER BY published_at DESC
        LIMIT ?
      `);
      
      const results = stmt.all(limit);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              news_count: results.length,
              news: results
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching Rust news: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_slint_news",
  {
    limit: z.number().min(1).max(50).optional().default(10).describe("Maximum number of news items")
  },
  async ({ limit }) => {
    try {
      const stmt = db.prepare(`
        SELECT title, summary, url, source, published_at
        FROM slint_news 
        WHERE is_current = 1
        ORDER BY published_at DESC
        LIMIT ?
      `);
      
      const results = stmt.all(limit);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              news_count: results.length,
              news: results
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching Slint news: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "refresh_data",
  {
    type: z.enum(['rust_packages', 'slint_components', 'rust_news', 'slint_news', 'all']).describe("Type of data to refresh")
  },
  async ({ type }) => {
    try {
      if (type === 'all') {
        const types = ['rust_packages', 'slint_components', 'rust_news', 'slint_news'];
        for (const t of types) {
          await refreshData(t);
        }
      } else {
        await refreshData(type);
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: `Successfully refreshed ${type} data`,
              timestamp: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error refreshing data: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_data_status",
  {},
  async () => {
    try {
      const cacheRecords = db.prepare('SELECT cache_type, last_cached, is_valid FROM data_cached_at').all();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              data_status: cacheRecords,
              last_check: new Date().toISOString()
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting data status: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Initialize data freshness check and start server
async function main() {
  try {
    await checkDataFreshness();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Rust/Slint Dev MCP server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();