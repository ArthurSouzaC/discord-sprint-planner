require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents, DiscordAPIError } = require('discord.js');
const token = process.env.DISCORD_BOK_TOKEN;
const guildId = process.env.GUILD_ID;

const { poker, priority } = require('./commands');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Bot is ready!');
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
        switch(interaction.commandName) {
            case 'poker': poker.init(interaction); 
                break;
            case 'priority': priority.init(interaction); 
                break;
            default: 
                break;
        }
    } else if(interaction.isButton()) {
        await interaction.deferUpdate();

        if(interaction.customId == ("low" || "medium" || "high")) await priority.handleVote(interaction)

        if(interaction.customId == 'next') await priority.next(interaction);
    }
});

client.login(token);