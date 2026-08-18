const paginate = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

const parseQueryParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  const search = query.search?.trim() || '';
  const sort = query.sort || '-createdAt';
  return { page, limit, skip, search, sort };
};

module.exports = { paginate, parseQueryParams };
