const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 모든 장바구니 API는 로그인 필요
router.use(verifyToken);

// 장바구니 조회
router.get('/', cartController.getCart);

// 장바구니에 상품 추가
router.post('/', cartController.addToCart);

// 장바구니 상품 수량 변경
router.put('/:productId', cartController.updateCartItem);

// 장바구니에서 상품 삭제
router.delete('/:productId', cartController.removeFromCart);

// 장바구니 비우기
router.delete('/', cartController.clearCart);

module.exports = router;
