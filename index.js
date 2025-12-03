require("dotenv").config();
const { 
    Client, 
    GatewayIntentBits, 
    PermissionsBitField,
    ChannelType,
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ============================
// Registrar Comandos Slash
// ============================

const commands = [
    new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Abrir um ticket"),
    new SlashCommandBuilder()
        .setName("fechar")
        .setDescription("Fechar o ticket atual")
].map(cmd => cmd.toJSON());

client.once("ready", async () => {
    console.log(`🔥 Bot online como ${client.user.tag}`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log("📌 Comandos registrados com sucesso!");
});

// ============================
// Sistema de Ticket
// ============================

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // ----------- /ticket ---------------
    if (interaction.commandName === "ticket") {
        const guild = interaction.guild;
        const user = interaction.user;

        // Criar canal privado
        const canal = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        await interaction.reply({
            content: `🎫 Ticket aberto! Vá até o canal: ${canal}`,
            ephemeral: true
        });

        await canal.send(`👋 Olá ${user}, explique seu problema e iremos te ajudar!`);
    }

    // ----------- /fechar ---------------
    if (interaction.commandName === "fechar") {
        const canal = interaction.channel;

        if (!canal.name.startsWith("ticket-")) {
            return interaction.reply({ content: "❌ Esse canal não é um ticket!", ephemeral: true });
        }

        await interaction.reply("⏳ Fechando o ticket...");
        setTimeout(() => canal.delete(), 2000);
    }
});

client.login(process.env.TOKEN);
