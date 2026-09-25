import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB identifier');
export const paginationQuery = {
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
};

