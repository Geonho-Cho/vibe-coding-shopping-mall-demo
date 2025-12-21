import { useState, useEffect } from 'react';
import { productApi } from '../utils/api';
import ProductCard from './ProductCard';
import './RelatedProducts.css';

function RelatedProducts({ category, currentProductId }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!category) return;

      try {
        setIsLoading(true);
        const allProducts = await productApi.getPublic();
        const related = allProducts
          .filter(p => p.category === category && p._id !== currentProductId)
          .slice(0, 4);
        setProducts(related);
      } catch (error) {
        console.error('관련 상품 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, currentProductId]);

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <section className="related-products">
      <h2>Related Products</h2>
      <div className="related-grid">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            showDescription
          />
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
