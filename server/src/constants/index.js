// 배송비 관련 상수
const SHIPPING = {
  FREE_THRESHOLD: 50000,  // 무료 배송 기준 금액
  STANDARD_FEE: 3000,     // 기본 배송비
};

// 배송비 계산
const calculateShippingFee = (itemsPrice, hasFreeShippingItem = false) => {
  if (hasFreeShippingItem || itemsPrice >= SHIPPING.FREE_THRESHOLD) {
    return 0;
  }
  return SHIPPING.STANDARD_FEE;
};

// 주문 상태
const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// 장바구니 populate 필드
const CART_POPULATE_FIELDS = 'name price imageUrl stock sku freeShipping';

// 주문 populate 필드
const ORDER_POPULATE_FIELDS = {
  ITEMS_BASIC: 'name imageUrl',
  ITEMS_DETAIL: 'name sku',
  USER_BASIC: 'name email',
  USER_DETAIL: 'name email phone',
};

module.exports = {
  SHIPPING,
  calculateShippingFee,
  ORDER_STATUS,
  CART_POPULATE_FIELDS,
  ORDER_POPULATE_FIELDS,
};
