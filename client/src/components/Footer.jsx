import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* 브랜드 */}
        <div className="footer-brand">
          <h3 className="footer-logo">RINO</h3>
          <p className="footer-tagline">
            프리미엄 가전으로<br />
            일상의 품격을 높입니다
          </p>
        </div>

        {/* 제품 링크 */}
        <div className="footer-links">
          <h4 className="footer-title">PRODUCTS</h4>
          <ul>
            {CATEGORIES.map(cat => (
              <li key={cat.name}>
                <Link to={cat.path}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 고객지원 */}
        <div className="footer-links">
          <h4 className="footer-title">SUPPORT</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">배송 안내</Link></li>
            <li><Link to="/returns">반품/교환</Link></li>
          </ul>
        </div>

        {/* 어드민 */}
        <div className="footer-links">
          <h4 className="footer-title">ADMIN</h4>
          <ul>
            <li><Link to="/login">Admin Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 RINO. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
