const { MessageActionRow, MessageButton } = require("discord.js");

var usersVotes = [];

module.exports = {
  init: (interaction) => {
    interaction.reply("O nosso Priority Planning vai começar!");
    setTimeout(() => {
      interaction.channel.send(renderVotingMessage());
    }, 0);
  },

  handleVote: (interaction) => {
    if (
      usersVotes
        .map((item) => item.userId)
        .includes(interaction.member.user.id)
    ) {
      usersVotes[usersVotes.findIndex((item) => item.userId == interaction.member.user.id)].vote = interaction.customId;
      return;
    };

    usersVotes.push({ userId: interaction.member.user.id, name: interaction.member.nickname || interaction.member.user.username, vote: interaction.customId });

    return interaction.channel.send(
      `${
        interaction.member.nickname || interaction.member.user.username
      } já votou`
    );
  },

  next: async (interaction) => {
    const fetched = await interaction.channel.messages.fetch();
    interaction.channel.bulkDelete(fetched);
  },

  finish: (interaction) => {
    showVotes(interaction);
    showResult(interaction);
  }
};

function createButton(functionality) {
  let button;
  
  switch(functionality) {
    case 'low':
      button = new MessageButton()
        .setCustomId("low")
        .setLabel("Baixa")
        .setStyle("SECONDARY")
        .setEmoji("🟢");
      break;

    case 'medium':
      button = new MessageButton()
        .setCustomId("medium")
        .setLabel("Média")
        .setStyle("SECONDARY")
        .setEmoji("🟡");
      break;

    case 'high':
      button = new MessageButton()
        .setCustomId("high")
        .setLabel("Alta")
        .setStyle("SECONDARY")
        .setEmoji("🔴");
      break;

    case 'end':
      button = new MessageButton()
        .setCustomId("end")
        .setLabel("Encerrar votação")
        .setStyle("SUCCESS");
      break;

    case 'next':
      button = new MessageButton()
      .setCustomId("next")
      .setLabel("Finalizar planning")
      .setStyle("PRIMARY");
  }

  return {
    button
  };
}

function renderVotingMessage() {
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
          .setCustomId("end")
          .setLabel("Encerrar votação")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("next")
          .setLabel("Finalizar planning")
          .setStyle("PRIMARY")
      ),
    ],
  };
}

function showVotes(interaction) {  
  usersVotes.forEach(user => {
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
    interaction.channel.send(`Resultado final: 🟢 (prioridade baixa)`);
  if(mediumCount > lowCount && mediumCount > highCount) 
    interaction.channel.send(`Resultado final: 🟡 (prioridade média)`);
  if(highCount > lowCount && highCount > mediumCount) 
    interaction.channel.send(`Resultado final: 🔴 (prioridade alta)`);

  interaction.channel.send("\n------------------------------------------------------------------------------\n");

  usersVotes = [];
  interaction.channel.send(renderVotingMessage());
}