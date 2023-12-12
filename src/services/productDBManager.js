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
        const {title, description, code, price, stock, category, thumbnails, owner} = product;

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
            thumbnails: thumbnails ?? [],
            owner: owner || 'admin',
        }

        try {
            const result = await productModel.create(newProduct);
            return 'New product created';
        } catch (error) {
            console.error(error.message);
            return 'Error creating new product';
        }

    }

    async updateProduct(productId, updatedProduct, userRole) {
        try {
            const product = await productModel.findById(productId);

            if (!product) {
                return 'Product not found';
            }

            if (userRole === 'admin' || (userRole === 'premium' && product.owner === 'admin')) {
                const result = await productModel.findByIdAndUpdate(productId, updatedProduct, { new: true });

                return 'Product updated';
            } else {
                return 'You do not have permission to update this product';
            }
        } catch (error) {
            console.error(error.message);
            return 'Error updating product';
        }
    }

    async deleteProduct(productId, userRole) {
        try {
            const product = await productModel.findById(productId);

            if (!product) {
                return 'Product not found';
            }

            if (userRole === 'admin' || (userRole === 'premium' && product.owner === 'admin')) {
                await productModel.findByIdAndDelete(productId);

                return 'Product deleted';
            } else {
                return 'You do not have permission to delete this product';
            }
        } catch (error) {
            console.error(error.message);
            return 'Error deleting product';
        }
    }

    
    async createProduct(product, userRole) {
        const { title, description, code, price, stock, category, thumbnails, owner, availability } = product;

        if (!title || !description || !code || !price || !stock || !category) {
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
            availability: availability ?? false,
            thumbnails: thumbnails ?? [],
            owner: owner || (userRole === 'premium' ? 'admin' : 'premium'),
        };

        try {
            const result = await productModel.create(newProduct);
            return result;
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
