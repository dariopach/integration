import { Router } from 'express';
import { productFSService } from '../services/productFSManager.js';

const router = Router ();
const ProductService = new productFSService('Products.json');

router.get('/', (req,res) => {
    res.render(
        'index',
        {
            title: 'Entrega',
            style: 'index.css',
            products: ProductService.getAllProducts()
        }
    )
});


export default router;