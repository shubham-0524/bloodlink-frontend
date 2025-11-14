import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function RecipientDashboard() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bloodType: '',
    location: ''
  })
  const [activeRequests, setActiveRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user profile and active requests
        const [profileData, requestsData] = await Promise.all([
          apiRequest(API_ENDPOINTS.auth.profile),
          apiRequest(API_ENDPOINTS.bloodRequests.list)
        ])

        if (profileData.success) {
          setProfile({
            firstName: profileData.data.user.firstName,
            lastName: profileData.data.user.lastName,
            bloodType: profileData.data.user.bloodType,
            location: profileData.data.user.location
          })
        }

        if (requestsData.success) {
          setActiveRequests(requestsData.data.requests || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Loading Dashboard...</h1>
          <p>Please wait while we load your data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Recipient Dashboard</h1>
        <p>Welcome back, {profile.firstName}! Find help when you need it most.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Profile</h3>
        </div>
        <div>
          <span className="blood-type-badge">{profile.bloodType}</span>
          <p>Location: {profile.location}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Blood Requests</h3>
        </div>
        {activeRequests.length === 0 ? (
          <p>No active requests</p>
        ) : (
          activeRequests.map(request => (
            <div key={request.id} style={{ padding: '15px 0', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="blood-type-badge">{request.bloodType}</span>
                  <span style={{ marginLeft: '10px', color: '#dc2626', fontWeight: 'bold' }}>
                    {request.urgency.toUpperCase()}
                  </span>
                  <p>{request.location}</p>
                  <p>{request.matchedDonors} donors found</p>
                </div>
                <span className="status-available">Active</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <Link to="/recipient/search" className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Search for Donors
          </Link>
          <button className="btn btn-secondary">Emergency Request</button>
          <button className="btn btn-secondary">Request History</button>
        </div>
      </div>
    </div>
  )
}

export default RecipientDashboard