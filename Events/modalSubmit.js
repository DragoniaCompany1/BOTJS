const client = require("../bot-dc");

// Event listener untuk menangani modal submission
client.on("modalSubmit", async (modal) => {
    // Logika untuk menangani modal submission
    try {
        // Pastikan untuk memeriksa ID modal agar sesuai dengan modal yang Anda harapkan
        if (modal.customId === 'tampilan-pendaftaran') {
            // Dapatkan data dari modal
            await modal.reply({ content: 'Silahkan di cek DM Anda.', ephemeral: true });
        } else {
            // Jika modal ID tidak sesuai
            await modal.reply({ content: 'Modal tidak dikenali.', ephemeral: true });
        }
    } catch (error) {
        console.error(`Error handling modal submit: ${error}`);
        await modal.reply({ content: 'Terjadi kesalahan saat memproses modal.', ephemeral: true });
    }
});
