import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function Register() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    userType: searchParams.get('type') || 'donor',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    bloodType: '',
    location: '',
    // Hospital specific
    hospitalName: '',
    hospitalId: '',
    // Additional fields
    emergencyContact: '',
    medicalConditions: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Remove frontend-only fields before sending to backend
      const { confirmPassword, ...backendData } = formData
      
      // Remove hospital fields if not registering as hospital
      if (backendData.userType !== 'hospital') {
        delete backendData.hospitalName
        delete backendData.hospitalId
      }
      
      console.log('Submitting registration data:', backendData)
      
      const data = await apiRequest(API_ENDPOINTS.auth.register, {
        method: 'POST',
        body: JSON.stringify(backendData)
      })

      if (data.success) {
        // Navigate to OTP verification
        navigate('/verify-otp', { 
          state: { 
            email: formData.email, 
            userType: formData.userType 
          } 
        })
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      // Handle validation errors specifically
      if (err.message === 'Validation errors' && err.details) {
        const validationMessages = err.details.map(error => error.message).join(', ')
        setError(`Validation errors: ${validationMessages}`)
      } else {
        setError(err.message || 'Network error. Please try again.')
      }
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#dc2626' }}>
          Register for BloodLink
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
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        {formData.userType === 'hospital' && (
          <>
            <div className="form-group">
              <label htmlFor="hospitalName">Hospital Name</label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hospitalId">Hospital Registration ID</label>
              <input
                type="text"
                id="hospitalId"
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </>
        )}

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
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="bloodType">Blood Type</label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Blood Type</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location (City)</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., New York"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="emergencyContact">Emergency Contact</label>
          <input
            type="tel"
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {(formData.userType === 'donor' || formData.userType === 'recipient') && (
          <div className="form-group">
            <label htmlFor="medicalConditions">Medical Conditions (Optional)</label>
            <textarea
              id="medicalConditions"
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Any relevant medical conditions or medications"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            minLength="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#dc2626', textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Register