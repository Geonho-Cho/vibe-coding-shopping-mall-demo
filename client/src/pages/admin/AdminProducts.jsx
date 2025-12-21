import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductTable from '../../components/ProductTable';
import ProductModal from '../../components/ProductModal';

function AdminProducts() {
  const {
    products,
    isLoading,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    createProduct,
    updateProduct,
    deleteProduct
  } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData, editing) => {
    if (editing) {
      await updateProduct(editing._id, formData);
      alert('제품이 수정되었습니다.');
    } else {
      await createProduct(formData);
      alert('제품이 추가되었습니다.');
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`"${product.name}" 제품을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteProduct(product._id);
      alert('제품이 삭제되었습니다.');
    } catch (error) {
      alert(error.message || '삭제에 실패했습니다.');
    }
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // 최소 5개 페이지 표시
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return <div className="admin-page-loading">로딩 중...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>제품 관리</h1>
          <p>총 {pagination.totalCount}개의 제품</p>
        </div>
        <button className="btn-add" onClick={handleAddClick}>
          + 제품 추가
        </button>
      </div>

      <ProductTable
        products={products}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={prevPage}
            disabled={!pagination.hasPrev}
          >
            이전
          </button>

          {getPageNumbers().map(page => (
            <button
              key={page}
              className={`pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-btn"
            onClick={nextPage}
            disabled={!pagination.hasNext}
          >
            다음
          </button>
        </div>
      )}

      <ProductModal
        isOpen={showModal}
        editingProduct={editingProduct}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AdminProducts;
