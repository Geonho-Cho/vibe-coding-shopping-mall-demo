const mongoose = require('mongoose');

// 주문 상품 스키마 (주문 시점 스냅샷)
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  imageUrl: String
}, { _id: false });

// 배송 정보 스키마
const shippingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '수령인 이름은 필수입니다.']
  },
  phone: {
    type: String,
    required: [true, '연락처는 필수입니다.']
  },
  postalCode: {
    type: String,
    required: [true, '우편번호는 필수입니다.']
  },
  address: {
    type: String,
    required: [true, '주소는 필수입니다.']
  },
  addressDetail: {
    type: String,
    default: ''
  },
  memo: {
    type: String,
    default: ''
  }
}, { _id: false });

// 결제 정보 스키마
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['card', 'bank'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  // 포트원 결제 정보
  impUid: String,           // 포트원 결제 고유 ID
  merchantUid: {            // 가맹점 주문번호 (중복 방지)
    type: String,
    unique: true,
    sparse: true            // null 허용하면서 unique
  },
  pgProvider: String,       // PG사 (html5_inicis 등)
  pgTid: String,            // PG 거래번호
  // 결제 금액 정보
  amount: Number,           // 실제 결제 금액
  // 카드 결제 정보
  cardInfo: {
    cardName: String,       // 카드사명
    cardNumber: String,     // 카드번호 (마스킹)
    cardQuota: Number,      // 할부 개월 (0: 일시불)
    approvalNumber: String  // 승인번호
  },
  // 가상계좌 정보
  bankInfo: {
    bankName: String,       // 은행명
    bankCode: String,       // 은행코드
    accountNumber: String,  // 계좌번호
    accountHolder: String,  // 예금주
    dueDate: Date           // 입금기한
  },
  // 기타
  receiptUrl: String,       // 영수증 URL
  paidAt: Date,             // 결제 완료 시각
  cancelledAt: Date,        // 취소 시각
  cancelReason: String      // 취소 사유
}, { _id: false });

// 상태 변경 이력 스키마
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  memo: String
}, { _id: false });

// 메인 주문 스키마
const orderSchema = new mongoose.Schema({
  // 주문번호 (ORD-20251221-001 형식)
  orderNumber: {
    type: String,
    unique: true
  },

  // 주문자
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 주문 상품
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [arr => arr.length > 0, '최소 1개 이상의 상품이 필요합니다.']
  },

  // 배송 정보
  shipping: {
    type: shippingSchema,
    required: true
  },

  // 금액 정보
  itemsPrice: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },

  // 결제 정보
  payment: {
    type: paymentSchema,
    required: true
  },

  // 주문 상태
  status: {
    type: String,
    enum: ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // 상태 변경 이력
  statusHistory: [statusHistorySchema],

  // 주문 메모 (관리자용)
  adminMemo: String

}, {
  timestamps: true
});

// 주문번호 자동 생성 (저장 전)
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // 오늘 날짜의 마지막 주문번호 찾기
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^ORD-${dateStr}-`)
    }).sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    this.orderNumber = `ORD-${dateStr}-${String(sequence).padStart(3, '0')}`;
  }

  // 상태 변경 이력 초기화
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      memo: '주문 생성'
    });
  }

  next();
});

// 상태 변경 메서드
orderSchema.methods.updateStatus = function(newStatus, memo = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    memo
  });
  return this.save();
};

// 인덱스
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.impUid': 1 });
orderSchema.index({ 'payment.merchantUid': 1 });

module.exports = mongoose.model('Order', orderSchema);
