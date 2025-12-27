const { CommandInteraction, MessageEmbed } = require("discord.js");
const Mysql = require("../../Mysql");
const client = require("../../bot-dc");
const { IntSucces, IntError } = require("../../Functions");

module.exports = {
    id: "tombol-reset",
    /**
     * @param {CommandInteraction} interaction
     */
    run: async (interaction) => {
        const userid = interaction.user.id;

        // Cek apakah pengguna sudah mendaftar
        Mysql.query(`SELECT * FROM playerucp WHERE DiscordID = '${userid}'`, async (error, row) => {
            if (!row[0]) {
                return IntError(interaction, ":x: **Terjadi Kesalahan** \nAnda Belum pernah mengambil tiket di server ini\nSilahkan daftarkan akun anda dengan cara ambil tiket\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}");
            }

            // Reset password logic here
            Mysql.query(`UPDATE DiscordID SET password = '', aktivasi = 0 WHERE DiscordID = '${userid}'`, async (err) => {
                if (err) {
                    return IntError(interaction, ":x: **Terjadi Kesalahan**\nGagal mereset password akun UCP. Silakan coba lagi.");
                }

                const msgEmbed = new MessageEmbed()
                    .setAuthor({ name: `Pemulihan akun | ${client.config.NAMA_SERVER}`, iconURL: client.config.ICON_URL })
                    .setDescription(`\n:warning: Peringatan!\nAnda telah meminta layanan lupa password. Jika ini bukan permintaan anda, maka abaikan saja pesan ini!\n\n***Kode Pemulihan***\n\`\`\`${row[0].verifikasi}\`\`\`\nMasuklah ke server dan masukkan Kode Pemulihan untuk membuat ulang kata sandi!\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`)
                    .setColor("#800000")
                    .setFooter({ text: `🤖 Bot ${client.config.NAMA_SERVER}` })
                    .setTimestamp();

                try {
                    // Kirim pesan kepada pengguna
                    await interaction.reply({ embeds: [msgEmbed], ephemeral: true });
                    IntSucces(interaction, `Pemulihan Akun | ${client.config.NAMA_SERVER}\n:white_check_mark: Berhasil!\n\n> Kami telah mengirimkan DM kepada anda, silahkan dibuka!\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`);
                } catch (error) {
                    // Tangani error jika gagal mengirim pesan
                    IntError(interaction, ":x: **Terjadi Kesalahan**\nGagal mengirim pesan. Pastikan pengaturan privasi Anda memperbolehkan pesan dari server ini.\nSilahkan Anda melakukan intruksi di bawah ini:\n- INTRUKSI OPEN DIRECT MESSAGE -\n• Tips Pertama, Kamu Pergi Ke Pengaturan Discord\n• Tips Ke Dua, Pilih Privacy & Safety\n• Tips Ke Tiga, Pilih Do Not Scan\n");
                }
            });
        });
    },
};
