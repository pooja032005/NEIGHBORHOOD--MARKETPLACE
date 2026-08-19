const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 👉 YOUR ROUTES
const itemRoutes = require("./routes/item");
const serviceRoutes = require("./routes/services");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/admin");
const adminManagementRoutes = require("./routes/adminManagement");
const bookingRoutes = require("./routes/bookings");
const userActionsRoutes = require("./routes/userActions");
const orderRoutes = require("./routes/orders");
const sellerRoutes = require("./routes/seller");
const adminAnalyticsRoutes = require("./routes/adminAnalytics");
const notificationRoutes = require("./routes/notifications");

app.use("/api/items", itemRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-management", adminManagementRoutes);
app.use("/api/admin/stats", adminAnalyticsRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/user-actions", userActionsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// 👉 CREATE HTTP SERVER (REQUIRED FOR SOCKET.IO)
const server = http.createServer(app);

// 👉 ENABLE SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",          // frontend URL
    methods: ["GET", "POST"]
  }
});

// 👉 SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (room) => {
    console.log("Joining room:", room);
    socket.join(room);
  });

  socket.on("leaveRoom", (room) => {
    console.log("Leaving room:", room);
    socket.leave(room);
  });

  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);
    io.to(data.room).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 👉 START SERVER
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exitCode = 1;
  });
