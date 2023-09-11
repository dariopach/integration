import { Router } from 'express';
import { productDBService } from '../services/productDBManager.js';
import { CartDBManager } from '../services/cartDBManager.js';
import { cartModel } from '../models/cartModel.js';

const router = Router();
const ProductService = new productDBService();
const CartService = new CartDBManager(); // Crea una instancia del servicio de carrito

router.get('/', async (req, res) => {
    const { page, limit, sort, query } = req.query;
    const result = await ProductService.getAllProducts({ page, limit, sort, query });

    result.prevLink = result.hasPrevPage ? `http://localhost:8080/products?page=${result.prevPage}` : '';
    result.nextLink = result.hasNextPage ? `http://localhost:8080/products?page=${result.nextPage}` : '';
    result.isValid = !(page <= 0 || page > result.totalPages);

    res.render('index', {
        title: 'Entrega',
        style: 'index.css',
        result,
    });
});

router.get('/carts/:cid', async (req, res) => {
    const cartId = req.params.cid;

    try {
        // Obtén el carrito por su cartId utilizando el servicio de carrito
        const cart = await CartService.getCartById(cartId);

        if (!cart) {
            // Maneja el caso en que no se encuentre el carrito
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }

        // Renderiza la vista de carrito con el carrito obtenido
        res.render('cart', { title: 'Carrito de Compras', cart });
    } catch (error) {
        console.error('Error al obtener el carrito desde la base de datos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
