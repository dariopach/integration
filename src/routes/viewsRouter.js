import { Router } from 'express';
import { productDBService } from '../services/productDBManager.js';

const router = Router ();
const ProductService = new productDBService();

router.get('/', async (req,res) => {
    res.render(
        'index',
        {
            title: 'Entrega',
            style: 'index.css',
            products: await ProductService.getAllProducts()
        }
    )
});

router.get('/', async (req, res) => {
    const { page, limit, sort, query } = req.query;
    const products = await ProductService.getAllProducts({ page, limit, sort, query });
    res.render('productList', {
        title: 'Lista de Productos',
        style: 'productList.css',
        products,
    });
});


export default router;