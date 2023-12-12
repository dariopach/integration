import supertest from 'supertest';
import chai from 'chai';
import { productModel } from '../src/models/productModel.js';

const requester = supertest('http://localhost:8080');
const expect = chai.expect;

describe('Testing Carts Router', () => {
  let token;
  let cartId;
  const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
  };

  before((done) => {
    requester
      .post('/api/sessions/register')
      .send(mockUser)
      .end((err, res) => {
        if (err) {
          console.error('Error registering:', err);
          done(err);
        } else {
          // Handle the response if needed
          done();
        }
      });
  });

  beforeEach((done) => {
    const credentials = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    requester
      .post('/api/sessions/login')
      .send(credentials)
      .end((err, res) => {
        if (err) {
          console.error('Error logging:', err);
          done(err);
        } else {
          token = res.headers['set-cookie'][0];
          done();
        }
      });
  });

  it('should create a new cart with a status of 201', async () => {
    const response = await requester.post('/api/carts').set('Cookie', `${token}`);
    cartId = response.body._id;
    expect(response.status).to.equal(201);
  });

  it('should add a product to the cart with a status of 200', async () => {
    const response = await requester
      .post(`/api/carts/${cartId}/product/64fe38f60678c670690132fa`)
      .set('Cookie', `${token}`)
      .send({ quantity: 2 });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.have.property('_id');
  });

  it('should delete a product from the cart with a status of 200', async () => {
    const response = await requester
      .delete(`/api/carts/${cartId}/products/64fe38f60678c670690132fa`)
      .set('Cookie', `${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.be.ok;
  });

  it('should update the cart with a status of 200', async () => {
    const response = await requester
      .put(`/api/carts/${cartId}`)
      .set('Cookie', `${token}`)
      .send({ products: [] });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.be.ok;
  });

  it('should update product quantity in the cart with a status of 200', async () => {
    const response = await requester
      .put(`/api/carts/${cartId}/products/64fe38f60678c670690132fa`)
      .set('Cookie', `${token}`)
      .send({ quantity: 3 });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.message).to.be.ok;
  });

  it('should clear the cart with a status of 200', async () => {
    const response = await requester
      .delete(`/api/carts/${cartId}`).set('Cookie', `${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.be.ok;
  });

  it('should finish a purchase with a status of 201', async () => {
    const response = await requester
      .post(`/api/carts/${cartId}/purchase`)
      .set('Cookie', `${token}`);

    expect(response.status).to.equal(201);
    expect(response.body.ticket).to.be.ok;
    expect(response.body.notPurchasedProducts).to.be.an('array');
  });

  after((done) => {
    requester
      .delete('/api/sessions/delete')
      .send({ email: 'john.doe@example.com' })
      .end((err, res) => {
        if (err) {
          console.error('Error deleting session:', err);
          done(err);
        } else {
          // Handle the response if needed
          done();
        }
      });
  });

});