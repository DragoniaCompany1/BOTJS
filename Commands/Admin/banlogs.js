const { MessageEmbed } = require("discord.js");
const mysql = require("mysql2/promise");
const dbConfig = require("../../config.json");

module.exports = {
    name: "banlogs",
    aliases: ["recentbans", "banhistory"],
    description: "Lihat history banned players",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 10,

    run: async (client, message, args) => {
        try {
            const adminRoleId = client.config.ROLE_ADMIN;
            const hasAdminRole = message.member && adminRoleId && message.member.roles.cache.has(adminRoleId);

            if (!hasAdminRole) {
                return message.reply("❌ Command ini hanya untuk admin!");
            }

            const limit = parseInt(args[0]) || 10;
            
            if (limit < 1 || limit > 50) {
                return message.reply("❌ Limit harus antara 1-50!");
            }

            const connection = await mysql.createConnection({
                host: dbConfig.mysql.host,
                user: dbConfig.mysql.user,
                password: dbConfig.mysql.password,
                database: dbConfig.mysql.database,
                port: 3306
            });

            const [rows] = await connection.query(
                `SELECT * FROM player_bans ORDER BY id DESC LIMIT ?`,
                [limit]
            );

            await connection.end();

            if (rows.length === 0) {
                return message.reply("📋 Tidak ada data banned players.");
            }

            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle(`🔨 Recent Bans (${rows.length} terakhir)`)
                .setDescription("List banned players terbaru")
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            let description = "";
            
            for (let i = 0; i < rows.length; i++) {
                const ban = rows[i];
                const banDate = new Date(parseInt(ban.ban_date) * 1000);
                const isPermanent = ban.ban_expire === 0 || ban.ban_expire === -1;
                
                description += `**${i + 1}.** \`${ban.name}\` (ID: ${ban.id})\n`;
                description += `   👮 By: **${ban.admin}**\n`;
                description += `   📝 Reason: ${ban.reason}\n`;
                description += `   📅 Date: <t:${Math.floor(banDate.getTime() / 1000)}:R>\n`;
                description += `   ⏱️ Type: ${isPermanent ? "Permanent" : "Temporary"}\n\n`;
            }

            embed.setDescription(description);

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di banlogs:", error);
            message.reply("❌ Terjadi kesalahan saat mengambil ban logs.");
        }
    }
};