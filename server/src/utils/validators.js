const Product = require('../models/Product');

/**
 * 상품 존재 및 재고 검증
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 요청 수량
 * @returns {Promise<{product: Object, error: string|null}>}
 */
const validateStock = async (productId, quantity = 1) => {
  const product = await Product.findById(productId);

  if (!product) {
    return {
      product: null,
      error: '상품을 찾을 수 없습니다.',
      status: 404
    };
  }

  if (product.stock < quantity) {
    return {
      product,
      error: `재고가 부족합니다. (현재 재고: ${product.stock})`,
      status: 400
    };
  }

  return { product, error: null, status: 200 };
};

/**
 * 여러 상품의 재고 일괄 검증
 * @param {Array<{productId: string, quantity: number}>} items
 * @returns {Promise<{valid: boolean, errors: Array, products: Map}>}
 */
const validateStockBulk = async (items) => {
  const errors = [];
  const products = new Map();

  for (const item of items) {
    const { product, error } = await validateStock(item.productId || item.product, item.quantity);

    if (error) {
      errors.push({ productId: item.productId || item.product, error });
    } else {
      products.set(product._id.toString(), product);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    products
  };
};

/**
 * 수량 검증
 * @param {number} quantity
 * @returns {{valid: boolean, error: string|null}}
 */
const validateQuantity = (quantity) => {
  if (!quantity || quantity < 1) {
    return { valid: false, error: '수량은 1 이상이어야 합니다.' };
  }
  return { valid: true, error: null };
};

module.exports = {
  validateStock,
  validateStockBulk,
  validateQuantity,
};
