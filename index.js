const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const cors = require("cors");
const db = require("./models");
const jobsRouter = require("./routes/jobs")
const familleRouter = require("./routes/famille");
const sitterRouter = require("./routes/sitter");
const familleChatsRouter = require("./routes/chats");

const { json, where } = require("sequelize");



const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/famille", familleRouter);
app.use("/sitter", sitterRouter);
app.use("", familleChatsRouter);
app.use("/jobs", jobsRouter)


const server = http.createServer(app);
const io = socketIO(server);



io.on("connection", (socket) => {

  socket.on("leaveroom", (data) => {
    const roomId = data.parentId + '' + data.sitterId;
    socket.leave(parseInt(roomId));
  });

  socket.on("sendmsg", async (data) => {
    try {
      const roomId = data.parentId + '' + data.sitterId;
      const room = await db.Chatroom.findOne({ where: { chatroom_id: parseInt(roomId) } })
      if (!room) {
        await db.Chatroom.create({
          famille_id: data.parentId,
          sitter_id: data.sitterId,
          chatroom_id: parseInt(roomId)
        })
      }
      await db.Message.create({
        message_body: data.message_body,
        sender: data.sender,
        chatroom_id: parseInt(roomId)
      });
      await db.Message.findAll({ where: { chatroom_id: parseInt(roomId) } })
        .then((messages) => {
          console.log("---------------------" + messages[messages.length - 1].message_body + '++++++++++++++++=')
          io.to(parseInt(roomId)).emit('messages', messages);
        })
        .catch((error) => {
          console.error('Error retrieving messages:', error);
        });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  socket.on('joinRoom', async (data) => {
    var usersInfoC = (data.parentId + '' + data.sitterId)
    socket.join(parseInt(usersInfoC));
    await db.Message.findAll({ where: { chatroom_id: parseInt(usersInfoC) } }).then((messages) => {
      console.log(messages)
      socket.emit('messages', messages);
    })

  });


  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

db.sequelize.sync().then(() => {
  server.listen(8000, () => {
    console.log(`Server is running on port ${8000}`);
  });
}).catch(err => {
  console.error("Database synchronization failed:", err);
});

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}