import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../constants';
import RelatedProducts from '../components/RelatedProducts';
import QuantitySelector from '../components/QuantitySelector';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.getById(id);
        setProduct(data);
        setQuantity(1);
      } catch (error) {
        console.error('상품 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id, quantity);
      alert(`${product.name} ${quantity}개를 장바구니에 담았습니다.`);
    } catch (error) {
      alert(error.message || '장바구니 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  // 바로 구매
  const handleBuyNow = () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    navigate('/checkout', {
      state: {
        directBuy: true,
        product: product,
        quantity: quantity,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">상품을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* 상품 상세 */}
      <section className="product-detail">
        <div className="product-detail-image">
          <img src={product.imageUrl} alt={product.name} />
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="product-price">₩{formatPrice(product.price)}</p>

          {/* 수량 선택 */}
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={product.stock}
            size="large"
          />

          {/* 버튼 그룹 */}
          <div className="product-buttons">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
            >
              {isAdding ? (
                '담는 중...'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {product.stock === 0 ? '품절' : '장바구니에 담기'}
                </>
              )}
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? '품절' : '바로 구매'}
            </button>
          </div>

          {/* 재고 */}
          <p className="stock-info">재고: {product.stock}개 남음</p>

          {/* TODO: 상세페이지 이미지 추가 예정 */}
        </div>
      </section>

      {/* 관련 상품 */}
      <RelatedProducts
        category={product.category}
        currentProductId={product._id}
      />
    </div>
  );
}

export default ProductDetail;
