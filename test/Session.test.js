import supertest from 'supertest';
import chai from 'chai';

const requester = supertest('http://localhost:8080');
const expect = chai.expect;

describe('Testing Sessions Router', () => {
  let userCookie;

  it('should register a new user with valid data', async () => {
    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const response = await requester
      .post('/api/sessions/register')
      .send(userData);

    expect(response.status).to.equal(200);
  });

  it('should log in a user with valid credentials and return a cookie', async () => {
    const credentials = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const response = await requester
      .post('/api/sessions/login')
      .send(credentials);

    expect(response.status).to.equal(200);
    expect(response.headers['set-cookie']).to.be.an('array');
    userCookie = response.headers['set-cookie'][0];
  });

  it('should retrieve the current user with a status of 200', async () => {
    const response = await requester
      .get('/api/session/current')
      .set('Cookie', [userCookie]);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.payload).to.have.property('id');
    expect(response.body.payload).to.have.property('username');
    expect(response.body.payload).to.have.property('role');
    expect(response.body.payload.id).to.equal('john.doe@example.com');
    expect(response.body.payload.username).to.equal('John');
    expect(response.body.payload.role).to.be.ok;
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