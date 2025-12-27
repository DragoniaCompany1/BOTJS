const { CommandInteraction, MessageEmbed } = require("discord.js");
const Mysql = require("../../Mysql");
const client = require("../../bot-dc");

module.exports = {
    id: "tombol-kirimulang",
    /**
     * @param {CommandInteraction} interaction
     */
    run: async (interaction) => {
        const userid = interaction.user.id;

        // Query untuk mengambil data akun dari database berdasarkan user ID
        Mysql.query(`SELECT * FROM playerucp WHERE DiscordID = '${userid}'`, async (error, row) => {
            if (error) {
                console.error("Database query error:", error);
                return interaction.reply({ content: ":x: Terjadi kesalahan saat memproses permintaan Anda.", ephemeral: true });
            }

            // Jika data ditemukan
            if (row[0]) {
                const getStatus = (status) => {
                    return status == 1 ? 'Terverifikasi' : 'Belum Terverifikasi';
                };
                
                const msgEmbed = new MessageEmbed()
                    .setAuthor({ name: `Cek Akun | ${client.config.NAMA_SERVER}`, iconURL: client.config.ICON_URL })
                    .setDescription(`:white_check_mark: **Berhasil!**\nBerikut adalah detail dari akun UCP Anda:\n\n**Nama UCP**\n${row[0].ucp}\n\n**Kode Verifikasi**\n${row[0].verifikasi}\n\n**Pemilik Akun**\nUser ID : **${userid}**\nUsername DC : **${interaction.user.tag}**\n\n**Status**\n${getStatus(row[0].aktivasi)}\n\n**Catatan**: Jangan beritahukan informasi ini kepada orang lain, termasuk admin dan para staff!`)
                    .setColor("#800000")
                    .setFooter({ text: `🤖 Bot ${client.config.NAMA_SERVER}` })
                    .setTimestamp();

                try {
                    await interaction.user.send({ embeds: [msgEmbed] });
                } catch (error) {
                    // Mengirimkan pesan jika tidak dapat mengirim DM
                    return interaction.reply({ content: "```\nTidak dapat mengirimkan kode/pin Verifikasi akun UCP anda. Silahkan gunakan command /resendcode jika sudah mengikuti instruksi di bawah ini:\n- INSTRUKSI OPEN DIRECT MESSAGE -\n• Tips Pertama, Pergi ke Pengaturan Discord Anda\n• Tips Kedua, Pilih Privacy & Safety\n• Tips Ketiga, Pilih Do Not Scan\n```", ephemeral: true });
                }

                // Mengirimkan konfirmasi ke saluran interaksi
                IntSucces(interaction, `Cek Akun | ${client.config.NAMA_SERVER}\n:white_check_mark: Berhasil!\n\n> Kami telah mengirimkan DM kepada Anda, silakan periksa!\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`);
            } else {
                // Jika data tidak ditemukan
                IntError(interaction, `:x: **Terjadi Kesalahan** \nAnda belum pernah mengambil tiket di server ini.\nSilahkan daftarkan akun Anda dengan cara ambil tiket.\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`);
            }
        });
    },
};
