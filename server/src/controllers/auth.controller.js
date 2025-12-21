const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일, 비밀번호 입력 확인
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 이메일로 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 비밀번호 제외하고 사용자 정보 반환
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      token,
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 현재 사용자 정보 조회 (토큰 검증)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
};
