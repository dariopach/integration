import supertest from 'supertest';
import chai from 'chai';

const requester = supertest('http://localhost:8080');
const expect = chai.expect;

describe('Testing Products Router', () => {
  let token;
  const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'admin'
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

  it('should return a list of products with a status of 200', async () => {
    const response = await requester.get('/api/product').set('Cookie', `${token}`);
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.be.an('array');
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
      .post('/api/product')
      .set('Cookie', `${token}`)
      .send(productData);

    expect(response.status).to.equal(200);
  });

  it('should return a 404 status for a non-existent product', async () => {
    const response = await requester.get('/products/123456789').set('Cookie', `${token}`);
    expect(response.status).to.equal(404);
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