const { MessageActionRow, MessageButton } = require("discord.js");

var usersVotes = [];

module.exports = {
  init: async (interaction) => {
    await interaction.reply(
      "\n------------------------------------------------------------------------------\n"
    );
    await interaction.channel.send("O nosso Priority Planning vai começar!");
    await interaction.channel.send(
      "\n------------------------------------------------------------------------------\n"
    );
    await interaction.channel.send(
      renderVotingMessage("Vamos votar a prioridade.")
    );
  },

  handleVote: async (interaction) => {
    if (
      usersVotes.map((item) => item.userId).includes(interaction.member.user.id)
    ) {
      usersVotes[
        usersVotes.findIndex(
          (item) => item.userId == interaction.member.user.id
        )
      ].vote = interaction.customId;
      return;
    }

    usersVotes.push({
      userId: interaction.member.user.id,
      name: interaction.member.nickname || interaction.member.user.username,
      vote: interaction.customId,
    });

    await interaction.channel.send(
      `${
        interaction.member.nickname || interaction.member.user.username
      } já votou`
    );
  },

  next: async (interaction) => {
    await removeButtons(interaction);
    await interaction.channel.send(
      "\n------------------------------------------------------------------------------\n"
    );
    await interaction.channel.send("Priority Planning finalizado!");
    await interaction.channel.send(
      "\n------------------------------------------------------------------------------\n"
    );
  },

  finish: async (interaction) => {
    await removeButtons(interaction);
    await showVotes(interaction);
    await showResult(interaction);
  },
};

function renderVotingMessage(message) {
  return {
    content: message,
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
          .setCustomId("end-pr")
          .setLabel("Encerrar votação")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("next-pr")
          .setLabel("Finalizar planning")
          .setStyle("PRIMARY")
      ),
    ],
  };
}

async function showVotes(interaction) {
  usersVotes.forEach(async (user) => {
    let voteMessage;
    if (user.vote == "low") voteMessage = "🟢 (prioridade baixa)";
    if (user.vote == "medium") voteMessage = "🟡 (prioridade média)";
    if (user.vote == "high") voteMessage = "🔴 (prioridade alta)";

    await interaction.channel.send(`${user.name} votou: ${voteMessage}`);
  });
}

async function showResult(interaction) {
  let lowCount = 0,
    mediumCount = 0,
    highCount = 0;
  usersVotes.forEach((user) => {
    if (user.vote == "low") lowCount++;
    if (user.vote == "medium") mediumCount++;
    if (user.vote == "high") highCount++;
  });

  if (lowCount > mediumCount && lowCount > highCount)
    await interaction.channel.send(`Resultado final: 🟢 (prioridade baixa)`);
  else if (mediumCount > lowCount && mediumCount > highCount)
    await interaction.channel.send(`Resultado final: 🟡 (prioridade média)`);
  else if (highCount > lowCount && highCount > mediumCount)
    await interaction.channel.send(`Resultado final: 🔴 (prioridade alta)`);
  else if (highCount == lowCount && highCount != 0)
    await interaction.channel.send(`Resultado final: 🟡 (prioridade média)`);
  else if (lowCount == mediumCount || mediumCount == highCount || mediumCount != 0) {
    usersVotes = [];
    await interaction.channel.send(
      "\n------------------------------------------------------------------------------\n"
    );
    await interaction.channel.send(
      renderVotingMessage("Aconteceu um empate! Vamos votar novamente.")
    );
    return;
  }

  usersVotes = [];
  await interaction.channel.send(
    "\n------------------------------------------------------------------------------\n"
  );
  await interaction.channel.send(renderVotingMessage("Vamos votar a prioridade."));
}

async function removeButtons(interaction) {
  const fetched = await interaction.channel.messages.fetch({ limit : 10 });
  fetched.forEach(async (item) => {
    if (item.components.length)
      await item.edit({
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("low")
              .setLabel("Baixa")
              .setStyle("SECONDARY")
              .setEmoji("🟢")
              .setDisabled(true),
            new MessageButton()
              .setCustomId("medium")
              .setLabel("Média")
              .setStyle("SECONDARY")
              .setEmoji("🟡")
              .setDisabled(true),
            new MessageButton()
              .setCustomId("high")
              .setLabel("Alta")
              .setStyle("SECONDARY")
              .setEmoji("🔴")
              .setDisabled(true)
          ),

          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("end-pr")
              .setLabel("Encerrar votação")
              .setStyle("SUCCESS")
              .setDisabled(true),
            new MessageButton()
              .setCustomId("next-pr")
              .setLabel("Finalizar planning")
              .setStyle("PRIMARY")
              .setDisabled(true)
          ),
        ],
      });
  });
}

async function timer(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  })
}