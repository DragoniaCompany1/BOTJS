const { MessageEmbed, MessageAttachment } = require("discord.js");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dbConfig = require("../../config.json");

module.exports = {
    name: "backup",
    aliases: ["backupdb", "exportdb"],
    description: "Backup database MySQL ke file SQL",
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "ATTACH_FILES"],
    cooldown: 30,

    run: async (client, message) => {
        try {
            const ownerId = client.config.OWNER_ID;
            const ownerRoleId = client.config.OWNER_ROLE;

            const isOwnerUser = message.author.id === ownerId;
            const hasOwnerRole = message.member && ownerRoleId && message.member.roles.cache.has(ownerRoleId);

            if (!isOwnerUser && !hasOwnerRole) {
                console.log(`⚠️ ${message.author.tag} mencoba backup tanpa permission`);
                return message.reply("❌ Command ini hanya bisa digunakan oleh bot owner atau yang memiliki role owner!");
            }

            const statusMsg = await message.reply("🔄 Memulai backup database...");

            const { host, user, password, database } = dbConfig.mysql;
            const port = 3306;

            if (!database) {
                return statusMsg.edit("❌ Database name tidak ditemukan di config.json!");
            }

            const timestamp = new Date()
                .toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
                .replace(/[\/\s:]/g, "-");

            const backupDir = path.join(process.cwd(), "backups");
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
                console.log("✅ Folder backups dibuat");
            }

            const fileName = `backup_${database}_${timestamp}.sql`;
            const filePath = path.join(backupDir, fileName);

            await statusMsg.edit("📦 Mengambil struktur & data database...");

            const connection = await mysql.createConnection({
                host,
                user,
                password,
                database,
                port
            });

            let sqlDump = `-- ==============================\n`;
            sqlDump += `-- BACKUP DATABASE: ${database}\n`;
            sqlDump += `-- DATE: ${new Date().toISOString()}\n`;
            sqlDump += `-- BACKUP BY: ${message.author.tag}\n`;
            sqlDump += `-- CREATED BY: Axel (Drgxel), Ozi (Mozi)\n`;
            sqlDump += `-- ==============================\n\n`;
            sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

            const [tables] = await connection.query("SHOW TABLES");
            const tableKey = Object.keys(tables[0])[0];

            for (const row of tables) {
                const tableName = row[tableKey];

                sqlDump += `\n-- ------------------------------\n`;
                sqlDump += `-- TABLE: ${tableName}\n`;
                sqlDump += `-- ------------------------------\n\n`;

                const [[createTable]] = await connection.query(
                    `SHOW CREATE TABLE \`${tableName}\``
                );

                sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                sqlDump += `${createTable["Create Table"]};\n\n`;

                const [rows] = await connection.query(
                    `SELECT * FROM \`${tableName}\``
                );

                if (rows.length > 0) {
                    sqlDump += `INSERT INTO \`${tableName}\` VALUES\n`;
                    
                    for (let i = 0; i < rows.length; i++) {
                        const data = rows[i];
                        const values = Object.values(data)
                            .map(val => val === null ? "NULL" : connection.escape(val))
                            .join(", ");

                        sqlDump += `(${values})`;
                        sqlDump += i < rows.length - 1 ? ",\n" : ";\n";
                    }
                    sqlDump += "\n";
                }
            }

            sqlDump += `\nSET FOREIGN_KEY_CHECKS=1;\n`;
            sqlDump += `-- ==============================\n`;
            sqlDump += `-- BACKUP COMPLETED\n`;
            sqlDump += `-- ==============================\n`;

            fs.writeFileSync(filePath, sqlDump, "utf8");
            await connection.end();

            const stats = fs.statSync(filePath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            await statusMsg.edit("📤 Mengirim file backup...");

            if (stats.size > 8 * 1024 * 1024) {
                return statusMsg.edit(
                    `⚠️ Backup berhasil tapi file terlalu besar (${fileSizeMB} MB).\n📁 Lokasi server:\n\`${filePath}\``
                );
            }

            const embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("✅ Database Backup Berhasil")
                .setDescription(`Database **${database}** berhasil di-backup!`)
                .addField("📊 Database", database, true)
                .addField("🌐 Host", host, true)
                .addField("💾 Ukuran", `${fileSizeMB} MB`, true)
                .addField("📅 Tanggal", new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), false)
                .addField("👤 Backup By", message.author.tag, true)
                .addField("📁 Lokasi", `\`${filePath}\``, false)
                .setFooter({ text: "Created by: Axel (Drgxel), Ozi (Mozi)" })
                .setTimestamp();

            await message.reply({
                embeds: [embed],
                files: [new MessageAttachment(filePath, fileName)]
            });

            await statusMsg.delete().catch(() => {});

            console.log(`✅ Backup berhasil: ${fileName} (${fileSizeMB} MB) by ${message.author.tag}`);

            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ File backup temporary dihapus: ${fileName}`);
                }
            }, 60000);

        } catch (err) {
            console.error("❌ BACKUP ERROR:", err);
            console.error("Stack trace:", err.stack);
            message.reply("❌ Terjadi kesalahan saat backup database.");
        }
    }
};