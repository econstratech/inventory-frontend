import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './forgotpassword.css'
import { Axios } from '../../environment/AxiosInstance';
import { ErrorMessage, SuccessMessage } from '../../environment/ToastMessage';


function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' or 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      const response = await Axios.post('/user/validate', {
        email: email
      });
      if (response.status === 200) {
        SuccessMessage('Email verified successfully');
        setStep('password');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        ErrorMessage(error.response.data.message || 'Email verification failed');
      } else {
        ErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters long' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      const response = await Axios.post('/user/reset-password', {
        email: email,
        password: password
      });
      if (response.status === 200) {
        SuccessMessage(response.data.message || 'Password reset successfully');
        // Redirect to login after successful password reset
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        ErrorMessage(error.response.data.message || 'Password reset failed');
      } else {
        ErrorMessage('Something went wrong. Please try again.');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <>
    <div className='forgot-password-wrap'>
        <div className='container'>
          <div className='row justify-content-between align-items-center min-vh-100'>
            {/* Left Side - Illustrations */}
            <div className='col-lg-6 col-md-6 col-sm-12 forgot-illustration-col d-none d-md-flex'>
              <div className='forgot-illustration-wrapper'>
                {/* Character with thought bubble */}
                <div className='forgot-character'>
                  <svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
                    {/* Thought bubble */}
                    <ellipse cx="120" cy="80" rx="35" ry="30" fill="#5050d5" opacity="0.9"/>
                    <text x="120" y="90" textAnchor="middle" fill="white" fontSize="40" fontWeight="bold">?</text>
                    
                    {/* Character body */}
                    <rect x="60" y="150" width="80" height="100" rx="40" fill="#5050d5"/>
                    {/* Character head */}
                    <circle cx="100" cy="120" r="35" fill="#ffb347"/>
                    {/* Character legs */}
                    <rect x="70" y="250" width="25" height="40" rx="12" fill="#5050d5"/>
                    <rect x="105" y="250" width="25" height="40" rx="12" fill="#5050d5"/>
                    {/* Character arm (raised) */}
                    <ellipse cx="50" cy="140" rx="15" ry="40" fill="#5050d5" transform="rotate(-20 50 140)"/>
                  </svg>
                </div>

                {/* Padlock in window */}
                <div className='forgot-padlock-window'>
                  <svg width="180" height="140" viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
                    {/* Window frame */}
                    <rect x="10" y="10" width="160" height="120" rx="8" fill="#e8f0fe" stroke="#5050d5" strokeWidth="2"/>
                    {/* Window controls */}
                    <circle cx="30" cy="25" r="4" fill="#9e9e9e"/>
                    <circle cx="50" cy="25" r="4" fill="#9e9e9e"/>
                    <circle cx="70" cy="25" r="4" fill="#9e9e9e"/>
                    {/* Padlock */}
                    <rect x="70" y="50" width="40" height="50" rx="4" fill="#5050d5"/>
                    <rect x="75" y="45" width="30" height="20" rx="15" fill="none" stroke="#5050d5" strokeWidth="3"/>
                    <circle cx="90" cy="75" r="8" fill="white"/>
                  </svg>
                </div>

                {/* Key icon */}
                <div className='forgot-key-icon'>
                  <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 20 C30 20, 20 30, 20 40 C20 50, 30 60, 40 60 C50 60, 60 50, 60 40 C60 30, 50 20, 40 20 Z" fill="#9e9e9e" opacity="0.3"/>
                    <path d="M45 35 L55 25 L65 35 L55 45 Z" fill="#9e9e9e" opacity="0.5"/>
                    <rect x="50" y="40" width="10" height="25" rx="2" fill="#9e9e9e" opacity="0.4"/>
                  </svg>
                </div>

                {/* Decorative question marks */}
                <div className='forgot-question-marks'>
                  <span className='forgot-qmark'>?</span>
                  <span className='forgot-qmark'>?</span>
                  <span className='forgot-qmark'>?</span>
                </div>

                {/* Decorative shapes */}
                <div className='forgot-decorative-shapes'>
                  <div className='forgot-shape-1'></div>
                  <div className='forgot-shape-2'></div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className='col-lg-5 col-md-6 col-sm-12'>
              <div className='forgot-form-wrapper'>
                <div className="forgot-logo-wrap">
                  <a href="/">
                    <img src={process.env.PUBLIC_URL + 'assets/images/logo-navy.png'} alt="Growthh" className='img-fluid' />
                  </a>
                </div>
                
                <h1 className='forgot-title'>
                  {step === 'email' ? 'Forgot Your Password ?' : 'Reset Your Password'}
                </h1>
                
                <p className='forgot-subtitle'>
                  {step === 'email' 
                    ? "Don't worry! Enter your email address and we'll verify it to reset your password."
                    : "Enter your new password below. Make sure it's strong and secure."}
                </p>

                <div className='forgot-form-wrap'>
                  {/* Email Step */}
                  {step === 'email' && (
                    <form className='w-100' onSubmit={handleEmailSubmit}>
                      <div className="forgot-input-group mb-4">
                        <input 
                          type="email" 
                          className={`forgot-input ${errors.email ? 'forgot-input-error' : ''}`}
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          required
                        />
                        {errors.email && (
                          <div className="forgot-error-message">{errors.email}</div>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        name="submit" 
                        className="btn-forgot-reset w-100"
                      >
                        VERIFY EMAIL
                      </button>
                    </form>
                  )}

                  {/* Password Step */}
                  {step === 'password' && (
                    <form className='w-100' onSubmit={handlePasswordSubmit}>
                      <div className="forgot-input-group mb-4">
                        <div className="forgot-password-input-wrapper">
                          <input 
                            type={showPassword ? "text" : "password"}
                            className={`forgot-input ${errors.password ? 'forgot-input-error' : ''}`}
                            placeholder="Enter New Password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                            required
                          />
                          <button
                            type="button"
                            className="forgot-password-toggle"
                            onClick={togglePasswordVisibility}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                          </button>
                        </div>
                        {errors.password && (
                          <div className="forgot-error-message">{errors.password}</div>
                        )}
                      </div>

                      <div className="forgot-input-group mb-4">
                        <div className="forgot-password-input-wrapper">
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            className={`forgot-input ${errors.confirmPassword ? 'forgot-input-error' : ''}`}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            required
                          />
                          <button
                            type="button"
                            className="forgot-password-toggle"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="forgot-error-message">{errors.confirmPassword}</div>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        name="submit" 
                        className="btn-forgot-reset w-100"
                      >
                        SAVE PASSWORD
                      </button>
                    </form>
                  )}
                  
                  <div className='forgot-back-link'>
                    {step === 'email' ? (
                      <Link to="/" className='forgot-link-text'>
                        Back to signin
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="forgot-link-text"
                        onClick={() => {
                          setStep('email');
                          setPassword('');
                          setConfirmPassword('');
                          setErrors({});
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Back to email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default ForgotPassword
