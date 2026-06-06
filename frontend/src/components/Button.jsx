import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  ...rest
}) => {
  const buttonClass = [
    'btn',
    variant === 'primary' ? 'btn-primary' : '',
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="spinner"></span>}
      {children}
    </button>
  );
};

export default Button;
