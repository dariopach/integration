import { fakerDE as faker } from '@faker-js/faker';

function generateMockProducts(count) {
    const mockProducts = [];
    for (let i = 1; i <= count; i++) {
      mockProducts.push({
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        code: faker.lorem.slug(),
        price: faker.commerce.price(),
        status: faker.datatype.boolean(),
        stock: faker.number.int({ min: 0, max: 100 }),
        category: faker.commerce.product(),
        availability: faker.datatype.boolean(),
        thumbnails: faker.image.url()
      });
    }
    return mockProducts;
  }


  export default generateMockProducts