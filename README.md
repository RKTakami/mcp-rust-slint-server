# MCP Rust/Slint Development Server

A Model Context Protocol (MCP) server that provides current information for Rust and Slint development, including packages, components, news, and resources from GitHub and other reputable sources.

## Overview

This MCP server serves up-to-date information for Rust and Slint development by:

- **Fetching Data from GitHub**: Real-time data from official Rust and Slint repositories
- **Maintaining Local Cache**: SQLite database with automatic freshness checking
- **Providing MCP Tools**: Six specialized tools for querying development information
- **Auto-Refresh**: Automatically updates data older than 24 hours on startup

## Features

### 🔍 Search Capabilities
- **Rust Packages**: Search popular Rust crates and libraries
- **Slint Components**: Find Slint UI components and examples
- **Development News**: Latest releases and announcements from both ecosystems

### 📊 Data Sources
- **GitHub Repositories**: Official Rust and Slint repositories
- **Package Registries**: Current package information and statistics
- **Release Feeds**: Real-time release announcements and updates
- **Community Data**: Popular packages and trending components

### 🛠️ MCP Tools
1. `search_rust_packages` - Search and discover Rust crates
2. `search_slint_components` - Find Slint UI components
3. `get_rust_news` - Latest Rust ecosystem news
4. `get_slint_news` - Recent Slint project updates
5. `refresh_data` - Manual data refresh capabilities
6. `get_data_status` - Cache status and data freshness monitoring

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RKTakami/mcp-rust-slint-server.git
   cd mcp-rust-slint-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile TypeScript**:
   ```bash
   npm run build
   ```

4. **Test the server**:
   ```bash
   npm test
   ```

## Configuration

### For Roo Code
Add to your MCP settings:
```json
{
  "mcpServers": {
    "rust-slint-dev": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {},
      "disabled": false,
      "alwaysAllow": [],
      "disabledTools": []
    }
  }
}
```

### For VSCode
Add to your VSCode MCP settings:
```json
{
  "mcpServers": {
    "rust-slint-dev": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {},
      "disabled": false,
      "alwaysAllow": [],
      "disabledTools": []
    }
  }
}
```

## Usage

### MCP Tools

#### Search Rust Packages
```javascript
// Search for popular Rust packages
await tools.search_rust_packages({
  query: "web framework",
  limit: 10
});
```

#### Search Slint Components
```javascript
// Find Slint UI components
await tools.search_slint_components({
  query: "button",
  category: "ui",
  limit: 10
});
```

#### Get Latest News
```javascript
// Get latest Rust news
await tools.get_rust_news({
  limit: 10
});

// Get latest Slint news
await tools.get_slint_news({
  limit: 10
});
```

#### Data Management
```javascript
// Check data freshness
await tools.get_data_status();

// Refresh specific data type
await tools.refresh_data({
  type: "rust_packages"
});

// Refresh all data
await tools.refresh_data({
  type: "all"
});
```

## Database Structure

The server uses SQLite with the following tables:

- **rust_packages**: Popular Rust crates and packages
- **slint_components**: Slint UI components and examples
- **rust_news**: Latest Rust releases and announcements
- **slint_news**: Recent Slint project updates
- **data_cached_at**: Cache timestamp tracking for data freshness

## Architecture

### Data Flow
1. **Startup**: Server checks data freshness on initialization
2. **Cache Validation**: Compares cache timestamps against 24-hour threshold
3. **GitHub API**: Fetches fresh data from official repositories
4. **Database Update**: Stores new data in SQLite database
5. **Tool Execution**: Serves cached data through MCP tools

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Database**: SQLite with `better-sqlite3`
- **HTTP Client**: Axios for GitHub API calls
- **Data Sources**: GitHub REST API v3

## Development

### Project Structure
```
mcp-rust-slint-server/
├── src/
│   └── index.ts          # Main server implementation
├── build/
│   └── index.js          # Compiled JavaScript
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── test_server.js        # Test suite
└── README.md            # This file
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run test suite
- `npm start` - Start the MCP server

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## API Endpoints

The server provides the following MCP tools:

### search_rust_packages
- **Description**: Search for Rust packages and crates
- **Parameters**: 
  - `query` (string): Search query
  - `limit` (number, optional): Maximum results (1-100, default: 10)

### search_slint_components
- **Description**: Search for Slint UI components
- **Parameters**:
  - `query` (string): Search query
  - `category` (string, optional): Filter by category
  - `limit` (number, optional): Maximum results (1-100, default: 10)

### get_rust_news
- **Description**: Get latest Rust ecosystem news
- **Parameters**:
  - `limit` (number, optional): Maximum results (1-50, default: 10)

### get_slint_news
- **Description**: Get latest Slint project updates
- **Parameters**:
  - `limit` (number, optional): Maximum results (1-50, default: 10)

### refresh_data
- **Description**: Manually refresh data from GitHub
- **Parameters**:
  - `type` (enum): Data type to refresh ('rust_packages', 'slint_components', 'rust_news', 'slint_news', 'all')

### get_data_status
- **Description**: Get cache status and data freshness information
- **Parameters**: None

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/RKTakami/mcp-rust-slint-server).

## Changelog

### v0.1.0
- Initial release
- Six MCP tools for Rust and Slint development
- GitHub API integration
- SQLite database with auto-refresh
- Roo Code and VSCode integration