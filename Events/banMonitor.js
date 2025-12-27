const client = require("../bot-dc");
const { MessageEmbed } = require("discord.js");
const mysql = require("mysql2/promise");
const dbConfig = require("../config.json");
const fs = require("fs");
const path = require("path");

let lastCheckedId = 0;
let isMonitoring = false;

async function checkBannedPlayers() {
    if (isMonitoring) return;
    isMonitoring = true;

    try {
        const configPath = path.join(process.cwd(), 'config', 'banlog.json');
        
        if (!fs.existsSync(configPath)) {
            isMonitoring = false;
            return;
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (!config.enabled || !config.channelId) {
            isMonitoring = false;
            return;
        }

        const channel = await client.channels.fetch(config.channelId).catch(() => null);
        
        if (!channel) {
            console.error("❌ Ban log channel tidak ditemukan");
            isMonitoring = false;
            return;
        }

        const connection = await mysql.createConnection({
            host: dbConfig.mysql.host,
            user: dbConfig.mysql.user,
            password: dbConfig.mysql.password,
            database: dbConfig.mysql.database,
            port: 3306
        });

        const [rows] = await connection.query(
            `SELECT * FROM player_bans WHERE id > ? ORDER BY id ASC`,
            [lastCheckedId]
        );

        if (rows.length > 0) {
            for (const ban of rows) {
                await sendBanLog(channel, ban);
                lastCheckedId = ban.id;
            }
        }

        await connection.end();

    } catch (error) {
        console.error("❌ Error checking banned players:", error);
    } finally {
        isMonitoring = false;
    }
}

async function sendBanLog(channel, ban) {
    try {
        const banDate = new Date(parseInt(ban.ban_date) * 1000);
        const expireDate = ban.ban_expire > 0 ? new Date(parseInt(ban.ban_expire) * 1000) : null;
        const isPermanent = ban.ban_expire === 0 || ban.ban_expire === -1;

        let durationText = "Permanent";
        if (!isPermanent && expireDate) {
            const duration = Math.floor((expireDate - banDate) / 1000);
            durationText = formatDuration(duration);
        }

        const embed = new MessageEmbed()
            .setColor(isPermanent ? "#FF0000" : "#FFA500")
            .setTitle("🔨 Player Banned")
            .setDescription(`**${ban.name}** telah di-ban dari server!`)
            .addField("👤 Player Name", ban.name, true)
            .addField("🆔 Ban ID", `#${ban.id}`, true)
            .addField("🌐 IP Address", ban.ip || "N/A", true)
            .addField("👮 Banned By", ban.admin || "Server", true)
            .addField("⏱️ Duration", durationText, true)
            .addField("📅 Ban Date", `<t:${Math.floor(banDate.getTime() / 1000)}:F>`, true)
            .addField("📝 Reason", ban.reason || "No reason provided", false)
            .setFooter({ text: `Ban ID: ${ban.id} • Created by: Axel (Drgxel), Ozi (Mozi)` })
            .setTimestamp();

        if (!isPermanent && expireDate) {
            embed.addField("⏰ Expires At", `<t:${Math.floor(expireDate.getTime() / 1000)}:F>`, false);
            embed.addField("⌛ Time Until Unban", `<t:${Math.floor(expireDate.getTime() / 1000)}:R>`, false);
        }

        await channel.send({ embeds: [embed] });

        console.log(`📋 Ban log sent: ${ban.name} (ID: ${ban.id}) banned by ${ban.admin}`);

    } catch (error) {
        console.error("❌ Error sending ban log:", error);
    }
}

function formatDuration(seconds) {
    if (seconds <= 0) return "Permanent";

    const units = [
        { name: "tahun", value: 31536000 },
        { name: "bulan", value: 2592000 },
        { name: "minggu", value: 604800 },
        { name: "hari", value: 86400 },
        { name: "jam", value: 3600 },
        { name: "menit", value: 60 },
        { name: "detik", value: 1 }
    ];

    let result = [];
    let remaining = seconds;

    for (const unit of units) {
        const count = Math.floor(remaining / unit.value);
        if (count > 0) {
            result.push(`${count} ${unit.name}`);
            remaining -= count * unit.value;
        }
        if (result.length >= 2) break;
    }

    return result.join(", ");
}

async function initializeBanMonitor() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.mysql.host,
            user: dbConfig.mysql.user,
            password: dbConfig.mysql.password,
            database: dbConfig.mysql.database,
            port: 3306
        });

        const [rows] = await connection.query(
            `SELECT MAX(id) as max_id FROM player_bans`
        );

        if (rows[0] && rows[0].max_id) {
            lastCheckedId = rows[0].max_id;
            console.log(`✅ Ban monitor initialized. Last ban ID: ${lastCheckedId}`);
        }

        await connection.end();

    } catch (error) {
        console.error("❌ Error initializing ban monitor:", error);
    }
}

client.once("ready", async () => {
    console.log("🔨 Ban monitor system loading...");
    
    await initializeBanMonitor();
    
    setInterval(checkBannedPlayers, 30000);
    
    console.log("✅ Ban monitor system active (check every 30 seconds)");
});