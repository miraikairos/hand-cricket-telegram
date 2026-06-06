const TelegramBot = require("node-telegram-bot-api");
const token = process.env.BOT_TOKEN;

const express = require("express");

const app = express();

const bot = new TelegramBot(token);

app.use(express.json());
const rooms = {};

function createRoomCode() {
  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();
}
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

  overs: null,
maxBalls: null,
waitingOvers: true,

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
bot.onText(/\/overs (.+)/, (msg, match) => {

  const roomCode = msg.chat.id;

  if (!rooms[roomCode]) return;

  const room = rooms[roomCode];

  const overs = Number(match[1]);

  room.overs = overs;
  room.maxBalls = overs * 6;

  room.waitingOvers = false;

  bot.sendMessage(
    msg.chat.id,
    `✅ Match Overs Set To ${overs}`
  );
  // RANDOM TOSS
const tossWinner =
  Math.random() < 0.5 ? "A" : "B";

room.tossWinner = tossWinner;

bot.sendMessage(
  msg.chat.id,
  `🪙 Toss Won By Team ${tossWinner}

Choose:

/bat
or
/bowl`
);

});
bot.onText(/\/teamcreate/, (msg) => {

// SET OVERS


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
   overs: null,
maxBalls: null,
waitingOvers: true,
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

// RANDOM TOSS
room.started = true;

bot.sendMessage(
  msg.chat.id,
  `Choose Overs:

/overs 1
/overs 2
/overs 3
/overs 5`
);



});
// BAT FIRST
bot.onText(/\/bat/, (msg) => {

  const roomCode = msg.chat.id;

  const room = rooms[roomCode];

  if (!room) return;

  room.battingTeam = room.tossWinner;

  room.bowlingTeam =
    room.tossWinner === "A"
      ? "B"
      : "A";

  const battingPlayers =
    room.battingTeam === "A"
      ? room.teamA
      : room.teamB;

  const bowlingPlayers =
    room.bowlingTeam === "A"
      ? room.teamA
      : room.teamB;

  bot.sendMessage(
    msg.chat.id,
    `🏏 MATCH STARTED

🎯 Overs: ${room.overs}

🏏 Batting Team: ${room.battingTeam}
🥎 Bowling Team: ${room.bowlingTeam}

🏏 Batsman:
${battingPlayers[0].name}

🥎 Bowler:
${bowlingPlayers[0].name}`
  );

  bot.sendMessage(
    msg.chat.id,
    "Choose your number",
    getNumberButtons(roomCode)
  );

});

// BOWL FIRST
bot.onText(/\/bowl/, (msg) => {

  const roomCode = msg.chat.id;

  const room = rooms[roomCode];

  if (!room) return;

  room.bowlingTeam = room.tossWinner;

  room.battingTeam =
    room.tossWinner === "A"
      ? "B"
      : "A";

  const battingPlayers =
    room.battingTeam === "A"
      ? room.teamA
      : room.teamB;

  const bowlingPlayers =
    room.bowlingTeam === "A"
      ? room.teamA
      : room.teamB;

  bot.sendMessage(
    msg.chat.id,
    `🏏 MATCH STARTED

🎯 Overs: ${room.overs}

🏏 Batting Team: ${room.battingTeam}
🥎 Bowling Team: ${room.bowlingTeam}

🏏 Batsman:
${battingPlayers[0].name}

🥎 Bowler:
${bowlingPlayers[0].name}`
  );

  bot.sendMessage(
    msg.chat.id,
    "Choose your number",
    getNumberButtons(roomCode)
  );

});
// GAMEPLAY
function startTeamGame(room, chatId) {

  const battingPlayers =
    room.battingTeam === "A"
      ? room.teamA
      : room.teamB;

  const bowlingPlayers =
    room.bowlingTeam === "A"
      ? room.teamA
      : room.teamB;

  bot.sendMessage(
    chatId,
    `🏏 MATCH STARTED

🎯 Overs: ${room.overs}

🏏 Batting Team: ${room.battingTeam}
🥎 Bowling Team: ${room.bowlingTeam}

🏏 Batsman:
${battingPlayers[0].name}

🥎 Bowler:
${bowlingPlayers[0].name}`
  );

 

}
bot.on("callback_query", (query) => {

  const data = query.data;
  const userId = query.from.id;

  if (!data.startsWith("play_")) return;

  const parts = data.split("_");

  const roomCode = parts[1];
  const number = Number(parts[2]);

  const room = rooms[roomCode];

  if (!room) return;
// NORMAL MODE
// NORMAL MODE
if (room.mode === "normal") {

  const batsman =
    room.players.find(
      p => p.id === room.batting
    );

  const bowler =
    room.players.find(
      p => p.id === room.bowling
    );

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
`🏏 Ball ${room.balls}

🏏 ${batsman.name}: ${batsmanChoice}
🥎 ${bowler.name}: ${bowlerChoice}

`;

  // OUT
  if (batsmanChoice === bowlerChoice) {

    room.wickets++;

    message +=
      `❌ ${batsman.name} OUT!\n`;

    bot.sendVideo(
      query.message.chat.id,
      "videos/out.mp4"
    );

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
        `\n🎯 Target: ${room.target}`;

      message +=
        `\n\n🏏 Second Innings Begins`;

    }

    // SECOND INNINGS END
    else {

      let winner;

      if (room.score >= room.target) {

        winner = batsman.name;

      } else {

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

  // RUNS
  else {

    room.score += batsmanChoice;

    message +=
      `🏏 +${batsmanChoice} Runs\n`;

  }

  // TARGET INFO
  if (room.innings === 2) {

    const runsNeeded =
      room.target - room.score;

    message +=
      `\n🎯 Target: ${room.target}`;

    message +=
      `\nNeed ${runsNeeded} runs`;

    // CHASE COMPLETE
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

bot.sendVideo(
  query.message.chat.id,
  "videos/wait.mp4"
);

bot.sendMessage(
  query.message.chat.id,

  `${message}

🏏 Now Batter: ${batsman.name}
🥎 Bowler: ${bowler.name}

🎮 Send Number (1-6)`,

  getNumberButtons(roomCode)
);

  room.choices = {};

  return;

}
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

  // OUT VIDEO
  bot.sendVideo(
    query.message.chat.id,
    "out.mp4"
  );

  room.currentBatsman++;

} else {

  room.score += batsmanChoice;

  message += `🏏 +${batsmanChoice} Runs\n`;

  // 1 RUN
  if (batsmanChoice === 1) {

    bot.sendVideo(
      query.message.chat.id,
      "1-run.mp4"
    );

  }

  // 2 RUNS
  else if (batsmanChoice === 2) {

    bot.sendVideo(
      query.message.chat.id,
      "2-run.mp4"
    );

  }

  // 3 RUNS
  else if (batsmanChoice === 3) {

    bot.sendVideo(
      query.message.chat.id,
      "3-run.mp4"
    );

  }

  // FOUR
  else if (batsmanChoice === 4) {

    bot.sendVideo(
      query.message.chat.id,
      "4-run.mp4"
    );

  }

  // FIVE
  else if (batsmanChoice === 5) {

    bot.sendVideo(
      query.message.chat.id,
      "5-run.png"
    );

  }

  // SIX
  else if (batsmanChoice === 6) {

    bot.sendVideo(
      query.message.chat.id,
      "https://media.tenor.com/J-7D1Xft6a8AAAPo/cricket-six.mp4"
    );

  }

}

  message +=
  `\nScore: ${room.score}/${room.wickets}`;

if (room.innings === 2) {

  const runsNeeded =
    room.target - room.score;

  const ballsLeft =
    room.maxBalls - room.balls;
const requiredRunRate =
  (runsNeeded / (ballsLeft / 6)).toFixed(2);
  message +=
    `\n🎯 Target: ${room.target}`;

  message +=
    `\nNeed ${runsNeeded} runs in ${ballsLeft} balls`;

}

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
bot.sendVideo(
  query.message.chat.id,
  "https://media.tenor.com/2roX3uxz_68AAAPo/trophy-win.mp4"
);
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

  bot.sendVideo(
  query.message.chat.id,
  "videos/wait.mp4"
);

bot.sendMessage(
  query.message.chat.id,

  `${message}

🏏 Now Batter: ${batsman.name}
🥎 Bowler: ${bowler.name}

🎮 Send Number (1-6)`,

  getNumberButtons(roomCode)
);
    }

    room.choices = {};

  }

});

console.log("🏏 Hand Cricket Bot Running");
app.post(`/bot${token}`, (req, res) => {

  bot.processUpdate(req.body);

  res.sendStatus(200);

});

app.get("/", (req, res) => {
  res.send("Bot Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {

  console.log(`Server running on ${PORT}`);

});