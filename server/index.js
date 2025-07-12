const express = require('express');
const app = express();

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
const Message = require('./models/Message');

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chat_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.json({ url: req.file.path });
});

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
  });

  socket.on('send-message', async (data) => {
    const newMsg = new Message({ user: data.user, message: data.message, room: data.room });
    await newMsg.save();
    io.to(data.room).emit('chat-message', newMsg);
  });

  socket.on('typing', ({ user, room }) => {
    socket.to(room).emit('user-typing', { user });
  });

  socket.on('stop-typing', ({ user, room }) => {
    socket.to(room).emit('user-stop-typing', { user });
  });

  socket.on('edit-message', async ({ messageId, newContent }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        message: newContent,
        edited: true,
      });
      io.to(currentRoom).emit('message-edited', { messageId, newContent });
    } catch (err) {
      console.error('Edit error:', err);
    }
  });

  socket.on('delete-message', async ({ messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        message: '[deleted]',
        deleted: true,
      });
      io.to(currentRoom).emit('message-deleted', { messageId });
    } catch (err) {
      console.error('Delete error:', err);
    }
  });

  socket.on('react-message', async ({ messageId, emoji, by }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const updatedReactions = message.reactions.filter(r => r.by !== by);
      updatedReactions.push({ emoji, by });

      message.reactions = updatedReactions;
      await message.save();

      io.to(currentRoom).emit('message-reacted', { messageId, reactions: updatedReactions });
    } catch (err) {
      console.error('Reaction error:', err);
    }
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
