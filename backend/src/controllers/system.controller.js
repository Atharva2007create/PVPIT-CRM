import { systemService } from '../services/system.service.js';
import { sendSuccess } from '../utils/api-response.js';

export function getApiInfo(_req, res) {
  return sendSuccess(res, { data: systemService.getApiInfo() });
}

export function getHealth(_req, res) {
  return sendSuccess(res, {
    data: systemService.getHealth(),
    message: 'Service health retrieved'
  });
}
