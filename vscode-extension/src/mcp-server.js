#!/usr/bin/env node

/**
 * MCP Server for Roblox Directory Tree
 * This connects Claude Desktop directly to your VS Code extension
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import http from "http";

const SERVER_URL = process.env.DIRECTORY_TREE_SERVER || "http://localhost:21326";

// Fetch from the VS Code extension's built-in server
async function fetchTree() {
  return new Promise((resolve, reject) => {
    http.get(`${SERVER_URL}/tree`, { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid response from server"));
        }
      });
    }).on("error", (err) => {
      reject(new Error(`Server not running. Start it in VS Code first! (${err.message})`));
    });
  });
}

async function fetchStatus() {
  return new Promise((resolve, reject) => {
    http.get(`${SERVER_URL}/status`, { timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid response"));
        }
      });
    }).on("error", (err) => {
      reject(new Error(`Cannot connect: ${err.message}`));
    });
  });
}

// Format tree as text
function treeToText(tree) {
  let result = `=====================================\n`;
  result += `  ROBLOX PROJECT STRUCTURE\n`;
  result += `  Game: ${tree.name || "Unknown"}\n`;
  result += `=====================================\n\n`;

  if (tree.containers && tree.containers.length > 0) {
    tree.containers.forEach((container, i) => {
      result += nodeToText(container, "", i === tree.containers.length - 1);
      result += "\n";
    });
  } else {
    result += "(No data - connect Roblox Studio first)\n";
  }

  return result;
}

function nodeToText(node, prefix = "", isLast = true) {
  const connector = prefix ? (isLast ? "└── " : "├── ") : "";
  const childPrefix = prefix + (isLast ? "    " : "│   ");

  let line = prefix + connector + node.name + ` [${node.className}]`;
  if (node.lineCount) line += ` (${node.lineCount} lines)`;
  if (node.childCount) line += ` (${node.childCount} children)`;

  let result = line + "\n";

  if (node.children && node.children.length > 0) {
    node.children.forEach((child, i) => {
      result += nodeToText(child, childPrefix, i === node.children.length - 1);
    });
  }

  return result;
}

// Search in tree
function searchTree(tree, query) {
  const results = [];
  const q = query.toLowerCase();

  function search(node, path = "") {
    const fullPath = path ? `${path}.${node.name}` : node.name;
    
    if (node.name.toLowerCase().includes(q) || fullPath.toLowerCase().includes(q)) {
      results.push({
        name: node.name,
        path: fullPath,
        className: node.className,
        lineCount: node.lineCount,
      });
    }

    if (node.children) {
      node.children.forEach((child) => search(child, fullPath));
    }
  }

  if (tree.containers) {
    tree.containers.forEach((c) => search(c));
  }

  return results;
}

// Create MCP Server
const server = new Server(
  { name: "roblox-directory-tree", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_roblox_project_structure",
      description: "Get the complete directory tree of the Roblox Studio project. Shows all scripts, modules, folders with their types and line counts.",
      inputSchema: {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["text", "json"],
            description: "Output format (default: text)"
          }
        }
      }
    },
    {
      name: "search_roblox_project",
      description: "Search for scripts, modules, or folders by name in the Roblox project",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Name or partial path to search for"
          }
        },
        required: ["query"]
      }
    },
    {
      name: "check_roblox_connection",
      description: "Check if Roblox Studio is connected and the server is running",
      inputSchema: { type: "object", properties: {} }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_roblox_project_structure": {
        const tree = await fetchTree();
        const format = args?.format || "text";
        
        return {
          content: [{
            type: "text",
            text: format === "json" ? JSON.stringify(tree, null, 2) : treeToText(tree)
          }]
        };
      }

      case "search_roblox_project": {
        const tree = await fetchTree();
        const results = searchTree(tree, args.query);
        
        if (results.length === 0) {
          return { content: [{ type: "text", text: `No results for "${args.query}"` }] };
        }

        let text = `Found ${results.length} result(s) for "${args.query}":\n\n`;
        results.forEach((r, i) => {
          text += `${i + 1}. ${r.name} [${r.className}]\n   Path: ${r.path}\n`;
          if (r.lineCount) text += `   Lines: ${r.lineCount}\n`;
          text += "\n";
        });

        return { content: [{ type: "text", text }] };
      }

      case "check_roblox_connection": {
        try {
          const status = await fetchStatus();
          const tree = await fetchTree();
          
          return {
            content: [{
              type: "text",
              text: `✅ Server running\n` +
                    `Game: ${tree.name || "Unknown"}\n` +
                    `Studio connected: ${status.connected ? "Yes" : "No"}\n` +
                    `Containers: ${tree.containers?.length || 0}`
            }]
          };
        } catch (e) {
          return {
            content: [{
              type: "text",
              text: `❌ Not connected\n\nMake sure:\n1. VS Code is open\n2. Click ▶ Start Server in Roblox Directory sidebar\n3. Connect from Roblox Studio plugin`
            }]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// Start
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
