const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { CART_POPULATE_FIELDS } = require('../constants');

// 장바구니 조회
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.product', CART_POPULATE_FIELDS);

    if (!cart) {
      cart = { items: [], totalPrice: 0, totalQuantity: 0 };
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니를 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 장바구니에 상품 추가
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // 상품 존재 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    // 재고 확인
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '재고가 부족합니다.'
      });
    }

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      // 장바구니가 없으면 새로 생성
      cart = new Cart({
        user: req.user.userId,
        items: [{ product: productId, quantity }]
      });
    } else {
      // 이미 있는 상품인지 확인
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        // 이미 있으면 수량 증가
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: '재고가 부족합니다.'
          });
        }
        existingItem.quantity = newQuantity;
      } else {
        // 없으면 새로 추가
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    // populate해서 반환
    cart = await Cart.findById(cart._id)
      .populate('items.product', CART_POPULATE_FIELDS);

    res.json({
      success: true,
      message: '장바구니에 추가되었습니다.',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 추가에 실패했습니다.',
      error: error.message
    });
  }
};

// 장바구니 상품 수량 변경
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: '수량은 1 이상이어야 합니다.'
      });
    }

    // 상품 재고 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: '재고가 부족합니다.'
      });
    }

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '장바구니에 해당 상품이 없습니다.'
      });
    }

    item.quantity = quantity;
    await cart.save();

    cart = await Cart.findById(cart._id)
      .populate('items.product', CART_POPULATE_FIELDS);

    res.json({
      success: true,
      message: '수량이 변경되었습니다.',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '수량 변경에 실패했습니다.',
      error: error.message
    });
  }
};

// 장바구니에서 상품 삭제
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    cart = await Cart.findById(cart._id)
      .populate('items.product', CART_POPULATE_FIELDS);

    res.json({
      success: true,
      message: '상품이 삭제되었습니다.',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 삭제에 실패했습니다.',
      error: error.message
    });
  }
};

// 장바구니 비우기
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: '장바구니가 비워졌습니다.',
      cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '장바구니 비우기에 실패했습니다.',
      error: error.message
    });
  }
};
