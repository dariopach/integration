import { productModel } from "../models/productModel.js";

class productDBService{

    async getAllProducts() {
        try {
            const products = await productModel.find();
            return products;
        } catch (error) {
            console.log(error.message);
            return [];
        }
    }

    async createProduct(product) {
        const {title, description, code, price, stock, category, thumbnails} = product;

        if(!title || !description || !code || !price || !stock || !category ) {
            return "Error creating product";
        }

        const newProduct = {
            title, 
            description, 
            code, 
            price, 
            status: true, 
            stock, 
            category, 
            thumbnails: thumbnails ?? []
        }

        try {
            const result = await productModel.create(newProduct);
            return 'New product created';
        } catch (error) {
            console.error(error.message);
            return 'Error creating new product';
        }

    }
}

export { productDBService } ;
