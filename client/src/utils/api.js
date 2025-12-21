// API Configuration and utilities

// 환경변수에서 API URL 가져오기 (없으면 로컬 개발용 주소 사용)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '요청에 실패했습니다.');
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email, password) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => fetchApi('/auth/me'),

  // Token validation (returns user or null)
  validateToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const data = await fetchApi('/auth/me');
      return data.user;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },
};

// User API
export const userApi = {
  create: (userData) =>
    fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getAll: () => fetchApi('/users'),

  getById: (id) => fetchApi(`/users/${id}`),

  update: (id, userData) =>
    fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  delete: (id) =>
    fetchApi(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Product API
export const productApi = {
  // 공개 상품 목록 (쇼핑몰용)
  getPublic: (category) => {
    const params = category ? `?category=${category}` : '';
    return fetchApi(`/products/public${params}`);
  },

  // 전체 상품 목록 (어드민용 - 인증 필요, 페이지네이션)
  getAll: (page = 1, limit = 5) => fetchApi(`/products?page=${page}&limit=${limit}`),

  // 단일 상품 조회
  getById: (id) => fetchApi(`/products/${id}`),

  // SKU로 조회
  getBySku: (sku) => fetchApi(`/products/sku/${sku}`),

  // 상품 생성 (어드민)
  create: (productData) =>
    fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  // 상품 수정 (어드민)
  update: (id, productData) =>
    fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  // 상품 삭제 (어드민)
  delete: (id) =>
    fetchApi(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Order API
export const orderApi = {
  // 주문 생성
  create: (orderData) =>
    fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // 내 주문 목록 조회
  getMyOrders: (page = 1, limit = 10, status) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return fetchApi(`/orders/my?${params}`);
  },

  // 주문 상세 조회
  getById: (id) => fetchApi(`/orders/${id}`),

  // 주문 취소
  cancel: (id, reason) =>
    fetchApi(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  // ===== 관리자 API =====
  // 전체 주문 목록
  getAllAdmin: (page = 1, limit = 20, status) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return fetchApi(`/orders/admin/all?${params}`);
  },

  // 주문 통계
  getStats: () => fetchApi('/orders/admin/stats'),

  // 주문 상세 (관리자)
  getByIdAdmin: (id) => fetchApi(`/orders/admin/${id}`),

  // 주문 상태 변경
  updateStatus: (id, status, memo) =>
    fetchApi(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, memo }),
    }),
};

// Cart API
export const cartApi = {
  // 장바구니 조회
  get: () => fetchApi('/cart'),

  // 장바구니에 상품 추가
  add: (productId, quantity = 1) =>
    fetchApi('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  // 장바구니 상품 수량 변경
  updateQuantity: (productId, quantity) =>
    fetchApi(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  // 장바구니에서 상품 삭제
  remove: (productId) =>
    fetchApi(`/cart/${productId}`, {
      method: 'DELETE',
    }),

  // 장바구니 비우기
  clear: () =>
    fetchApi('/cart', {
      method: 'DELETE',
    }),
};

export default fetchApi;
