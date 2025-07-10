const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const amqp = require('amqplib');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';

let channel;

// Connect to RabbitMQ
async function connectRabbitMQ() {
  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('chat');
  console.log('✅ Connected to RabbitMQ');

  // Consume messages
  channel.consume('chat', (msg) => {
    const data = JSON.parse(msg.content.toString());
    io.emit('chat-message', data);
    channel.ack(msg);
  });
}

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('join-room', ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);

    socket.to(room).emit('chat-message', {
      user: 'System',
      message: `${username} joined the room`,
    });

    socket.on('send-message', (data) => {
      // Send to RabbitMQ with room info
      channel.sendToQueue('chat', Buffer.from(JSON.stringify({ ...data, room })));
    });
  });

  // Consume from RabbitMQ and emit to room
  channel.consume('chat', (msg) => {
    const data = JSON.parse(msg.content.toString());
    io.to(data.room).emit('chat-message', data);
    channel.ack(msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

