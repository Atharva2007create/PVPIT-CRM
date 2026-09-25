import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Phase 1 foundation remains active', () => {
  const app = createApp({ logging: false });

  it('creates the application with valid environment configuration', () => {
    assert.equal(typeof app, 'function');
  });

  it('returns the standard health response from both health endpoints', async () => {
    for (const path of ['/health', '/api/v1/health']) {
      const response = await request(app).get(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.body.success, true, path);
      assert.equal(response.body.data.status, 'ok', path);
      assert.equal(response.body.data.environment, 'test', path);
      assert.equal(response.body.data.database.status, 'disconnected', path);
      assert.equal(response.body.data.apiVersion, 'v1', path);
      assert.ok(response.body.data.serverTime, path);
      assert.ok(response.body.message, path);
      assert.ok(response.headers['x-request-id'], path);
      assert.equal(response.headers['x-powered-by'], undefined, path);
    }
  });

  it('returns API version information and exactly two roles', async () => {
    const response = await request(app).get('/api/v1');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.version, 'v1');
    assert.deepEqual(response.body.data.roles, ['student', 'administrator']);
  });

  it('returns the standard 404 response for unknown routes', async () => {
    const response = await request(app).get('/api/v1/missing');
    assert.equal(response.status, 404);
    assert.deepEqual(Object.keys(response.body).sort(), ['error', 'requestId', 'success']);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
    assert.ok(response.body.requestId);
  });

  it('has no active notification route', async () => {
    const response = await request(app).get('/api/v1/notifications');
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
  });

  it('has no active later-phase business routes', async () => {
    const paths = [
      '/api/v1/students', '/api/v1/academics', '/api/v1/attendance', '/api/v1/grievances',
      '/api/v1/users', '/api/v1/auth/register'
    ];
    for (const path of paths) {
      const response = await request(app).get(path);
      assert.equal(response.status, 404, path);
      assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND', path);
    }
  });

  it('normalizes parser failures through the central error handler', async () => {
    const response = await request(app)
      .post('/api/v1')
      .set('content-type', 'application/json')
      .send('{');
    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'INVALID_JSON');
    assert.ok(response.body.requestId);
  });
});
