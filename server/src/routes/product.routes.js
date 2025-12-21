const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// ========== 공개 API ==========
// 공개 상품 목록 (쇼핑몰 프론트용)
router.get('/public', productController.getPublicProducts);

// SKU로 상품 조회
router.get('/sku/:sku', productController.getProductBySku);

// 단일 상품 조회 (ID)
router.get('/:id', productController.getProductById);

// ========== 어드민 API ==========
// 전체 상품 목록 (어드민용 - 비공개 포함)
router.get('/', verifyToken, isAdmin, productController.getAllProducts);

// 상품 생성
router.post('/', verifyToken, isAdmin, productController.createProduct);

// 상품 수정
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);

// 상품 삭제
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
