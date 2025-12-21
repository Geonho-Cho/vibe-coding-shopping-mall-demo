import { useState, useEffect } from 'react';
import { productApi } from '../../utils/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products count
        const products = await productApi.getAll();

        // TODO: Fetch orders when order API is ready
        // const orders = await orderApi.getAll();

        setStats({
          totalProducts: products.length || 0,
          totalOrders: 0,
          totalSales: 0,
          pendingOrders: 0
        });

        setRecentOrders([]);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="admin-page-loading">로딩 중...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>대시보드</h1>
        <p>쇼핑몰 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">총 제품</span>
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">등록된 제품 수</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">총 주문</span>
            <span className="stat-icon">🛒</span>
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">전체 주문 수</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">총 매출</span>
            <span className="stat-icon">📈</span>
          </div>
          <div className="stat-value">₩{stats.totalSales.toLocaleString()}</div>
          <div className="stat-label">누적 매출액</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">처리 대기</span>
            <span className="stat-icon">⏳</span>
          </div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-label">처리 대기 주문</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <h2>최근 주문</h2>
        {recentOrders.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객명</th>
                <th>금액</th>
                <th>상태</th>
                <th>주문일시</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>₩{order.totalAmount?.toLocaleString()}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-message">주문 내역이 없습니다</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
