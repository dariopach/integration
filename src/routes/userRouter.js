import {Router} from 'express';
import passport from 'passport';

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

router.post(
    "/login",
    passport.authenticate('login',{failureRedirect: '/api/sessions/failLogin'}),
    async (req, res) => {
        if (!req.user) {
            return res.status(400).send({status: "error", error: "Invalid credentials"});
        }

        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age
        }

        res.send({
            status: 'success',
            payload: req.user
        });
    }
);

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

export default router;