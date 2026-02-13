# Roblox Live Directory Tree

A VS Code extension that gives you a live view of your Roblox project structure, synced directly from Roblox Studio. Includes built-in Claude Desktop integration via MCP.

## Setup

### 1. Install the VS Code Extension

Install the `.vsix` file from the [Releases](https://github.com/AustinBarikdar/Live-Directory-Tree-Rojo-Plugin/releases) page, or search for **Roblox Live Directory Tree** in the VS Code marketplace.

No extra install steps required — everything is bundled with the extension.

### 2. Install the Roblox Studio Plugin

Install the companion plugin in Roblox Studio so it can send your project structure to VS Code.

### 3. Start the Server

Open the **Roblox Directory** panel in the VS Code sidebar and click the **▶ Start Server** button.

### 4. (Optional) Claude Desktop Integration

Click the **✨ Setup Claude Desktop Integration** button in the Roblox Directory panel title bar. This automatically configures Claude Desktop's MCP config — no manual editing needed.

Restart Claude Desktop after setup.

## Features

- **Live tree view** of your Roblox project structure in VS Code
- **Copy tree** to clipboard for pasting into AI assistants
- **Copy path** of any item (right-click)
- **Status bar** showing connection state
- **Auto-refresh** on incoming data from Studio
- **Claude Desktop MCP** integration (one-click setup)

## MCP Tools (Claude Desktop)

Once configured, Claude can use these tools:

| Tool | Description |
|------|-------------|
| `get_roblox_project_structure` | Get the complete project tree (text or JSON) |
| `search_roblox_project` | Search for scripts/modules/folders by name |
| `check_roblox_connection` | Check if Studio is connected and server is running |

**Example prompts:**

- "What's my Roblox project structure?"
- "Search for DataService in my project"
- "Is Roblox Studio connected?"
- "Show me all the modules in ReplicatedStorage"

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `robloxDirectoryTree.serverPort` | `21326` | Port for the built-in server |
| `robloxDirectoryTree.autoRefresh` | `true` | Automatically refresh the tree |
| `robloxDirectoryTree.refreshInterval` | `3000` | Auto-refresh interval (ms) |
| `robloxDirectoryTree.autoStartServer` | `false` | Start the server automatically on VS Code launch |

## Troubleshooting

**"Cannot connect to directory tree server"**
- Make sure VS Code is open with the extension
- Click ▶ Start Server in the Roblox Directory sidebar
- Check that port 21326 is not blocked

**Tree shows "Waiting for Roblox Studio..."**
- Make sure the Roblox Studio plugin is installed and running
- Ensure Studio and VS Code are on the same machine

**Claude doesn't see the MCP server**
- Click the ✨ button to re-run MCP setup
- Make sure you restarted Claude Desktop after setup
