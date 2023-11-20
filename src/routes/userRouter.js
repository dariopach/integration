import {Router} from 'express';
import passport from 'passport';
import jwt  from 'jsonwebtoken';

import { SECRET_JWT } from '../utils/constantsUtil.js';
import userModel from '../models/userModel.js';
import { isValidPassword } from '../utils/functionsUtil.js';


const router = Router();

router.post(
    "/register",
    passport.authenticate('register',{failureRedirect: '/api/sessions/failRegister'}),
    (req, res) => {
        res.send({
            status: 'success',
            message: 'User Registered'
        });
    }
);

router.get("/failRegister", (req, res) => {
    console.log('Failded Stratergy');
    res.send({
        status: 'error',
        message: 'Failed Register'
    });
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try {
        const result = await userModel.findOne({ email }).lean();

        if (!result) throw new Error('Login error!');

        if (!isValidPassword(result, password)) throw new Error ('Login error!');

        const user = {
            first_name: result.first_name,
            last_name: result.last_name,
            email: result.email,
            age: result.age
        }

        const token = jwt.sign(user, SECRET_JWT, {expiresIn: '1h'});

        res.cookie('coderCookie', token, {maxAge: 3600000}).send({
            status: 'success',
            token
        });
    } catch (error) {
        res.send({
            status: 'error',
            payload: error.message
        });
    }
});

router.get("/failLogin", (req, res) => {
    console.log('Failded Stratergy');
    res.send({
        status: 'error',
        message: 'Failed Login'
    });
});

router.delete('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send('Unable to log out')
            } else {
                res.send('Logout successful')
            }
        });
    } else {
        res.end()
    }
})

router.get("/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    res.send({
        status: 'success',
        message: 'Success'
    });
});

router.get("/githubcallback", passport.authenticate('github', {failureRedirect: '/login'}), (req, res) => {
    req.session.user = req.user;
    res.redirect('/products');
});

router.get('/recovery/:token', (req, res) => {
    res.send(req.params.token);
});

export default router;