function Select({ label, error, options = [], ...rest }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <select {...rest}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
export default Select;