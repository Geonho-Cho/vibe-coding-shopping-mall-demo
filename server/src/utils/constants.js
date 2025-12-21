// 배송비 관련 상수
const SHIPPING = {
  FREE_THRESHOLD: 50000,  // 무료 배송 기준 금액
  STANDARD_FEE: 3000,     // 기본 배송비
};

// 배송비 계산
const calculateShippingFee = (totalPrice) => {
  return totalPrice >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.STANDARD_FEE;
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

// 취소 가능한 상태
const CANCELLABLE_STATUS = [ORDER_STATUS.PENDING, ORDER_STATUS.PAID];

module.exports = {
  SHIPPING,
  calculateShippingFee,
  ORDER_STATUS,
  CANCELLABLE_STATUS,
};
