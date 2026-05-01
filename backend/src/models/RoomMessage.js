const mongoose = require("mongoose");

const roomMessageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true, trim: true },
    text: { type: String, trim: true, default: "" },
    imageUrl: { type: String, default: "" },
    type: { type: String, enum: ["text", "image", "system", "broadcast", "gift"], default: "text" },
  },
  { timestamps: true }
);

const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema);
module.exports = { RoomMessage };
