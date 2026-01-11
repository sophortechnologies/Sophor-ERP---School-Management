export function buildPaginatedResponse<T>(
  data: T[],
  count: number,
  page: number,
  pageSize: number,
  baseUrl: string,
) {
  const totalPages = Math.ceil(count / pageSize);

  return {
    count,
    total_pages: totalPages,
    current_page: page,
    page_size: pageSize,
    next:
      page < totalPages
        ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}`
        : null,
    previous:
      page > 1
        ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}`
        : null,
    data,
  };
}
