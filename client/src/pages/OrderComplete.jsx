import { Link, useLocation } from 'react-router-dom';
import './OrderComplete.css';

function OrderComplete() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber;

  return (
    <div className="order-complete-page">
      {/* 브레드크럼 */}
      <div className="complete-breadcrumb">
        <Link to="/">HOME</Link> &gt; 주문완료
      </div>

      <h1 className="complete-title">주문완료</h1>

      {/* 진행 단계 */}
      <div className="complete-steps">
        <span className="step">01 장바구니</span>
        <span className="step-arrow">&gt;</span>
        <span className="step">02 주문서작성/결제</span>
        <span className="step-arrow">&gt;</span>
        <span className="step active">03 주문완료</span>
      </div>

      {/* 완료 메시지 */}
      <div className="complete-content">
        <div className="complete-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h2>주문이 완료되었습니다!</h2>
        <p>주문해 주셔서 감사합니다.</p>

        {orderNumber && (
          <div className="order-number">
            <span>주문번호</span>
            <strong>{orderNumber}</strong>
          </div>
        )}

        <p className="complete-notice">
          주문 내역은 마이페이지에서 확인하실 수 있습니다.
        </p>

        <div className="complete-actions">
          <Link to="/mypage/orders" className="btn-orders">주문 내역 보기</Link>
          <Link to="/" className="btn-home">쇼핑 계속하기</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderComplete;
