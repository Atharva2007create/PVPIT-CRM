import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { emailMatchesRole } from '../src/config/email-patterns.js';
import { ACCOUNT_STATUS } from '../src/constants/account-status.js';
import { ROLES } from '../src/constants/roles.js';
import { requireRole } from '../src/middleware/authorize.js';
import { User } from '../src/models/user.model.js';
import { userRepository } from '../src/repositories/user.repository.js';
import { authService } from '../src/services/auth.service.js';
import { signAccessToken } from '../src/utils/jwt.js';
import { comparePassword, hashPassword } from '../src/utils/password.js';

const app = createApp({ logging: false });
const originalRepository = { ...userRepository };

function account({
  role = ROLES.STUDENT,
  email = 'student.21cs104@pvpit.test',
  status = ACCOUNT_STATUS.ACTIVE,
  tokenVersion = 0,
  passwordHash = 'unused'
} = {}) {
  const id = new mongoose.Types.ObjectId().toString();
  return {
    id,
    _id: new mongoose.Types.ObjectId(id),
    name: role === ROLES.STUDENT ? 'Test Student' : 'Test Administrator',
    email,
    passwordHash,
    role,
    status,
    tokenVersion,
    lastLoginAt: null
  };
}

async function prepareLogin(user, password = 'StrongPass123!') {
  user.passwordHash = await hashPassword(password);
  userRepository.findByEmailWithPassword = async (email) => email === user.email ? user : null;
  userRepository.updateLastLogin = async () => user;
  return password;
}

function prepareAuthentication(user) {
  userRepository.findByIdForAuthentication = async (id) => id === user.id ? user : null;
}

beforeEach(() => Object.assign(userRepository, originalRepository));
afterEach(() => Object.assign(userRepository, originalRepository));

describe('User model and password security', () => {
  it('accepts student and administrator roles', () => {
    for (const role of [ROLES.STUDENT, ROLES.ADMINISTRATOR]) {
      const user = new User({
        name: 'Valid User',
        email: role === ROLES.STUDENT ? 'student.21cs104@pvpit.test' : 'admin.atharva@pvpit.test',
        passwordHash: 'hash',
        role
      });
      assert.equal(user.validateSync(), undefined, role);
    }
  });

  it('rejects unsupported roles', () => {
    const user = new User({ name: 'Invalid User', email: 'x@example.test', passwordHash: 'hash', role: 'mentor' });
    assert.match(user.validateSync().errors.role.message, /not a valid enum value/);
  });

  it('normalizes email and enforces duplicate rejection through a unique index', () => {
    const user = new User({
      name: 'Email User', email: '  STUDENT.21CS104@PVPIT.TEST  ', passwordHash: 'hash', role: ROLES.STUDENT
    });
    assert.equal(user.email, 'student.21cs104@pvpit.test');
    const emailIndex = User.schema.indexes().find(([fields]) => fields.email === 1);
    assert.equal(emailIndex[1].unique, true);
  });

  it('stores a verifiable hash and excludes it from JSON responses', async () => {
    const password = 'StrongPass123!';
    const passwordHash = await hashPassword(password);
    assert.notEqual(passwordHash, password);
    assert.equal(await comparePassword(password, passwordHash), true);
    const user = new User({
      name: 'Safe User', email: 'student.safe1@pvpit.test', passwordHash, role: ROLES.STUDENT
    });
    assert.equal(user.toJSON().passwordHash, undefined);
    assert.equal(user.toJSON().tokenVersion, undefined);
  });
});

describe('Administrator bootstrap', () => {
  it('creates the first administrator with a hash instead of plaintext', async () => {
    const email = 'admin.atharva@pvpit.test';
    const password = 'StrongPass123!';
    let createdData;
    userRepository.findByEmail = async () => null;
    userRepository.create = async (data) => {
      createdData = data;
      return { id: new mongoose.Types.ObjectId().toString(), ...data };
    };
    const result = await authService.bootstrapAdministrator({ name: 'Initial Administrator', email, password });
    assert.equal(result.created, true);
    assert.equal(result.user.role, ROLES.ADMINISTRATOR);
    assert.equal(result.user.email, email);
    assert.notEqual(createdData.passwordHash, password);
    assert.equal(await comparePassword(password, createdData.passwordHash), true);
  });

  it('is idempotent and never creates a duplicate administrator', async () => {
    const existing = account({ role: ROLES.ADMINISTRATOR, email: 'admin.atharva@pvpit.test' });
    userRepository.findByEmail = async () => existing;
    userRepository.create = mock.fn();
    const result = await authService.bootstrapAdministrator({
      name: existing.name,
      email: existing.email,
      password: 'StrongPass123!'
    });
    assert.equal(result.created, false);
    assert.equal(result.user.role, ROLES.ADMINISTRATOR);
    assert.equal(userRepository.create.mock.callCount(), 0);
  });
});

describe('Email pattern configuration', () => {
  it('validates student and administrator formats separately', () => {
    assert.equal(emailMatchesRole('student.21cs104@pvpit.test', ROLES.STUDENT), true);
    assert.equal(emailMatchesRole('admin.atharva@pvpit.test', ROLES.STUDENT), false);
    assert.equal(emailMatchesRole('admin.atharva@pvpit.test', ROLES.ADMINISTRATOR), true);
    assert.equal(emailMatchesRole('student.21cs104@pvpit.test', ROLES.ADMINISTRATOR), false);
    assert.equal(emailMatchesRole('student.bad-name@pvpit.test', ROLES.STUDENT), false);
    assert.equal(emailMatchesRole('admin.bad_name@pvpit.test', ROLES.ADMINISTRATOR), false);
  });
});

describe('Authentication API', () => {
  it('rejects a client-supplied role in the login request', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'student.21cs104@pvpit.test',
      password: 'StrongPass123!',
      role: ROLES.ADMINISTRATOR
    });
    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  });

  it('logs in a student using the stored role and returns no password data', async () => {
    const user = account();
    const password = await prepareLogin(user);
    const response = await request(app).post('/api/v1/auth/login').send({ email: user.email, password });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.role, ROLES.STUDENT);
    assert.equal(response.body.data.user.workflow, ROLES.STUDENT);
    assert.ok(response.body.data.accessToken);
    assert.doesNotMatch(JSON.stringify(response.body), /passwordHash|StrongPass123/);
  });

  it('logs in an administrator using the stored role', async () => {
    const user = account({ role: ROLES.ADMINISTRATOR, email: 'admin.operator1@pvpit.test' });
    const password = await prepareLogin(user);
    const response = await request(app).post('/api/v1/auth/login').send({ email: user.email, password });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.role, ROLES.ADMINISTRATOR);
    assert.equal(response.body.data.user.workflow, ROLES.ADMINISTRATOR);
  });

  it('returns the same generic error for unknown email and incorrect password', async () => {
    const user = account();
    await prepareLogin(user);
    for (const payload of [
      { email: 'student.unknown1@pvpit.test', password: 'StrongPass123!' },
      { email: user.email, password: 'Incorrect123!' }
    ]) {
      const response = await request(app).post('/api/v1/auth/login').send(payload);
      assert.equal(response.status, 401);
      assert.equal(response.body.error.code, 'INVALID_CREDENTIALS');
      assert.equal(response.body.error.message, 'Invalid email or password');
    }
  });

  it('rejects suspended users and role/email disagreement', async () => {
    const suspended = account({ status: ACCOUNT_STATUS.SUSPENDED });
    const password = await prepareLogin(suspended);
    let response = await request(app).post('/api/v1/auth/login').send({ email: suspended.email, password });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, 'ACCOUNT_SUSPENDED');

    const mismatched = account({ email: 'admin.learner1@pvpit.test', role: ROLES.STUDENT });
    await prepareLogin(mismatched, password);
    response = await request(app).post('/api/v1/auth/login').send({ email: mismatched.email, password });
    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, 'EMAIL_ROLE_MISMATCH');
  });

  it('rejects emails outside both configured formats before account lookup', async () => {
    userRepository.findByEmailWithPassword = mock.fn();
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'person@unapproved.example', password: 'StrongPass123!'
    });
    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, 'INVALID_EMAIL_PATTERN');
    assert.equal(userRepository.findByEmailWithPassword.mock.callCount(), 0);
  });

  it('accepts a valid JWT and returns the current safe user', async () => {
    const user = account();
    prepareAuthentication(user);
    const token = signAccessToken(user);
    const response = await request(app).get('/api/v1/auth/me').set('authorization', `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, user.id);
    assert.equal(response.body.data.role, ROLES.STUDENT);
    assert.doesNotMatch(JSON.stringify(response.body), /passwordHash|tokenVersion/);
  });

  it('rejects missing, invalid, expired, and revoked JWTs', async () => {
    let response = await request(app).get('/api/v1/auth/me');
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'AUTHENTICATION_REQUIRED');

    response = await request(app).get('/api/v1/auth/me').set('authorization', 'Bearer not-a-token');
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'INVALID_TOKEN');

    const user = account();
    prepareAuthentication(user);
    const expired = signAccessToken(user, { expiresIn: '-1s' });
    response = await request(app).get('/api/v1/auth/me').set('authorization', `Bearer ${expired}`);
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'TOKEN_EXPIRED');

    const revoked = signAccessToken(user);
    user.tokenVersion += 1;
    response = await request(app).get('/api/v1/auth/me').set('authorization', `Bearer ${revoked}`);
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'TOKEN_REVOKED');
  });

  it('logs out and invalidates the previously issued token', async () => {
    const user = account();
    prepareAuthentication(user);
    userRepository.incrementTokenVersion = async (id, currentVersion) => {
      if (id !== user.id || currentVersion !== user.tokenVersion) return null;
      user.tokenVersion += 1;
      return user;
    };
    const token = signAccessToken(user);
    const logout = await request(app).post('/api/v1/auth/logout').set('authorization', `Bearer ${token}`).send({});
    assert.equal(logout.status, 200);
    assert.equal(logout.body.message, 'Logout successful');
    const me = await request(app).get('/api/v1/auth/me').set('authorization', `Bearer ${token}`);
    assert.equal(me.status, 401);
    assert.equal(me.body.error.code, 'TOKEN_REVOKED');
  });
});

describe('Role authorization middleware', () => {
  it('allows matching roles and rejects cross-role access', () => {
    for (const [actual, required, allowed] of [
      [ROLES.STUDENT, ROLES.STUDENT, true],
      [ROLES.ADMINISTRATOR, ROLES.ADMINISTRATOR, true],
      [ROLES.STUDENT, ROLES.ADMINISTRATOR, false],
      [ROLES.ADMINISTRATOR, ROLES.STUDENT, false]
    ]) {
      const next = mock.fn();
      requireRole(required)({ user: { role: actual } }, {}, next);
      const error = next.mock.calls[0]?.arguments[0];
      assert.equal(error === undefined, allowed, `${actual} -> ${required}`);
      if (!allowed) assert.equal(error.statusCode, 403);
    }
  });
});
