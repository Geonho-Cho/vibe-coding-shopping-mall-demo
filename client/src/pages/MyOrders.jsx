import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  formatPrice,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_CLASS,
  DATE_FILTERS,
  STATUS_FILTER_OPTIONS
} from '../constants';
import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('3month');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // 날짜 필터 계산
  const getDateRange = (filter) => {
    const end = new Date();
    const start = new Date();

    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7day':
        start.setDate(start.getDate() - 7);
        break;
      case '15day':
        start.setDate(start.getDate() - 15);
        break;
      case '1month':
        start.setMonth(start.getMonth() - 1);
        break;
      case '3month':
        start.setMonth(start.getMonth() - 3);
        break;
      case '1year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 3);
    }

    return { start, end };
  };

  // 주문 목록 조회
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my', {
        params: { page, limit: 10 }
      });

      if (response.data.success) {
        // 날짜 필터 적용
        const { start } = getDateRange(dateFilter);
        let filteredOrders = response.data.orders.filter(order =>
          new Date(order.createdAt) >= start
        );

        // 상태 필터 적용
        if (statusFilter !== 'all') {
          if (statusFilter === 'cancelled') {
            // 취소/환불은 cancelled, refunded 둘 다 포함
            filteredOrders = filteredOrders.filter(order =>
              ['cancelled', 'refunded'].includes(order.status)
            );
          } else {
            filteredOrders = filteredOrders.filter(order =>
              order.status === statusFilter
            );
          }
        }

        setOrders(filteredOrders);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('주문 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateFilter, statusFilter]);

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '');
  };

  if (loading) {
    return <div className="orders-loading">로딩 중...</div>;
  }

  return (
    <div className="my-orders-content">
      <h1 className="orders-title">주문목록 / 배송조회</h1>

      {/* 상태 필터 탭 */}
      <div className="orders-status-tabs">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`status-tab ${statusFilter === option.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 날짜 필터 */}
      <div className="orders-filter">
        <span className="filter-label">조회기간</span>
        <div className="filter-buttons">
          {DATE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={dateFilter === filter.value ? 'active' : ''}
              onClick={() => setDateFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 주문 개수 */}
      <div className="orders-count">
        주문목록 / 배송조회 내역 총 <strong>{orders.length}</strong> 건
      </div>

      {/* 주문 테이블 */}
      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>날짜/주문번호</th>
              <th>상품명/옵션</th>
              <th>상품금액/수량</th>
              <th>주문상태</th>
              <th>확인</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-orders">
                  조회내역이 없습니다.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-info">
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                    <span className="order-number">{order.orderNumber}</span>
                  </td>
                  <td className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="order-price">
                    <span className="price">{formatPrice(order.totalPrice)}원</span>
                    <span className="quantity">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}개
                    </span>
                  </td>
                  <td className="order-status">
                    <span className={`status-badge ${ORDER_STATUS_CLASS[order.status] || ''}`}>
                      {ORDER_STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td className="order-actions">
                    <Link to={`/mypage/orders/${order._id}`} className="btn-detail">
                      주문상세
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="orders-pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={pagination.page === page ? 'active' : ''}
              onClick={() => fetchOrders(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
