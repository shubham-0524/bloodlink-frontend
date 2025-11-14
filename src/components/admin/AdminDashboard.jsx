import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function AdminDashboard() {
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPendingVerifications = async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await apiRequest(API_ENDPOINTS.users.pendingVerifications)
      if (data.success) {
        setPendingVerifications(data.data.users || [])
      }
    } catch (err) {
      setError('Failed to load pending verifications')
      console.error('Admin dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId) => {
    try {
      const data = await apiRequest(API_ENDPOINTS.users.verifyUser(userId), {
        method: 'PATCH',
        body: JSON.stringify({ verified: true })
      })

      if (data.success) {
        // Remove the verified user from the pending list
        setPendingVerifications(prev => 
          prev.filter(user => user._id !== userId)
        )
        alert('User verified successfully!')
      }
    } catch (err) {
      alert('Failed to verify user: ' + err.message)
      console.error('Verification error:', err)
    }
  }

  const handleRejectUser = async (userId) => {
    if (!confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.users.verifyUser(userId), {
        method: 'PATCH', 
        body: JSON.stringify({ verified: false, rejected: true })
      })

      if (data.success) {
        setPendingVerifications(prev => 
          prev.filter(user => user._id !== userId)
        )
        alert('User rejected successfully')
      }
    } catch (err) {
      alert('Failed to reject user: ' + err.message)
      console.error('Rejection error:', err)
    }
  }

  useEffect(() => {
    fetchPendingVerifications()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchPendingVerifications}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Verify users and monitor activity</p>
        <button className="btn btn-secondary" onClick={fetchPendingVerifications}>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pending Verifications ({pendingVerifications.length})</h3>
        </div>
        
        {pendingVerifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>No pending verifications at this time.</p>
          </div>
        ) : (
          pendingVerifications.map(user => (
            <div 
              key={user._id} 
              style={{ 
                padding: '20px 0', 
                borderBottom: '1px solid #e5e7eb', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start' 
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>
                    {user.userType === 'hospital' ? (user.hospitalName || 'Hospital') : `${user.firstName} ${user.lastName}`}
                  </h4>
                  <span style={{
                    backgroundColor: user.userType === 'hospital' ? '#3b82f6' : user.userType === 'donor' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {user.userType}
                  </span>
                </div>
                
                <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                  <p style={{ margin: '2px 0' }}><strong>Email:</strong> {user.email}</p>
                  <p style={{ margin: '2px 0' }}><strong>Phone:</strong> {user.phone}</p>
                  {user.bloodType && <p style={{ margin: '2px 0' }}><strong>Blood Type:</strong> {user.bloodType}</p>}
                  <p style={{ margin: '2px 0' }}><strong>Location:</strong> {user.location}</p>
                  {user.userType === 'hospital' && user.hospitalId && (
                    <p style={{ margin: '2px 0' }}><strong>Hospital ID:</strong> {user.hospitalId}</p>
                  )}
                  <p style={{ margin: '2px 0' }}><strong>Registered:</strong> {formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '20px' }}>
                <button 
                  onClick={() => handleVerifyUser(user._id)}
                  className="btn btn-primary"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  ✓ Verify
                </button>
                <button 
                  onClick={() => handleRejectUser(user._id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px', padding: '6px 12px' }}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminDashboard