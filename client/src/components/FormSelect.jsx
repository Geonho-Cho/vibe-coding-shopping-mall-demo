function FormSelect({
  name,
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  disabled = false
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`form-select ${className}`}
      disabled={disabled}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FormSelect;
