const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
  init: async (interaction) => {
    await interaction.channel.reply("O nosso Poker Planning vai começar!");
    renderVotingMessage(interaction)
  },

  handleVote: async (interaction) => {
    await interaction.channel.send("assd");
  }
}

function renderVotingMessage(interaction) {
  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
                  .setCustomId('low')
                  .setLabel('Baixa')
                  .setStyle('SECONDARY')
                  .setEmoji('🟢'),
              new MessageButton()
                  .setCustomId('medium')
                  .setLabel('Média')
                  .setStyle('SECONDARY')
                  .setEmoji('🟡'),
              new MessageButton()
                  .setCustomId('high')
                  .setLabel('Alta')
                  .setStyle('SECONDARY')
                  .setEmoji('🔴'),

    );

  interaction.channel.send({ content: 'Vote a dificuldade!', components: [row] });
}