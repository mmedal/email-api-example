const request = require('supertest');
const test = require('tape');

const { app, server } = require('../../lib/server.js');

const { ADMIN_NAME, ADMIN_PASSWORD } = require('../../lib/constants.js');

test('GET /api', t => {
  request(app).get('/api').auth(ADMIN_NAME, ADMIN_PASSWORD)
    .expect(200)
    .end((err, res) => {
      t.error(err, 'no request error');
      t.deepEqual(res.body, { email: 'http://127.0.0.1/api/email' },
        'received expected response');
      t.end();
    });
});

test('GET /api/email', t => {
  request(app).post('/api/email')
    .send({
      to: 'bademail',
      from: 'fake@fake.com',
      fromName: 'fakeeee',
      subject: 'fake',
      body: 'fake'
    })
    .auth(ADMIN_NAME, ADMIN_PASSWORD)
    .expect(400)
    .end((err, res) => {
      t.error(err, 'no request error');
      t.equal(res.body.name, 'EmailValidationException',
        'email endpoint successfully bubbles up validation/api exceptions');
      t.end();
    });
});

server.close();
