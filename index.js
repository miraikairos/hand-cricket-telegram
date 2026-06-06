const TelegramBot = require("node-telegram-bot-api");

const token = "7646314468:AAG9cFzjxrVYBtsjwlUxJS1LZzHKgX1bBr4";

const bot = new TelegramBot(token, {
  polling: true,
});

const rooms = {};

function createRoomCode() {
  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
}

function getNumberButtons(roomCode) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "1", callback_data: `play_${roomCode}_1` },
          { text: "2", callback_data: `play_${roomCode}_2` },
          { text: "3", callback_data: `play_${roomCode}_3` },
        ],
        [
          { text: "4", callback_data: `play_${roomCode}_4` },
          { text: "5", callback_data: `play_${roomCode}_5` },
          { text: "6", callback_data: `play_${roomCode}_6` },
        ],
      ],
    },
  };
}

// START
bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,
    `🏏 Hand Cricket Arena

/create - 1v1 Match
/teamcreate - Team Match`
  );

});

// NORMAL CREATE
bot.onText(/\/create/, (msg) => {

  const roomCode = createRoomCode();

  rooms[roomCode] = {

    mode: "normal",

    players: [
      {
        id: msg.from.id,
        name: msg.from.first_name,
      },
    ],

    chats: [msg.chat.id],

    innings: 1,

    batting: null,
    bowling: null,

    score: 0,
    target: 0,

    wickets: 0,
    balls: 0,

    overs: 2,
    maxBalls: 12,

    choices: {},

    started: false,
  };

  bot.sendMessage(
    msg.chat.id,
    `🏏 Room Created

Code: ${roomCode}

Join using:
/join ${roomCode}`
  );

});

// TEAM CREATE
bot.onText(/\/teamcreate/, (msg) => {

  const roomCode = msg.chat.id;

rooms[roomCode] = {

    mode: "team",

    teamA: [],
    teamB: [],

    chats: [msg.chat.id],

    innings: 1,

    battingTeam: "A",
    bowlingTeam: "B",

    currentBatsman: 0,
    currentBowler: 0,

    score: 0,
    wickets: 0,

    balls: 0,
    overs: 2,
    maxBalls: 12,

    target: 0,

    choices: {},

    started: false,
  };

  bot.sendMessage(
    msg.chat.id,
    `🏏 TEAM MATCH CREATED

Join Team A:
/joinA

Join Team B:
/joinB

Start Match:
/startmatch`
  );

});

// JOIN NORMAL MATCH
bot.onText(/\/join (.+)/, (msg, match) => {

  const roomCode = match[1];

  if (!rooms[roomCode]) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
    );

    return;
  }

  const room = rooms[roomCode];

  if (room.mode !== "normal") {

    bot.sendMessage(
      msg.chat.id,
      "❌ Not a normal room"
    );

    return;
  }

  if (room.players.length >= 2) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Room Full"
    );

    return;
  }

  room.players.push({
    id: msg.from.id,
    name: msg.from.first_name,
  });

  room.chats.push(msg.chat.id);

  room.started = true;

  const tossWinner =
    room.players[Math.floor(Math.random() * 2)];

  room.batting = tossWinner.id;

  room.bowling =
    room.players.find(
      p => p.id !== tossWinner.id
    ).id;

  room.chats.forEach((chat) => {

    bot.sendMessage(
      chat,
      `🏏 Match Started

${tossWinner.name} bats first`
    );

    bot.sendMessage(
      chat,
      "Choose your number",
      getNumberButtons(roomCode)
    );

  });

});

// JOIN TEAM A
bot.onText(/\/joinA/,(msg, match) => {

  const roomCode = msg.chat.id;

  if (!rooms[roomCode]) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
    );

    return;
  }

  const room = rooms[roomCode];

  const alreadyJoined =
    room.teamA.find(
      p => p.id === msg.from.id
    ) ||
    room.teamB.find(
      p => p.id === msg.from.id
    );

  if (alreadyJoined) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Already joined"
    );

    return;
  }

  room.teamA.push({
    id: msg.from.id,
    name: msg.from.first_name,
  });

  bot.sendMessage(
    msg.chat.id,
    `✅ ${msg.from.first_name} joined Team A`
  );

});

// JOIN TEAM B
bot.onText(/\/joinB/, (msg, match) => {

  const roomCode = msg.chat.id;

  if (!rooms[roomCode]) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
    );

    return;
  }

  const room = rooms[roomCode];

  const alreadyJoined =
    room.teamA.find(
      p => p.id === msg.from.id
    ) ||
    room.teamB.find(
      p => p.id === msg.from.id
    );

  if (alreadyJoined) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Already joined"
    );

    return;
  }

  room.teamB.push({
    id: msg.from.id,
    name: msg.from.first_name,
  });

  bot.sendMessage(
    msg.chat.id,
    `✅ ${msg.from.first_name} joined Team B`
  );

});

// START TEAM MATCH
bot.onText(/\/startmatch/, (msg, match) => {

  const roomCode = msg.chat.id;

  if (!rooms[roomCode]) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
    );

    return;
  }

  const room = rooms[roomCode];

  if (
    room.teamA.length === 0 ||
    room.teamB.length === 0
  ) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Both teams need players"
    );

    return;
  }

  room.started = true;

  bot.sendMessage(
  msg.chat.id,
  `🏏 TEAM MATCH STARTED

Team A Players: ${room.teamA.length}
Team B Players: ${room.teamB.length}

🏏 Batsman: ${room.teamA[0].name}

🥎 Bowler: ${room.teamB[0].name}`
);

  bot.sendMessage(
    msg.chat.id,
    "Choose your number",
    getNumberButtons(roomCode)
  );

});

// GAMEPLAY
bot.on("callback_query", (query) => {

  const data = query.data;
  const userId = query.from.id;

  if (!data.startsWith("play_")) return;

  const parts = data.split("_");

  const roomCode = parts[1];
  const number = Number(parts[2]);

  const room = rooms[roomCode];

  if (!room) return;

  // TEAM MODE
  if (room.mode === "team") {

    const battingPlayers =
      room.battingTeam === "A"
        ? room.teamA
        : room.teamB;

    const bowlingPlayers =
      room.bowlingTeam === "A"
        ? room.teamA
        : room.teamB;

    const batsman =
      battingPlayers[room.currentBatsman];

    const bowler =
      bowlingPlayers[room.currentBowler];

    if (!batsman || !bowler) return;

    if (
      userId !== batsman.id &&
      userId !== bowler.id
    ) {

      bot.answerCallbackQuery(query.id, {
        text: "Not your turn",
      });

      return;
    }

    room.choices[userId] = number;

    if (Object.keys(room.choices).length < 2) {

      bot.answerCallbackQuery(query.id, {
        text: "Waiting for opponent...",
      });

      return;
    }

    const batsmanChoice =
      room.choices[batsman.id];

    const bowlerChoice =
      room.choices[bowler.id];

    room.balls++;
let message =
  `🏏 Ball ${room.balls}/${room.maxBalls}

🏏 Batsman: ${batsman.name}
🥎 Bowler: ${bowler.name}

`;

    message +=
      `${batsman.name}: ${batsmanChoice}\n`;

    message +=
      `${bowler.name}: ${bowlerChoice}\n\n`;

    if (batsmanChoice === bowlerChoice) {

      room.wickets++;

      message += `❌ ${batsman.name} OUT!\n`;

      room.currentBatsman++;

    } else {

      room.score += batsmanChoice;

      message += `🏏 +${batsmanChoice} Runs\n`;

    }

    message +=
      `\nScore: ${room.score}/${room.wickets}`;

    const inningsEnd =
      room.currentBatsman >= battingPlayers.length ||
      room.balls >= room.maxBalls;

    if (inningsEnd) {

      if (room.innings === 1) {

        room.target = room.score + 1;

        room.innings = 2;

        room.score = 0;
        room.wickets = 0;
        room.balls = 0;

        room.currentBatsman = 0;

        const temp = room.battingTeam;
        room.battingTeam = room.bowlingTeam;
        room.bowlingTeam = temp;

        message +=
          `\n\n🎯 Target: ${room.target}`;

        bot.sendMessage(
          query.message.chat.id,
          message
        );

        bot.sendMessage(
          query.message.chat.id,
          "🏏 Second Innings Begins",
          getNumberButtons(roomCode)
        );

      } else {

        let winner;

        if (room.score >= room.target) {
          winner = room.battingTeam;
        } else {
          winner = room.bowlingTeam;
        }

        message +=
          `\n\n🏆 Team ${winner} Wins`;

        bot.sendMessage(
          query.message.chat.id,
          message
        );

        delete rooms[roomCode];

      }

    } else {

      if (
        room.innings === 2 &&
        room.score >= room.target
      ) {

        message +=
          `\n\n🏆 Team ${room.battingTeam} Wins`;

        bot.sendMessage(
          query.message.chat.id,
          message
        );

        delete rooms[roomCode];

        return;
      }

      bot.sendMessage(
        query.message.chat.id,
        message,
        getNumberButtons(roomCode)
      );

    }

    room.choices = {};

  }

});

console.log("🏏 Hand Cricket Bot Running");