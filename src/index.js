require("dotenv").config();
const express = require('express');
const app = express();

// Require the necessary discord.js classes
const { Client, Intents } = require("discord.js");
const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.GUILD_ID;

const { poker, priority } = require("./commands");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case "poker":
        poker.init(interaction);
        break;
      case "priority":
        priority.init(interaction);
        break;
      case "clear":
        clearChannel(interaction);
        break;
      default:
        break;
    }
  } else if (interaction.isButton()) {
    interaction.deferUpdate();
    if (
      interaction.customId == "low" ||
      interaction.customId == "medium" ||
      interaction.customId == "high"
    )
      priority.handleVote(interaction);

    if (interaction.customId == "next-pr") priority.next(interaction);
    if (interaction.customId == "end-pr") priority.finish(interaction);
    if (interaction.customId == "next-pk") poker.next(interaction);
    if (interaction.customId == "end-pk") poker.finish(interaction);
  } else if (interaction.isSelectMenu()) {
    interaction.deferUpdate();
    poker.handleVote(interaction);
  }
});

async function clearChannel(interaction) {
  let fetched = await interaction.channel.messages.fetch({ limit: 100 });
  fetched = fetched.filter(message => message.author.id == '961620203752538153')
  await interaction.channel.bulkDelete(fetched);
  await interaction.reply("Canal limpo.");
}

client.login(token);
app.use('/', (req, res) => {
  res.send('Bot is online!')
})
app.listen(process.env.PORT);