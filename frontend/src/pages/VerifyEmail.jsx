import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/api';
import '../styles/verify-email.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/auth/verify-email/${token}`);
      setVerificationData(response.data);
      setMessage(response.data.message);
      
      // Auto-login user after verification
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {loading ? (
          <div className="verify-loading">
            <div className="spinner"></div>
            <p>Verifying your email...</p>
          </div>
        ) : error ? (
          <div className="verify-error">
            <h2>❌ Verification Failed</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/login')} className="btn-back">
              Back to Login
            </button>
          </div>
        ) : (
          <div className="verify-success">
            <h2>✅ Email Verified!</h2>
            <p>{message}</p>
            <p className="redirect-msg">Redirecting to home page...</p>
            <button onClick={() => navigate('/')} className="btn-home">
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
