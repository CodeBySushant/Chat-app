const express = require('express');
const app = express(); // Only declare once here

const http = require('http');
const { Server } = require('socket.io');
const amqp = require('amqplib');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const mongoose = require('mongoose');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

// --- Cloudinary setup ---

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chat_images',          // folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ storage });

// Upload route (uploads directly to Cloudinary)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  // req.file.path contains the Cloudinary URL
  res.json({ url: req.file.path });
});

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
