import express from "express";
import handlebars from "express-handlebars";
import session from 'express-session';
import mongoose from "mongoose";
import http from 'http';
import { Server } from "socket.io";
import mongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import nodemailer from 'nodemailer';

import productRoutes from "./routes/productRoutes.js";
import viewsRouter from "./routes/viewsRouter.js";
import userRouter from './routes/userRouter.js';
import { __dirname } from "./utils/constantsUtil.js";
import cartsRouter from "./routes/cartsRouter.js";
import sessionRouter from "./routes/sessionRouter.js";
import { messageModel } from "./models/messageModel.js";
import initializatePassport from "./config/passportConfig.js";
import { isAdmin, isUser } from "./utils/authorizationUtil.js";

const uri = process.env.LINK_MONGO;
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
app.use(cookieParser());

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

//Passport
initializatePassport();
app.use(passport.initialize());
app.use(passport.session());

//Routers
app.use("/api/product", isAdmin, productRoutes);
app.use("/", viewsRouter);
app.use("/api/carts", isUser, cartsRouter);
app.use('/api/sessions', userRouter);
app.use('/api/session', sessionRouter);


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

//Send email
const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
  } 
});

app.get('/send/mail', async (req, res) => {

  try {
      const result = await transport.sendMail({
          from: 'Ecommerce <dariopach3@gmail.com>',
          to: 'dariopach@hotmail.com',
          subject: 'Correo de prueba',
          html: ` <div>
                      <h1>Ecommerce</h1>
                      <p>Gracias por su compra</p>
                      <img src="cid:Logo"/>
                  </div>`,
          attachments: [{
              filename: 'Logo.jpg',
              path: 'src\\images\\Logo.jpg',
              cid: 'Logo'
          }]
      });
  
      res.send({status: 'success', result});
  } catch (error) {
      console.log(error.message);
      res.status(500).send({status: 'error', message: 'Error in send email!'});
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Start server in PORT ${PORT}`);
});

