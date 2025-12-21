const jwt = require('jsonwebtoken');

// JWT 토큰 검증 미들웨어
exports.verifyToken = (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
      });
    }

    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
};

// 관리자 권한 확인 미들웨어
exports.isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.'
    });
  }
  next();
};
