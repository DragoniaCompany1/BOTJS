const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "backupinfo",
    aliases: ["listbackup", "backups"],
    description: "Lihat daftar file backup yang tersedia",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES"],
    cooldown: 5,

    run: async (client, message) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);

            if (!isOwnerUser && !hasOwnerRole) {
                console.log(`⚠️ ${message.author.tag} mencoba backupinfo tanpa permission`);
                return message.reply("❌ Command ini hanya bisa digunakan oleh bot owner atau yang memiliki role owner!");
            }

            const backupDir = path.join(process.cwd(), "backups");

            if (!fs.existsSync(backupDir)) {
                return message.reply("📁 Belum ada folder backup. Gunakan `!backup` untuk membuat backup pertama.");
            }

            const files = fs.readdirSync(backupDir)
                .filter(file => file.endsWith(".sql"))
                .map(file => {
                    const filePath = path.join(backupDir, file);
                    const stats = fs.statSync(filePath);
                    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                    const date = stats.mtime;

                    return {
                        name: file,
                        size: sizeMB,
                        date: date,
                        dateStr: date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
                    };
                })
                .sort((a, b) => b.date - a.date);

            if (files.length === 0) {
                return message.reply("📁 Tidak ada file backup ditemukan. Gunakan `!backup` untuk membuat backup.");
            }

            const totalSize = files.reduce((sum, file) => sum + parseFloat(file.size), 0).toFixed(2);

            let description = `Total: **${files.length}** file backup (${totalSize} MB)\n\n`;

            files.slice(0, 10).forEach((file, index) => {
                description += `**${index + 1}.** \`${file.name}\`\n`;
                description += `   💾 ${file.size} MB • 📅 ${file.dateStr}\n\n`;
            });

            if (files.length > 10) {
                description += `\n*...dan ${files.length - 10} file lainnya*`;
            }

            const embed = new MessageEmbed()
                .setColor("#0099ff")
                .setTitle("📦 Daftar Backup Database")
                .setDescription(description)
                .addField("📁 Lokasi", `\`${backupDir}\``, false)
                .addField("💡 Cara Restore", "Upload file .sql dan ketik `!restore`", false)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (err) {
            console.error("❌ BACKUPINFO ERROR:", err);
            message.reply("❌ Terjadi kesalahan saat mengambil info backup.");
        }
    }
};