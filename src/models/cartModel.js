import mongoose from "mongoose";

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    products: [cartProductSchema]
});

const cartProductSchema = new Schema({
    product: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

export const cartModel = mongoose.model(cartCollection, cartSchema);