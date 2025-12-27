const { MessageEmbed } = require("discord.js");
const mysql = require("mysql2/promise");
const dbConfig = require("../../config.json");

module.exports = {
    name: "checkban",
    aliases: ["baninfo", "isbanned"],
    description: "Check apakah player di-ban",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 5,

    run: async (client, message, args) => {
        try {
            if (!args[0]) {
                return message.reply("❌ Gunakan: `!checkban [nama_player]`");
            }

            const playerName = args.join(" ");

            const connection = await mysql.createConnection({
                host: dbConfig.mysql.host,
                user: dbConfig.mysql.user,
                password: dbConfig.mysql.password,
                database: dbConfig.mysql.database,
                port: 3306
            });

            const [rows] = await connection.query(
                `SELECT * FROM player_bans WHERE name LIKE ? ORDER BY id DESC LIMIT 1`,
                [`%${playerName}%`]
            );

            await connection.end();

            if (rows.length === 0) {
                const embed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("✅ Player Tidak Di-Ban")
                    .setDescription(`Player **${playerName}** tidak ditemukan dalam database ban.`)
                    .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            const ban = rows[0];
            const banDate = new Date(parseInt(ban.ban_date) * 1000);
            const expireDate = ban.ban_expire > 0 ? new Date(parseInt(ban.ban_expire) * 1000) : null;
            const isPermanent = ban.ban_expire === 0 || ban.ban_expire === -1;
            const isActive = !expireDate || expireDate > new Date();

            const embed = new MessageEmbed()
                .setColor(isActive ? "#FF0000" : "#FFA500")
                .setTitle(isActive ? "🔨 Player Banned" : "⚠️ Ban Expired")
                .setDescription(`Ban information untuk **${ban.name}**`)
                .addField("🆔 Ban ID", `#${ban.id}`, true)
                .addField("👤 Player Name", ban.name, true)
                .addField("🌐 IP Address", ban.ip || "N/A", true)
                .addField("👮 Banned By", ban.admin || "Server", true)
                .addField("📅 Ban Date", `<t:${Math.floor(banDate.getTime() / 1000)}:F>`, true)
                .addField("⏱️ Type", isPermanent ? "Permanent" : "Temporary", true)
                .addField("📝 Reason", ban.reason || "No reason provided", false)
                .setFooter({ text: `Ban ID: ${ban.id} • Created by: Axel (Drgxel), Ozi (Mozi)` })
                .setTimestamp();

            if (!isPermanent && expireDate) {
                embed.addField("⏰ Expires At", `<t:${Math.floor(expireDate.getTime() / 1000)}:F>`, false);
                
                if (isActive) {
                    embed.addField("⌛ Time Remaining", `<t:${Math.floor(expireDate.getTime() / 1000)}:R>`, false);
                } else {
                    embed.addField("✅ Status", "Ban sudah expired", false);
                }
            }

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di checkban:", error);
            message.reply("❌ Terjadi kesalahan saat check ban.");
        }
    }
};