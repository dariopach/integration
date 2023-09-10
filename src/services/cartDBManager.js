import { cartModel } from "../models/cartModel.js";

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

    async getCartById(cartId) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.product');
            return cart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error fetching cart');
        }
    }

    async updateCart(cartId, products) {
        try {
            const updatedCart = await cartModel.findByIdAndUpdate(cartId, { products }, { new: true }).populate('products.product');
            return updatedCart;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error updating cart');
        }
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
