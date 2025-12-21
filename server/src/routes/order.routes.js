const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// ==================== 사용자 API ====================
// 모든 사용자 API는 로그인 필요
router.use(verifyToken);

// 주문 생성
router.post('/', orderController.createOrder);

// 내 주문 목록 조회
router.get('/my', orderController.getMyOrders);

// 주문 상세 조회
router.get('/:id', orderController.getOrderById);

// 주문 취소
router.patch('/:id/cancel', orderController.cancelOrder);

// ==================== 관리자 API ====================
// 전체 주문 목록 조회
router.get('/admin/all', isAdmin, orderController.getAllOrders);

// 주문 통계
router.get('/admin/stats', isAdmin, orderController.getOrderStats);

// 주문 상세 조회 (관리자)
router.get('/admin/:id', isAdmin, orderController.getOrderByIdAdmin);

// 주문 상태 변경
router.patch('/admin/:id/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;
