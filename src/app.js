import express from "express";
import handlebars from "express-handlebars";
import productRoutes from "./routes/productRoutes.js";
import viewsRouter from "./routes/viewsRouter.js";
import __dirname from "./utils/constantsUtil.js";
import mongoose from "mongoose";
import http from 'http';
import { Server } from "socket.io";
import cartsRouter from "./routes/cartsRouter.js";
import { messageModel } from "./models/messageModel.js";

const uri = "mongodb://127.0.0.1:27017/ecommerce";
mongoose.connect(uri);

const app = express();
const server = http.createServer(app);

//Socket.io config
const io = new Server(server);

//Handlebars config
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/../views");
app.set("view engine", "handlebars");

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extend: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Routers
app.use("/api/product", productRoutes);
app.use("/products", viewsRouter);
app.use("/api/carts", cartsRouter);


// Configura la comunicación de Socket.IO
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  // Maneja el evento cuando un cliente envía un mensaje
  socket.on('chatMessage', async (data) => {
      const { user, message } = data;

      // Guarda el mensaje en MongoDB 
      const newMessage = new messageModel({ user, message });
      await newMessage.save();

      // Emite el mensaje a todos los clientes conectados
      io.emit('message', { user, message });
  });

  socket.on('cartUpdated', async (data) => {
    io.emit('cartUpdated', data);
  });

  // Maneja la desconexión de un cliente
  socket.on('disconnect', () => {
      console.log('Un cliente se ha desconectado');
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Start server in PORT ${PORT}`);
});

