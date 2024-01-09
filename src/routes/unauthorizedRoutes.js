import { Router } from 'express';

const router = Router();

router.get("/login", logged, async (req, res) => {

    res.render(
        'login',
        {
            title: "Ingreso usuario registrado",
            style: "index.css",
            loginFailed: req.session.loginFailed ?? false,
            registerSuccess: req.session.registerSuccess ?? false
        }
    );
});

router.get("/register", logged, async (req, res) => {

    res.render(
        'register',
        {
            title: "Registro de nuevo usuario",
            style: "index.css",
            registerFailed: req.session.registerFailed ?? false
        }
    );
});


router.get("/recovery", logged, async (req, res) => {

    console.log(req.cookies);
    res.render(
        'recovery',
        {
            title: "Recuperar contraseña",
            style: "index.css",
            notification: req.cookies.notification ?? false
        }
    );
});

function logged(req, res, next) {
    if (req.user) {
        return res.redirect("/products");
    }

    next();
}

export default router;
