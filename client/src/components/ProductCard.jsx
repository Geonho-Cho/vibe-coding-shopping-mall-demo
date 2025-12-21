import { Link } from 'react-router-dom';
import { formatPrice } from '../constants';
import './ProductCard.css';

function ProductCard({ product, showDescription = false }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span className="no-image">No Image</span>
        )}
      </div>
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        {showDescription && (
          <p className="product-card-desc">
            {product.description || product.category}
          </p>
        )}
        <p className="product-card-price">₩{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
