const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "monitorban",
    aliases: ["setupbanlog", "banlog"],
    description: "Setup channel untuk monitor banned players",
    UserPerms: ["ADMINISTRATOR"],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    cooldown: 5,

    run: async (client, message, args) => {
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

            const channel = message.mentions.channels.first() || message.channel;

            const configPath = path.join(process.cwd(), 'config', 'banlog.json');
            const configDir = path.dirname(configPath);

            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

            config.channelId = channel.id;
            config.guildId = message.guild.id;
            config.enabled = true;
            config.setupBy = message.author.id;
            config.setupAt = new Date().toISOString();

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            const embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Ban Log Monitor Setup Berhasil")
                .setDescription(`Channel ban log telah diatur ke ${channel}`)
                .addField("📝 Channel", channel.toString(), true)
                .addField("👤 Setup By", message.author.tag, true)
                .addField("⚙️ Status", "✅ Aktif", true)
                .addField("ℹ️ Info", "Bot akan otomatis monitor banned players dari database dan mengirim log ke channel ini.", false)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            const testEmbed = new MessageEmbed()
                .setColor("#FF9900")
                .setTitle("🔨 Ban Log Monitor Aktif")
                .setDescription("Channel ini sekarang akan menerima notifikasi setiap ada player yang di-ban.")
                .addField("⚡ Auto Monitor", "Bot akan check database setiap 30 detik", false)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await channel.send({ embeds: [testEmbed] });

            console.log(`✅ Ban log monitor setup di #${channel.name} oleh ${message.author.tag}`);

        } catch (error) {
            console.error("❌ Error di monitorban:", error);
            message.reply("❌ Terjadi kesalahan saat setup ban log monitor.");
        }
    }
};