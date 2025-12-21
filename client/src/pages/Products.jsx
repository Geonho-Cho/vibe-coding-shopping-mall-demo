import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { productApi } from '../utils/api';
import { CATEGORY_NAMES } from '../constants';
import ProductCard from '../components/ProductCard';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getPublic();
        setProducts(data);
      } catch (err) {
        setError('상품을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // URL 파라미터로 카테고리 스크롤
  useEffect(() => {
    if (!loading) {
      const params = new URLSearchParams(location.search);
      const category = params.get('category');
      if (category) {
        const element = document.getElementById(`category-${category}`);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  }, [location.search, loading]);

  // 카테고리별로 상품 그룹화
  const groupByCategory = (products) => {
    return products.reduce((acc, product) => {
      const category = product.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  };

  const groupedProducts = groupByCategory(products);

  // CATEGORY_NAMES 순서대로 정렬
  const sortedCategories = CATEGORY_NAMES.filter(cat => groupedProducts[cat]);

  if (loading) {
    return (
      <div className="products-page">
        <h1>Products</h1>
        <p style={{ textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <h1>Products</h1>
        <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1>Products</h1>

      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No products available</p>
      ) : (
        sortedCategories.map((category) => (
          <section
            key={category}
            id={`category-${category}`}
            className="category-section"
          >
            <div className="category-header">
              <h2>{category}</h2>
            </div>
            <div className="products-grid">
              {groupedProducts[category].map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default Products;
