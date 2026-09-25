import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.validated.body);
  return sendSuccess(res, { data, message: 'Login successful' });
});

export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: authService.getCurrentUser(req.user) });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.auth);
  return sendSuccess(res, { message: 'Logout successful' });
});
