import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { orderApi } from '../utils/api';
import { formatPrice, calculateShippingFee, PAYMENT, SHIPPING_MEMO_OPTIONS } from '../constants';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { items, totalPrice, clearCart, isLoading: cartLoading } = useCart();

  // 바로 구매 / 선택 상품 주문
  const directBuy = location.state?.directBuy;
  const directProduct = location.state?.product;
  const directQuantity = location.state?.quantity || 1;
  const selectedOnly = location.state?.selectedOnly;
  const selectedItemIds = location.state?.selectedItems || [];

  // 주문할 상품 필터링
  const orderItems = directBuy
    ? [{ product: directProduct, quantity: directQuantity }]
    : selectedOnly
      ? items.filter(item => selectedItemIds.includes(item.product._id))
      : items;

  // 주문 금액 계산
  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = calculateShippingFee(itemsPrice, orderItems);
  const finalPrice = itemsPrice + shippingFee;

  // 폼 상태
  const [formData, setFormData] = useState({
    // 주문자 정보
    ordererName: user?.name || '',
    ordererPhone: user?.phone || '',
    ordererEmail: user?.email || '',
    // 배송 정보
    shippingName: '',
    shippingPhone: '',
    postalCode: '',
    address: '',
    addressDetail: '',
    shippingMemo: '',
    sameAsOrderer: false,
    // 결제 수단
    paymentMethod: 'card',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const hasChecked = useRef(false);
  const orderCompleted = useRef(false);

  // 포트원 결제 모듈 초기화
  useEffect(() => {
    const IMP = window.IMP;
    if (IMP) {
      IMP.init(import.meta.env.VITE_IMP_CODE);
    }
  }, []);

  // 로그인 및 장바구니 체크 (로딩 완료 후 한 번만 실행)
  useEffect(() => {
    // 이미 체크했거나 주문 완료된 경우 스킵
    if (hasChecked.current || orderCompleted.current) return;

    // 인증 로딩 중이면 아직 체크하지 않음
    if (authLoading) return;

    if (!user) {
      hasChecked.current = true;
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 바로 구매가 아닌 경우만 장바구니 로딩 체크
    if (!directBuy && cartLoading) return;

    if (orderItems.length === 0) {
      hasChecked.current = true;
      alert('주문할 상품이 없습니다.');
      navigate('/cart');
    }
  }, [user, orderItems, navigate, authLoading, cartLoading, directBuy]);

  // 주문자와 동일 체크
  const handleSameAsOrderer = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsOrderer: checked,
      shippingName: checked ? prev.ordererName : '',
      shippingPhone: checked ? prev.ordererPhone : '',
    }));
  };

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // PG사 설정 (TODO: 운영 배포 시 환경변수로 변경)
  const getPgProvider = () => 'html5_inicis';

  // 주문 제출 (포트원 결제)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.shippingName || !formData.shippingPhone || !formData.postalCode || !formData.address) {
      alert('배송 정보를 모두 입력해주세요.');
      return;
    }

    if (!agreedToTerms) {
      alert('구매조건 확인 및 결제진행에 동의해주세요.');
      return;
    }

    const IMP = window.IMP;
    if (!IMP) {
      alert('결제 모듈을 불러오지 못했습니다.');
      return;
    }

    setIsSubmitting(true);

    // 주문번호 생성
    const merchantUid = `${PAYMENT.ORDER_PREFIX}${Date.now()}`;

    // 상품명 설정
    const productName = orderItems.length > 1
      ? `${orderItems[0].product.name} 외 ${orderItems.length - 1}건`
      : orderItems[0].product.name;

    // 결제 요청
    IMP.request_pay(
      {
        pg: getPgProvider(),
        pay_method: formData.paymentMethod === 'bank' ? 'vbank' : 'card',
        merchant_uid: merchantUid,
        name: productName,
        amount: finalPrice,
        buyer_email: formData.ordererEmail,
        buyer_name: formData.ordererName,
        buyer_tel: formData.ordererPhone,
        buyer_addr: `${formData.address} ${formData.addressDetail}`,
        buyer_postcode: formData.postalCode,
      },
      async (response) => {
        if (response.success) {
          // 결제 성공 → 서버에 주문 생성
          try {
            const orderData = {
              items: orderItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
              })),
              shipping: {
                name: formData.shippingName,
                phone: formData.shippingPhone,
                postalCode: formData.postalCode,
                address: formData.address,
                addressDetail: formData.addressDetail,
                memo: formData.shippingMemo,
              },
              payment: {
                method: formData.paymentMethod,
                impUid: response.imp_uid,
                merchantUid: response.merchant_uid,
              },
            };

            const orderResponse = await orderApi.create(orderData);

            if (orderResponse.success) {
              // 주문 완료 플래그 설정 (빈 장바구니 체크 방지)
              orderCompleted.current = true;

              // 장바구니 전체 주문인 경우만 장바구니 비우기 (바로 구매, 선택 주문 제외)
              if (!directBuy && !selectedOnly) {
                await clearCart();
              }

              navigate('/order-complete', {
                state: { orderNumber: orderResponse.order.orderNumber }
              });
            }
          } catch (error) {
            alert(error.message || '주문 저장 중 오류가 발생했습니다.');
          }
        } else {
          // 결제 실패
          alert(`결제에 실패했습니다: ${response.error_msg}`);
        }
        setIsSubmitting(false);
      }
    );
  };

  // 로딩 중이거나 유효하지 않으면 null
  if (authLoading || (!directBuy && cartLoading)) {
    return <div className="checkout-page"><p>로딩 중...</p></div>;
  }

  if (!user) {
    return null;
  }

  // 주문 완료 후 navigate 대기 중이면 로딩 표시
  if (orderCompleted.current) {
    return <div className="checkout-page"><p>주문 완료 처리 중...</p></div>;
  }

  if (orderItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>주문할 상품이 없습니다.</h2>
          <p>장바구니에서 상품을 추가해주세요.</p>
          <div className="checkout-empty-actions">
            <Link to="/cart" className="btn-go-cart">장바구니로 가기</Link>
            <Link to="/" className="btn-go-home">쇼핑 계속하기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* 브레드크럼 */}
      <div className="checkout-breadcrumb">
        <Link to="/">HOME</Link> &gt; 주문서 작성/결제
      </div>

      <h1 className="checkout-title">주문서작성/결제</h1>

      {/* 진행 단계 */}
      <div className="checkout-steps">
        <span className="step">01 장바구니</span>
        <span className="step-arrow">&gt;</span>
        <span className="step active">02 주문서작성/결제</span>
        <span className="step-arrow">&gt;</span>
        <span className="step">03 주문완료</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 주문 상품 내역 */}
        <section className="checkout-section">
          <h2 className="section-title">주문상세내역</h2>
          <div className="order-items-table">
            <table>
              <thead>
                <tr>
                  <th className="col-product">상품/옵션 정보</th>
                  <th className="col-qty">수량</th>
                  <th className="col-price">상품금액</th>
                  <th className="col-total">합계금액</th>
                  <th className="col-shipping">배송비</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.product._id}>
                    <td className="col-product">
                      <div className="item-info">
                        <img src={item.product.imageUrl} alt={item.product.name} />
                        <span>{item.product.name}</span>
                      </div>
                    </td>
                    <td className="col-qty">{item.quantity}개</td>
                    <td className="col-price">{formatPrice(item.product.price)}원</td>
                    <td className="col-total">{formatPrice(item.product.price * item.quantity)}원</td>
                    <td className="col-shipping">
                      {shippingFee === 0 ? '무료' : `${formatPrice(shippingFee)}원`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link to="/cart" className="back-to-cart">&lt; 장바구니 가기</Link>

          {/* 주문 요약 */}
          <div className="order-summary-box">
            <div className="summary-item">
              <span>총 {orderItems.length}개의 상품금액</span>
              <strong>{formatPrice(itemsPrice)}원</strong>
            </div>
            <span className="summary-operator">+</span>
            <div className="summary-item">
              <span>배송비</span>
              <strong>{formatPrice(shippingFee)}원</strong>
            </div>
            <span className="summary-operator">=</span>
            <div className="summary-item total">
              <span>합계</span>
              <strong>{formatPrice(finalPrice)}원</strong>
            </div>
          </div>
        </section>

        {/* 주문자 정보 */}
        <section className="checkout-section">
          <h2 className="section-title">주문자 정보</h2>
          <div className="form-grid">
            <div className="form-row">
              <label>주문하시는 분 *</label>
              <input
                type="text"
                name="ordererName"
                value={formData.ordererName}
                onChange={handleChange}
                placeholder="이름"
              />
            </div>
            <div className="form-row">
              <label>휴대폰 번호 *</label>
              <input
                type="tel"
                name="ordererPhone"
                value={formData.ordererPhone}
                onChange={handleChange}
                placeholder="010-0000-0000"
              />
            </div>
            <div className="form-row">
              <label>이메일</label>
              <input
                type="email"
                name="ordererEmail"
                value={formData.ordererEmail}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </section>

        {/* 배송 정보 */}
        <section className="checkout-section">
          <h2 className="section-title">배송정보</h2>

          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.sameAsOrderer}
                onChange={handleSameAsOrderer}
              />
              주문자 정보와 동일
            </label>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>받으실 분 *</label>
              <input
                type="text"
                name="shippingName"
                value={formData.shippingName}
                onChange={handleChange}
                placeholder="이름"
              />
            </div>
            <div className="form-row">
              <label>우편번호 *</label>
              <div className="input-with-btn">
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="우편번호"
                />
                <button type="button" className="btn-search">우편번호검색</button>
              </div>
            </div>
            <div className="form-row">
              <label>주소 *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="기본 주소"
              />
            </div>
            <div className="form-row">
              <label>상세주소</label>
              <input
                type="text"
                name="addressDetail"
                value={formData.addressDetail}
                onChange={handleChange}
                placeholder="상세 주소"
              />
            </div>
            <div className="form-row">
              <label>휴대폰 번호 *</label>
              <input
                type="tel"
                name="shippingPhone"
                value={formData.shippingPhone}
                onChange={handleChange}
                placeholder="010-0000-0000"
              />
            </div>
            <div className="form-row">
              <label>배송 메모</label>
              <select
                name="shippingMemo"
                value={formData.shippingMemo}
                onChange={handleChange}
              >
                {SHIPPING_MEMO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 결제 정보 */}
        <section className="checkout-section">
          <h2 className="section-title">결제정보</h2>
          <div className="payment-summary">
            <div className="payment-row">
              <span>상품 합계 금액</span>
              <span>{formatPrice(itemsPrice)}원</span>
            </div>
            <div className="payment-row">
              <span>배송비</span>
              <span>{shippingFee === 0 ? '무료' : `${formatPrice(shippingFee)}원`}</span>
            </div>
            <div className="payment-row">
              <span>할인 및 적립</span>
              <span>할인 (-) 0원</span>
            </div>
            <div className="payment-row total">
              <span>최종 결제 금액</span>
              <span>{formatPrice(finalPrice)}원</span>
            </div>
          </div>
        </section>

        {/* 결제 수단 */}
        <section className="checkout-section">
          <h2 className="section-title">결제수단 선택 / 결제</h2>
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleChange}
              />
              <span>신용카드/간편결제</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={formData.paymentMethod === 'bank'}
                onChange={handleChange}
              />
              <span>무통장입금</span>
            </label>
          </div>
        </section>

        {/* 최종 결제 */}
        <div className="checkout-final">
          <div className="final-price">
            <span>최종 결제 금액</span>
            <strong>{formatPrice(finalPrice)}원</strong>
          </div>

          <div className="terms-agreement">
            <label>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              (필수) 구매하실 상품의 결제정보를 확인하였으며, 구매진행에 동의합니다.
            </label>
          </div>

          <button
            type="submit"
            className="btn-checkout"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '결제하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
