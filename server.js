const cors = require('cors');
const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const http = require('http');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const statisticsRoutes = require('./routes/statistics');
const tokenRoutes = require('./routes/token');

const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(cors());
app.use(express.json());

async function mongoConnect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected');
  } catch (err) {
    console.log(err);
    return;
  }
  server.listen(3001, '0.0.0.0', () => { console.log('server is live') });
}

mongoConnect();
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (room) => {
    console.log(`User joined room: ${room}`);
    socket.join(room);
  });

  socket.on('track-req', (data, room) => {
    console.log(`Track request received in room ${room}:`, data);
    io.to(room).emit('track-req'); // Broadcast event to all clients in the room
  });

  socket.on('queue-req', (data, room) => {
    console.log(`Queue request received in room ${room}:`, data);
    io.to(room).emit('queue-req'); // Broadcast event to all clients in the room
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/token', tokenRoutes);

app.get('/', (req, res) => {
  res.status(200).send('Hello world');
});

module.exports = { io };