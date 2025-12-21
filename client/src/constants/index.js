// 카테고리 목록
export const CATEGORIES = [
  { name: '생활/주방', path: '/products?category=생활/주방' },
  { name: '욕실/청소', path: '/products?category=욕실/청소' },
  { name: '데스크/문구', path: '/products?category=데스크/문구' },
  { name: '홈데코/인테리어', path: '/products?category=홈데코/인테리어' },
];

// 카테고리 이름만 배열로 (select 옵션용)
export const CATEGORY_NAMES = CATEGORIES.map(cat => cat.name);

// 가격 포맷팅
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

// 배송비 관련 상수
export const SHIPPING = {
  FREE_THRESHOLD: 50000,  // 무료 배송 기준 금액
  STANDARD_FEE: 3000,     // 기본 배송비
};

// 배송비 계산 (무료배송 상품 여부 체크)
export const calculateShippingFee = (totalPrice, items = []) => {
  const hasFreeShippingItem = items.some(item => item.product?.freeShipping);
  if (hasFreeShippingItem || totalPrice >= SHIPPING.FREE_THRESHOLD) {
    return 0;
  }
  return SHIPPING.STANDARD_FEE;
};

// 주문 상태
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// 주문 상태 한글 라벨
export const ORDER_STATUS_LABEL = {
  pending: '결제대기',
  paid: '결제완료',
  preparing: '상품준비중',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소됨',
  refunded: '환불됨',
};

// 주문 상태 CSS 클래스
export const ORDER_STATUS_CLASS = {
  pending: 'status-pending',
  paid: 'status-paid',
  preparing: 'status-preparing',
  shipping: 'status-shipping',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
  refunded: 'status-refunded',
};

// 결제 관련 상수
export const PAYMENT = {
  PG_PROVIDER: 'html5_inicis',
  ORDER_PREFIX: 'ORD-',
};

// 배송 메모 옵션
export const SHIPPING_MEMO_OPTIONS = [
  { value: '', label: '배송 메모를 선택해주세요' },
  { value: '문 앞에 놓아주세요', label: '문 앞에 놓아주세요' },
  { value: '경비실에 맡겨주세요', label: '경비실에 맡겨주세요' },
  { value: '배송 전 연락주세요', label: '배송 전 연락주세요' },
  { value: '부재 시 휴대폰으로 연락주세요', label: '부재 시 휴대폰으로 연락주세요' },
];

// 주문 조회 기간 필터
export const DATE_FILTERS = [
  { value: 'today', label: '오늘' },
  { value: '7day', label: '7일' },
  { value: '15day', label: '15일' },
  { value: '1month', label: '1개월' },
  { value: '3month', label: '3개월' },
  { value: '1year', label: '1년' },
];

// 주문 상태 필터 옵션
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '준비중' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소/환불' },
];
