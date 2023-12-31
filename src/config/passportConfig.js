import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import jwt, { ExtractJwt } from 'passport-jwt';
import 'dotenv/config';

import userModel from '../models/userModel.js';
import { createHash, isValidPassword } from '../utils/functionsUtil.js';
import { SECRET_JWT, KEY_COOKIE } from "../utils/constantsUtil.js"

const localStratergy = local.Strategy;
const JWTStratergy = jwt.Strategy;

const initializatePassport = () => {
    passport.use('register', new localStratergy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age, role } = req.body;

            try {
                let user = await userModel.findOne({ email: username});
                if(user) {
                    console.log('User already exists');
                    return done(null, false);
                }

                const newUser = {first_name, last_name, email, age, password: createHash(password), role};
                let result = await userModel.create(newUser);

                return done(null, result);
            } catch (error) {
                return done("Error al registrar usuario: " + error);
            }
        }
    ))

    passport.use(
        'jwt',
        new JWTStratergy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: SECRET_JWT
            },
            async (jwt_payload, done) => {
                try {
                    return done(null, jwt_payload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    )

    passport.use('login', new localStratergy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await userModel.findOne({email: username});
                if (!user) {
                    console.log('User does not exist');
                    return done(null, false);
                }
                if(!isValidPassword(user, password)) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use(
        'github',
        new GitHubStrategy({
            clientID: process.env.CLIENT_ID_GITHUB,
            clientSecret: process.env.CLIENT_SECRET_GITHUB,
            callbackURL: process.env.CALLBACKURL_GITHUB
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile); 
            let user = await userModel.findOne({email: profile._json.login})
            if(!user) {
                let newUser = {
                    first_name: profile._json.login,
                    last_name: '',
                    email: profile._json.login,
                    age: '',
                    password: ''
                }
                let result = await userModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch(error) {
            return done(error);
        }
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findById(id);
        done(null, user);
    })
}


const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies[KEY_COOKIE] ?? null;
    }

    return token;
}

export default initializatePassport;