import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CATEGORIES } from '../constants';

function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { totalQuantity } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="header">
      <nav className="header-nav">
        {/* 로고 */}
        <Link to="/" className="header-logo">RINO</Link>

        {/* 메인 네비게이션 (카테고리) */}
        <ul className="header-menu">
          {CATEGORIES.map(cat => (
            <li key={cat.name}>
              <Link to={cat.path}>{cat.name}</Link>
            </li>
          ))}
        </ul>

        {/* 우측 아이콘/버튼 */}
        <div className="header-actions">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="header-action-link">ADMIN</Link>
              )}
              <Link to="/mypage/orders" className="header-action-link">MYPAGE</Link>
              <button className="header-action-btn" onClick={logout}>LOGOUT</button>
            </>
          ) : (
            <Link to="/login" className="header-action-link">LOGIN</Link>
          )}
          <Link to="/cart" className="header-cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalQuantity > 0 && (
              <span className="cart-badge">{totalQuantity}</span>
            )}
          </Link>

          {/* 모바일 햄버거 */}
          <button className="header-hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* 모바일 사이드 메뉴 */}
      {menuOpen && (
        <div className="side-menu-overlay" onClick={closeMenu}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeMenu}>×</button>
            <ul>
              <li><Link to="/" onClick={closeMenu}>HOME</Link></li>
              <li><Link to="/products" onClick={closeMenu}>PRODUCTS</Link></li>
              {CATEGORIES.map(cat => (
                <li key={cat.name}>
                  <Link to={cat.path} onClick={closeMenu}>{cat.name}</Link>
                </li>
              ))}
              <li><Link to="/about" onClick={closeMenu}>ABOUT</Link></li>
              <hr />
              {user ? (
                <>
                  {isAdmin && (
                    <li><Link to="/admin" onClick={closeMenu}>Admin</Link></li>
                  )}
                  <li><Link to="/mypage" onClick={closeMenu}>My Page</Link></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
                  <li><Link to="/signup" onClick={closeMenu}>Join</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
