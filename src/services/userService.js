import userModel from "../models/userModel.js";
import {createHash, isValidPassword} from '../utils/functionsUtil.js';

class UserService {

    async createUser(user) {
        try {
            user.password = createHash(user.password);
            return await userModel.create(user);
        } catch (error) {
            throw new Error(error.message.replace(/"/g, "'"));
        }
    }

    async login(email, password) {
        try {
            const user = await userModel.find({email: email});

            if (user.length > 0 && isValidPassword(user[0], password)) {
                return user[0];
            }
            
            throw new Error('Login failed');

        } catch (error) {
            throw new Error(error.message.replace(/"/g, "'"));
        }
    }

}

const togglePremiumStatus = async (req, res) => {
    const userId = req.params.uid;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
  
      // Cambiar el rol del usuario entre "user" y "premium"
      user.role = user.role === 'user' ? 'premium' : 'user';
  
      await user.save();
  
      res.status(200).json({ message: 'Rol de usuario actualizado exitosamente.' });
    } catch (error) {
      res.status(500).json({ error: 'Error al cambiar el rol de usuario.' });
    }
  };

  export { UserService, togglePremiumStatus };