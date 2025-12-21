import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../pages/admin/Admin.css';

function AdminLayout() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth({ requireAuth: true });

  // Loading state
  if (isLoading) {
    return <div className="admin-loading">로딩 중...</div>;
  }

  // Not admin - redirect
  if (!isAdmin) {
    return (
      <div className="admin-loading">
        <p>관리자 권한이 필요합니다.</p>
        <button onClick={() => navigate('/')}>홈으로 이동</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">ADMIN</div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>대시보드</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📦</span>
            <span>제품 관리</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🛒</span>
            <span>주문 관리</span>
          </NavLink>
        </nav>

        <button
          className="admin-back-btn"
          onClick={() => navigate('/')}
        >
          <span>→</span>
          <span>쇼핑몰로 이동</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
