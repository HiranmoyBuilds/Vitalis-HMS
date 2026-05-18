const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Socket.io middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Vitalis Hospital API is running...');
});

// --- Mock Real-Time Queue Logic ---
let currentQueuePosition = 24;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send initial queue state immediately upon connection
  socket.emit('queue_update', { 
    position: currentQueuePosition, 
    waitTime: currentQueuePosition * 5 
  });

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room.`);
  });

  socket.on('sendMessage', (message) => {
    const receiverId = message.receiver._id || message.receiver;
    io.to(receiverId.toString()).emit('receiveMessage', message);
    console.log(`Socket real-time message dispatched from ${message.sender._id || message.sender} to ${receiverId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate queue moving down every 10 seconds
setInterval(() => {
  if (currentQueuePosition > 0) {
    currentQueuePosition--;
  } else {
    currentQueuePosition = 24; // Reset for demonstration loop
  }
  
  // Broadcast new state to all connected clients
  io.emit('queue_update', { 
    position: currentQueuePosition, 
    waitTime: currentQueuePosition * 5 
  });
}, 10000); 

// --- End Queue Logic ---

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
