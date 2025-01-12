const cors = require('cors');
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const statisticsRoutes = require('./routes/statistics');
const tokenRoutes = require('./routes/token');

const app = express();
const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*', // Allow specific origin in production
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
async function mongoConnect() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection error:', err);
    return;
  }
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
  });
}

mongoConnect();

// Socket.IO Setup
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*', // Allow specific origin in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (room) => {
    console.log(`User joined room: ${room}`);
    socket.join(room);
  });

  socket.on('track-req', (data, room) => {
    console.log(`Track request received in room ${room}:`, data);
    io.to(room).emit('track-req', data); // Broadcast event to all clients in the room
  });

  socket.on('queue-req', (data, room) => {
    console.log(`Queue request received in room ${room}:`, data);
    io.to(room).emit('queue-req', data); // Broadcast event to all clients in the room
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/token', tokenRoutes);

// Root Route
app.get('/', (req, res) => {
  res.status(200).send('Hello world');
});

module.exports = { io };
