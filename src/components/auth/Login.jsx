import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'donor'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (data.success) {
        // Store JWT token and user data
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('userType', data.data.userType)
        
        // Redirect based on user type
        navigate(`/${data.data.userType}/dashboard`)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#dc2626' }}>
          Login to BloodLink
        </h2>

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

        <div className="form-group">
          <label htmlFor="userType">User Type</label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="donor">Blood Donor</option>
            <option value="recipient">Blood Recipient</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginBottom: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#dc2626', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login