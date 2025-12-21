import './QuantitySelector.css';

function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`quantity-selector quantity-selector--${size}`}>
      <button
        type="button"
        className="quantity-selector__btn"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        aria-label="수량 감소"
      >
        −
      </button>
      <span className="quantity-selector__value">{value}</span>
      <button
        type="button"
        className="quantity-selector__btn"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        aria-label="수량 증가"
      >
        +
      </button>
    </div>
  );
}

export default QuantitySelector;
