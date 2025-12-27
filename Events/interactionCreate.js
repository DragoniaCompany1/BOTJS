const { Modal } = require("discord-modals");
const client = require("../bot-dc");

client.on("interactionCreate", async (interaction) => {

    // Penanganan Context Menu
    if (interaction.isContextMenu()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);
    }

    // Penanganan Buttons
    if (interaction.isButton()) {
        const Buttons = client.buttons.get(interaction.customId);
        if (Buttons) Buttons.run(interaction, client);
    }

    // Penanganan Modals
    if (interaction.isModalSubmit()) {
        const Modals = client.modals.get(interaction.customId);
        Modals.run(interaction, client);
    }    
});
