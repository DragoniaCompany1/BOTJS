const { CommandInteraction, Client } = require("discord.js");
const { Modal, TextInputComponent, showModal } = require("discord-modals");
const ms = require("ms");
const Mysql = require("../../Mysql");
const client = require("../../bot-dc");
const umurakun = ms("0 days"); // Menentukan umur akun minimum yang diperlukan
require("../../Functions");

module.exports = {
    id: "tombol-pendaftaran",
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    run: async (interaction, client) => {
        const userid = interaction.user.id;
        const createdAt = new Date(interaction.user.createdAt).getTime();
        const detectDays = Date.now() - createdAt;

        // Cek apakah umur akun memenuhi syarat
        if (detectDays < umurakun) {
            return IntError(interaction, "Umur akun anda tidak mencukupi untuk mendaftar Akun UCP di server ini!");
        }

        // Query untuk memeriksa apakah akun sudah terdaftar
        Mysql.query(`SELECT * FROM playerucp WHERE DiscordID = '${userid}'`, async (err, row) => {
            if (err) {
                console.error("Database query error:", err);
                return IntError(interaction, "Terjadi kesalahan saat memproses pendaftaran.");
            }

            if (row.length < 1) {
                // Membuat modal pendaftaran
                const modalRegister = new Modal()
                    .setCustomId("tampilan-pendaftaran")
                    .setTitle("Pendaftaran Akun UCP")
                    .addComponents(
                        new TextInputComponent()
                            .setCustomId("reg-name")
                            .setLabel("Isi Nama UCP Anda Di Bawah Ini")
                            .setMinLength(4)
                            .setMaxLength(24)
                            .setStyle("SHORT")
                            .setPlaceholder("Nama User Control Panel Anda")
                            .setRequired(true)
                    );

                // Menampilkan modal kepada pengguna
                showModal(modalRegister, {
                    client: client,
                    interaction: interaction
                });
            } else {
                // Jika akun sudah terdaftar
                return IntError(interaction, 
                    `**Pendaftaran Akun | ${client.config.NAMA_SERVER}**\n:x: Terjadi Kesalahan!\n\n> Akun Discord ini sudah terdaftar di database dan tidak dapat mengambil tiket lagi.\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`);
            }
        });
    },
};
