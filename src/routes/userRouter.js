import {Router} from 'express';
import passport from 'passport';
import jwt  from 'jsonwebtoken';
import { format } from 'date-fns'

import { SECRET_JWT } from '../utils/constantsUtil.js';
import userModel from '../models/userModel.js';
import { isValidPassword, createHash} from '../utils/functionsUtil.js';
import { UserService } from '../services/userService.js';
import { uploader } from '../utils/multerUtil.js'
import { isUser, isAdmin } from '../utils/authorizationUtil.js';

const router = Router();
const userService = new UserService();

// Ruta para cambiar el rol de un usuario a premium o viceversa
router.put('/premium/:uid', userService.togglePremiumStatus);

router.delete('/products/:productId', async (req, res) => {
    const productId = req.params.productId;
    const userRole = req.user.role;
  
    try {
      const result = await productDBManager.deleteProduct(productId, userRole);
      res.status(200).json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
  });

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

router.delete("/delete", async (req, res) => {
    const {email} = req.body;

    try {
        const result = await userModel.deleteOne({ email: email });

        if (!result) throw new Error('Delete Error');

        res.send({
            status: 'success',
            message: 'User Deleted'
        });
    } catch (error) {
        res.send({
            status: 'error',
            payload: error.message
        });
    }
});

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

        const token = jwt.sign(result, SECRET_JWT, {expiresIn: '1h'});

        res.cookie('coderCookie', token, {maxAge: 3600000}).send({
            status: 'success',
            token
        });

        //updated last connection
        const updateLastConnection = async () => {
            try {
                const lastConnection = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                await userService.updateUser(user, { lastConnection });
                console.log('Last connection updated successfully');
            } catch (error) {
                console.error('Error updating last connection:', error.message);
            }
        };
        updateLastConnection();

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

router.post('/changePass', async (req, res) => {

    const { token, password } = req.body;
    try {
            const user = jwt.verify(token, SECRET_JWT);
        if (!user) {
            return res.redirect('/recovery')
        }

        const fullUser = await userModel.findOne({_id: user.id});
        if (isValidPassword(fullUser, password)) {
            return res.cookie('errorMessage', 'No se permite reutilizar la contraseña', {maxAge: 5000}).redirect(`/changePass/${token}`)
        }

        const newPassword = createHash(password);

        await userModel.updateOne({ _id: user.id}, {password: newPassword});

        return res.redirect('/login')
    } catch {
       return res.redirect('/recovery');
    }
})

router.post('/:uid/documents', isUser, uploader.array('docs', 3 ), userService.uploadDocuments)

// Ruta para acceder al panel de administrador
router.get('/admin', isAdmin, userService.renderAdminPanel);

// Rutas para actualizar el rol y eliminar un usuario
router.post('/admin/update-role/:userId', isAdmin, userService.updateUserRole);
router.post('/admin/delete-user/:userId', isAdmin, userService.deleteUser);


export default router;