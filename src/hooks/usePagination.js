import { useEffect, useMemo, useState } from 'react';

export const usePagination = (items = [], initialPageSize = 6) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalItems = items.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  useEffect(() => {
    setCurrentPage(page => Math.min(page, pageCount));
  }, [pageCount]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const changePageSize = size => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return { paginatedItems, currentPage, setCurrentPage, pageSize, setPageSize: changePageSize, pageCount, totalItems };
};
