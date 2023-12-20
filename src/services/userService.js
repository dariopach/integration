import userModel from "../models/userModel.js";
import {createHash, isValidPassword} from '../utils/functionsUtil.js';
import { __dirname } from "../utils/constantsUtil.js";

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

    async updateUser(userData, updatedUserData) {
        try {
            const user = await userModel.findOne({ email: userData.email});

            if (!user) {
                throw new Error('User not found');
            }

            if (updatedUserData.first_name) {
                user.first_name = updatedUserData.first_name;
            }

            if (updatedUserData.last_name) {
                user.last_name = updatedUserData.last_name;
            }

            if (updatedUserData.email) {
                user.email = updatedUserData.email;
            }

            if (updatedUserData.age) {
                user.age = updatedUserData.age;
            }

            if (updatedUserData.documents) {
                user.documents = updatedUserData.documents;
            }

            if (updatedUserData.lastConnection) {
                user.lastConnection = updatedUserData.lastConnection;
            }

            await user.save();

            return user; 

        } catch (error) {
            throw new Error(error.message.replace(/"/g, "'"));
        }

    }

    async uploadDocuments(req, res) {
        const userId = req.params.uid;
        if (!userId || isNaN(userId)) {
          return res.status(400).json({ error: 'User not found' });
        }
    
        const files = req.files;
        if (!files || isNaN(files.length)) {
          return res.status(400).json({ error: 'Docs not found' });
        }
    
        const documents = files.map(file => ({
          name: file.filename,
          reference: `${__dirname}/../public/img/${file.filename}`
        }));
    
        try {
          const userData = await userModel.findById(userId);
          if (!userData) {
            return res.status(404).json({ error: 'User not found' });
          }
    
          userData.documents = documents;
          const user = await this.updateUser(userData, { ...userData });
    
          return res.status(201).json({
            status: 'success',
            message: 'User successfully updated',
            data: user
          });
        } catch (error) {
          return res.status(500).json({ error: 'Error updating user' });
        }
      }
      async togglePremiumStatus(req, res) {
        const userId = req.params.uid;
    
        try {
          const user = await userModel.findById(userId);
    
          if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
          }
    
          // Verificar si el usuario ha subido los documentos necesarios
          if (!this.hasRequiredDocuments(user)) {
            return res.status(400).json({ error: 'El usuario no ha terminado de procesar su documentación.' });
          }
    
          // Cambiar el rol del usuario entre "user" y "premium"
          user.role = user.role === 'user' ? 'premium' : 'user';
    
          await user.save();
    
          res.status(200).json({ message: 'Rol de usuario actualizado exitosamente.' });
        } catch (error) {
          res.status(500).json({ error: 'Error al cambiar el rol de usuario.' });
        }
      }
    
      hasRequiredDocuments(user) {
        return user.documents && user.documents.length >= 3; 
      }
}


  export { UserService };