const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const healthRouter = require("./routes/health");
const { registerSocketHandlers } = require("./socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/health", healthRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Voice social backend running" });
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
