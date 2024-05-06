const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIO(server);

let onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("new user", (userId) => {
    onlineUsers[userId] = {
      connectedAt: new Date(),
      socketId: socket.id,
    };
    io.emit("user status", {
      userId,
      onlineUsers: Object.keys(onlineUsers),
      status: "online",
      connectedAt: onlineUsers[userId].connectedAt,
    });
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key].socketId === socket.id
    );
    if (userId) {
      delete onlineUsers[userId];
      io.emit("user status", { userId, status: "offline" });
    }
  });
});

app.get("/", (req, res) => res.send("Express on Vercel"));

server.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
