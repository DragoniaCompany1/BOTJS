const { CommandInteraction, MessageEmbed } = require("discord.js");
const { Modal } = require("discord-modals");
const Mysql = require("../Mysql");
const client = require("../bot-dc");
require("../Functions");

module.exports = {
    id: "tampilan-pendaftaran",
    /**
     * @param {CommandInteraction} interaction
     */
    run: async (interaction) => {
        const userid = interaction.user.id;
        const inputName = interaction.fields.getTextInputValue('reg-name');
        const randCode = Math.floor(Math.random() * 99999) + 1;

        // Validasi inputName
        if (inputName.includes("_")) return IntError(interaction, 'Nama akun User Control Panel tidak boleh disertai dengan simbol "_"');
        if (inputName.includes(" ")) return IntError(interaction, 'Nama akun User Control Panel tidak boleh disertai dengan spasi');
        if (!/^[a-z]+$/i.test(inputName)) return IntError(interaction, 'Nama akun User Control Panel tidak boleh disertai dengan simbol atau angka!');

        // Cek apakah nama akun sudah ada di database
        Mysql.query(`SELECT * FROM playerucp WHERE ucp = '${inputName}'`, async (err, row) => {
            if (err) return IntError(interaction, 'Terjadi kesalahan saat memeriksa data akun.');
            
            if (row.length < 1) {
                // Tambahkan akun baru ke database
                await Mysql.query(`INSERT INTO playerucp SET ucp = '${inputName}', DiscordID = '${userid}', verifycode = '${randCode}'`);

                // Buat pesan embed untuk DM
                const msgEmbed = new MessageEmbed()
                    .setAuthor({ name: `PENGAMBILAN TICKET AKUN UCP ${client.config.NAMA_SERVER}`, iconURL: client.config.ICON_URL })
                    .setDescription(`Yang terhormat, **${inputName}**, blablablablablablablablablabla:\n\n**UCP**: ${inputName}\n\n**Kode Verifikasi**: ${randCode}\n\n**Waktu Pendaftaran**: <t:${Math.round(Date.now() / 1000)}:R>`)
                    .setColor("#800000")
                    .setImage(client.config.ICON_URL1)
                    .setFooter({ text: client.config.TEKS_BUATDM })
                    .setTimestamp();

                // Kirim DM kepada pengguna
                await interaction.user.send({ embeds: [msgEmbed] }).catch(error => {
                    interaction.reply({ content: "```\nTidak dapat mengirimkan kode/pin Verifikasi untuk akun UCP Anda. Silakan gunakan perintah /resendcode setelah mengikuti instruksi di bawah ini:\n- INSTRUKSI OPEN DIRECT MESSAGE -\n• Tips Pertama, Buka Pengaturan Discord Anda\n• Tips Kedua, Pilih Privacy & Safety\n• Tips Ketiga, Pilih Do Not Scan\n```", ephemeral: true });
                });

                console.log(`[BOT]: User (${interaction.user.tag}) Telah berhasil mendaftarkan akun UCP nya dengan Nama (${inputName}) Dan Pin (${randCode})`);

                // Kirim pesan sukses ke interaksi
                IntSucces(interaction, `DAFTAR UCP ${client.config.NAMA_SERVER}\n:white_check_mark: **Berhasil!**\n\n> Akun **${inputName}** berhasil didaftarkan. Silakan cek DM dari Bot RSP:GTA untuk informasi lebih lanjut!\n\n**${client.config.TANDA_PAGAR}**\n${client.config.MOTO_SERVER}`);

                // Tambahkan role dan ubah nickname pengguna
                const rWarga = interaction.guild.roles.cache.get(client.config.ROLE_WARGA);
                if (rWarga) {
                    try {
                    await interaction.member.roles.add(rWarga);
                    await interaction.member.setNickname(`WARGA | ${inputName}`);
                    }
                    catch (error) {
                        await interaction.reply({ content: `:x: **Terjadi Kesalahan**\nSilahkan coba lagi.`, ephemeral: true });
                    }
                }
            } else {
                return IntError(interaction, "Maaf, nama akun yang Anda input telah terdaftar. Silakan mencoba nama akun yang lain!");
            }
        });
    }
};
