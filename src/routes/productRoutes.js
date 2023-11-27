import { Router } from 'express';
import  express  from 'express';
import { productDBService } from '../services/productDBManager.js';
import { uploader } from '../utils/multerUtil.js';
import generateMockProducts from '../utils/fakerUtil.js';
import customError from '../errorHandler/customError.js'
import {generateProductErrorInfo} from '../errorHandler/info.js'
import ErrorCodes from '../errorHandler/enum.js';

const router = Router();
const ProductService = new productDBService();

// Middleware para parsear query params
router.use(express.urlencoded({ extended: true }));

// Endpoint para obtener productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query, category, availability } = req.query;
    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort === 'desc' ? '-price' : 'price',
        query,
        category,
        availability,
    };

    try {
        const result = await ProductService.getFilteredProducts(options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint para crear un nuevo producto
router.post('/', uploader.array('thumbnails', 2), async (req, res) => {
    try {
        if (!req.files) {
            req.body.thumbnails = [];
            req.files?.forEach((file) => {
                req.body.thumbnails.push(file.filename);
            });
        }
        const {title, description, price, code, stock, category} = req.body;
        if (!title || !description || !price || !code || !stock || !category) {
            customError.createError({
                name: 'Product creation error',
                cause: generateProductErrorInfo({ title, description, price, code, stock, category }),
                message: 'Error trying to create product',
                code: ErrorCodes.INVALID_TYPES_ERROR,
            });
        }
    
        const result = await ProductService.createProduct(req.body);
    
        res.json({
            message: result
        });
    } catch (error) {
      res.status(500).json(error);
    }    
});

// Endpoint fake products
router.post('/mockingproducts', (req, res) => {
    try {
      const mockProducts = generateMockProducts(100); 
      res.json(mockProducts);
    } catch (error) {
      res.status(500).json({ error: 'Error to generate products' });
    }
  });

// Clase de eliminación de producto
class DeleteProductHandler {
    async handle(req, res) {
      const productId = req.params.productId;
      const userRole = req.user.role; 
      const userEmail = req.user.email; 
  
      try {
        const product = await ProductService.getProductById(productId);

        authenticateRole(userRole, ['admin', 'premium']);
  
        if (product.owner && product.owner !== userEmail) {
          customError.createError({
            name: 'Product deletion error',
            cause: generateProductErrorInfo({ productId }),
            message: 'You do not have permission to delete this product.',
            code: ErrorCodes.PERMISSION_ERROR,
          });
        }
  
        // Borrar el producto
        const result = await ProductService.deleteProduct(productId);
        res.json({ message: 'Product deleted successfully.' });
      } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
      }
    }
  }
  
  // Endpoint para eliminar un producto
  router.delete('/:productId', new DeleteProductHandler().handle);

export default router;
