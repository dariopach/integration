import mongoose from "mongoose";

const messageCollection = 'messages';

const messageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

export const productModel = mongoose.model(messageCollection, messageSchema);