const Product = require('../models/Product');

// 전체 상품 조회 (페이지네이션)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, isPublic, page = 1, limit = 5 } = req.query;

    // 필터 조건 구성
    const filter = {};
    if (category) filter.category = category;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 전체 개수와 상품 목록 조회
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 목록을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 단일 상품 조회 (ID)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// SKU로 상품 조회
exports.getProductBySku = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '해당 SKU의 상품을 찾을 수 없습니다.'
      });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 조회에 실패했습니다.',
      error: error.message
    });
  }
};

// 상품 생성
exports.createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, imageUrl, stock, isPublic, description, isRecommended } = req.body;

    // SKU 중복 체크
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 상품 코드(SKU)입니다.'
      });
    }

    const product = new Product({
      sku,
      name,
      price,
      category,
      imageUrl,
      stock: stock || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
      description: description || '',
      isRecommended: isRecommended || false
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      message: '상품이 등록되었습니다.',
      product: savedProduct
    });
  } catch (error) {
    // Mongoose 유효성 검사 에러 처리
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(400).json({
      success: false,
      message: '상품 등록에 실패했습니다.',
      error: error.message
    });
  }
};

// 상품 수정
exports.updateProduct = async (req, res) => {
  try {
    const { sku } = req.body;
    const productId = req.params.id;

    // SKU 변경 시 중복 체크 (자기 자신 제외)
    if (sku) {
      const existingProduct = await Product.findOne({
        sku,
        _id: { $ne: productId }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 상품 코드(SKU)입니다.'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '상품이 수정되었습니다.',
      product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(400).json({
      success: false,
      message: '상품 수정에 실패했습니다.',
      error: error.message
    });
  }
};

// 상품 삭제
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    res.json({
      success: true,
      message: '상품이 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 삭제에 실패했습니다.',
      error: error.message
    });
  }
};

// 공개 상품만 조회 (쇼핑몰 프론트용)
exports.getPublicProducts = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isPublic: true };
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '상품 목록을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};
