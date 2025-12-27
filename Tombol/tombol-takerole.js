require("dotenv").config();
const { CommandInteraction } = require("discord.js");
const Mysql = require("../Mysql");
const client = require("../bot-dc");
const { IntSucces, IntError } = require("../Functions");

module.exports = {
    id: "tombol-takerole",
    /**
     * @param {CommandInteraction} interaction
     */
    run: async (interaction) => {
        try {
            const userid = interaction.user.id;
            const roleId = process.env.ROLE_WARGA;

            // Cek jika roleId valid
            if (!roleId) {
                await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nRole ID tidak ditemukan di environment variables.`, ephemeral: true });
                return;
            }

            // Ambil data dari MySQL
            Mysql.query(`SELECT * FROM playerucp WHERE DiscordID = ?`, [userid], async (err, rows) => {
                if (err) {
                    await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nGagal melakukan query ke database.`, ephemeral: true });
                    return;
                }

                if (rows.length > 0) {
                    // Jika Discord ID sudah terdaftar di tabel dataucp
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (role) {
                        try {
                            await interaction.member.roles.add(role);
                            //await IntSucces(interaction, `PENGAMBILAN ROLE WARGA\n:white_check_mark: **Berhasil!**\n\n> Akun Discord Anda berhasil kami verifikasi sebagai pemain di server ini\n> Mohon untuk tidak keluar lagi dari Discord ini\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`);
                            await interaction.reply({ content: `**:white_check_mark: PENGAMBILAN ROLE WARGA Berhasil!**\
                                \n\
                                \nAkun Discord Anda berhasil kami verifikasi sebagai pemain di server ini\
                                \nMohon untuk tidak keluar lagi dari Discord ini\
                                `, ephemeral: true });

                        } catch (error) {
                            await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nGagal menambahkan role.`, ephemeral: true });
                        }
                    } else {
                        await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nRole dengan ID ${roleId} tidak ditemukan di server ini.`, ephemeral: true });
                    }
                } else {
                    await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nAnda belum pernah daftar / ambil tiket di server ini, silakan ambil tiket terlebih dahulu`, ephemeral: true });
                }
            });
        } catch (error) {
            console.error(`Terjadi kesalahan: ${error.message}`);
            await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nTerjadi kesalahan saat memproses permintaan.`, ephemeral: true });
        }
    }
};
