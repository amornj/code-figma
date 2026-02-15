# Quick Setup Guide

## 1. Install & Build

```bash
cd mcp-server
npm install
npm run build
```

## 2. Create .env

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Use the same email/password from web UI
- Get Supabase URL and key from main `.env` file

## 3. Configure Claude Desktop

Edit config file (create if doesn't exist):

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "code-figma": {
      "command": "node",
      "args": ["/Users/home/projects/code-figma/mcp-server/dist/index.js"],
      "env": {
        "API_URL": "http://localhost:3000",
        "SUPABASE_URL": "https://dhclrzavrjqxsdedvasn.supabase.co",
        "SUPABASE_ANON_KEY": "sb_publishable_EMf_ItHLF5xYS49dCnDLTw_I9WmdHpH",
        "USER_EMAIL": "your_email@example.com",
        "USER_PASSWORD": "your_password"
      }
    }
  }
}
```

**Important:** Replace the path and credentials!

## 4. Start code-figma

```bash
# In code-figma root
npm run dev
```

## 5. Restart Claude Desktop

Close and reopen Claude Desktop.

## 6. Test It!

In Claude Desktop:

```
You: "List all my projects"
```

If you see your projects, it's working! 🎉

## Troubleshooting

**Not working?**

1. Check absolute path in config is correct
2. Verify code-figma app is running (both ports 3000 and 5173)
3. Test credentials work in web UI
4. Restart Claude Desktop
5. Check Claude Desktop logs (Help → Show Logs)

**Still stuck?**

Read the full [README.md](./README.md) for detailed troubleshooting.
