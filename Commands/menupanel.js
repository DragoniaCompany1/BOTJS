const { Client, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
    name: "menupanel",
    aliases: ["panel", "menu"],
    UserPerms: [],
    BotPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
    description: "Menampilkan Panel Pendaftaran Akun",
    cooldown: 5,
    
    run: async (client, messageOrInteraction, args) => {
        try {
            const isInteraction = messageOrInteraction.isCommand && messageOrInteraction.isCommand();
            const message = isInteraction ? null : messageOrInteraction;
            const interaction = isInteraction ? messageOrInteraction : null;

            const member = isInteraction ? interaction.member : message.member;
            const user = isInteraction ? interaction.user : message.author;
            const channel = isInteraction ? interaction.channel : message.channel;
            const guild = isInteraction ? interaction.guild : message.guild;

            if (!member || !user) {
                console.error('❌ Member atau user tidak ditemukan');
                return;
            }

            const allowedRoleId = client.config.ROLE_ADMIN;

            if (!allowedRoleId) {
                console.error('❌ ROLE_ADMIN tidak ditemukan di .env');
                const errorMsg = "⚠️ Konfigurasi role admin tidak ditemukan. Hubungi developer.";
                
                if (isInteraction) {
                    return interaction.reply({ content: errorMsg, ephemeral: true });
                } else {
                    return message.reply(errorMsg);
                }
            }

            const memberRoles = member.roles;
            if (!memberRoles || !memberRoles.cache || !memberRoles.cache.has(allowedRoleId)) {
                console.log(`⚠️ ${user.tag} tidak memiliki permission untuk menupanel`);
                const errorMsg = "❌ Anda tidak memiliki izin untuk menjalankan perintah ini.";
                
                if (isInteraction) {
                    return interaction.reply({ content: errorMsg, ephemeral: true });
                } else {
                    return message.reply(errorMsg);
                }
            }

            const roleId = client.config.ROLE_WARGA;
            
            if (!roleId) {
                console.error('❌ ROLE_WARGA tidak ditemukan di .env');
                const errorMsg = "⚠️ Konfigurasi role warga tidak ditemukan. Hubungi developer.";
                
                if (isInteraction) {
                    return interaction.reply({ content: errorMsg, ephemeral: true });
                } else {
                    return message.reply(errorMsg);
                }
            }

            const serverName = client.config.NAMA_SERVER || 'Server';
            const iconURL = client.config.ICON_URL || client.user.displayAvatarURL();
            const footerText = client.config.TEKS_BUATDM || '✉ TIM ADMIN';

            const msgEmbed = new MessageEmbed()
                .setAuthor({ 
                    name: `Panel Akun ${serverName}`, 
                    iconURL: iconURL 
                })
                .setColor("#800000")
                .setDescription(`:information_source: Selamat datang di panel pendaftaran **${serverName}**!\n\n\
『 🎫 CREATE UCP 』\n\
Klik tombol ini untuk mendaftarkan akun UCP baru. Anda akan diminta mengisi formulir pendaftaran.\n\n\
『 🎟 RESEND KODE 』\n\
Kirim ulang kode verifikasi UCP Anda jika belum diterima atau hilang.\n\n\
『 😕 LUPA KATA SANDI 』\n\
Reset kata sandi UCP Anda jika lupa. Kode verifikasi baru akan dikirimkan.\n\n\
『 🔰 REFF ROLE 』\n\
Ambil kembali role <@&${roleId}> jika hilang. Pastikan Anda sudah terdaftar di server!`)
                .setFooter({ 
                    text: `${footerText} • Created by: Axel (Drgxel), Ozi (Mozi)` 
                })
                .setTimestamp();

            const Buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("tombol-pendaftaran")
                        .setLabel("CREATE UCP")
                        .setStyle("PRIMARY")
                        .setEmoji("🎫"),

                    new MessageButton()
                        .setCustomId("tombol-kirimulang")
                        .setLabel("RESEND KODE")
                        .setStyle("PRIMARY")
                        .setEmoji("🎟"),

                    new MessageButton()
                        .setCustomId("tombol-reset")
                        .setLabel("LUPA KATA SANDI")
                        .setStyle("DANGER")
                        .setEmoji("😕"),

                    new MessageButton()
                        .setCustomId("tombol-takerole")
                        .setLabel("REFF ROLE")
                        .setStyle("SECONDARY")
                        .setEmoji("🔰")
                );

            const replyOptions = { 
                embeds: [msgEmbed], 
                components: [Buttons] 
            };

            if (isInteraction) {
                await interaction.reply(replyOptions);
            } else {
                await message.reply(replyOptions);
            }

            console.log(`✅ Menu panel berhasil ditampilkan oleh ${user.tag} di #${channel.name}`);

        } catch (error) {
            console.error('❌ Error di command menupanel:', error);
            console.error('Stack trace:', error.stack);
            
            const errorMsg = '❌ Terjadi kesalahan saat menampilkan menu panel. Silakan coba lagi.';

            try {
                const isInteraction = messageOrInteraction.isCommand && messageOrInteraction.isCommand();
                
                if (isInteraction) {
                    if (messageOrInteraction.replied || messageOrInteraction.deferred) {
                        await messageOrInteraction.followUp({ content: errorMsg, ephemeral: true });
                    } else {
                        await messageOrInteraction.reply({ content: errorMsg, ephemeral: true });
                    }
                } else {
                    await messageOrInteraction.reply(errorMsg);
                }
            } catch (err) {
                console.error('❌ Gagal mengirim error message:', err);
            }
        }
    },
};