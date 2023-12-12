import { cartModel } from "../models/cartModel.js";
import { productDBService } from "./productDBManager.js";

class CartDBManager {
    async createCart() {
        try {
            const newCart = await cartModel.create({ products: [] });
            return newCart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error creating cart');
        }
    }

    async getRandomCart() {
        try {
            const cart = await cartModel.findOne().populate('products.product').lean();
            if (cart) {
                let total = 0;
                cart.products.forEach( product => total += (product.product.price * product.quantity))
                cart.total = total;
                return cart;
            }
            return this.createCart();
        } catch (error) {
            console.error(error.message);
            throw new Error('Error fetching cart');
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.product').lean();
            const products = cart.products.filter(product => product.product._id.toString() !== productId);
            const updatedCart = await this.updateCart(cartId, products);
            let total = 0;
            updatedCart.products.forEach( product => total += (product.product.price * product.quantity))
            updatedCart.total = total;
            return updatedCart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error removing product');
        }
    }

    async updateProductQuantity(cartId, productId, quantity, userRole) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.product').lean();
            let products = [];

            cart.products.forEach(product => {
                if (product.product._id.toString() === productId) {
                    // Verificar que el usuario no sea premium y el producto le pertenezca
                    if (!(userRole === 'premium' && product.product.owner === 'admin')) {
                        product.quantity += quantity;
                    }
                }
                products.push(product);
            });
            const updatedCart = await this.updateCart(cartId, products);
            let total = 0;
            updatedCart.products.forEach( product => total += (product.product.price * product.quantity))
            updatedCart.total = total;
            return updatedCart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error updating quantity');
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.product').lean();
            let total = 0;
            cart.products.forEach( product => total += (product.product.price * product.quantity))
            cart.total = total;
            return cart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error fetching cart');
        }
    }

    async updateCart(cartId, products) {
        try {
            const updatedCart = await cartModel.findByIdAndUpdate(cartId, { products }, { new: true }).populate('products.product').lean();
            return updatedCart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error updating cart');
        }
    }

    async clearCart(cartId) {
        return this.updateCart(cartId, []);
    }

    async deleteCart(cartId) {
        try {
            const result = await cartModel.findByIdAndDelete(cartId);
            return result;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error deleting cart');
        }
    }
}

export { CartDBManager };
