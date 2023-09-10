import { Router } from 'express';
import { productDBService } from '../services/productDBManager.js';

const router = Router ();
const ProductService = new productDBService();

router.get('/', async (req,res) => {
    const { page, limit, sort, query } = req.query;
    res.render(
        'index',
        {
            title: 'Entrega',
            style: 'index.css',
            products: (await ProductService.getAllProducts({ page, limit, sort, query })).products
        }
    )
});

router.get('/', async (req, res) => {
    res.render('productList', {
        title: 'Lista de Productos',
        style: 'productList.css',
        products,
    });
});


export default router;