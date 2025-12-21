const axios = require('axios');

const PORTONE_API_URL = 'https://api.iamport.kr';

// 포트원 액세스 토큰 발급
const getAccessToken = async () => {
  try {
    const response = await axios.post(`${PORTONE_API_URL}/users/getToken`, {
      imp_key: process.env.IMP_KEY,
      imp_secret: process.env.IMP_SECRET
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.message || '토큰 발급 실패');
    }

    return response.data.response.access_token;
  } catch (error) {
    console.error('포트원 토큰 발급 실패:', error.message);
    throw new Error('결제 서비스 연결에 실패했습니다.');
  }
};

// 결제 정보 조회
const getPaymentInfo = async (impUid) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(`${PORTONE_API_URL}/payments/${impUid}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.message || '결제 정보 조회 실패');
    }

    return response.data.response;
  } catch (error) {
    console.error('결제 정보 조회 실패:', error.message);
    throw new Error('결제 정보를 확인할 수 없습니다.');
  }
};

// 결제 검증
const verifyPayment = async (impUid, expectedAmount) => {
  const paymentInfo = await getPaymentInfo(impUid);

  // 결제 상태 확인
  if (paymentInfo.status !== 'paid') {
    return {
      success: false,
      message: `결제가 완료되지 않았습니다. 상태: ${paymentInfo.status}`,
      paymentInfo
    };
  }

  // 결제 금액 검증
  if (paymentInfo.amount !== expectedAmount) {
    return {
      success: false,
      message: `결제 금액이 일치하지 않습니다. (예상: ${expectedAmount}, 실제: ${paymentInfo.amount})`,
      paymentInfo
    };
  }

  return {
    success: true,
    message: '결제 검증 성공',
    paymentInfo
  };
};

// 결제 취소
const cancelPayment = async (impUid, reason, amount = null) => {
  try {
    const accessToken = await getAccessToken();

    const cancelData = {
      imp_uid: impUid,
      reason: reason
    };

    // 부분 취소인 경우 금액 지정
    if (amount) {
      cancelData.amount = amount;
    }

    const response = await axios.post(
      `${PORTONE_API_URL}/payments/cancel`,
      cancelData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (response.data.code !== 0) {
      throw new Error(response.data.message || '결제 취소 실패');
    }

    return {
      success: true,
      message: '결제가 취소되었습니다.',
      cancelInfo: response.data.response
    };
  } catch (error) {
    console.error('결제 취소 실패:', error.message);
    throw new Error('결제 취소에 실패했습니다.');
  }
};

// 결제 정보 정규화 (DB 저장용)
const normalizePaymentInfo = (paymentInfo) => {
  const normalized = {
    impUid: paymentInfo.imp_uid,
    merchantUid: paymentInfo.merchant_uid,
    pgProvider: paymentInfo.pg_provider,
    pgTid: paymentInfo.pg_tid,
    amount: paymentInfo.amount,
    receiptUrl: paymentInfo.receipt_url,
    paidAt: paymentInfo.paid_at ? new Date(paymentInfo.paid_at * 1000) : null
  };

  // 카드 결제 정보
  if (paymentInfo.pay_method === 'card') {
    normalized.cardInfo = {
      cardName: paymentInfo.card_name,
      cardNumber: paymentInfo.card_number,
      cardQuota: paymentInfo.card_quota,
      approvalNumber: paymentInfo.apply_num
    };
  }

  // 가상계좌 정보
  if (paymentInfo.pay_method === 'vbank') {
    normalized.bankInfo = {
      bankName: paymentInfo.vbank_name,
      bankCode: paymentInfo.vbank_code,
      accountNumber: paymentInfo.vbank_num,
      accountHolder: paymentInfo.vbank_holder,
      dueDate: paymentInfo.vbank_date ? new Date(paymentInfo.vbank_date * 1000) : null
    };
  }

  return normalized;
};

module.exports = {
  getAccessToken,
  getPaymentInfo,
  verifyPayment,
  cancelPayment,
  normalizePaymentInfo
};
