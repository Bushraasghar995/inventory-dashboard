function Button({ children, variant = 'primary', size = 'md', icon: Icon, type = 'button', onClick, disabled, className = '' }) {
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-outline';
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  return (
    <button type={type} className={`btn ${variantClass} ${sizeClass} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
export default Button;