
// ======================================
// HOME
// ======================================

app.get("/", (req, res) => {

  res.send("Bot Running");

});

// ======================================
// WEBHOOK SETUP
// ======================================

const domain = process.env.RAILWAY_PUBLIC_DOMAIN || "localhost:3000";
const webhookUrl = `https://${domain}/webhook/${token}`;

app.post(`/webhook/:token`, (req, res) => {

  if (req.params.token !== token) {
    return res.status(403).send("Unauthorized");
  }

  bot.processUpdate(req.body);
  res.sendStatus(200);

});

setInterval(() => {

  Object.keys(rooms).forEach(code => {

    const room = rooms[code];

    if (!room) return;

   if (
    room.lastActive &&
    Date.now() - room.lastActive > 30 * 60 * 1000
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

const server = app.listen(PORT, async () => {

  console.log(
    `Server running on ${PORT}`
  );

  // Set webhook with Telegram
  try {
    await bot.setWebHook(webhookUrl);
    console.log("Webhook set:", webhookUrl);
  } catch (err) {
    console.log("Webhook setup failed:", err.message);
  }

});

// ======================================
// ERROR HANDLERS
// ======================================

bot.on("polling_error", (err) => {

  console.log(
    "Bot polling error:",
    err
  );

});

bot.on("error", (err) => {

  console.log(
    "Bot error:",
    err
  );

});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

