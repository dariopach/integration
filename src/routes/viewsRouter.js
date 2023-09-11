import { Router } from 'express';
import { productDBService } from '../services/productDBManager.js';

const router = Router ();
const ProductService = new productDBService();

router.get('/', async (req,res) => {
    const { page, limit, sort, query } = req.query;
    const result = await ProductService.getAllProducts({ page, limit, sort, query });

    result.prevLink = result.hasPrevPage?`http://localhost:8080/products?page=${result.prevPage}`:'';
    result.nextLink = result.hasNextPage?`http://localhost:8080/products?page=${result.nextPage}`:'';
    result.isValid= !(page<=0||page>result.totalPages)

    res.render(
        'index',
        {
            title: 'Entrega',
            style: 'index.css',
            result
        }
    )
});

export default router;