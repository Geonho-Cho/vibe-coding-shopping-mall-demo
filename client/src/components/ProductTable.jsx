function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>이미지</th>
            <th>SKU</th>
            <th>제품명</th>
            <th>카테고리</th>
            <th>가격</th>
            <th>재고</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product._id}>
                <td>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-thumbnail"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                  />
                </td>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₩{product.price?.toLocaleString()}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.isPublic ? 'status-public' : 'status-private'}`}>
                    {product.isPublic ? '공개' : '비공개'}
                  </span>
                </td>
                <td className="action-cell">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => onEdit(product)}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => onDelete(product)}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="empty-cell">
                등록된 제품이 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
