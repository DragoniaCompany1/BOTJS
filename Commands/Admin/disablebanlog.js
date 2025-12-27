const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "disablebanlog",
    aliases: ["stopbanlog", "banlogoff"],
    description: "Disable ban log monitor",
    UserPerms: ["ADMINISTRATOR"],
    BotPerms: ["SEND_MESSAGES"],
    cooldown: 5,

    run: async (client, message) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;
            const adminRoleId = client.config.ROLE_ADMIN;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);
            const hasAdminRole = message.member && adminRoleId && message.member.roles.cache.has(adminRoleId);

            if (!isOwnerUser && !hasOwnerRole && !hasAdminRole) {
                return message.reply("❌ Command ini hanya bisa digunakan oleh Administrator!");
            }

            const configPath = path.join(process.cwd(), 'config', 'banlog.json');

            if (!fs.existsSync(configPath)) {
                return message.reply("⚠️ Ban log monitor belum di-setup!");
            }

            let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            config.enabled = false;

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("❌ Ban Log Monitor Dinonaktifkan")
                .setDescription("Ban log monitor telah dinonaktifkan.")
                .addField("👤 Disabled By", message.author.tag, true)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error di disablebanlog:", error);
            message.reply("❌ Terjadi kesalahan.");
        }
    }
};