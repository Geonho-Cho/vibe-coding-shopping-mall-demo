const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, '수량은 1 이상이어야 합니다.'],
    default: 1
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

// 총 금액 계산 가상 필드
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);
});

// 총 수량 계산 가상 필드
cartSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// JSON 변환 시 가상 필드 포함
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
