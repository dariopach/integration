import express from "express";
import handlebars from "express-handlebars";
import session from 'express-session';
import mongoose from "mongoose";
import http from 'http';
import { Server } from "socket.io";
import mongoStore from "connect-mongo";
import passport from "passport";

import productRoutes from "./routes/productRoutes.js";
import viewsRouter from "./routes/viewsRouter.js";
import userRouter from './routes/userRouter.js';
import __dirname from "./utils/constantsUtil.js";
import cartsRouter from "./routes/cartsRouter.js";
import { messageModel } from "./models/messageModel.js";
import initializatePassport from "./config/passportConfig.js";

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

//Session
app.use(session(
  {
      store: mongoStore.create({
          mongoUrl: uri,
          mongoOptions: { useUnifiedTopology: true },
          ttl: 100
      }),
      secret: 'secretPhrase',
      resave: false,
      saveUninitialized: false
  }
));

initializatePassport();
app.use(passport.initialize());
app.use(passport.session());

//Routers
app.use("/api/product", productRoutes);
app.use("/", viewsRouter);
app.use("/api/carts", cartsRouter);
app.use('/api/sessions', userRouter);


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

