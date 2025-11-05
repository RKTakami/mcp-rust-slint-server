"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var zod_1 = require("zod");
var axios_1 = require("axios");
var better_sqlite3_1 = require("better-sqlite3");
var path_1 = require("path");
var fs_1 = require("fs");
// Database setup
var DATA_DIR = (0, path_1.join)(process.cwd(), 'data');
if (!(0, fs_1.existsSync)(DATA_DIR)) {
    (0, fs_1.mkdirSync)(DATA_DIR, { recursive: true });
}
var db = new better_sqlite3_1.default((0, path_1.join)(DATA_DIR, 'rust_slint_dev.db'));
// Initialize database schema
db.exec("\n  CREATE TABLE IF NOT EXISTS rust_packages (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT UNIQUE NOT NULL,\n    description TEXT,\n    version TEXT,\n    repository_url TEXT,\n    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,\n    is_current BOOLEAN DEFAULT 1\n  );\n\n  CREATE TABLE IF NOT EXISTS slint_components (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT UNIQUE NOT NULL,\n    description TEXT,\n    category TEXT,\n    repository_url TEXT,\n    documentation_url TEXT,\n    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,\n    is_current BOOLEAN DEFAULT 1\n  );\n\n  CREATE TABLE IF NOT EXISTS rust_news (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    title TEXT NOT NULL,\n    summary TEXT,\n    url TEXT UNIQUE NOT NULL,\n    source TEXT,\n    published_at DATETIME,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    is_current BOOLEAN DEFAULT 1\n  );\n\n  CREATE TABLE IF NOT EXISTS slint_news (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    title TEXT NOT NULL,\n    summary TEXT,\n    url TEXT UNIQUE NOT NULL,\n    source TEXT,\n    published_at DATETIME,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    is_current BOOLEAN DEFAULT 1\n  );\n\n  CREATE TABLE IF NOT EXISTS data_cached_at (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    cache_type TEXT UNIQUE NOT NULL,\n    last_cached DATETIME DEFAULT CURRENT_TIMESTAMP,\n    is_valid BOOLEAN DEFAULT 1\n  );\n");
// Data freshness check on startup
function checkDataFreshness() {
    return __awaiter(this, void 0, void 0, function () {
        var cacheTypes, staleThreshold, now, _i, cacheTypes_1, cacheType, cacheRecord;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.error('Checking data freshness...');
                    cacheTypes = ['rust_packages', 'slint_components', 'rust_news', 'slint_news'];
                    staleThreshold = 24 * 60 * 60 * 1000;
                    now = Date.now();
                    _i = 0, cacheTypes_1 = cacheTypes;
                    _a.label = 1;
                case 1:
                    if (!(_i < cacheTypes_1.length)) return [3 /*break*/, 4];
                    cacheType = cacheTypes_1[_i];
                    cacheRecord = db.prepare('SELECT last_cached, is_valid FROM data_cached_at WHERE cache_type = ?').get(cacheType);
                    if (!(!cacheRecord || !cacheRecord.is_valid ||
                        (now - new Date(cacheRecord.last_cached).getTime()) > staleThreshold)) return [3 /*break*/, 3];
                    console.error("".concat(cacheType, " data is stale, refreshing..."));
                    return [4 /*yield*/, refreshData(cacheType)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Refresh data based on type
function refreshData(type) {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 14, , 15]);
                    data = void 0;
                    _a = type;
                    switch (_a) {
                        case 'rust_packages': return [3 /*break*/, 1];
                        case 'slint_components': return [3 /*break*/, 4];
                        case 'rust_news': return [3 /*break*/, 7];
                        case 'slint_news': return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 13];
                case 1: return [4 /*yield*/, fetchRustPackages()];
                case 2:
                    data = _b.sent();
                    return [4 /*yield*/, updateRustPackages(data)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 4: return [4 /*yield*/, fetchSlintComponents()];
                case 5:
                    data = _b.sent();
                    return [4 /*yield*/, updateSlintComponents(data)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 7: return [4 /*yield*/, fetchRustNews()];
                case 8:
                    data = _b.sent();
                    return [4 /*yield*/, updateRustNews(data)];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 10: return [4 /*yield*/, fetchSlintNews()];
                case 11:
                    data = _b.sent();
                    return [4 /*yield*/, updateSlintNews(data)];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 13:
                    // Update cache timestamp
                    db.prepare("\n      INSERT OR REPLACE INTO data_cached_at (cache_type, last_cached, is_valid)\n      VALUES (?, CURRENT_TIMESTAMP, 1)\n    ").run(type);
                    console.error("".concat(type, " data refreshed successfully"));
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _b.sent();
                    console.error("Error refreshing ".concat(type, ":"), error_1);
                    // Mark as invalid so it will be retried next time
                    db.prepare("\n      INSERT OR REPLACE INTO data_cached_at (cache_type, last_cached, is_valid)\n      VALUES (?, CURRENT_TIMESTAMP, 0)\n    ").run(type);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// GitHub API functions for data gathering
function fetchRustPackages() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('https://api.github.com/search/repositories', {
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
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.items.map(function (repo) { return ({
                            name: repo.name,
                            description: repo.description,
                            version: 'latest',
                            repository_url: repo.html_url,
                            last_updated: repo.updated_at
                        }); })];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching Rust packages:', error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchSlintComponents() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('https://api.github.com/search/repositories', {
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
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.items.map(function (repo) { return ({
                            name: repo.name,
                            description: repo.description,
                            category: 'component',
                            repository_url: repo.html_url,
                            documentation_url: "".concat(repo.html_url, "/blob/main/README.md"),
                            last_updated: repo.updated_at
                        }); })];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error fetching Slint components:', error_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchRustNews() {
    return __awaiter(this, void 0, void 0, function () {
        var rustLangResponse, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('https://api.github.com/repos/rust-lang/rust/releases', {
                            headers: {
                                'Accept': 'application/vnd.github.v3+json',
                                'User-Agent': 'rust-slint-dev-mcp'
                            }
                        })];
                case 1:
                    rustLangResponse = _a.sent();
                    return [2 /*return*/, rustLangResponse.data.slice(0, 10).map(function (release) {
                            var _a;
                            return ({
                                title: release.name || release.tag_name,
                                summary: ((_a = release.body) === null || _a === void 0 ? void 0 : _a.substring(0, 200)) + '...' || '',
                                url: release.html_url,
                                source: 'Rust Lang',
                                published_at: release.published_at
                            });
                        })];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error fetching Rust news:', error_4);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchSlintNews() {
    return __awaiter(this, void 0, void 0, function () {
        var slintResponse, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get('https://api.github.com/repos/slint-ui/slint/releases', {
                            headers: {
                                'Accept': 'application/vnd.github.v3+json',
                                'User-Agent': 'rust-slint-dev-mcp'
                            }
                        })];
                case 1:
                    slintResponse = _a.sent();
                    return [2 /*return*/, slintResponse.data.slice(0, 10).map(function (release) {
                            var _a;
                            return ({
                                title: release.name || release.tag_name,
                                summary: ((_a = release.body) === null || _a === void 0 ? void 0 : _a.substring(0, 200)) + '...' || '',
                                url: release.html_url,
                                source: 'Slint UI',
                                published_at: release.published_at
                            });
                        })];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error fetching Slint news:', error_5);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Database update functions
function updateRustPackages(packages) {
    return __awaiter(this, void 0, void 0, function () {
        var stmt, _i, packages_1, pkg;
        return __generator(this, function (_a) {
            stmt = db.prepare("\n    INSERT OR REPLACE INTO rust_packages \n    (name, description, version, repository_url, last_updated, is_current)\n    VALUES (?, ?, ?, ?, ?, 1)\n  ");
            for (_i = 0, packages_1 = packages; _i < packages_1.length; _i++) {
                pkg = packages_1[_i];
                stmt.run(pkg.name, pkg.description, pkg.version, pkg.repository_url, pkg.last_updated);
            }
            return [2 /*return*/];
        });
    });
}
function updateSlintComponents(components) {
    return __awaiter(this, void 0, void 0, function () {
        var stmt, _i, components_1, comp;
        return __generator(this, function (_a) {
            stmt = db.prepare("\n    INSERT OR REPLACE INTO slint_components \n    (name, description, category, repository_url, documentation_url, last_updated, is_current)\n    VALUES (?, ?, ?, ?, ?, ?, 1)\n  ");
            for (_i = 0, components_1 = components; _i < components_1.length; _i++) {
                comp = components_1[_i];
                stmt.run(comp.name, comp.description, comp.category, comp.repository_url, comp.documentation_url, comp.last_updated);
            }
            return [2 /*return*/];
        });
    });
}
function updateRustNews(news) {
    return __awaiter(this, void 0, void 0, function () {
        var stmt, _i, news_1, item;
        return __generator(this, function (_a) {
            stmt = db.prepare("\n    INSERT OR REPLACE INTO rust_news \n    (title, summary, url, source, published_at, is_current)\n    VALUES (?, ?, ?, ?, ?, 1)\n  ");
            for (_i = 0, news_1 = news; _i < news_1.length; _i++) {
                item = news_1[_i];
                stmt.run(item.title, item.summary, item.url, item.source, item.published_at);
            }
            return [2 /*return*/];
        });
    });
}
function updateSlintNews(news) {
    return __awaiter(this, void 0, void 0, function () {
        var stmt, _i, news_2, item;
        return __generator(this, function (_a) {
            stmt = db.prepare("\n    INSERT OR REPLACE INTO slint_news \n    (title, summary, url, source, published_at, is_current)\n    VALUES (?, ?, ?, ?, ?, 1)\n  ");
            for (_i = 0, news_2 = news; _i < news_2.length; _i++) {
                item = news_2[_i];
                stmt.run(item.title, item.summary, item.url, item.source, item.published_at);
            }
            return [2 /*return*/];
        });
    });
}
// Create an MCP server
var server = new mcp_js_1.McpServer({
    name: "rust-slint-dev-mcp",
    version: "0.1.0"
});
// Tools for querying Rust information
server.tool("search_rust_packages", {
    query: zod_1.z.string().describe("Search query for Rust packages"),
    limit: zod_1.z.number().min(1).max(100).optional().default(10).describe("Maximum number of results")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var stmt, results;
    var query = _b.query, limit = _b.limit;
    return __generator(this, function (_c) {
        try {
            stmt = db.prepare("\n        SELECT name, description, version, repository_url, last_updated\n        FROM rust_packages \n        WHERE name LIKE ? OR description LIKE ?\n        AND is_current = 1\n        ORDER BY last_updated DESC\n        LIMIT ?\n      ");
            results = stmt.all("%".concat(query, "%"), "%".concat(query, "%"), limit);
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                query: query,
                                results_count: results.length,
                                packages: results
                            }, null, 2),
                        },
                    ],
                }];
        }
        catch (error) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Error searching Rust packages: ".concat(error),
                        },
                    ],
                    isError: true,
                }];
        }
        return [2 /*return*/];
    });
}); });
server.tool("search_slint_components", {
    query: zod_1.z.string().describe("Search query for Slint components"),
    category: zod_1.z.string().optional().describe("Filter by component category"),
    limit: zod_1.z.number().min(1).max(100).optional().default(10).describe("Maximum number of results")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var stmt, params, results;
    var query = _b.query, category = _b.category, limit = _b.limit;
    return __generator(this, function (_c) {
        try {
            stmt = db.prepare("\n        SELECT name, description, category, repository_url, documentation_url, last_updated\n        FROM slint_components \n        WHERE (name LIKE ? OR description LIKE ?)\n        AND is_current = 1\n      ");
            params = ["%".concat(query, "%"), "%".concat(query, "%")];
            if (category) {
                stmt = db.prepare("\n          SELECT name, description, category, repository_url, documentation_url, last_updated\n          FROM slint_components \n          WHERE (name LIKE ? OR description LIKE ?)\n          AND category LIKE ?\n          AND is_current = 1\n        ");
                params.push("%".concat(category, "%"));
            }
            stmt = stmt.prepare(stmt.sql + ' ORDER BY last_updated DESC LIMIT ?');
            params.push(limit.toString());
            results = stmt.all.apply(stmt, params);
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                query: query,
                                category_filter: category,
                                results_count: results.length,
                                components: results
                            }, null, 2),
                        },
                    ],
                }];
        }
        catch (error) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Error searching Slint components: ".concat(error),
                        },
                    ],
                    isError: true,
                }];
        }
        return [2 /*return*/];
    });
}); });
server.tool("get_rust_news", {
    limit: zod_1.z.number().min(1).max(50).optional().default(10).describe("Maximum number of news items")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var stmt, results;
    var limit = _b.limit;
    return __generator(this, function (_c) {
        try {
            stmt = db.prepare("\n        SELECT title, summary, url, source, published_at\n        FROM rust_news \n        WHERE is_current = 1\n        ORDER BY published_at DESC\n        LIMIT ?\n      ");
            results = stmt.all(limit);
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                news_count: results.length,
                                news: results
                            }, null, 2),
                        },
                    ],
                }];
        }
        catch (error) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Error fetching Rust news: ".concat(error),
                        },
                    ],
                    isError: true,
                }];
        }
        return [2 /*return*/];
    });
}); });
server.tool("get_slint_news", {
    limit: zod_1.z.number().min(1).max(50).optional().default(10).describe("Maximum number of news items")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var stmt, results;
    var limit = _b.limit;
    return __generator(this, function (_c) {
        try {
            stmt = db.prepare("\n        SELECT title, summary, url, source, published_at\n        FROM slint_news \n        WHERE is_current = 1\n        ORDER BY published_at DESC\n        LIMIT ?\n      ");
            results = stmt.all(limit);
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                news_count: results.length,
                                news: results
                            }, null, 2),
                        },
                    ],
                }];
        }
        catch (error) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Error fetching Slint news: ".concat(error),
                        },
                    ],
                    isError: true,
                }];
        }
        return [2 /*return*/];
    });
}); });
server.tool("refresh_data", {
    type: zod_1.z.enum(['rust_packages', 'slint_components', 'rust_news', 'slint_news', 'all']).describe("Type of data to refresh")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var types, _i, types_1, t, error_6;
    var type = _b.type;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 8, , 9]);
                if (!(type === 'all')) return [3 /*break*/, 5];
                types = ['rust_packages', 'slint_components', 'rust_news', 'slint_news'];
                _i = 0, types_1 = types;
                _c.label = 1;
            case 1:
                if (!(_i < types_1.length)) return [3 /*break*/, 4];
                t = types_1[_i];
                return [4 /*yield*/, refreshData(t)];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, refreshData(type)];
            case 6:
                _c.sent();
                _c.label = 7;
            case 7: return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                message: "Successfully refreshed ".concat(type, " data"),
                                timestamp: new Date().toISOString()
                            }, null, 2),
                        },
                    ],
                }];
            case 8:
                error_6 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error refreshing data: ".concat(error_6),
                            },
                        ],
                        isError: true,
                    }];
            case 9: return [2 /*return*/];
        }
    });
}); });
server.tool("get_data_status", {}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var cacheRecords;
    return __generator(this, function (_a) {
        try {
            cacheRecords = db.prepare('SELECT cache_type, last_cached, is_valid FROM data_cached_at').all();
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                data_status: cacheRecords,
                                last_check: new Date().toISOString()
                            }, null, 2),
                        },
                    ],
                }];
        }
        catch (error) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Error getting data status: ".concat(error),
                        },
                    ],
                    isError: true,
                }];
        }
        return [2 /*return*/];
    });
}); });
// Initialize data freshness check and start server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, checkDataFreshness()];
                case 1:
                    _a.sent();
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 2:
                    _a.sent();
                    console.error('Rust/Slint Dev MCP server running on stdio');
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Failed to start server:', error_7);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
