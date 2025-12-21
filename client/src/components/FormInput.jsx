function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = '',
  disabled = false
}) {
  return (
    <div className="form-row">
      <label className={`form-label ${required ? 'required' : ''}`}>
        {label}
      </label>
      <div className="form-input-wrapper">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-input ${className} ${error ? 'error' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    </div>
  );
}

export default FormInput;
