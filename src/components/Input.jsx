function Input({ label, error, ...rest }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input {...rest} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
export default Input;