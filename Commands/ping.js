const { Message, Client } = require("discord.js");

// Mendefinisikan modul untuk di ekspor
module.exports = {
    // Nama command
    name: "ping",
    // Alias command
    aliases: ['p'],
    // Permissions yang dibutuhkan oleh pengguna
    UserPerms: [],
    // Permissions yang dibutuhkan oleh bot
    BotPerms: ["SEND_MESSAGES"], 
    // Cooldown untuk command ini dalam milidetik
    cooldown: 50,
    /**
     * Fungsi yang akan dijalankan ketika command ini dipanggil
     * @param {Client} client - Client dari Discord.js
     * @param {Message} message - Pesan yang memicu command
     * @param {String[]} args - Argumen tambahan yang mungkin diberikan
     */
    run: async (client, message, args) => {
        // Mengirim pesan awal untuk menghitung ping
        const sentMessage = await message.reply('Menghitung ping...');

        // Menghitung latensi (ping) antara pesan yang dikirim pengguna dan pesan balasan
        const ping = sentMessage.createdTimestamp - message.createdTimestamp;
        // Menghitung latensi API
        const apiPing = Math.round(client.ws.ping);

        // Mengedit pesan yang sudah dikirim dengan hasil latensi
        sentMessage.edit(`Pong!! :ping_pong: Latensi adalah ${ping}ms. Latensi API adalah ${apiPing}ms.`);
    },
};
