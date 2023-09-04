import { Router } from 'express';
import { productDBService } from '../services/productDBManager.js';
import { uploader } from '../utils/multerUtil.js';

const router = Router ();
const ProductService = new productDBService();

router.get('/', async (req,res) => {
    const products = await ProductService.getAllProducts();
    res.send(products);
});

router.post('/', uploader.array('thumbnails', 2), async (req, res) => {
    
    if (!req.files) {
        req.body,thumbnails = [];
        req.files?.forEach((file) => {
            req.body.thumbnails.push(file.filename);
        });
    } 

    const result = await ProductService.createProduct(req.body);
    

    res.send({
        message: result
    });
});

export default router;