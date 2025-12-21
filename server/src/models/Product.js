const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // 상품 코드 (SKU) - 유니크
  sku: {
    type: String,
    required: [true, '상품 코드(SKU)는 필수입니다.'],
    unique: true,
    trim: true
  },
  // 상품명
  name: {
    type: String,
    required: [true, '상품명은 필수입니다.'],
    trim: true
  },
  // 상품 가격
  price: {
    type: Number,
    required: [true, '상품 가격은 필수입니다.'],
    min: [0, '가격은 0 이상이어야 합니다.']
  },
  // 상품 카테고리
  category: {
    type: String,
    required: [true, '상품 카테고리는 필수입니다.'],
    trim: true
  },
  // 상품 이미지 (URL)
  imageUrl: {
    type: String,
    required: [true, '상품 이미지 URL은 필수입니다.']
  },
  // 재고 수량
  stock: {
    type: Number,
    required: true,
    min: [0, '재고는 0 이상이어야 합니다.'],
    default: 0
  },
  // 판매 상태 (공개/비공개)
  isPublic: {
    type: Boolean,
    required: true,
    default: true
  },
  // 상품 설명 (선택)
  description: {
    type: String,
    default: ''
  },
  // 추천 상품 여부 (기존 기능 유지)
  isRecommended: {
    type: Boolean,
    default: false
  },
  // 무료배송 여부
  freeShipping: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

// SKU 중복 체크를 위한 인덱스
productSchema.index({ sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
