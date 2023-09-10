import express from 'express';
import { cartModel } from '../models/cartModel.js';

const cartsRouter = express.Router();

// Create a new cart
cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartModel.create({ products: [] });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cart by ID
cartsRouter.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartModel.findById(cartId);
    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).json({ error: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add product to cart
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;
  try {
    const cart = await cartModel.findById(cartId);

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    const product = cart.products.find(product => product.product === productId);
      if (product) {
        product.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint delete from cart
cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
      const result = await cartService.removeProductFromCart(cartId, productId);
      res.json({ message: result });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint refresh
cartsRouter.put('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const products = req.body.products;

  try {
      const result = await cartService.updateCart(cartId, products);
      res.json({ message: result });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint refresh quantity
cartsRouter.put('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity;

  try {
      const result = await cartService.updateProductQuantity(cartId, productId, quantity);
      res.json({ message: result });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint delete all
cartsRouter.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
      const result = await cartService.clearCart(cartId);
      res.json({ message: result });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});


export default cartsRouter;