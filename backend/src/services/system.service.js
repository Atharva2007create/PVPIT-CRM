import { env } from '../config/env.js';
import { ROLE_VALUES } from '../constants/roles.js';
import { systemRepository } from '../repositories/system.repository.js';

export const API_VERSION = 'v1';

export const systemService = Object.freeze({
  getApiInfo() {
    return {
      name: 'PVPIT Student CRM API',
      version: API_VERSION,
      phase: 'Phase 2 - Authentication and Authorization',
      roles: ROLE_VALUES
    };
  },

  getHealth() {
    return {
      status: 'ok',
      environment: env.NODE_ENV,
      database: { status: systemRepository.getDatabaseStatus() },
      serverTime: new Date().toISOString(),
      apiVersion: API_VERSION
    };
  }
});
