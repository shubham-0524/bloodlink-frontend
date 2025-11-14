import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function OTPVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  
  const { email, userType } = location.state || {}

  useEffect(() => {
    if (!email || !userType) {
      navigate('/register')
      return
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, email, userType, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.auth.verifyOtp, {
        method: 'POST',
        body: JSON.stringify({ email, otp, userType })
      })

      if (data.success) {
        // Store JWT token and user data
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('userType', data.data.user.userType)
        
        // Redirect based on user type
        navigate(`/${data.data.user.userType}/dashboard`)
      } else {
        setError(data.message || 'OTP verification failed')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
      console.error('OTP verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError('')

    try {
      const data = await apiRequest(API_ENDPOINTS.auth.resendOtp, {
        method: 'POST',
        body: JSON.stringify({ email, userType })
      })

      if (data.success) {
        setCountdown(60)
        // Show success message
        setError('') // Clear any previous errors
        alert('OTP has been resent to your email/phone')
      } else {
        setError(data.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
      console.error('Resend OTP error:', err)
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  return (
    <div className="auth-container">
      <div className="form">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#dc2626' }}>
          Verify Your Account
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#6b7280' }}>
          We've sent a 6-digit verification code to:
          <br />
          <strong>{email}</strong>
        </p>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Enter Verification Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              className="form-control"
              placeholder="123456"
              maxLength="6"
              style={{ 
                textAlign: 'center', 
                fontSize: '1.5rem', 
                letterSpacing: '0.5rem',
                fontFamily: 'monospace'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Didn't receive the code?
          </p>
          
          {countdown > 0 ? (
            <p style={{ color: '#9ca3af' }}>
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {resendLoading ? 'Resending...' : 'Resend Code'}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification