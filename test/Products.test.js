import supertest from 'supertest';
import chai from 'chai';

const requester = supertest('http://localhost:8080');
const expect = chai.expect;

describe('Testing Products Router', () => {
  it('should return a list of products with a status of 200', async () => {
    const response = await requester.get('/products');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should create a new product with valid data', async () => {
    const productData = {
      title: 'Test Product',
      description: 'A test product description',
      price: 10.99,
      code: 'ABC123',
      stock: 50,
      category: 'Test Category',
    };

    const response = await requester
      .post('/api/products')
      .send(productData);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Product created successfully.');
    expect(response.body.payload).to.have.property('_id');
  });

  it('should return a 404 status for a non-existent product', async () => {
    const response = await requester.get('/products/123456789');
    expect(response.status).to.equal(404);
    expect(response.body.error).to.equal('Product not found');
  });
});