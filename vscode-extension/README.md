# Roblox Directory Tree MCP Server

This MCP (Model Context Protocol) server allows Claude to directly fetch your Roblox project structure.

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Claude Desktop

Add this to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "roblox-directory-tree": {
      "command": "node",
      "args": ["C:/FULL/PATH/TO/mcp-server/index.js"],
      "env": {
        "DIRECTORY_TREE_SERVER": "http://localhost:21326"
      }
    }
  }
}
```

⚠️ **Replace `C:/FULL/PATH/TO/mcp-server/index.js` with the actual full path to the index.js file!**

### 3. Restart Claude Desktop

Close and reopen Claude Desktop for the changes to take effect.

## Available Tools

Once configured, Claude can use these tools:

| Tool | Description |
|------|-------------|
| `get_roblox_directory_tree` | Get the complete project tree |
| `search_roblox_project` | Search for files/scripts by name |
| `get_roblox_connection_status` | Check if Studio is connected |

## Usage

Just ask Claude things like:

- "What's my Roblox project structure?"
- "Search for DataService in my project"
- "Is Roblox Studio connected?"
- "Show me all the modules in ReplicatedStorage"

Claude will automatically fetch the info from your VS Code extension!

## Requirements

1. VS Code extension must be running
2. Server must be started (click ▶ in VS Code)
3. Roblox Studio plugin must be connected

## Troubleshooting

**"Cannot connect to directory tree server"**
- Make sure VS Code is open with the extension
- Click ▶ Start Server in the Roblox Directory sidebar
- Check that port 21326 is not blocked

**Claude doesn't see the MCP server**
- Double-check the path in `claude_desktop_config.json`
- Make sure you restarted Claude Desktop
- Check the path uses forward slashes or escaped backslashes
