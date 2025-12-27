const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dbConfig = require("../../config.json");

module.exports = {
    name: "restore",
    aliases: ["restoredb", "importdb"],
    description: "Restore database dari file backup SQL",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES"],
    cooldown: 30,

    run: async (client, message) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);

            if (!isOwnerUser && !hasOwnerRole) {
                console.log(`⚠️ ${message.author.tag} mencoba restore tanpa permission`);
                return message.reply("❌ Command ini hanya bisa digunakan oleh bot owner atau yang memiliki role owner!");
            }

            const attachment = message.attachments.first();

            if (!attachment || !attachment.name.endsWith(".sql")) {
                return message.reply("❌ Silakan upload file SQL untuk direstore!\nContoh: `!restore` + attach file .sql");
            }

            const statusMsg = await message.reply("🔄 Memulai proses restore database...");

            const backupDir = path.join(process.cwd(), "backups");
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const tempFile = path.join(backupDir, `temp_restore_${Date.now()}.sql`);

            await statusMsg.edit("📥 Mengunduh file SQL...");

            const https = require("https");
            const fileStream = fs.createWriteStream(tempFile);

            await new Promise((resolve, reject) => {
                https.get(attachment.url, (response) => {
                    response.pipe(fileStream);
                    fileStream.on("finish", () => {
                        fileStream.close();
                        resolve();
                    });
                }).on("error", (err) => {
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    reject(err);
                });
            });

            await statusMsg.edit("💾 Mengimpor ke database...");

            const { host, user, password, database } = dbConfig.mysql;
            const port = 3306;

            const connection = await mysql.createConnection({
                host,
                user,
                password,
                database,
                port,
                multipleStatements: true
            });

            const sqlContent = fs.readFileSync(tempFile, "utf8");

            await connection.query(sqlContent);
            await connection.end();

            fs.unlinkSync(tempFile);

            const embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Database Restore Berhasil")
                .setDescription(`Database **${database}** berhasil di-restore dari backup!`)
                .addField("📊 Database", database, true)
                .addField("📁 File", attachment.name, true)
                .addField("📅 Tanggal", new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), false)
                .addField("👤 Restore By", message.author.tag, true)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await statusMsg.edit({ content: null, embeds: [embed] });

            console.log(`✅ Restore berhasil oleh ${message.author.tag}`);

        } catch (err) {
            console.error("❌ RESTORE ERROR:", err);
            console.error("Stack trace:", err.stack);
            message.reply("❌ Terjadi kesalahan saat restore database.");
        }
    }
};