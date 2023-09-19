import {Router} from 'express';
import UserService from '../services/userService.js';

const US = new UserService();
const router = Router();

router.post("/register", async (req, res) => {
    try {
        await US.createUser(req.body);
        req.session.registerSuccess = true;
        res.redirect("/login");
    } catch (error) {
        req.session.registerFailed = true;
        res.redirect("/register");
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password} = req.body;
        const { first_name, last_name, age } = await US.login(email, password);

        req.session.user = {first_name, last_name, email, age};
        req.session.loginFailed = false;
        res.redirect("/");
    } catch (error) {
        req.session.loginFailed = true;
        req.session.registerSuccess = false;
        res.redirect("/login");
    }
});

export default router;