import fs, { writeFile } from 'fs';

class productFSService{

    constructor(file) {
        this.file = file;
    }

    getAllProducts() {
        try {
            const products = fs.readFileSync(this.file, 'utf-8')
            return JSON.parse(products);
        } catch (error) {
            console.log(error.message);
            return [];
        }
    }

    createProduct(product) {
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

        const products = this.getAllProducts();
        products.push(newProduct);

        try {
            fs.writeFileSync(this.file,JSON.stringify(products, null, '\t'));

            return 'New product created';
        } catch (error) {
            console.error(error.message);
            return 'Error creating new product';
        }

    }
}

export { productFSService } ;
