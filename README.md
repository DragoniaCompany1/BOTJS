## 📄 **README.md:**

# 🤖 Discord Bot for SAMP Server v1.0
**Created by: Axel (Drgxel), Ozi (Mozi)**

Bot Discord sederhana untuk SAMP Roleplay Server dengan fitur monitoring dan utility.

---

## ✨ Features v1.0

### 📋 **1. Help Menu**
Interactive help menu dengan kategori dan search function.
- `!help` - Show help menu
- `!help [command]` - Detail command tertentu

### 🎮 **2. Menu Panel**
Panel pendaftaran UCP dengan tombol interaktif.
- `!menupanel` - Tampilkan panel pendaftaran (Admin only)

### 🔨 **3. Ban Logs Monitor**
Real-time monitoring banned players dari database SAMP.
- `!monitorban #channel` - Setup ban log channel (Admin only)
- `!disablebanlog` - Disable ban monitor (Admin only)
- `!banlogs [limit]` - Lihat recent bans
- `!checkban [player]` - Check apakah player banned

### 🏓 **4. Ping**
Check bot latency dan status.
- `!ping` - Show bot ping

---

## 📦 Installation

### Requirements
- Node.js v16 or higher
- MySQL Database (SAMP Server Database)
- Discord Bot Token

### 1. Install Dependencies
```bash
npm install
```

Required packages will be installed automatically.

### 2. Setup Configuration

#### **A. Edit `.env` file:**
Copy `.env.example` to `.env` and fill in your details:

```env
# Server Information
NAMA_SERVER=Your_Server_Name
TANDA_PAGAR=#YourTag
MOTO_SERVER=Your Server Motto
TEKS_BUATDM=✉ Admin Team

# Bot Configuration
PREFIX_BOT=!
TOKEN_BOT=your_discord_bot_token_here

# Discord IDs
OWNER_ID=your_discord_user_id
OWNER_ROLE=your_owner_role_id
GUILD_ID=your_server_id
ROLE_ADMIN=your_admin_role_id
ROLE_WARGA=your_member_role_id

# Server Icons
ICON_URL=your_server_icon_url
ICON_URL1=your_server_icon_url_2

# SAMP Server
SERVER_IP=your_samp_server_ip
SERVER_PORT=7777
```

**How to get Discord IDs:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right click on user/role/server → Copy ID

#### **B. Edit `config.json` file:**
Copy `config.json.example` to `config.json`:

```json
{
    "mysql": {
        "connectionLimit": 3,
        "host": "your_mysql_host",
        "user": "your_mysql_username",
        "password": "your_mysql_password",
        "database": "your_database_name"
    }
}
```

---

## 🔧 Database Setup for Ban Logs

### Important: Configure Your Ban Table

The ban monitoring system needs to know which table stores banned players in YOUR database.

#### **Default Configuration**
By default, the bot looks for a table named `player_bans` with these columns:
- `id` - Ban ID
- `name` - Player name
- `ip` - IP Address
- `ban_expire` - Expiration timestamp
- `ban_date` - Ban date timestamp
- `admin` - Admin who banned
- `reason` - Ban reason

#### **If Your Table Name is Different:**

1. Open `Events/banMonitor.js`
2. Find line ~40: `SELECT * FROM player_bans WHERE id > ?`
3. Replace `player_bans` with YOUR table name
4. Example: `SELECT * FROM banned_players WHERE id > ?`

#### **If Your Column Names are Different:**

You need to modify the queries in these files:
- `Events/banMonitor.js` (line ~40, ~70)
- `Commands/Admin/banlogs.js` (line ~35)
- `Commands/Admin/checkban.js` (line ~30)

**Example modification:**
```javascript
// Original
SELECT * FROM player_bans WHERE name = ?

// If your columns are different
SELECT * FROM your_table WHERE player_name = ?
```

**Common Column Name Variations:**
```
name → player_name, username, char_name
admin → banned_by, admin_name
reason → ban_reason, ban_desc
ban_date → banned_date, timestamp, created_at
ban_expire → expire_date, unban_date
```

#### **Sample Table Structures:**

<details>
<summary>Click to see example table structures</summary>

**Structure 1 (Default - player_bans):**
```sql
CREATE TABLE player_bans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(24),
    ip VARCHAR(24),
    ban_expire BIGINT,
    ban_date BIGINT,
    admin VARCHAR(40),
    reason VARCHAR(128)
);
```

**Structure 2 (Alternative - banned_players):**
```sql
CREATE TABLE banned_players (
    ban_id INT PRIMARY KEY AUTO_INCREMENT,
    player_name VARCHAR(24),
    ip_address VARCHAR(24),
    expire_date BIGINT,
    banned_date BIGINT,
    banned_by VARCHAR(40),
    ban_reason TEXT
);
```

**Structure 3 (UCP-Based):**
```sql
CREATE TABLE ucp_bans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(24),
    ip VARCHAR(16),
    unban_time INT,
    ban_time INT,
    admin_name VARCHAR(24),
    ban_desc VARCHAR(255)
);
```

</details>

---

## 🚀 Running the Bot

### Start Bot
```bash
npm start
```

or

```bash
node bot-dc.js
```

### Keep Bot Running (Production)

Using PM2 (Recommended):
```bash
npm install -g pm2
pm2 start bot-dc.js --name "samp-bot"
pm2 save
pm2 startup
```

Using Screen (Linux):
```bash
screen -S samp-bot
node bot-dc.js
# Press Ctrl+A, then D to detach
```

---

## 📖 Usage Guide

### Setup Ban Monitoring

1. Create a channel for ban logs (e.g., `#ban-logs`)
2. Run command: `!monitorban #ban-logs`
3. Bot will automatically monitor and send ban notifications every 30 seconds

### Example Commands

```
!help
Shows interactive help menu with all commands

!menupanel
Admin command to show registration panel with buttons

!monitorban #ban-logs
Setup ban monitoring in #ban-logs channel

!banlogs 10
Show last 10 banned players

!checkban John_Doe
Check if John_Doe is banned

!ping
Check bot latency
```

---

## 📂 Project Structure

```
Bot/
├── bot-dc.js (Protected - Main file)
├── Core/
│   └── index.js (Protected - Command loader)
├── Mysql.js (Protected - Database connection)
├── Events/
│   ├── messageCreate.js (Protected - Command handler)
│   ├── interactionCreate.js (Protected - Button/Modal handler)
│   ├── ready.js (Protected - Startup)
│   └── banMonitor.js (Protected - Ban monitoring system)
├── Commands/
│   ├── Admin/
│   │   ├── monitorban.js (Setup ban monitoring)
│   │   ├── disablebanlog.js (Disable ban monitoring)
│   │   ├── banlogs.js (View ban history)
│   │   └── checkban.js (Check banned player)
│   ├── menupanel.js (Registration panel)
│   └── Utility/
│       ├── help.js (Help menu)
│       └── ping.js (Bot ping)
├── Tombol/
│   ├── tombol-pendaftaran.js (Registration button)
│   ├── tombol-kirimulang.js (Resend button)
│   ├── tombol-reset.js (Reset button)
│   └── tombol-takerole.js (Take role button)
├── Modals/
│   └── tampilan-pendaftaran.js (Registration modal)
├── .env (Your configuration)
├── config.json (Database configuration)
├── package.json (Dependencies)
└── README.md (This file)
```

---

## 🔒 Protected Files

### ⚠️ DO NOT EDIT These Files:
- ❌ `bot-dc.js`
- ❌ `Core/index.js`
- ❌ `Mysql.js`
- ❌ `Events/*.js`

**Reason:** These files are obfuscated and contain core bot logic. Editing them will break the bot.

### ✅ You CAN Edit:
- ✅ `.env` (You MUST configure this)
- ✅ `config.json` (You MUST configure this)
- ✅ Files in `Commands/` folder (if you want to customize)
- ✅ Files in `Tombol/` folder (button handlers)
- ✅ Files in `Modals/` folder (modal handlers)

---

## 🐛 Troubleshooting

### Bot Won't Start

**Error: "Invalid token"**
- Check `TOKEN_BOT` in `.env` file
- Make sure token is correct from Discord Developer Portal
- Token should look like: `MTAwNz...xYz.GxYz...`

**Error: "Cannot connect to database"**
- Check `config.json` credentials
- Verify MySQL server is running
- Test connection with MySQL client

**Error: "Missing permissions"**
- Check bot has proper permissions in Discord server
- Recommended permissions: Administrator or these specific permissions:
  - Send Messages
  - Embed Links
  - Attach Files
  - Read Message History
  - Add Reactions
  - Manage Messages

### Ban Monitor Not Working

**No ban logs appearing:**
1. Check `Events/banMonitor.js` table name matches YOUR database table
2. Verify database connection is working
3. Check if channel still exists
4. Run `!disablebanlog` then `!monitorban #channel` again

**Getting database errors:**
1. Verify table name is correct
2. Verify column names match your database
3. Check MySQL user has SELECT permission on ban table

### Commands Not Responding

**Bot online but not responding:**
- Check `PREFIX_BOT` in `.env` (default is `!`)
- Make sure you're using correct prefix
- Check bot has "Read Messages" permission

**Getting "Missing permissions" error:**
- Check role IDs in `.env` are correct
- For admin commands, check `ROLE_ADMIN` ID
- Right-click role → Copy ID (Developer Mode must be enabled)

---

## 📊 Bot Permissions Setup

### Required Bot Permissions:
- ✅ View Channels
- ✅ Send Messages
- ✅ Embed Links
- ✅ Attach Files
- ✅ Read Message History
- ✅ Add Reactions
- ✅ Use External Emojis
- ✅ Manage Messages (for button interactions)

### Recommended Role Hierarchy:
```
Bot Role (at top)
  ↓
Owner Role
  ↓
Admin Role
  ↓
Member Role
```

---

## 🔄 Updating the Bot

### When new version is released:

1. Backup your `.env` and `config.json`
2. Download new version
3. Replace all files EXCEPT `.env` and `config.json`
4. Run `npm install` to update dependencies
5. Restart bot

---

## 📝 Changelog

### v1.0 (Initial Release)
- ✅ Interactive help menu
- ✅ Menu panel with buttons
- ✅ Ban logs monitoring system
- ✅ Ping command
- ✅ Auto-detect commands
- ✅ MySQL database integration

---

## 🤝 Contributing

This is v1.0 release. More features coming soon!

**Planned Features:**
- Server monitoring (online players, status)
- Admin management system
- Player statistics
- Database backup system
- And more...

---

## 📞 Support

### Need Help?

**Common Issues:**
- Check troubleshooting section above
- Make sure all configurations are correct
- Verify bot permissions in Discord

**Report Bugs:**
- Open an issue with detailed description
- Include error messages
- Include bot version (v1.0)

**Feature Requests:**
- Suggestions are welcome!
- Open an issue with [Feature Request] tag

---

## ⚖️ License & Terms

### MIT License

Permission is hereby granted, free of charge, to use this software.

### Terms of Use:

✅ **You CAN:**
- Use this bot for your server
- Modify commands for your needs
- Share with others (with credits)

❌ **You CANNOT:**
- Remove or modify credits
- Claim this as your own work
- Sell this bot or any modified version

### Credits Must Remain:

Credits "**Created by: Axel (Drgxel), Ozi (Mozi)**" must stay in:
- Bot startup message
- Help menu footer
- All embed footers
- This README file

**Respect the developers. Keep the credits intact! ❤️**

---

## 💖 Credits

**Main Developers:**
- **Axel (Drgxel)** - Lead Developer
- **Ozi (Mozi)** - Co-Developer

**Special Thanks:**
- Discord.js Community
- SAMP Community
- All users and testers

---

## 🌟 Star This Project!

If you find this bot useful, please give it a star ⭐

---

**Made with ❤️ by Axel (Drgxel) & Ozi (Mozi)**

Discord Bot for SAMP Server v1.0
```

---

## 📄 **File `.env.example`:**

```env
# ========================================
# Discord Bot Configuration
# Created by: Axel (Drgxel), Ozi (Mozi)
# ========================================

# Server Information
NAMA_SERVER=Your_Server_Name
TANDA_PAGAR=#YourTag
MOTO_SERVER=Your Server Motto
TEKS_BUATDM=✉ Admin Team

# Bot Configuration
PREFIX_BOT=!
TOKEN_BOT=your_discord_bot_token_here

# Discord IDs (Enable Developer Mode to copy IDs)
OWNER_ID=your_discord_user_id
OWNER_ROLE=your_owner_role_id
GUILD_ID=your_server_id
ROLE_ADMIN=your_admin_role_id
ROLE_WARGA=your_member_role_id

# Server Icons
ICON_URL=https://your-server-icon-url.com/icon.png
ICON_URL1=https://your-server-icon-url.com/icon2.png

# SAMP Server Information
SERVER_IP=your.samp.server.ip
SERVER_PORT=7777

# Webhook (Optional - for error logging)
WEBHOOK_ID=
WEBHOOK_TOKEN=
```

---

## 📄 **File `config.json.example`:**

```json
{
    "mysql": {
        "connectionLimit": 3,
        "host": "localhost",
        "user": "your_mysql_username",
        "password": "your_mysql_password",
        "database": "your_database_name"
    }
}
```
