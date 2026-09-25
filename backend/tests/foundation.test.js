import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { parseEnvironment } from '../src/config/env.js';
import { ROLE_VALUES } from '../src/constants/roles.js';
import { errorHandler } from '../src/middleware/error-handler.js';
import { requestId } from '../src/middleware/request-id.js';
import { validate } from '../src/middleware/validate.js';

describe('foundation configuration and contracts', () => {
  it('rejects invalid environment configuration with a clear error', () => {
    assert.throws(
      () => parseEnvironment({ NODE_ENV: 'development', PORT: '0' }),
      /Invalid environment configuration:.*PORT.*MONGODB_URI.*JWT_SECRET.*CLIENT_ORIGIN/
    );
  });

  it('contains only student and administrator roles', () => {
    assert.deepEqual(ROLE_VALUES, ['student', 'administrator']);
  });

  it('returns validation failures in the standard error response', async () => {
    const schema = z.object({
      body: z.object({ name: z.string().min(2) }),
      params: z.object({}),
      query: z.object({})
    });
    const app = express();
    app.use(requestId, express.json());
    app.post('/validate', validate(schema), (_req, res) => res.json({ success: true }));
    app.use(errorHandler);

    const response = await request(app).post('/validate').send({ name: '' });
    assert.equal(response.status, 422);
    assert.deepEqual(Object.keys(response.body).sort(), ['error', 'requestId', 'success']);
    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
    assert.equal(response.body.error.message, 'Request validation failed');
  });
});
