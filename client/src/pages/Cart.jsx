import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, calculateShippingFee, SHIPPING } from '../constants';
import QuantitySelector from '../components/QuantitySelector';
import './Cart.css';

function Cart() {
  const { user } = useAuth();
  const { items, totalPrice, isLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  // 로그인 체크
  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>로그인이 필요합니다</h2>
          <p>장바구니를 이용하시려면 로그인해주세요.</p>
          <Link to="/login" className="cart-login-btn">로그인</Link>
        </div>
      </div>
    );
  }

  // 전체 선택
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(item => item.product._id));
    } else {
      setSelectedItems([]);
    }
  };

  // 개별 선택
  const handleSelectItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // 수량 변경
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      alert(error.message);
    }
  };

  // 선택 상품 삭제
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedItems.length}개 상품을 삭제하시겠습니까?`)) return;

    for (const productId of selectedItems) {
      await removeFromCart(productId);
    }
    setSelectedItems([]);
  };

  // 전체 삭제
  const handleClearCart = async () => {
    if (!window.confirm('장바구니를 비우시겠습니까?')) return;
    await clearCart();
    setSelectedItems([]);
  };

  // 선택 상품 금액 계산
  const selectedTotalPrice = items
    .filter(item => selectedItems.includes(item.product._id))
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // 배송비 계산
  const shippingFee = calculateShippingFee(totalPrice, items);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">장바구니</h1>
        <div className="cart-empty">
          <p>장바구니가 비어있습니다.</p>
          <Link to="/products" className="cart-continue-btn">쇼핑 계속하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* 브레드크럼 */}
      <div className="cart-breadcrumb">
        <Link to="/">HOME</Link> &gt; 장바구니
      </div>

      <h1 className="cart-title">장바구니</h1>

      {/* 진행 단계 */}
      <div className="cart-steps">
        <span className="step active">01 장바구니</span>
        <span className="step-arrow">&gt;</span>
        <span className="step">02 주문서작성/결제</span>
        <span className="step-arrow">&gt;</span>
        <span className="step">03 주문완료</span>
      </div>

      {/* 장바구니 테이블 */}
      <div className="cart-table-wrapper">
        <table className="cart-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="col-product">상품/옵션 정보</th>
              <th className="col-quantity">수량</th>
              <th className="col-price">상품금액</th>
              <th className="col-total">합계금액</th>
              <th className="col-shipping">배송비</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.product._id}>
                <td className="col-check">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product._id)}
                    onChange={() => handleSelectItem(item.product._id)}
                  />
                </td>
                <td className="col-product">
                  <div className="product-info">
                    <Link to={`/products/${item.product._id}`} className="product-image">
                      <img src={item.product.imageUrl} alt={item.product.name} />
                    </Link>
                    <div className="product-details">
                      <Link to={`/products/${item.product._id}`} className="product-name">
                        {item.product.name}
                      </Link>
                      <p className="product-sku">SKU: {item.product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="col-quantity">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(newQty) => handleQuantityChange(item.product._id, newQty)}
                    min={1}
                    max={item.product.stock}
                    size="small"
                  />
                </td>
                <td className="col-price">
                  {formatPrice(item.product.price)}원
                </td>
                <td className="col-total">
                  {formatPrice(item.product.price * item.quantity)}원
                </td>
                <td className="col-shipping">
                  <div className="shipping-info">
                    {shippingFee === 0 ? (
                      <>
                        <span>0원</span>
                        <small>(무료배송)</small>
                      </>
                    ) : (
                      <>
                        <span>{formatPrice(shippingFee)}원</span>
                        <small>(택배-선결제)</small>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 쇼핑 계속하기 */}
      <Link to="/products" className="continue-shopping">
        &lt; 쇼핑 계속하기
      </Link>

      {/* 합계 영역 */}
      <div className="cart-summary">
        <div className="summary-row">
          <span className="summary-label">
            총 <strong>{items.length}</strong>개의 상품금액
          </span>
          <span className="summary-value">{formatPrice(totalPrice)}원</span>
        </div>
        <span className="summary-operator">+</span>
        <div className="summary-row">
          <span className="summary-label">배송비</span>
          <span className="summary-value">{formatPrice(shippingFee)}원</span>
        </div>
        <span className="summary-operator">=</span>
        <div className="summary-row total">
          <span className="summary-label">합계</span>
          <span className="summary-value">{formatPrice(totalPrice + shippingFee)}원</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="cart-actions">
        <div className="actions-left">
          <button className="btn-outline" onClick={handleDeleteSelected}>
            선택 상품 삭제
          </button>
          <button className="btn-outline" onClick={handleClearCart}>
            장바구니 비우기
          </button>
        </div>
        <div className="actions-right">
          <button
            className="btn-outline-dark"
            disabled={selectedItems.length === 0}
            onClick={() => navigate('/checkout', { state: { selectedOnly: true, selectedItems } })}
          >
            선택 상품 주문
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/checkout')}
          >
            전체 상품 주문
          </button>
        </div>
      </div>

      {/* 안내 문구 */}
      <p className="cart-notice">
        * 주문서 작성단계에서 할인 적용을 하실 수 있습니다.
      </p>
    </div>
  );
}

export default Cart;
