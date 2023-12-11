import supertest from 'supertest';
import chai from 'chai';
import { productModel } from '../src/models/productModel.js';

const requester = supertest('http://localhost:8080');
const expect = chai.expect;

describe('Testing Carts Router', () => {
  let cartId;

  it('should create a new cart with a status of 201', async () => {
    const response = await requester.post('/api/carts');
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('_id');
    cartId = response.body._id;
  });

  it('should add a product to the cart with a status of 200', async () => {
    const productData = {
      title: 'Test Product',
      description: 'A test product description',
      price: 10.99,
      code: 'ABC123',
      stock: 50,
      category: 'Test Category',
    };

    const product = await productModel.create(productData);

    const response = await requester
      .post(`/api/carts/${cartId}/product/${product._id}`)
      .send({ quantity: 2 });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.have.property('_id');
  });

  it('should delete a product from the cart with a status of 200', async () => {
    const product = await productModel.create({
      title: 'Test Product 2',
      description: 'Another test product description',
      price: 15.99,
      code: 'XYZ456',
      stock: 30,
      category: 'Test Category',
    });

    const response = await requester
      .delete(`/api/carts/${cartId}/products/${product._id}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.be.ok;
  });

  it('should update the cart with a status of 200', async () => {
    const response = await requester
      .put(`/api/carts/${cartId}`)
      .send({ products: [] });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.be.ok;
  });

  it('should update product quantity in the cart with a status of 200', async () => {
    const product = await productModel.create({
      title: 'Test Product 3',
      description: 'Yet another test product description',
      price: 20.99,
      code: 'PQR789',
      stock: 20,
      category: 'Test Category',
    });

    const response = await requester
      .put(`/api/carts/${cartId}/products/${product._id}`)
      .send({ quantity: 3 });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.be.ok;
  });

  it('should clear the cart with a status of 200', async () => {
    const response = await requester
      .delete(`/api/carts/${cartId}`);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.be.ok;
  });

  it('should finish a purchase with a status of 201', async () => {
    const product = await productModel.create({
      title: 'Test Product 4',
      description: 'Yet another test product description',
      price: 25.99,
      code: 'MNO123',
      stock: 15,
      category: 'Test Category',
    });

    const response = await requester
      .post(`/api/carts/${cartId}/purchase`);

    expect(response.status).to.equal(201);
    expect(response.body.ticket).to.be.ok;
    expect(response.body.notPurchasedProducts).to.be.an('array');
  });
});