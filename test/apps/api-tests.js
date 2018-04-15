const request = require('supertest');
const test = require('tape');

const { app, server } = require('../../lib/server.js');

const { ADMIN_NAME, ADMIN_PASSWORD } = require('../../lib/constants.js');

test('GET /api', t => {
  request(app).get('/api').auth(ADMIN_NAME, ADMIN_PASSWORD)
    .expect(200)
    .end((err, res) => {
      t.error(err, 'no request error');
      t.deepEqual(res.body, { hello: 'world' }, 'received expected response');
      t.end();
    });
});

server.close();
