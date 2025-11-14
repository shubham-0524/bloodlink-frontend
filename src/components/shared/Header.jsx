import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'
import './Header.css'

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUserType = localStorage.getItem('userType')
    
    if (token && storedUserType) {
      setIsAuthenticated(true)
      setUserType(storedUserType)
      // TODO: Fetch user profile if needed
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Call logout API
      await apiRequest(API_ENDPOINTS.auth.logout, {
        method: 'POST'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      setIsAuthenticated(false)
      setUserType('')
      setUser(null)
      navigate('/')
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🩸</span>
          BloodLink
        </Link>
        
        <nav className="nav">
          {isAuthenticated ? (
            <div className="nav-authenticated">
              <span className="user-greeting">
                Welcome, {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </span>
              <Link 
                to={`/${userType}/dashboard`} 
                className="nav-link"
              >
                Dashboard
              </Link>
              {userType === 'donor' && (
                <>
                  <Link to="/donor/profile" className="nav-link">
                    Profile
                  </Link>
                  <Link to="/donor/map" className="nav-link">
                    Blood Requests Map
                  </Link>
                </>
              )}
              {userType === 'recipient' && (
                <>
                  <Link to="/recipient/search" className="nav-link">
                    Search Donors
                  </Link>
                  <Link to="/recipient/requests" className="nav-link">
                    My Requests
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-guest">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header