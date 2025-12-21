import { useState, useEffect } from 'react';
import { orderApi } from '../../utils/api';
import { formatPrice, ORDER_STATUS_LABEL } from '../../constants';
import './AdminOrders.css';

// 관리자용 상태 필터 (드롭다운과 일치)
const STATUS_TABS = [
  { value: 'all', label: '전체' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '상품준비중' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소' },
  { value: 'refunded', label: '환불' },
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // 주문 목록 조회
  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        orderApi.getAllAdmin(page, 20),
        orderApi.getStats()
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.orders);
        setPagination(ordersRes.pagination);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('주문 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 필터링 적용
  useEffect(() => {
    let result = [...orders];

    // 상태 필터
    if (statusFilter !== 'all') {
      if (statusFilter === 'cancelled') {
        result = result.filter(order =>
          ['cancelled', 'refunded'].includes(order.status)
        );
      } else {
        result = result.filter(order => order.status === statusFilter);
      }
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.orderNumber?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.shipping?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery]);

  // 상태 변경
  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`주문 상태를 "${ORDER_STATUS_LABEL[newStatus]}"(으)로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const res = await orderApi.updateStatus(orderId, newStatus);
      if (res.success) {
        alert('주문 상태가 변경되었습니다.');
        fetchOrders(pagination.page);
      }
    } catch (error) {
      alert(error.message || '상태 변경에 실패했습니다.');
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  // 상태 배지 클래스
  const getStatusClass = (status) => {
    const classMap = {
      pending: 'badge-pending',
      paid: 'badge-paid',
      preparing: 'badge-preparing',
      shipping: 'badge-shipping',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
      refunded: 'badge-cancelled',
    };
    return classMap[status] || '';
  };

  if (isLoading) {
    return <div className="admin-page-loading">로딩 중...</div>;
  }

  return (
    <div className="admin-page admin-orders">
      <div className="admin-page-header">
        <div>
          <h1>주문 관리</h1>
          <p>총 {stats.totalOrders || 0}건의 주문</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="order-stats-grid">
        <div className="order-stat-card">
          <div className="order-stat-title">오늘 주문</div>
          <div className="order-stat-value">{stats.todayOrders || 0}</div>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-title">처리 대기</div>
          <div className="order-stat-value">{stats.pendingOrders || 0}</div>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-title">총 매출</div>
          <div className="order-stat-value">{formatPrice(stats.totalRevenue || 0)}원</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="orders-toolbar">
        <div className="orders-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="주문번호 또는 고객명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 상태 탭 */}
      <div className="orders-tabs">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'all'
            ? stats.totalOrders || 0
            : stats.statusCounts?.[tab.value] || 0;
          return (
            <button
              key={tab.value}
              className={`tab-btn ${statusFilter === tab.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 주문 목록 */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <p>조회된 주문이 없습니다.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-main-info">
                  <span className="order-icon">🕐</span>
                  <div>
                    <div className="order-number">{order.orderNumber}</div>
                    <div className="order-customer">
                      {order.user?.name || order.shipping?.name} · {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="order-header-right">
                  <span className={`order-badge ${getStatusClass(order.status)}`}>
                    {ORDER_STATUS_LABEL[order.status] || order.status}
                  </span>
                  <span className="order-total">{formatPrice(order.totalPrice)}원</span>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-info-grid">
                  <div className="order-info-item">
                    <span className="info-label">고객 정보</span>
                    <span className="info-value">{order.user?.email || '-'}</span>
                    <span className="info-value">{order.shipping?.phone || '-'}</span>
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">주문 상품</span>
                    <span className="info-value">
                      {order.items?.length || 0}개 상품
                    </span>
                    {order.items?.[0] && (
                      <span className="info-value info-product">
                        {order.items[0].name}
                        {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                      </span>
                    )}
                  </div>
                  <div className="order-info-item">
                    <span className="info-label">배송 주소</span>
                    <span className="info-value">
                      {order.shipping?.address} {order.shipping?.addressDetail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-card-footer">
                <div className="order-actions">
                  {order.status === 'paid' && (
                    <button
                      className="btn-action btn-primary"
                      onClick={() => handleStatusChange(order._id, 'preparing')}
                    >
                      상품 준비
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      className="btn-action btn-primary"
                      onClick={() => handleStatusChange(order._id, 'shipping')}
                    >
                      배송 시작
                    </button>
                  )}
                  {order.status === 'shipping' && (
                    <button
                      className="btn-action btn-primary"
                      onClick={() => handleStatusChange(order._id, 'delivered')}
                    >
                      배송 완료
                    </button>
                  )}
                  {['paid', 'preparing'].includes(order.status) && (
                    <button
                      className="btn-action btn-outline"
                      onClick={() => handleStatusChange(order._id, 'cancelled')}
                    >
                      주문 취소
                    </button>
                  )}
                </div>
                <select
                  className="status-select"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="paid">결제완료</option>
                  <option value="preparing">상품준비중</option>
                  <option value="shipping">배송중</option>
                  <option value="delivered">배송완료</option>
                  <option value="cancelled">취소</option>
                  <option value="refunded">환불</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => fetchOrders(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            이전
          </button>
          <span className="pagination-info">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => fetchOrders(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
