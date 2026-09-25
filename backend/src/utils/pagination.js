export function paginationFromQuery(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export const PAGINATION_DEFAULTS = Object.freeze({ page: 1, limit: 20, maxLimit: 100 });

export function paginationMeta({ page, limit, total }) {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}
