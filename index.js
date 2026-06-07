/*

🏏 FULL HAND CRICKET TELEGRAM BOT

✅ 1v1 Mode
✅ Team Mode
✅ Overs
✅ Toss
✅ Bat / Bowl
✅ DM Bowling
✅ Group Batting
✅ Innings
✅ Target Chasing
✅ Videos
✅ Webhook
✅ Render Ready

*/

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN;

const app = express();

const bot = new TelegramBot(token);

app.use(express.json());

const rooms = {};

// ======================================
// ROOM CODE
// ======================================

function createRoomCode() {

  return Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

}

// ======================================
// BOWLING BUTTONS
// ======================================

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

// ======================================
// SEND RUN VIDEOS
// ======================================

async function sendRunVideo(chatId, runs){

  if (runs === 1) {

 return bot.sendVideo(chatId, "1-run.mp4");

  }

  else if (runs === 2) {

    return bot.sendVideo(chatId, "2-run.mp4");

  }

  else if (runs === 3) {

   return  bot.sendVideo(chatId, "3-run.mp4");

  }

  else if (runs === 4) {

  return   bot.sendVideo(chatId, "4-run.mp4");

  }

  else if (runs === 5) {

 return    bot.sendPhoto(chatId, "5-run.png");

  }

  else if (runs === 6) {

   return  bot.sendVideo(
      chatId,
      "6-run.mp4"
    );

  }

}

// ======================================
// SEND BOWLER DM
// ======================================

async function sendBowlerDM(
  bowler,
  roomCode,
  groupChat
) {

  return bot.sendMessage(
    bowler.id,
    "🥎 Choose Bowling Number",
    getBowlingButtons(roomCode)
  )

  .catch(() => {

    bot.sendMessage(
      groupChat,

`⚠️ ${bowler.name} must start bot in DM first

https://t.me/strangerfrndmusicbot

Then press /start`
    );

  });

}

// ======================================
// START
// ======================================

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(

    msg.chat.id,

`🏏 HAND CRICKET ARENA

/create - 1v1 Match

/teamcreate - Team Match`

  );

});

// ======================================
// CREATE 1V1
// ======================================

bot.onText(/\/create/, (msg) => {

  const roomCode = createRoomCode();

  rooms[roomCode] = {

    mode: "normal",

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

Join:
/join ${roomCode}`

  );

});

// ======================================
// JOIN 1V1
// ======================================

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

`🏏 MATCH STARTED

🏏 Batter:
${batsman.name}

🥎 Bowler:
${bowler.name}

🏏 Batter sends number in group
🥎 Bowler receives buttons in DM`

  );

  sendBowlerDM(
    bowler,
    roomCode,
    msg.chat.id
  );

});

// ======================================
// TEAM CREATE
// ======================================

bot.onText(/\/teamcreate/, (msg) => {
 console.log("TEAMCREATE WORKING");
  const roomCode =
    String(msg.chat.id);

  rooms[roomCode] = {
 groupChat: msg.chat.id,
    mode: "team",

    teamA: [],
    teamB: [],

    innings: 1,

    battingTeam: null,
    bowlingTeam: null,

    currentBatsman: 0,
    currentBowler: 0,

    overs: null,
    maxBalls: null,

    score: 0,
    wickets: 0,
    balls: 0,

    target: 0,

    choices: {}

  };

  bot.sendMessage(

    msg.chat.id,

`🏏 TEAM MATCH CREATED

Join Team A:
/joinA

Join Team B:
/joinB

Start:
/startmatch`

  );

});

// ======================================
// JOIN A
// ======================================

bot.onText(/\/joinA/, (msg) => {

  const roomCode = String(msg.chat.id);

  const room = rooms[roomCode];

  if (!room) {
    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
    );
    return;
  }

  // already in Team A
  if (
    room.teamA.find(
      p => p.id === msg.from.id
    )
  ) {

    bot.sendMessage(
      msg.chat.id,
      "⚠️ Already joined Team A"
    );

    return;
  }

  // already in Team B
  if (
    room.teamB.find(
      p => p.id === msg.from.id
    )
  ) {

    bot.sendMessage(
      msg.chat.id,
      "❌ You already joined Team B"
    );

    return;
  }

  room.teamA.push({
    id: msg.from.id,
    name: msg.from.first_name
  });

  bot.sendMessage(
    msg.chat.id,
    `✅ ${msg.from.first_name} joined Team A`
  );

});

// ======================================
// JOIN B
// ======================================

bot.onText(/\/joinB/, (msg) => {

  const roomCode = String(msg.chat.id);

  const room = rooms[roomCode];

  if (!room) {
    bot.sendMessage(
      msg.chat.id,
      "❌ Room not found"
    );
    return;
  }

  // already in Team B
  if (
    room.teamB.find(
      p => p.id === msg.from.id
    )
  ) {

    bot.sendMessage(
      msg.chat.id,
      "⚠️ Already joined Team B"
    );

    return;
  }

  // already in Team A
  if (
    room.teamA.find(
      p => p.id === msg.from.id
    )
  ) {

    bot.sendMessage(
      msg.chat.id,
      "❌ You already joined Team A"
    );

    return;
  }

  room.teamB.push({
    id: msg.from.id,
    name: msg.from.first_name
  });

  bot.sendMessage(
    msg.chat.id,
    `✅ ${msg.from.first_name} joined Team B`
  );

});

// ======================================
// START TEAM MATCH
// ======================================

bot.onText(/\/startmatch/, (msg) => {

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) return;

  bot.sendMessage(

    msg.chat.id,

`Choose Overs

/overs 1
/overs 2
/overs 3
/overs 5`

  );

});

// ======================================
// OVERS
// ======================================

bot.onText(/\/overs (.+)/, (msg, match) => {

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) return;

  const overs =
    Number(match[1]);

  room.overs = overs;

  room.maxBalls =
    overs * 6;

  room.tossWinner =
    Math.random() < 0.5
      ? "A"
      : "B";

  bot.sendMessage(

    msg.chat.id,

`🪙 Toss won by Team ${room.tossWinner}

Choose:

/bat
or
/bowl`

  );

});

// ======================================
// BAT
// ======================================

bot.onText(/\/bat/, (msg) => {

  startTeamGame(
    msg,
    true
  );

});

// ======================================
// BOWL
// ======================================

bot.onText(/\/bowl/, (msg) => {

  startTeamGame(
    msg,
    false
  );

});

// ======================================
// START TEAM GAME
// ======================================

async function startTeamGame(
  msg,
  batFirst
) {

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) return;

  if (batFirst) {

    room.battingTeam =
      room.tossWinner;

    room.bowlingTeam =
      room.tossWinner === "A"
        ? "B"
        : "A";

  }

  else {

    room.bowlingTeam =
      room.tossWinner;

    room.battingTeam =
      room.tossWinner === "A"
        ? "B"
        : "A";

  }

  const battingPlayers =
    room.battingTeam === "A"
      ? room.teamA
      : room.teamB;

  const bowlingPlayers =
    room.bowlingTeam === "A"
      ? room.teamA
      : room.teamB;

  const batsman =
    battingPlayers[0];

  const bowler =
    bowlingPlayers[0];

await bot.sendMessage(

  msg.chat.id,

`🏏 MATCH STARTED

🎯 Overs:
${room.overs}

🏏 Batting Team:
${room.battingTeam}

🥎 Bowling Team:
${room.bowlingTeam}

🏏 Batter:
${batsman.name}

🥎 Bowler:
${bowler.name}`

);

await sendBowlerDM(
  bowler,
  roomCode,
  msg.chat.id
);

}

// ======================================
// BATTER TYPES NUMBER
// ======================================

bot.on("message", (msg) => {

  const number =
    Number(msg.text);

  if (
    number < 1 ||
    number > 6
  ) return;

  Object.keys(rooms).forEach((roomCode) => {

    const room =
      rooms[roomCode];

    if (!room) return;

    // NORMAL

    if (room.mode === "normal") {

      const batsman =
        room.players.find(
          p => p.id === room.batting
        );

      if (
        batsman &&
        msg.from.id === batsman.id
      ) {

        room.choices[
          batsman.id
        ] = number;
   

      }

    }

    // TEAM

    else {

      const battingPlayers =
        room.battingTeam === "A"
          ? room.teamA
          : room.teamB;

      const batsman =
        battingPlayers[
          room.currentBatsman
        ];

      if (
        batsman &&
        msg.from.id === batsman.id
      ) {

        room.choices[
          batsman.id
        ] = number;
   
      }

    }

  });

});

// ======================================
// CALLBACK
// ======================================

bot.on("callback_query", (query) => {

  const data =
    query.data;

  if (
    !data.startsWith("bowl_")
  ) return;

  const parts =
    data.split("_");

  const roomCode =
    parts[1];

  const number =
    Number(parts[2]);

  const room =
    rooms[roomCode];

  if (!room) return;

  // NORMAL

  if (room.mode === "normal") {

    const batsman =
      room.players.find(
        p => p.id === room.batting
      );

    const bowler =
      room.players.find(
        p => p.id === room.bowling
      );

    room.choices[
      bowler.id
    ] = number;

    if (
      room.choices[
        batsman.id
      ] === undefined
    ) {

      bot.answerCallbackQuery(
        query.id,
        {
          text:
            "Waiting for batsman"
        }
      );

      return;

    }

    playNormalBall(
      room,
      roomCode,
      query.message.chat.id,
      batsman,
      bowler
    );

  }

  // TEAM

  else {

    const battingPlayers =
      room.battingTeam === "A"
        ? room.teamA
        : room.teamB;

    const bowlingPlayers =
      room.bowlingTeam === "A"
        ? room.teamA
        : room.teamB;

    const batsman =
      battingPlayers[
        room.currentBatsman
      ];

    const bowler =
      bowlingPlayers[
        room.currentBowler
      ];

    room.choices[
      bowler.id
    ] = number;
    bot.sendMessage(
  query.message.chat.id,

`🥎 ${bowler.name} selected bowling number

🏏 ${batsman.name}, send your number now`
);

    if (
      room.choices[
        batsman.id
      ] === undefined
    ) {

      bot.answerCallbackQuery(
        query.id,
        {
          text:
            "Waiting for batsman"
        }
      );

      return;

    }

    playTeamBall(
      room,
      roomCode,
      room.groupChat,
      batsman,
      bowler
    );

  }

});

// ======================================
// NORMAL BALL
// ======================================

function playNormalBall(
  room,
  roomCode,
  chatId,
  batsman,
  bowler
) {

  const bat =
    room.choices[
      batsman.id
    ];

  const bowl =
    room.choices[
      bowler.id
    ];

  room.balls++;

  let message =
`🏏 Ball ${room.balls}

🏏 ${batsman.name}: ${bat}
🥎 ${bowler.name}: ${bowl}

`;

  // OUT

  if (bat === bowl) {

    bot.sendVideo(
      chatId,
      "out.mp4"
    );

    if (
      room.innings === 1
    ) {

      room.target =
        room.score + 1;

      room.innings = 2;

      room.score = 0;

      room.balls = 0;

      const temp =
        room.batting;

      room.batting =
        room.bowling;

      room.bowling =
        temp;

      message +=
`\n❌ OUT

🎯 Target:
${room.target}

🏏 Second Innings`;

    }

    else {

      message +=
`\n❌ OUT

🏆 ${bowler.name} Wins`;

      bot.sendMessage(
        chatId,
        message
      );

      delete rooms[
        roomCode
      ];

      return;

    }

  }

  // RUNS

  else {

    room.score += bat;

    await sendRunVideo(
  chatId,
  bat
);

    message +=
      `🏏 +${bat} Runs`;

  }

  // CHASE COMPLETE

  if (
    room.innings === 2 &&
    room.score >= room.target
  ) {

    message +=
`\n🏆 ${batsman.name} Wins`;

    bot.sendMessage(
      chatId,
      message
    );

    delete rooms[
      roomCode
    ];

    return;

  }

  message +=
`\n\nScore:
${room.score}`;

  room.choices = {};

  const newBatsman =
    room.players.find(
      p => p.id === room.batting
    );

  const newBowler =
    room.players.find(
      p => p.id === room.bowling
    );

await bot.sendMessage(
  chatId,
  message
);

await bot.sendVideo(
  chatId,
  "wait.mp4"
);

  sendBowlerDM(
    newBowler,
    roomCode,
    chatId
  );

}

// ======================================
// TEAM BALL
// ======================================

async function playTeamBall(
  room,
  roomCode,
  chatId,
  batsman,
  bowler
) {

  const bat =
    room.choices[
      batsman.id
    ];

  const bowl =
    room.choices[
      bowler.id
    ];

  room.balls++;

  let message =
`🏏 Ball ${room.balls}/${room.maxBalls}

🏏 ${batsman.name}: ${bat}
🥎 ${bowler.name}: ${bowl}

`;

  // OUT

  if (bat === bowl) {

    bot.sendVideo(
      chatId,
      "out.mp4"
    );

    room.wickets++;

    room.currentBatsman++;

    message +=
      `❌ OUT`;

  }

  // RUNS

  else {

    room.score += bat;

    await sendRunVideo(
  chatId,
  bat
);

    message +=
      `🏏 +${bat} Runs`;

  }

  message +=
`\n\nScore:
${room.score}/${room.wickets}`;

  // TARGET

  if (
    room.innings === 2
  ) {

    const need =
      room.target -
      room.score;

    const ballsLeft =
      room.maxBalls -
      room.balls;

    message +=
`\n🎯 Target:
${room.target}

Need ${need} in ${ballsLeft} balls`;

  }

  room.choices = {};

 await bot.sendMessage(
  chatId,
  message
);

await bot.sendVideo(
  chatId,
  "wait.mp4"
);

  const battingPlayers =
    room.battingTeam === "A"
      ? room.teamA
      : room.teamB;

  const bowlingPlayers =
    room.bowlingTeam === "A"
      ? room.teamA
      : room.teamB;

  const newBatsman =
    battingPlayers[
      room.currentBatsman
    ];

  const newBowler =
    bowlingPlayers[
      room.currentBowler
    ];

  // INNINGS END

  if (
    !newBatsman ||
    room.balls >= room.maxBalls
  ) {

    if (
      room.innings === 1
    ) {

      room.target =
        room.score + 1;

      room.innings = 2;

      room.score = 0;
      room.wickets = 0;
      room.balls = 0;

      room.currentBatsman = 0;

      const temp =
        room.battingTeam;

      room.battingTeam =
        room.bowlingTeam;

      room.bowlingTeam =
        temp;

      bot.sendMessage(

        chatId,

`🎯 Target:
${room.target}

🏏 Second Innings Begins`

      );

      return;

    }

    else {

      bot.sendVideo(
        chatId,
        "https://media.tenor.com/2roX3uxz_68AAAPo/trophy-win.mp4"
      );

      bot.sendMessage(

        chatId,

`🏆 Team ${room.bowlingTeam} Wins`

      );

      delete rooms[
        roomCode
      ];

      return;

    }

  }

  // CHASE COMPLETE

  if (
    room.innings === 2 &&
    room.score >= room.target
  ) {

    bot.sendVideo(
      chatId,
      "https://media.tenor.com/2roX3uxz_68AAAPo/trophy-win.mp4"
    );

    bot.sendMessage(

      chatId,

`🏆 Team ${room.battingTeam} Wins`

    );

    delete rooms[
      roomCode
    ];

    return;

  }

  sendBowlerDM(
    newBowler,
    roomCode,
    chatId
  );

}

// ======================================
// WEBHOOK
// ======================================

app.post(`/bot${token}`, (req, res) => {

  bot.processUpdate(
    req.body
  );

  res.sendStatus(200);

});

// ======================================
// HOME
// ======================================

app.get("/", (req, res) => {

  res.send("Bot Running");

});

// ======================================
// SERVER
// ======================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );

});