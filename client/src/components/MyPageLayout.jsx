import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MyPageLayout.css';

function MyPageLayout() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // 로딩 중
  if (isLoading) {
    return <div className="mypage-loading">로딩 중...</div>;
  }

  // 로그인 안 됨
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="mypage-layout">
      {/* 브레드크럼 */}
      <div className="mypage-breadcrumb">
        <Link to="/">HOME</Link> &gt; <span>마이페이지</span>
      </div>

      <div className="mypage-container">
        {/* 사이드바 */}
        <aside className="mypage-sidebar">
          <h2 className="sidebar-title">마이페이지</h2>

          {/* 회원 정보 카드 */}
          <div className="member-card">
            <p className="member-greeting">
              <strong>{user?.name || '회원'}</strong>님
            </p>
            <p className="member-grade">
              회원등급은 <strong>일반회원</strong>등급 입니다.
            </p>
          </div>

          {/* 쇼핑정보 */}
          <div className="sidebar-section">
            <h3 className="section-title">쇼핑정보</h3>
            <ul className="sidebar-menu">
              <li className={isActive('/mypage/orders') ? 'active' : ''}>
                <Link to="/mypage/orders">주문목록/배송조회</Link>
              </li>
              <li className={isActive('/mypage/cancel') ? 'active' : ''}>
                <Link to="/mypage/cancel">취소/반품/교환 내역</Link>
              </li>
              <li className={isActive('/mypage/wishlist') ? 'active' : ''}>
                <Link to="/mypage/wishlist">위시리스트</Link>
              </li>
            </ul>
          </div>

          {/* 혜택관리 */}
          <div className="sidebar-section">
            <h3 className="section-title">혜택관리</h3>
            <ul className="sidebar-menu">
              <li className={isActive('/mypage/coupon') ? 'active' : ''}>
                <Link to="/mypage/coupon">쿠폰</Link>
              </li>
              <li className={isActive('/mypage/point') ? 'active' : ''}>
                <Link to="/mypage/point">마일리지</Link>
              </li>
            </ul>
          </div>

          {/* 회원정보 */}
          <div className="sidebar-section">
            <h3 className="section-title">회원정보</h3>
            <ul className="sidebar-menu">
              <li className={isActive('/mypage/profile') ? 'active' : ''}>
                <Link to="/mypage/profile">회원정보 변경</Link>
              </li>
              <li className={isActive('/mypage/address') ? 'active' : ''}>
                <Link to="/mypage/address">배송지 관리</Link>
              </li>
            </ul>
          </div>

          {/* 고객센터 */}
          <div className="sidebar-section">
            <h3 className="section-title">고객센터</h3>
            <ul className="sidebar-menu">
              <li className={isActive('/mypage/inquiry') ? 'active' : ''}>
                <Link to="/mypage/inquiry">1:1 문의</Link>
              </li>
              <li className={isActive('/mypage/reviews') ? 'active' : ''}>
                <Link to="/mypage/reviews">나의 상품후기</Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="mypage-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MyPageLayout;
