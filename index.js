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
process.on(
  "unhandledRejection",
  err => {

    console.log(
      "UNHANDLED:",
      err
    );

  }
);

process.on(
  "uncaughtException",
  err => {

    console.log(
      "CRASH:",
      err
    );

  }
);
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

async function sendRunVideo(chatId, runs) {

  if (runs === 1) {
    bot.sendVideo(chatId, "BAACAgUAAxkBAAICOGolQEHMxQABoYl0knG9P3OsCY4WZQACuBwAAqMQKFWi_HmdeTT9YTsE").catch(console.log);
  }

  else if (runs === 2) {
    bot.sendVideo(chatId, "BAACAgUAAxkBAAICOWolQEzBc1xSsHt0fs3jBgV_J3DvAAK5HAACoxAoVe66Mz3tf8HWOwQ").catch(console.log);
  }

  else if (runs === 3) {
   bot.sendVideo(chatId, "3-run.mp4").catch(console.log);
  }

  else if (runs === 4) {
   bot.sendVideo(chatId, "BAACAgUAAxkBAAICO2olQGAg0TlEAvGXHXk-8cJJMlLuAAK7HAACoxAoVRTu3CZ7XEtpOwQ").catch(console.log);
  }

  else if (runs === 5) {
    bot.sendVideo(chatId, "BAACAgUAAxkBAAICU2olSFazZ_ToXKa6aL_1j3hZXlyNAALJHAACoxAoVcej4vl3ZXulOwQ").catch(console.log);
  }

  else if (runs === 6) {
    bot.sendVideo(chatId, "BAACAgUAAxkBAAICPWolQGxjhjmqXo2422M6me1dKbYHAAK8HAACoxAoVZk76ZRAxyeHOwQ").catch(console.log);
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

  console.log(
    "TRYING DM:",
    bowler.name,
    bowler.id
  );

try {

  await bot.sendMessage(
    bowler.id,
    "🥎 Choose Bowling Number",
    getBowlingButtons(roomCode)
  );

  console.log(
    "DM SUCCESS:",
    bowler.name
  );

} catch (err) {

  console.log(
    "DM FAILED:",
    bowler.name,
    err.message
  );

  setTimeout(async () => {

    try {

      await bot.sendMessage(
        bowler.id,
        "🥎 Choose Bowling Number",
        getBowlingButtons(roomCode)
      );

      console.log(
        "DM RETRY SUCCESS:",
        bowler.name
      );

    } catch {

      bot.sendMessage(
        groupChat,
        `⚠️ ${bowler.name} must start bot in DM first and then type /resenddm in group chat`
      );

    }

  }, 3000);

}

}

// ======================================
// START
// ======================================

bot.onText(/\/start/, (msg) => {
     console.log(
    "START USER:",
    msg.from.first_name,
    msg.from.id
  );
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
   groupChat: msg.chat.id,
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

    choices: {},
    processing: false
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
    bot.sendMessage(msg.chat.id, "❌ Room not found");
    return;
  }

  if (room.players.length >= 2) {
    bot.sendMessage(msg.chat.id, "❌ Room Full");
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

📩 Both players check DM`

  );

  sendBowlerDM(
    bowler,
    roomCode,
    msg.chat.id
  );
  bot.sendMessage(

  batsman.id,

`🏏 Your turn to bat

Send a number from 1-6`
);

});

// ======================================
// TEAM CREATE
// ======================================

bot.onText(/\/teamcreate/, (msg) => {

  const roomCode =
    String(msg.chat.id);

  rooms[roomCode] = {

    groupChat: msg.chat.id,
    owner: msg.from.id,
    ownerName: msg.from.first_name,
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

    choices: {},
    processing: false
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

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) {
    bot.sendMessage(msg.chat.id, "❌ Room not found");
    return;
  }

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

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) {
    bot.sendMessage(msg.chat.id, "❌ Room not found");
    return;
  }

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
// START MATCH
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
// RESEND DM
// ======================================

bot.onText(/\/resenddm/, (msg) => {

  const roomCode = String(msg.chat.id);

  const room = rooms[roomCode];

  if (!room || room.mode !== "team") return;

  const bowlingPlayers =
    room.bowlingTeam === "A"
      ? room.teamA
      : room.teamB;

  const bowler =
    bowlingPlayers[
      room.currentBowler
    ];

  sendBowlerDM(
    bowler,
    roomCode,
    room.groupChat
  );

  bot.sendMessage(
    msg.chat.id,
    "📩 Bowling DM resent"
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
 if (room.oversLocked) {

  bot.sendMessage(
    msg.chat.id,
    "⚠️ Overs already selected"
  );

  return;

}
  const overs =
    Number(match[1]);

  room.overs = overs;

  room.maxBalls =
    overs * 6;
  room.oversLocked = true;
  room.tossWinner =
    Math.random() < 0.5
      ? "A"
      : "B";
 room.tossChooser =
  room.tossWinner === "A"
    ? room.teamA[0].id
    : room.teamB[0].id;
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

// ======================================
// BAT
// ======================================

bot.onText(/\/bat/, (msg) => {

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) return;

  if (
    msg.from.id !== room.tossChooser
  ) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Only toss winner can choose"
    );

    return;

  }

  if (room.choiceDone) {

    bot.sendMessage(
      msg.chat.id,
      "⚠️ Bat/Bowl already selected"
    );

    return;

  }

  room.choiceDone = true;

room.choiceDone = true;

room.battingTeam =
  room.tossWinner;

room.bowlingTeam =
  room.tossWinner === "A"
    ? "B"
    : "A";

bot.sendMessage(
  msg.chat.id,

`🏏 Team Setup Phase

Batting Team: ${room.battingTeam}
Bowling Team: ${room.bowlingTeam}

Use /status

Arrange lineup:

/battingorder POSITION PLAYER

/bowlingorder POSITION PLAYER

Example:

/battingorder 1 3

/bowlingorder 1 2

When ready:

/begin`
);

});

// ======================================
// BOWL
// ======================================

bot.onText(/\/bowl/, (msg) => {

  const roomCode =
    String(msg.chat.id);

  const room =
    rooms[roomCode];

  if (!room) return;

  if (
    msg.from.id !== room.tossChooser
  ) {

    bot.sendMessage(
      msg.chat.id,
      "❌ Only toss winner can choose"
    );

    return;

  }

  if (room.choiceDone) {

    bot.sendMessage(
      msg.chat.id,
      "⚠️ Bat/Bowl already selected"
    );

    return;

  }

  room.choiceDone = true;

room.choiceDone = true;

room.bowlingTeam =
  room.tossWinner;

room.battingTeam =
  room.tossWinner === "A"
    ? "B"
    : "A";

bot.sendMessage(
  msg.chat.id,

`🏏 Team Setup Phase

Batting Team: ${room.battingTeam}
Bowling Team: ${room.bowlingTeam}

Use /status

Arrange lineup:

/battingorder POSITION PLAYER

/bowlingorder POSITION PLAYER

Example:

/battingorder 1 3

/bowlingorder 1 2

When ready:

/begin`
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

  room.groupChat,

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

await bot.sendMessage(

  room.groupChat,

`🥎 ${bowler.name}

Check your DM and choose bowling number`
);

  await sendBowlerDM(
    bowler,
    roomCode,
    room.groupChat
  );

}

// ======================================
// BATTER SENDS NUMBER
// ======================================



  bot.on("message", (msg) => {

  if (msg.video) {

    console.log(
      "VIDEO ID:",
      msg.video.file_id
    );

  }

  const number =
    parseInt(msg.text);

  if (
    isNaN(number) ||
    number < 1 ||
    number > 6
  ) return;

  const roomCode =
    Object.keys(rooms).find(code => {

      const room =
        rooms[code];

      if (!room) return false;

      // NORMAL
      if (room.mode === "normal") {

        return room.players.some(
          p => p.id === msg.from.id
        );

      }

      // TEAM
      return (

        room.teamA.some(
          p => p.id === msg.from.id
        ) ||

        room.teamB.some(
          p => p.id === msg.from.id
        )

      );

    });

  if (!roomCode) return;

  const room =
    rooms[roomCode];

  // ======================================
  // NORMAL
  // ======================================

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
      batsman &&
      msg.from.id === batsman.id
    ) {

     

      room.choices[
        batsman.id
      ] = number;

      if (
        room.choices[
          bowler.id
        ] !== undefined
      ) {

        playNormalBall(
          room,
          roomCode,
          room.groupChat,
          batsman,
          bowler
        );

      }

    }

  }
  

  // ======================================
  // TEAM
  // ======================================

  else {

    const battingPlayers =
      room.battingTeam === "A"
        ? room.teamA
        : room.teamB;

    const batsman =
      battingPlayers[
        room.currentBatsman
      ];
     console.log(
  "CURRENT BATSMAN:",
  batsman?.name,
  room.currentBatsman
);

console.log(
  "MSG FROM:",
  msg.from.first_name
);
if (
  msg.chat.id !== room.groupChat
) return;

    if (
      batsman &&
      msg.from.id === batsman.id
    ) {

   

     
 
      const bowlingPlayers =
        room.bowlingTeam === "A"
          ? room.teamA
          : room.teamB;

      const bowler =
        bowlingPlayers[
          room.currentBowler
        ];
    if (
  room.choices[
    bowler.id
  ] === undefined
) {

  bot.sendMessage(
    room.groupChat,
    "⏳ Wait for bowler to choose first"
  );

  return;

}
 room.choices[
        batsman.id
      ] = number;

          console.log(
  "BATTER NUMBER:",
  batsman.name,
  number
);
     
      if (
        room.choices[
          bowler.id
        ] !== undefined
      ) {

        playTeamBall(
          room,
          roomCode,
          room.groupChat,
          batsman,
          bowler
        );

      }

    }

  }

});

// ======================================
// STATUS
// ======================================
const text =

`📊 TEAM MATCH STATUS

👑 Match Creator:
${room.ownerName || "Unknown"}

🏏 Innings:
${room.innings}

🎯 Score:
${room.score}/${room.wickets}

🏏 Batting Team (${room.battingTeam})

${battingPlayers
  .map((p, i) =>
    `${i + 1}. ${i === room.currentBatsman ? "➡️" : ""} ${p.name}`
  )
  .join("\n")}

🥎 Bowling Team (${room.bowlingTeam})

${bowlingPlayers
  .map((p, i) =>
    `${i + 1}. ${i === room.currentBowler ? "➡️" : ""} ${p.name}`
  )
  .join("\n")}

🏏 Current Batter:
${batsman?.name || "None"}

🥎 Current Bowler:
${bowler?.name || "None"}

🏏 Balls:
${room.balls || 0}/${room.maxBalls || 0}

🎯 Target:
${room.target || "Not set"}

${!room.matchStarted
  ? "\n⚠️ Setup Phase Active\nUse /begin when lineup is ready"
  : "\n✅ Match In Progress"}`
;

///////////batting//////////

bot.onText(
  /\/battingorder (\d+) (\d+)/,
  (msg, match) => {

    const room =
      rooms[String(msg.chat.id)];

    if (!room) return;

    if (
      msg.from.id !== room.owner
    ) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Only match creator can edit lineup"
      );

    }

    if (
      room.lineupLocked
    ) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Lineup locked"
      );

    }

    const battingPlayers =
      room.battingTeam === "A"
        ? room.teamA
        : room.teamB;

    const pos =
      parseInt(match[1]) - 1;

    const player =
      parseInt(match[2]) - 1;

    if (
      pos < 0 ||
      player < 0 ||
      pos >= battingPlayers.length ||
      player >= battingPlayers.length
    ) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Invalid player number"
      );

    }

    [
      battingPlayers[pos],
      battingPlayers[player]
    ] = [
      battingPlayers[player],
      battingPlayers[pos]
    ];

    bot.sendMessage(
      msg.chat.id,
      "✅ Batting order updated"
    );

  }
);

///////////bowling/////////

bot.onText(
  /\/bowlingorder (\d+) (\d+)/,
  (msg, match) => {

    const room =
      rooms[String(msg.chat.id)];

    if (!room) return;

    if (
      msg.from.id !== room.owner
    ) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Only match creator can edit lineup"
      );

    }

    if (
      room.lineupLocked
    ) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Lineup locked"
      );

    }

    const bowlingPlayers =
      room.bowlingTeam === "A"
        ? room.teamA
        : room.teamB;

    const pos =
      parseInt(match[1]) - 1;

    const player =
      parseInt(match[2]) - 1;

    if (
      pos < 0 ||
      player < 0 ||
      pos >= bowlingPlayers.length ||
      player >= bowlingPlayers.length
    ) {

      return bot.sendMessage(
        msg.chat.id,
        "❌ Invalid player number"
      );

    }

    [
      bowlingPlayers[pos],
      bowlingPlayers[player]
    ] = [
      bowlingPlayers[player],
      bowlingPlayers[pos]
    ];

    bot.sendMessage(
      msg.chat.id,
      "✅ Bowling order updated"
    );

  }
);
//////begin/////////

bot.onText(/\/begin/, (msg) => {

  const room =
    rooms[String(msg.chat.id)];

  if (!room) return;

  if (
    room.mode !== "team"
  ) return;

  if (
    msg.from.id !== room.owner
  ) {

    return bot.sendMessage(
      msg.chat.id,
      "❌ Only match creator can start match."
    );

  }
  if (room.matchStarted) {

  return bot.sendMessage(
    msg.chat.id,
    "⚠️ Match already started"
  );

}
room.matchStarted = true;
room.lineupLocked = true;
  startTeamGame(
    msg,
    room.battingTeam === room.tossWinner
  );

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

  // ======================================
  // NORMAL MODE
  // ======================================

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
  ] !== undefined
) {

  playNormalBall(
    room,
    roomCode,
    room.groupChat,
    batsman,
    bowler
  );

}
  bot.answerCallbackQuery(
  query.id,
  {
    text:
      "Bowling number selected"
  }
);

  }

  // ======================================
  // TEAM MODE
  // ======================================

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
    if (query.from.id !== bowler.id) {

  bot.answerCallbackQuery(
    query.id,
    {
      text: "❌ Not your turn to bowl"
    }
  );

  return;

}
    room.choices[
      bowler.id
    ] = number;
   
  console.log(
  "BOWLER NUMBER:",
  bowler.name,
  number
);
    // ask batter after bowler selects
if (
  room.choices[
    batsman.id
  ] !== undefined
) {

  playTeamBall(
    room,
    roomCode,
    room.groupChat,
    batsman,
    bowler
  );

}


bot.sendMessage(
  room.groupChat,

`🥎 ${bowler.name} selected bowling number

🏏 ${batsman.name} send your number now`
);

   bot.answerCallbackQuery(
  query.id,
  {
    text:
      "Bowling number selected"
  }
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
  if (room.processing) return;

  room.processing = true;
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

      // send score to batter
bot.sendMessage(
  batsman.id,
  message
);

// send score to bowler
bot.sendMessage(
  bowler.id,
  message
);
delete rooms[
  roomCode
];
console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;

return;

    }

  }

  // RUNS

  else {

    room.score += bat;

// send instantly without waiting
sendRunVideo(
  batsman.id,
  bat
);

sendRunVideo(
  bowler.id,
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

    // send score to batter
bot.sendMessage(
  batsman.id,
  message
);

// send score to bowler
bot.sendMessage(
  bowler.id,
  message
);

 delete rooms[
  roomCode
];
console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;

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

// send score to batter
bot.sendMessage(
  batsman.id,
  message
);

// send score to bowler
bot.sendMessage(
  bowler.id,
  message
);
   bot.sendMessage(

  newBatsman.id,

`🏏 Your turn to bat

Send number from 1-6`
);
 // wait video to batter
bot.sendVideo(
  batsman.id,
  "BAACAgUAAxkDAAICLmolLnzhrXw_GPlbh5Littz0qkzeAAKRHAACoxAoVYhYGaXqOeMxOwQ"
).catch(console.log);

// wait video to bowler
bot.sendVideo(
  bowler.id,
  "BAACAgUAAxkDAAICLmolLnzhrXw_GPlbh5Littz0qkzeAAKRHAACoxAoVYhYGaXqOeMxOwQ"
).catch(console.log);

  sendBowlerDM(
    newBowler,
    roomCode,
    chatId
  );
  console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;
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
  console.log(
  "PLAYTEAMBALL START",
  roomCode,
  room.processing
);
if (room.processing) return;

room.processing = true;
room.lastActive = Date.now();
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
    // ======================================
  // SCORE
  // ======================================

  message +=
`\n\nScore:
${room.score}/${room.wickets}`;

  // ======================================
  // TARGET
  // ======================================

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

  // clear old choices

  room.choices = {};

  // ======================================
  // SEND SCORE
  // ======================================

  await bot.sendMessage(
    chatId,
    message
  );

  // ======================================
  // WAIT VIDEO
  // ======================================



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

  // ======================================
  // INNINGS END
  // ======================================

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
     room.currentBowler = 0;
      const temp =
        room.battingTeam;

      room.battingTeam =
        room.bowlingTeam;

      room.bowlingTeam =
        temp;

      await bot.sendMessage(

        chatId,

`🎯 Target:
${room.target}

🏏 Second Innings Begins`

      );

      const secondBowling =
        room.bowlingTeam === "A"
          ? room.teamA
          : room.teamB;
     await bot.sendMessage(

  room.groupChat,

`🥎 ${secondBowling[0].name}

Check your DM and choose bowling number`
);
     await sendBowlerDM(
  secondBowling[0],
  roomCode,
  room.groupChat
);
console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;


      return;

    }

    else {

      await bot.sendVideo(
        chatId,
        "https://media.tenor.com/2roX3uxz_68AAAPo/trophy-win.mp4"
      );

      await bot.sendMessage(

        chatId,

`🏆 Team ${room.bowlingTeam} Wins`

      );

     delete rooms[
  roomCode
];
console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;

return;

    }

  }

  // ======================================
  // CHASE COMPLETE
  // ======================================

  if (
    room.innings === 2 &&
    room.score >= room.target
  ) {

    await bot.sendVideo(
      chatId,
      "https://media.tenor.com/2roX3uxz_68AAAPo/trophy-win.mp4"
    );

    await bot.sendMessage(

      chatId,

`🏆 Team ${room.battingTeam} Wins`

    );

   delete rooms[
  roomCode
];
console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;

return;

  }

  // ======================================
  // NEXT BALL
  // ======================================

 // ======================================
// NEXT BALL
// ======================================

// wait video before next ball


// tell bowler to check DM
await bot.sendMessage(

  room.groupChat,

`🥎 ${newBowler.name}

Check your DM and choose bowling number`
);
console.log(
  "PLAYTEAMBALL END",
  roomCode
);
room.processing = false;
// send DM buttons
setTimeout(() => {

  sendBowlerDM(
    newBowler,
    roomCode,
    room.groupChat
  );

}, 1500);

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
setInterval(() => {

  Object.keys(rooms).forEach(code => {

    const room = rooms[code];

    if (!room) return;

    if (
      Date.now() - (room.lastActive || 0)
      > 1000 * 60 * 30
    ) {

      delete rooms[code];

      console.log(
        "Deleted inactive room:",
        code
      );

    }

  });

}, 600000);
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
