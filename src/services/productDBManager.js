import { productModel } from "../models/productModel.js";

class productDBService{

    async getAllProducts({ page, limit, sort, query }) {
        try {
            const options = {
                page: page || 1,
                limit: limit || 10,
                sort: sort || {},
                customLabels: {
                    totalDocs: 'totalProducts',
                    docs: 'products',
                },
            };

            const products = await productModel.paginate(query || {}, {lean: true, ...options});
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

    async getFilteredProducts({ limit, page, sort, query, category, availability }) {
        try {
            const filter = {};
            if (query) {
                filter.title = { $regex: query, $options: 'i' };
            }
            if (category) {
                filter.category = category;
            }
            if (availability !== undefined) {
                filter.availability = availability === 'true';
            }

            const options = {
                page,
                limit,
                sort,
            };

            const products = await productModel.paginate(filter, options);
            return {
                status: 'success',
                payload: products.docs,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/api/product?limit=${limit}&page=${products.prevPage}` : null,
                nextLink: products.hasNextPage ? `/api/product?limit=${limit}&page=${products.nextPage}` : null,
            };
        } catch (error) {
            console.log(error.message);
            return { status: 'error', payload: [] };
        }
    }    
}

export { productDBService } ;
