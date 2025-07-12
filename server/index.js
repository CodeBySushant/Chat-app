const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const amqp = require('amqplib');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use(cors());
app.use(express.json()); // Important for reading JSON bodies

// 🔐 Express session setup
app.use(session({
  secret: 'keyboard cat', // ⚠️ Replace with a strong secret in production
  resave: false,
  saveUninitialized: false
}));

// 🔐 Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// 🛣️ Auth routes
app.use('/api/auth', authRoutes);

// --- Multer Setup for File Uploads ---

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// --- HTTP + WebSocket setup ---

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';

let channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('chat');

  // ✅ Consume messages and emit to WebSocket
  channel.consume('chat', (msg) => {
    const data = JSON.parse(msg.content.toString());
    io.to(data.room).emit('chat-message', data);
    channel.ack(msg);
  });
}

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  let currentRoom = '';

  socket.on('join-room', ({ username, room }) => {
    socket.join(room);
    currentRoom = room;

    console.log(`${username} joined room: ${room}`);

    socket.to(room).emit('chat-message', {
      user: 'System',
      message: `${username} joined the room`,
    });

    socket.on('send-message', (data) => {
      channel.sendToQueue('chat', Buffer.from(JSON.stringify({ ...data, room })));
    });

    // Typing indicator events
    socket.on('typing', ({ user, room }) => {
      socket.to(room).emit('user-typing', { user });
    });

    socket.on('stop-typing', ({ user, room }) => {
      socket.to(room).emit('user-stop-typing', { user });
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

async function startServer() {
  try {
    await connectRabbitMQ();
    console.log('✅ Connected to RabbitMQ');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

startServer();
