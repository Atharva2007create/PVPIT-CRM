import { randomUUID } from 'node:crypto';

export function requestId(req, res, next) {
  const suppliedId = req.get('x-request-id');
  req.requestId = suppliedId && suppliedId.length <= 128 ? suppliedId : randomUUID();
  res.set('x-request-id', req.requestId);
  next();
}
