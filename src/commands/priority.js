const { MessageActionRow, MessageButton } = require("discord.js");

const usersVotes = [];

module.exports = {
  init: async (interaction) => {
    await interaction.reply("O nosso Priority Planning vai começar!");
    setTimeout(async () => {
      await interaction.channel.send(renderVotingMessage());
    }, 0);
  },

  handleVote: async (interaction) => {
    if (
      usersVotes
        .filter((item) => item?.userId)
        .includes(interaction.member.user.id)
    )
      return;

    usersVotes.push({ userId: interaction.member.user.id, name: interaction.member.nickname || interaction.member.user.username, vote: interaction.customId });

    return await interaction.channel.send(
      `${
        interaction.member.nickname || interaction.member.user.username
      } já votou`
    );
  },

  next: async (interaction) => {
    await showVotes(interaction);
    await showResult(interaction);
  }
};

function renderVotingMessage() {
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("low")
      .setLabel("Baixa")
      .setStyle("SECONDARY")
      .setEmoji("🟢"),
    new MessageButton()
      .setCustomId("medium")
      .setLabel("Média")
      .setStyle("SECONDARY")
      .setEmoji("🟡"),
    new MessageButton()
      .setCustomId("high")
      .setLabel("Alta")
      .setStyle("SECONDARY")
      .setEmoji("🔴")
  );

  return {
    content: "Vote a dificuldade!",
    components: [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("low")
          .setLabel("Baixa")
          .setStyle("SECONDARY")
          .setEmoji("🟢"),
        new MessageButton()
          .setCustomId("medium")
          .setLabel("Média")
          .setStyle("SECONDARY")
          .setEmoji("🟡"),
        new MessageButton()
          .setCustomId("high")
          .setLabel("Alta")
          .setStyle("SECONDARY")
          .setEmoji("🔴")
      ),

      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("next")
          .setLabel("Próxima tarefa")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("end")
          .setLabel("Finalizar")
          .setStyle("SUCCESS")
      ),
    ],
  };
}

async function showVotes(interaction) {  
  usersVotes.forEach(async user => {
    let voteMessage;
    if(user.vote == 'low') voteMessage = '🟢 (prioridade baixa)'
    if(user.vote == 'medium') voteMessage = '🟡 (prioridade média)'
    if(user.vote == 'high') voteMessage = '🔴 (prioridade alta)'

    interaction.channel.send(`${user.name} votou: ${voteMessage}`)
  })
}

async function showResult(interaction) {
  let lowCount = 0, mediumCount = 0, highCount = 0;
  usersVotes.forEach(user => {
    if(user.vote == 'low') lowCount++;
    if(user.vote == 'medium') mediumCount++;
    if(user.vote == 'high') highCount++;
  })

  if(lowCount > mediumCount && lowCount > highCount)
    return interaction.channel.send(`Resultado final: 🟢 (prioridade baixa)`);
  if(mediumCount > lowCount && mediumCount > highCount) 
    return interaction.channel.send(`Resultado final: 🟡 (prioridade média)`);
  if(highCount > lowCount && lowCount > mediumCount) 
    return interaction.channel.send(`Resultado final: 🔴 (prioridade alta)`);

  voteAgain(interaction)
}

function voteAgain(interaction) {
  //
}