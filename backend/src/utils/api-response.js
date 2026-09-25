export function sendSuccess(res, { data = {}, message = 'Request successful', statusCode = 200 } = {}) {
  return res.status(statusCode).json({ success: true, data, message });
}
