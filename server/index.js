const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const amqp = require('amqplib');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 5000;
const RABBIT_URL = process.env.RABBIT_URL || 'amqp://localhost';

let channel;

async function connectRabbit() {
  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('chat');

  // Consume from RabbitMQ and send to clients
  channel.consume('chat', (msg) => {
    const data = JSON.parse(msg.content.toString());
    io.emit('chat-message', data);
    channel.ack(msg);
  });
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('send-message', (data) => {
    // Publish to RabbitMQ
    channel.sendToQueue('chat', Buffer.from(JSON.stringify(data)));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

connectRabbit().then(() => {
  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});
