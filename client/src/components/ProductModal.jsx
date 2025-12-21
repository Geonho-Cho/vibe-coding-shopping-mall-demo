import { useState, useEffect, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import { CATEGORY_NAMES } from '../constants';

const INITIAL_PRODUCT = {
  sku: '',
  name: '',
  category: CATEGORY_NAMES[0],
  price: '',
  imageUrl: '',
  stock: '0',
  isPublic: true,
  description: '',
  isRecommended: false
};

function ProductModal({ isOpen, editingProduct, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_PRODUCT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        sku: editingProduct.sku || '',
        name: editingProduct.name || '',
        category: editingProduct.category || CATEGORY_NAMES[0],
        price: editingProduct.price || '',
        imageUrl: editingProduct.imageUrl || '',
        stock: editingProduct.stock || '0',
        isPublic: editingProduct.isPublic !== undefined ? editingProduct.isPublic : true,
        description: editingProduct.description || '',
        isRecommended: editingProduct.isRecommended || false
      });
    } else {
      setFormData(INITIAL_PRODUCT);
    }
  }, [editingProduct, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = useCallback((url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.sku || !formData.name || !formData.price || !formData.imageUrl) {
      alert('상품코드(SKU), 상품명, 가격, 이미지는 필수입니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData, editingProduct);
      onClose();
    } catch (error) {
      alert(error.message || '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>{editingProduct ? '제품 수정' : '제품 추가'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* SKU & 상품명 */}
          <div className="form-row-group">
            <div className="form-group">
              <label>상품코드 (SKU) *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="예: PROD-2025-001"
                required
                disabled={!!editingProduct}
              />
            </div>

            <div className="form-group">
              <label>상품명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="상품명을 입력하세요"
                required
              />
            </div>
          </div>

          {/* 카테고리 & 가격 */}
          <div className="form-row-group">
            <div className="form-group">
              <label>카테고리 *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORY_NAMES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>가격 *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* 재고 & 판매상태 */}
          <div className="form-row-group">
            <div className="form-group">
              <label>재고 수량</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>판매 상태</label>
              <select
                name="isPublic"
                value={formData.isPublic}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isPublic: e.target.value === 'true'
                }))}
              >
                <option value="true">공개</option>
                <option value="false">비공개</option>
              </select>
            </div>
          </div>

          {/* 이미지 업로드 */}
          <ImageUploader
            imageUrl={formData.imageUrl}
            onImageChange={handleImageChange}
          />

          {/* 설명 */}
          <div className="form-group">
            <label>상품 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="상품 설명을 입력하세요 (선택사항)"
              rows="3"
            />
          </div>

          {/* 추천 상품 */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isRecommended"
                checked={formData.isRecommended}
                onChange={handleChange}
              />
              추천 제품으로 설정
            </label>
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
