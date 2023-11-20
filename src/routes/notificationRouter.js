import { Router } from "express";
import nodemailer from 'nodemailer';
import jwt  from 'jsonwebtoken';

import { SECRET_JWT } from '../utils/constantsUtil.js';
import userModel from "../models/userModel";

const router = Router();
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    } 
  });
  

router.post('/send', async (req, res) => {
    try {
       const  {email, message} = req.body;

        if(!emailRegex.test(email)) throw new Error('Invalid email');

        const result = await transport.sendMail({
            from: 'Ecommerce <dariopach3@gmail.com>',
            to: email,
            subject: 'Correo de prueba',
            html: ` <div>
                        <h1>Ecommerce</h1>
                        <p>${message}</p>
                        <img src="cid:Logo"/>
                    </div>`,
        });
    
        res.send({status: 'success', result});
    } catch (error) {
        console.log(error.message);
        res.status(500).send({status: 'error', message: 'Error in send email!'});
    }
});


router.post('/recovery', async (req, res) => {
    try {
       const  {email} = req.body;

        if(!emailRegex.test(email)) throw new Error('Invalid email');

        const userResult = await userModel.findOne({ email }).lean();

        if (!userResult) throw new Error('Invalid user!');

        const user = {
            id: userResult._id,
            first_name: userResult.first_name,
            last_name: userResult.last_name,
            email: userResult.email,
            age: userResult.age
        }

        const token = jwt.sign(user, SECRET_JWT, {expiresIn: '1h'});

        const link = `http://localhost8080/api/sessions/recovery/${token}`;

        await transport.sendMail({
            from: 'Ecommerce <dariopach3@gmail.com>',
            to: email,
            subject: 'Recuperacion de contraseña',
            html: ` <div>
                        <h1>Recuperacion de contraseña</h1>
                        <p>Para recuperar contraseña haga click en el siguiente <a href="${link}">link</a></p>
                        <img src="cid:Logo"/>
                    </div>`,
        });
    
        res.send('Email enviado con exito');
    } catch (error) {
        res.send(error.message);
    }
});


export default router;