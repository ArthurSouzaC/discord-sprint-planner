const {
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");

let usersVotes = [];
let userMain = "";

module.exports = {
  init: async (interaction) => {
    userMain = interaction.member.user.id;
    await interaction.reply("\n────────────────────────────────────────\n");
    await interaction.channel.send("O nosso Poker Planning vai começar!");
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
    await interaction.channel.send(
      await renderVotingMessage("Vamos votar a dificuldade.")
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
      ].vote = interaction.values[0];
      return;
    }

    usersVotes.push({
      userId: interaction.member.user.id,
      name: interaction.member.nickname || interaction.member.user.username,
      vote: interaction.values[0],
    });

    await interaction.channel.send(`<@${interaction.member.user.id}> já votou`);
  },

  next: async (interaction) => {
    if (userMain != interaction.member.user.id) return;
    await removeButtons(interaction);
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
    await interaction.channel.send("Poker Planning finalizado!");
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
  },

  finish: async (interaction) => {
    if (userMain != interaction.member.user.id) return;
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
    await removeButtons(interaction);
    await showVotes(interaction);
    await showResult(interaction);
  },
};

const fib_nums = ["1", "2", "3", "5", "8", "13", "21", "34", "55", "89"];
const options = fib_nums.map((num) => ({ label: num, value: num }));

async function renderVotingMessage(message) {
  return {
    content: message,
    components: [
      new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("select")
          .setPlaceholder("Selecione...")
          .addOptions(options)
      ),

      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("end-pk")
          .setLabel("Encerrar votação")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("next-pk")
          .setLabel("Finalizar planning")
          .setStyle("PRIMARY")
      ),
    ],
  };
}

async function showVotes(interaction) {
  usersVotes.forEach(async (user) => {
    const voteMessage = user.vote;
    await interaction.channel.send(`<@${user.userId}> votou: ${voteMessage}`);
  });
}

async function showResult(interaction) {
  let usersVotesSorted = usersVotes.map((item) => item.vote);
  usersVotesSorted = usersVotesSorted.sort((a, b) => a - b);
  const lowest = usersVotesSorted[0] || "0";
  const highest = usersVotesSorted[usersVotesSorted.length - 1] || "0";

  const positionInArray = {
    lowest: fib_nums.findIndex(
      (element, index, array) => element == lowest.toString()
    ),
    highest: fib_nums.findIndex(
      (element, index, array) => element == highest.toString()
    ),
  };

  const votesCount = {
    1: 0,
    2: 0,
    3: 0,
    5: 0,
    8: 0,
    13: 0,
    21: 0,
    34: 0,
    55: 0,
    89: 0,
  };

  usersVotes.forEach((userVote) => {
    votesCount[userVote.vote]++;
  });

  const max = Math.max(...Object.values(votesCount));

  const indexes = [];

  for (let index = 0; index < Object.values(votesCount).length; index++) {
    if (Object.values(votesCount)[index] === max) {
      indexes.push(index);
    }
  }

  if (positionInArray.highest - positionInArray.lowest >= 2) {
    const selectedVoters = chooseUser([highest, lowest]);
    await interaction.channel.send(
      "\n────────────────────────────────────────\n"
    );
    await interaction.channel.send(
      await renderVotingMessage(
        `Aconteceu uma divergência entre ${lowest} e ${highest}! <@${selectedVoters[1]}> e <@${selectedVoters[0]}>, justifiquem o seu voto e todos votem novamente!`
      )
    );
    usersVotes = [];
    return;
  } else if (positionInArray.highest == positionInArray.lowest) {
    await interaction.channel.send(`**Resultado final: ${parseInt(lowest)}**`);
  } else {
    if (indexes.length == 1) {
      await interaction.channel.send(
        `**Resultado final: ${Object.keys(votesCount)[indexes[0]]}**`
      );
    } else {
      await interaction.channel.send(
        `**Resultado final: ${(parseInt(lowest) + parseInt(highest)) / 2}**`
      );
    }
  }

  usersVotes = [];
  await interaction.channel.send(
    "\n────────────────────────────────────────\n"
  );
  await interaction.channel.send(
    await renderVotingMessage("Vamos votar a dificuldade.")
  );
}

async function removeButtons(interaction) {
  const fetched = await interaction.channel.messages.fetch({ limit: 20 });
  fetched.forEach(async (item) => {
    if (item.components.length)
      await item.edit({
        components: [
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("select")
              .setPlaceholder("Selecione...")
              .addOptions(options)
              .setDisabled(true)
          ),

          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("end-pk")
              .setLabel("Encerrar votação")
              .setStyle("SUCCESS")
              .setDisabled(true),
            new MessageButton()
              .setCustomId("next-pk")
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
  let selectedVoters = [];

  usersVotes.forEach((vote) => {
    vote.vote == votes[0] && voters[0].push(vote.userId);
    vote.vote == votes[1] && voters[1].push(vote.userId);
  });

  voters.forEach((_voters) => {
    const index = Math.floor(Math.random() * _voters.length);
    selectedVoters.push(_voters[index]);
  });

  return selectedVoters;
}

async function timer(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}
