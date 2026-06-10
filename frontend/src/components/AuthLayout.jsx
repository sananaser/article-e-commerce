import React from 'react';
import '../styles/auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      {/* Left side: Brand/Hero Banner */}
      <div className="auth-left">
        <div className="brand-overlay">
          <h1 className="brand-logo">ARTICLE</h1>
          <p className="brand-tagline">Elevated Fashion</p>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="auth-right">
        <div className="auth-form-container">
          <header className="auth-header">
            <h2 className="auth-title">{title}</h2>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
