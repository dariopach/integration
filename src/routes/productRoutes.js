import { Router } from 'express';
import  express  from 'express';
import { productDBService } from '../services/productDBManager.js';
import { uploader } from '../utils/multerUtil.js';
import generateMockProducts from '../utils/fakerUtil.js';

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
    if (!req.files) {
        req.body.thumbnails = [];
        req.files?.forEach((file) => {
            req.body.thumbnails.push(file.filename);
        });
    }

    const result = await ProductService.createProduct(req.body);

    res.json({
        message: result
    });
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

export default router;
