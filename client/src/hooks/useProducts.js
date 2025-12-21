import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../utils/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5,
    hasNext: false,
    hasPrev: false
  });

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await productApi.getAll(page, 5);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('제품 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const goToPage = (page) => {
    fetchProducts(page);
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      fetchProducts(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrev) {
      fetchProducts(pagination.currentPage - 1);
    }
  };

  const createProduct = async (productData) => {
    const data = {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock) || 0
    };
    await productApi.create(data);
    await fetchProducts(1); // 생성 후 첫 페이지로
  };

  const updateProduct = async (id, productData) => {
    const data = {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock) || 0
    };
    await productApi.update(id, data);
    await fetchProducts(pagination.currentPage); // 현재 페이지 유지
  };

  const deleteProduct = async (id) => {
    await productApi.delete(id);
    // 현재 페이지에 상품이 1개뿐이었으면 이전 페이지로
    if (products.length === 1 && pagination.hasPrev) {
      await fetchProducts(pagination.currentPage - 1);
    } else {
      await fetchProducts(pagination.currentPage);
    }
  };

  return {
    products,
    isLoading,
    pagination,
    fetchProducts,
    goToPage,
    nextPage,
    prevPage,
    createProduct,
    updateProduct,
    deleteProduct
  };
}
