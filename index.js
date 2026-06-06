const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN;

const app = express();

const bot = new TelegramBot(token);

app.use(express.json());

const rooms = {};

// =========================
// CREATE ROOM CODE
// =========================

function createRoomCode() {

  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

}

// =========================
// BOWLING BUTTONS
// =========================

function getBowlingButtons(roomCode) {

  return {

    reply_markup: {

      inline_keyboard: [

        [
          {
            text: "1",
            callback_data: `bowl_${roomCode}_1`
          },

          {
            text: "2",
            callback_data: `bowl_${roomCode}_2`
          },

          {
            text: "3",
            callback_data: `bowl_${roomCode}_3`
          }

        ],

        [
          {
            text: "4",
            callback_data: `bowl_${roomCode}_4`
          },

          {
            text: "5",
            callback_data: `bowl_${roomCode}_5`
          },

          {
            text: "6",
            callback_data: `bowl_${roomCode}_6`
          }

        ]

      ]

    }

  };

}

// =========================
// START
// =========================

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(

    msg.chat.id,

`🏏 Hand Cricket Arena

/create - 1v1 Match`

  );

});

// =========================
// CREATE MATCH
// =========================

bot.onText(/\/create/, (msg) => {

  const roomCode = createRoomCode();

  rooms[roomCode] = {

    players: [

      {
        id: msg.from.id,
        name: msg.from.first_name
      }

    ],

    innings: 1,

    batting: null,
    bowling: null,

    score: 0,
    target: 0,

    wickets: 0,
    balls: 0,

    choices: {}

  };

  bot.sendMessage(

    msg.chat.id,

`🏏 Room Created

Code: ${roomCode}

Join using:
/join ${roomCode}`

  );

});

// =========================
// JOIN MATCH
// =========================

bot.onText(/\/join (.+)/, (msg, match) => {

  const roomCode = match[1];

  const room = rooms[roomCode];

  if (!room) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
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
    name: msg.from.first_name

  });

  // RANDOM TOSS

  const tossWinner =
    room.players[Math.floor(Math.random() * 2)];

  room.batting = tossWinner.id;

  room.bowling =
    room.players.find(
      p => p.id !== tossWinner.id
    ).id;

  const batsman =
    room.players.find(
      p => p.id === room.batting
    );

  const bowler =
    room.players.find(
      p => p.id === room.bowling
    );

  bot.sendMessage(

    msg.chat.id,

`🏏 Match Started

🏏 Batter:
${batsman.name}

🥎 Bowler:
${bowler.name}

🏏 Batter sends number in group
🥎 Bowler receives buttons in DM`

  );

  // SEND BOWLER DM

  bot.sendMessage(

    bowler.id,

    "🥎 Choose Bowling Number",

    getBowlingButtons(roomCode)

  ).catch(() => {

    bot.sendMessage(

      msg.chat.id,

`⚠️ ${bowler.name} must start bot in DM first

https://t.me/strangerfrndmusicbot`

    );

  });

});

// =========================
// BATSMAN TYPES NUMBER
// =========================

bot.on("message", (msg) => {

  const text = msg.text;

  if (!text) return;

  const number = Number(text);

  if (
    number < 1 ||
    number > 6
  ) return;

  Object.keys(rooms).forEach((roomCode) => {

    const room = rooms[roomCode];

    if (!room) return;

    const batsman =
      room.players.find(
        p => p.id === room.batting
      );

    if (!batsman) return;

    if (msg.from.id !== batsman.id) return;

    room.choices[batsman.id] = number;

  });

});

// =========================
// CALLBACKS
// =========================

bot.on("callback_query", async (query) => {

  const data = query.data;

  if (!data.startsWith("bowl_")) return;

  const parts = data.split("_");

  const roomCode = parts[1];

  const number = Number(parts[2]);

  const room = rooms[roomCode];

  if (!room) return;

  const batsman =
    room.players.find(
      p => p.id === room.batting
    );

  const bowler =
    room.players.find(
      p => p.id === room.bowling
    );

  room.choices[bowler.id] = number;

  // WAIT FOR BATSMAN

  if (
    room.choices[batsman.id] === undefined
  ) {

    bot.answerCallbackQuery(query.id, {

      text: "Waiting for batsman"

    });

    return;

  }

  const batsmanChoice =
    room.choices[batsman.id];

  const bowlerChoice =
    room.choices[bowler.id];

  room.balls++;

  let message =
`🏏 Ball ${room.balls}

🏏 ${batsman.name}: ${batsmanChoice}
🥎 ${bowler.name}: ${bowlerChoice}

`;

  // =========================
  // OUT
  // =========================

  if (batsmanChoice === bowlerChoice) {

    room.wickets++;

    message +=
      `❌ ${batsman.name} OUT!\n`;

    // FIRST INNINGS END

    if (room.innings === 1) {

      room.target = room.score + 1;

      room.innings = 2;

      room.score = 0;

      room.wickets = 0;

      room.balls = 0;

      // SWAP PLAYERS

      const temp = room.batting;

      room.batting = room.bowling;

      room.bowling = temp;

      message +=
`\n🎯 Target: ${room.target}

🏏 Second Innings Begins`;

    }

    // MATCH END

    else {

      let winner;

      if (room.score >= room.target) {

        winner = batsman.name;

      }

      else {

        winner = bowler.name;

      }

      message +=
        `\n\n🏆 ${winner} Wins`;

      bot.sendMessage(
        query.message.chat.id,
        message
      );

      delete rooms[roomCode];

      return;

    }

  }

  // =========================
  // RUNS
  // =========================

  else {

    room.score += batsmanChoice;

    message +=
      `🏏 +${batsmanChoice} Runs\n`;

  }

  // =========================
  // TARGET INFO
  // =========================

  if (room.innings === 2) {

    const runsNeeded =
      room.target - room.score;

    message +=
      `\n🎯 Target: ${room.target}`;

    message +=
      `\nNeed ${runsNeeded} runs`;

    // WIN

    if (room.score >= room.target) {

      message +=
        `\n\n🏆 ${batsman.name} Wins`;

      bot.sendMessage(
        query.message.chat.id,
        message
      );

      delete rooms[roomCode];

      return;

    }

  }

  message +=
    `\nScore: ${room.score}/${room.wickets}`;

  // RESET CHOICES

  room.choices = {};

  // UPDATED PLAYERS

  const newBatsman =
    room.players.find(
      p => p.id === room.batting
    );

  const newBowler =
    room.players.find(
      p => p.id === room.bowling
    );

  // GROUP MESSAGE

  bot.sendMessage(

    query.message.chat.id,

`${message}

🏏 Batter:
${newBatsman.name}

🥎 Bowler:
${newBowler.name}

🏏 ${newBatsman.name} send number in group`

  );

  // SEND NEW BOWLER DM

  bot.sendMessage(

    newBowler.id,

    "🥎 Choose Bowling Number",

    getBowlingButtons(roomCode)

  ).catch(() => {

    bot.sendMessage(

      query.message.chat.id,

`⚠️ ${newBowler.name} must start bot in DM first

https://t.me/strangerfrndmusicbot`

    );

  });

});

// =========================
// WEBHOOK
// =========================

app.post(`/bot${token}`, (req, res) => {

  bot.processUpdate(req.body);

  res.sendStatus(200);

});

// =========================
// HOME
// =========================

app.get("/", (req, res) => {

  res.send("Bot Running");

});

// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );

});