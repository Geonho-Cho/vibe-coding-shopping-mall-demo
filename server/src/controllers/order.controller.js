const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyPayment, normalizePaymentInfo, cancelPayment } = require('../utils/portone');
const { SHIPPING, calculateShippingFee, ORDER_POPULATE_FIELDS } = require('../constants');

// 주문 생성 (결제 검증 포함)
exports.createOrder = async (req, res) => {
  try {
    const { shipping, payment, items: requestItems } = req.body;
    const userId = req.user.userId;

    // 결제 정보 필수 확인
    if (!payment.impUid || !payment.merchantUid) {
      return res.status(400).json({
        success: false,
        message: '결제 정보가 누락되었습니다.'
      });
    }

    // 중복 주문 체크 (merchantUid 기준)
    const existingOrder = await Order.findOne({
      'payment.merchantUid': payment.merchantUid
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: '이미 처리된 주문입니다.',
        orderNumber: existingOrder.orderNumber
      });
    }

    // impUid 중복 체크
    const existingPayment = await Order.findOne({
      'payment.impUid': payment.impUid
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: '이미 사용된 결제 정보입니다.'
      });
    }

    // items가 직접 전달되지 않으면 장바구니에서 가져오기
    let items = requestItems;
    let cart = null;

    if (!items || items.length === 0) {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: '주문할 상품이 없습니다.'
        });
      }
      items = cart.items;
    }

    // 상품 정보 검증 및 스냅샷 생성
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = item.product._id
        ? item.product
        : await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `상품을 찾을 수 없습니다: ${item.product}`
        });
      }

      // 재고 확인
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `재고가 부족합니다: ${product.name} (현재 재고: ${product.stock})`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
        freeShipping: product.freeShipping || false
      });

      itemsPrice += product.price * item.quantity;
    }

    // 배송비 계산
    const hasFreeShippingItem = orderItems.some(item => item.freeShipping);
    const shippingFee = calculateShippingFee(itemsPrice, hasFreeShippingItem);
    const totalPrice = itemsPrice + shippingFee;

    // 포트원 결제 검증
    const verifyResult = await verifyPayment(payment.impUid, totalPrice);

    if (!verifyResult.success) {
      // 결제 금액 불일치 시 자동 취소
      if (verifyResult.paymentInfo && verifyResult.paymentInfo.status === 'paid') {
        try {
          await cancelPayment(payment.impUid, '결제 금액 불일치로 자동 취소');
        } catch (cancelError) {
          console.error('자동 취소 실패:', cancelError);
        }
      }

      return res.status(400).json({
        success: false,
        message: verifyResult.message
      });
    }

    // 결제 정보 정규화
    const normalizedPayment = normalizePaymentInfo(verifyResult.paymentInfo);

    // 주문 생성
    const order = new Order({
      user: userId,
      items: orderItems,
      shipping,
      itemsPrice,
      shippingFee,
      discountAmount: 0,
      totalPrice,
      payment: {
        method: payment.method,
        status: 'completed',
        ...normalizedPayment
      },
      status: 'paid'  // 결제 완료 상태로 생성
    });

    await order.save();

    // 재고 차감
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 장바구니 비우기 (장바구니에서 주문한 경우)
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({
      success: true,
      message: '주문이 생성되었습니다.',
      order
    });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 생성에 실패했습니다.',
      error: error.message
    });
  }
};

// 내 주문 목록 조회
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 목록 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 주문 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({
      _id: id,
      user: userId
    }).populate('items.product', ORDER_POPULATE_FIELDS.ITEMS_BASIC);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 주문 취소 (사용자)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    const order = await Order.findOne({
      _id: id,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 취소 가능한 상태 확인
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '취소할 수 없는 주문 상태입니다.'
      });
    }

    // 재고 복구
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // 상태 변경
    await order.updateStatus('cancelled', reason || '사용자 요청으로 취소');

    res.json({
      success: true,
      message: '주문이 취소되었습니다.',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 취소에 실패했습니다.',
      error: error.message
    });
  }
};

// ==================== 관리자 API ====================

// 전체 주문 목록 조회 (관리자)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', ORDER_POPULATE_FIELDS.USER_BASIC)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 목록 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 주문 상태 변경 (관리자)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, memo } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    // 결제 완료 처리
    if (status === 'paid' && order.payment.status !== 'completed') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
    }

    // 환불 처리
    if (status === 'refunded') {
      order.payment.status = 'refunded';
      // 재고 복구
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.updateStatus(status, memo);

    res.json({
      success: true,
      message: '주문 상태가 변경되었습니다.',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 상태 변경에 실패했습니다.',
      error: error.message
    });
  }
};

// 주문 상세 조회 (관리자)
exports.getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', ORDER_POPULATE_FIELDS.USER_DETAIL)
      .populate('items.product', ORDER_POPULATE_FIELDS.ITEMS_DETAIL);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '주문 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 주문 통계 (관리자 대시보드용)
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      statusCounts,
      recentRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $in: ['pending', 'paid'] } }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        totalRevenue: recentRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.',
      error: error.message
    });
  }
};
