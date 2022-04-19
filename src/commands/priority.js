const { MessageActionRow, MessageButton } = require("discord.js");

var usersVotes = [];
let userMain = "";

module.exports = {
  init: async (interaction) => {
    userMain = interaction.member.user.id;
    await interaction.reply("\n────────────────────────────────────────\n");
    await interaction.channel.send("O nosso Priority Planning vai começar!");
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
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

    await interaction.channel.send(`<@${interaction.member.user.id}> já votou`);
  },

  next: async (interaction) => {
    if (userMain != interaction.member.user.id) return;
    await removeButtons(interaction);
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
    await interaction.channel.send("Priority Planning finalizado!");
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
  },

  finish: async (interaction) => {
    if (userMain != interaction.member.user.id) return;
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

    switch (user.vote) {
      case "low":
        voteMessage = "🟢 (prioridade baixa)";
        break;
      case "medium":
        voteMessage = "🟡 (prioridade média)";
        break;
      case "high":
        voteMessage = "🔴 (prioridade alta)";
        break;
      default:
        voteMessage = "🟡 (prioridade média)";
    }

    await interaction.channel.send(`<@${user.userId}> votou: ${voteMessage}`);
  });
}

async function showResult(interaction) {
  let lowCount = 0,
    mediumCount = 0,
    highCount = 0;

  usersVotes.forEach((user) => {
    switch (user.vote) {
      case "low":
        lowCount++;
        break;
      case "medium":
        mediumCount++;
        break;
      case "high":
        highCount++;
        break;
      default:
        voteMessage = mediumCount++;
    }
  });

  if (lowCount > mediumCount && lowCount > highCount)
    await interaction.channel.send(
      `**Resultado final: 🟢 (prioridade baixa)**`
    );
  else if (mediumCount > lowCount && mediumCount > highCount)
    await interaction.channel.send(
      `**Resultado final: 🟡 (prioridade média)**`
    );
  else if (highCount > lowCount && highCount > mediumCount)
    await interaction.channel.send(`**Resultado final: 🔴 (prioridade alta)**`);
  else if (highCount == lowCount && highCount != 0)
    await interaction.channel.send(
      `**Resultado final: 🟡 (prioridade média)**`
    );
  else if (
    lowCount == mediumCount ||
    mediumCount == highCount ||
    mediumCount != 0
  ) {
    const selectedVoters = [];
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );

    if (lowCount == mediumCount) {
      selectedVoters = chooseUser(["low", "medium"]);
      await interaction.channel.send(
        renderVotingMessage(
          `Aconteceu um empate entre 🟢 e 🟡! <@${selectedVoters[0]}> e <@${selectedVoters[1]}>, justifiquem o seu voto e todos votem novamente!`
        )
      );
    } else if (mediumCount == highCount) {
      selectedVoters = chooseUser(["medium", "high"]);
      await interaction.channel.send(
        renderVotingMessage(
          `Aconteceu um empate entre 🟡 e 🔴! <@${selectedVoters[0]}> e <@${selectedVoters[1]}>, justifiquem o seu voto e todos votem novamente!`
        )
      );
    }

    usersVotes = [];
    return;
  }

  usersVotes = [];
  await interaction.channel.send(
    "\n────────────────────────────────────────\n"
  );
  await interaction.channel.send(
    renderVotingMessage("Vamos votar a prioridade.")
  );
}

async function removeButtons(interaction) {
  const fetched = await interaction.channel.messages.fetch({ limit: 10 });
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

function chooseUser(votes) {
  const voters = [[], []];
  const selectedVoters = [];
  usersVotes.forEach((vote) => {
    if (vote.vote == votes[0]) voters[0].push(vote.userId);
    if (vote.vote == votes[1]) voters[1].push(vote.userId);
  });
  voters.forEach((_voters) => {
    const index = Math.floor(Math.random() * _voters.length);
    selectedVoters.push(_voters[index]);
  });

  return selectedVoters;
}
