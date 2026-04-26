const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: {type: String, required: true, trim: true},
    hostId: {type: String, required: true, trim: true},
    participants: {type: Number, default: 0},
  },
  {timestamps: true},
);

const messageSchema = new mongoose.Schema(
  {
    roomId: {type: String, required: true, index: true},
    userId: {type: String, required: true},
    userName: {type: String, required: true},
    text: {type: String, required: true},
  },
  {timestamps: true},
);

const Room = mongoose.model('Room', roomSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = {Room, Message};
