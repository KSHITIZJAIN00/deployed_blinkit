// socketServer.js
import { Server } from "socket.io";

let io;

export const initSocketServer = (httpServer) => {
  const allowedOrigins = [
    "https://blinkify-kj7a.onrender.com", // Deployed frontend
    "http://localhost:5173",              // Local Vite dev
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow specific origins or requests with no origin (mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("send-location", (data) => {
      const { orderId, latitude, longitude } = data;

      // Broadcast the location to all clients
      io.emit("receive-location", { 
        id: socket.id, 
        orderId, 
        latitude, 
        longitude 
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      io.emit("user-disconnect", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized!");
  return io;
};
