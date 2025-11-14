import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function DonorDashboard() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bloodType: '',
    location: '',
    isAvailable: true
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user profile and stats
        const [profileData, statsData, requestsData] = await Promise.all([
          apiRequest(API_ENDPOINTS.auth.profile),
          apiRequest(API_ENDPOINTS.users.stats),
          apiRequest(API_ENDPOINTS.bloodRequests.list)
        ])

        if (profileData.success) {
          setProfile({
            firstName: profileData.data.user.firstName,
            lastName: profileData.data.user.lastName,
            bloodType: profileData.data.user.bloodType,
            location: profileData.data.user.location,
            isAvailable: profileData.data.user.isAvailable
          })
        }

        if (statsData.success) {
          setStats({
            totalDonations: statsData.data.stats.totalDonations || 0,
            livesImpacted: statsData.data.stats.livesImpacted || 0,
            responseRate: statsData.data.stats.responseRate || 100,
            availabilityHours: statsData.data.stats.availabilityHours || 0
          })
        }

        if (requestsData.success) {
          setRecentRequests(requestsData.data.requests || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])
  
  const [recentRequests, setRecentRequests] = useState([])

  const [stats, setStats] = useState({
    totalDonations: 0,
    livesImpacted: 0,
    responseRate: 100,
    availabilityHours: 0
  })

  const handleAvailabilityToggle = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.users.availability, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: !profile.isAvailable })
      })

      if (data.success) {
        setProfile(prev => ({ ...prev, isAvailable: data.data.isAvailable }))
      }
    } catch (err) {
      console.error('Failed to update availability:', err)
    }
  }

  const handleRequestResponse = async (requestId, response) => {
    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.respond(requestId), {
        method: 'POST',
        body: JSON.stringify({ response })
      })

      if (data.success) {
        setRecentRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: response === 'accept' ? 'accepted' : 'declined' }
              : req
          )
        )
      }
    } catch (err) {
      console.error('Failed to respond to request:', err)
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return '#dc2626'
      case 'high': return '#f59e0b'
      case 'medium': return '#059669'
      default: return '#6b7280'
    }
  }

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
        <h1>Donor Dashboard</h1>
        <p>Welcome back, {profile.firstName}! Ready to save lives today?</p>
      </div>

      {/* Availability Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Availability Status</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="blood-type-badge">{profile.bloodType}</span>
            <p style={{ margin: '10px 0', color: '#6b7280' }}>
              Status: <span className={profile.isAvailable ? 'status-available' : 'status-unavailable'}>
                {profile.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </p>
            <p style={{ color: '#6b7280' }}>Location: {profile.location}</p>
          </div>
          <div>
            <button 
              onClick={handleAvailabilityToggle}
              className={`btn ${profile.isAvailable ? 'btn-secondary' : 'btn-primary'}`}
            >
              {profile.isAvailable ? 'Set Unavailable' : 'Set Available'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '5px' }}>{stats.totalDonations}</h3>
          <p style={{ color: '#6b7280' }}>Total Donations</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '5px' }}>{stats.livesImpacted}</h3>
          <p style={{ color: '#6b7280' }}>Lives Impacted</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '5px' }}>{stats.responseRate}%</h3>
          <p style={{ color: '#6b7280' }}>Response Rate</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '5px' }}>{stats.availabilityHours}h</h3>
          <p style={{ color: '#6b7280' }}>Avg. Available/Day</p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Blood Requests</h3>
        </div>
        {recentRequests.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No recent requests. You'll be notified when someone needs your blood type.
          </p>
        ) : (
          <div>
            {recentRequests.map(request => (
              <div key={request.id} style={{ 
                borderBottom: '1px solid #e5e7eb', 
                padding: '15px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0 }}>{request.recipientName}</h4>
                    <span className="blood-type-badge">{request.bloodType}</span>
                    <span style={{ 
                      color: getUrgencyColor(request.urgency),
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase'
                    }}>
                      {request.urgency}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', margin: '5px 0' }}>
                    📍 {request.location} • {request.distance} away
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                    Requested {request.requestedAt}
                  </p>
                </div>
                
                <div>
                  {request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleRequestResponse(request.id, 'accept')}
                        className="btn btn-primary"
                        style={{ padding: '5px 15px' }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRequestResponse(request.id, 'decline')}
                        className="btn btn-secondary"
                        style={{ padding: '5px 15px' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {request.status === 'accepted' && (
                    <span className="status-available">✓ Accepted</span>
                  )}
                  {request.status === 'declined' && (
                    <span className="status-unavailable">✗ Declined</span>
                  )}
                  {request.status === 'responded' && (
                    <span className="status-pending">Responded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <Link to="/donor/profile" className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Update Profile
          </Link>
          <button className="btn btn-secondary">
            View Donation History
          </button>
          <button className="btn btn-secondary">
            Emergency Notifications
          </button>
          <button className="btn btn-secondary">
            Find Nearby Centers
          </button>
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard