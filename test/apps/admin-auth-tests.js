const request = require('supertest');
const test = require('tape');

const { app, server } = require('../../lib/server.js');

const { ADMIN_NAME, ADMIN_PASSWORD } = require('../../lib/constants.js');

test('should return 401 when basic auth not included in request', t => {
  request(app).get('/api')
    .expect(401)
    .end((err, res) => {
      t.error(err, 'no request error');
      t.end();
    });
});

test('should return 401 when basic auth is wrong', t => {
  request(app).get('/api').auth('yolo', 'baggins')
  .expect(401)
  .end((err, res) => {
    t.error(err, 'no request error');
    t.end();
  });
});

test('should return 200 when basic auth successful', t => {
  request(app).get('/api').auth(ADMIN_NAME, ADMIN_PASSWORD)
  .expect(200)
  .end((err, res) => {
    t.error(err, 'no request error');
    t.end();
  });
});

server.close();
