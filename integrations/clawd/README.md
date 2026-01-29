# Claude Recall for MoltBot

Long-term memory extension for [MoltBot](https://github.com/moltbot/moltbot) that learns and recalls your context automatically.

## Installation

### Option 1: As MoltBot Extension

Add to your MoltBot `extensions/` folder:

```bash
cd your-clawd-installation/extensions
git clone https://github.com/nhevers/claude-recall.git claude-recall
cd claude-recall/integrations/clawd
npm install && npm run build
```

Then add to your MoltBot config:

```json
{
  "extensions": {
    "claude-recall": {
      "enabled": true,
      "dataDir": ".claude-recall",
      "autoCapture": true
    }
  }
}
```

### Option 2: As MoltBot Skill

Copy `skill.json` to your MoltBot skills directory:

```bash
cp integrations/clawd/skill.json ~/.moltbot/skills/claude-recall.json
```

Configure in your MoltBot config:

```json
{
  "skills": {
    "claude-recall": {
      "maxMemories": 10,
      "channels": ["discord", "slack", "imessage"]
    }
  }
}
```

### Option 3: Via MCP Server

Start the MCP server:

```bash
npm run mcp:start
```

Add to your MoltBot MCP config:

```json
{
  "mcp": {
    "servers": {
      "claude-recall": {
        "command": "node",
        "args": ["path/to/claude-recall/src/mcp/server.js", "--stdio"]
      }
    }
  }
}
```

## Features

### Automatic Memory Capture

The extension hooks into MoltBot's agent loop to automatically capture:

- **Preferences**: User-stated preferences and likes/dislikes
- **Decisions**: Important decisions made during conversations
- **Learnings**: Technical insights and discoveries
- **Context**: Project-specific information

### Context Injection

Before each response, relevant memories are automatically injected into the context, giving MoltBot awareness of past interactions.

### Multi-Channel Support

Works across all MoltBot channels:
- Discord
- Slack
- iMessage
- Microsoft Teams
- Signal
- WebChat

## Available Tools

When installed as a skill, these tools become available:

### `recall_context`

Retrieve relevant memories based on current context.

```
recall_context("working on the authentication module")
```

### `search_memories`

Search through stored memories.

```
search_memories("database schema", limit=10, types=["decision", "learning"])
```

### `save_memory`

Manually save important information.

```
save_memory("Always use prepared statements for SQL queries", type="preference")
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dataDir` | string | `.claude-recall` | Storage directory |
| `maxMemories` | number | `10` | Max memories per context |
| `autoCapture` | boolean | `true` | Auto-capture observations |
| `channels` | array | `[]` | Enabled channels (empty = all) |

## API

### Hooks

The extension implements these MoltBot lifecycle hooks:

- `onSessionStart`: Initialize session memory
- `onMessage`: Inject relevant context
- `onResponse`: Extract and save observations
- `onSessionEnd`: Generate session summary

### MCP Methods

When using MCP, these methods are available:

- `memory/search`: Search memories
- `memory/recall`: Get context-relevant memories
- `memory/save`: Store new memory
- `memory/timeline`: Get recent activity

## License

MIT
