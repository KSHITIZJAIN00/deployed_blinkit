// socketServer.js
import { Server } from "socket.io";

let io;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins dynamically
        callback(null, origin || "*");
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("send-location", (data) => {
      const { orderId, latitude, longitude } = data;
      io.emit("recived-location", { id: socket.id, orderId, latitude, longitude });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      io.emit("user-disconnect", socket.id);
    });
  });
};
