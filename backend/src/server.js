const express = require('express');
const cors = require('cors');
const {createServer} = require('http');
const {Server} = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();
const {Room, Message} = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ok: true});
});

app.get('/rooms', async (_req, res) => {
  const rooms = await Room.find().sort({createdAt: -1}).lean();
  const normalized = rooms.map(room => ({
    id: room._id.toString(),
    title: room.title,
    hostId: room.hostId,
    participants: room.participants || 0,
  }));
  res.json(normalized);
});

app.post('/rooms', async (req, res) => {
  const {title, hostId} = req.body;
  if (!title || !hostId) {
    res.status(400).json({message: 'title and hostId are required'});
    return;
  }
  const room = await Room.create({title, hostId, participants: 0});
  res.status(201).json(room);
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', socket => {
  socket.on('joinRoom', async ({roomId}) => {
    socket.join(roomId);
    const room = await Room.findById(roomId);
    if (room) {
      room.participants += 1;
      await room.save();
    }
    const history = await Message.find({roomId})
      .sort({createdAt: 1})
      .limit(200)
      .lean();
    socket.emit(
      'chatHistory',
      history.map(message => ({
        id: message._id.toString(),
        roomId: message.roomId,
        userId: message.userId,
        userName: message.userName,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
      })),
    );
  });

  socket.on('leaveRoom', async ({roomId}) => {
    socket.leave(roomId);
    const room = await Room.findById(roomId);
    if (room) {
      room.participants = Math.max(0, room.participants - 1);
      await room.save();
    }
  });

  socket.on('chatMessage', async payload => {
    const saved = await Message.create({
      roomId: payload.roomId,
      userId: payload.userId,
      userName: payload.userName || 'User',
      text: payload.text,
    });
    io.to(payload.roomId).emit('chatMessage', {
      id: saved._id.toString(),
      roomId: saved.roomId,
      userId: saved.userId,
      userName: saved.userName,
      text: saved.text,
      createdAt: saved.createdAt.toISOString(),
    });
  });
});

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('Missing MONGO_URI in backend .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    server.listen(port, () => {
      console.log(`VoiceSocial backend running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Mongo connection failed:', error.message);
    process.exit(1);
  });
