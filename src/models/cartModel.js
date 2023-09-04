import mongoose from "mongoose";

const cartCollection = 'carts';

const cartProductSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    products: [cartProductSchema]
});



export const cartModel = mongoose.model(cartCollection, cartSchema);