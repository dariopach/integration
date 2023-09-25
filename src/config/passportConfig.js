import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2'
import userModel from '../models/userModel.js';
import { createHash, isValidPassword } from '../utils/functionsUtil.js';

const localStratergy = local.Strategy;
const initializatePassport = () => {
    passport.use('register', new localStratergy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;

            try {
                let user = await userModel.findOne({ email: username});
                if(user) {
                    console.log('User already exists');
                    return done(null, false);
                }

                const newUser = {first_name, last_name, email, age, password: createHash(password)};
                let result = await userModel.create(newUser);

                return done(null, result);
            } catch (error) {
                return done("Error al registrar usuario: " + error);
            }
        }
    ))

    passport.use('login', new localStratergy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await userModel.findOne({email: username});
                if (!user) {
                    console.log('User does not exist');
                    return (null, false);
                }
                if(!isValidPassword(user, password)) {
                    return done (null, false);
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
            clientID: '1337eaf6cd8266519ca3',
            clientSecret: 'cf97315dc2523de3c469e74d5e4d74d2a520b747',
            callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile); 
            let user = await userModel.findOne({username: profile._json.login})
            if(!user) {
                let newUser = {
                    first_name: profile._json.login,
                    last_name: '',
                    email: '',
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

export default initializatePassport;