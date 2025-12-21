import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../utils/api';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const allProducts = await productApi.getPublic();

        // 추천 상품 우선, 부족하면 최신 상품으로 채움
        const recommended = allProducts.filter(p => p.isRecommended);
        const featured = recommended.slice(0, 3);

        if (featured.length < 3) {
          const remaining = allProducts
            .filter(p => !featured.find(f => f._id === p._id))
            .slice(0, 3 - featured.length);
          featured.push(...remaining);
        }

        setProducts(featured);
      } catch (error) {
        console.error('추천 상품 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="featured">
      <div className="featured-header">
        <h2 className="featured-title">Featured Products</h2>
        <p className="featured-subtitle">엄선된 프리미엄 제품을 만나보세요</p>
      </div>

      <div className="featured-grid">
        {isLoading ? (
          <div className="featured-loading">로딩 중...</div>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              showDescription
            />
          ))
        ) : (
          <p className="featured-empty">등록된 상품이 없습니다.</p>
        )}
      </div>

      <div className="featured-more">
        <Link to="/products" className="more-btn">모든 제품 보기</Link>
      </div>
    </section>
  );
}

export default FeaturedProducts;
