import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS, apiRequest } from '../../config/api'
import BloodRequestForm from './BloodRequestForm'

function HospitalDashboard() {
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)

  const fetchHospitalData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Fetch profile
      const profileData = await apiRequest(API_ENDPOINTS.auth.profile)
      if (profileData.success) {
        setProfile(profileData.data.user)
      }
      
      // Fetch blood requests created by this hospital
      const requestsData = await apiRequest(API_ENDPOINTS.bloodRequests.list)
      if (requestsData.success) {
        setRequests(requestsData.data.requests || [])
      }
    } catch (err) {
      if (err.message && err.message.includes('verification required')) {
        setError('Account verification required. Please verify your account first.')
      } else {
        setError('Failed to load hospital data')
      }
      console.error('Hospital data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSuccess = (newRequest) => {
    setRequests(prev => [newRequest, ...prev])
  }

  useEffect(() => {
    fetchHospitalData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#f97316',
      critical: '#dc2626'
    }
    return colors[urgency] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="hospital-dashboard">
        <div className="loading-spinner" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px'
        }}>
          Loading hospital data...
        </div>
      </div>
    )
  }

  if (error) {
    const isVerificationError = error.includes('verification required')
    
    return (
      <div className="hospital-dashboard">
        <div className="error-message" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            backgroundColor: isVerificationError ? '#fef3c7' : '#fee2e2', 
            padding: '30px', 
            borderRadius: '8px', 
            border: isVerificationError ? '1px solid #f59e0b' : '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {isVerificationError ? '⚠️' : '❌'}
            </div>
            <h2 style={{ 
              color: isVerificationError ? '#d97706' : '#dc2626', 
              marginBottom: '15px' 
            }}>
              {isVerificationError ? 'Account Verification Required' : 'Error Loading Data'}
            </h2>
            <p style={{ 
              color: isVerificationError ? '#92400e' : '#dc2626', 
              fontSize: '16px',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              {isVerificationError 
                ? 'Your hospital account needs to be verified by an administrator before you can access the dashboard features.' 
                : error
              }
            </p>
            
            {isVerificationError ? (
              <div style={{ 
                backgroundColor: '#fbbf24', 
                color: 'white', 
                padding: '15px', 
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>Next Steps:</strong>
                <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  <li>Contact your system administrator</li>
                  <li>Provide your hospital details for verification</li>
                  <li>Wait for account approval</li>
                </ol>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={fetchHospitalData}>
                Retry
              </button>
            )}
            
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
              <p><strong>Hospital:</strong> {profile?.hospitalName || 'leelavati'}</p>
              <p><strong>Contact:</strong> {profile?.email || 'shubhamkurunkar524@gmail.com'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hospital-dashboard" style={{ padding: '20px' }}>
      <div className="dashboard-container">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#dc2626', margin: '0 0 5px 0' }}>Hospital Dashboard</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>Welcome, {profile?.name || 'Hospital'}</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRequestForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            + Create Blood Request
          </button>
        </div>

        <div className="dashboard-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div className="stat-card" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>Total Requests</h3>
            <div className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {requests.length}
            </div>
          </div>
          <div className="stat-card" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>Active Requests</h3>
            <div className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {requests.filter(r => r.status === 'active').length}
            </div>
          </div>
          <div className="stat-card" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>Fulfilled Requests</h3>
            <div className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              {requests.filter(r => r.status === 'fulfilled').length}
            </div>
          </div>
          <div className="stat-card" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>Critical Requests</h3>
            <div className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {requests.filter(r => r.urgency === 'critical').length}
            </div>
          </div>
        </div>

        <div className="blood-requests" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ marginBottom: '20px' }}>Your Blood Requests</h3>
          {requests.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px',
              border: '1px dashed #d1d5db'
            }}>
              <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>No blood requests created yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowRequestForm(true)}
              >
                Create Your First Request
              </button>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map(request => (
                <div key={request._id} className="request-card" style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '15px',
                  backgroundColor: 'white'
                }}>
                  <div className="request-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="blood-type" style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {request.bloodType}
                      </span>
                      <span style={{
                        backgroundColor: getUrgencyColor(request.urgency),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {request.urgency}
                      </span>
                    </div>
                    <span className={`status status-${request.status}`} style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      backgroundColor: request.status === 'active' ? '#10b981' : 
                                     request.status === 'fulfilled' ? '#059669' : '#6b7280',
                      color: 'white'
                    }}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="request-details" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div><strong>Units Needed:</strong> {request.unitsNeeded}</div>
                    <div><strong>Location:</strong> {request.location}</div>
                    <div><strong>Required By:</strong> {formatDate(request.requiredBy)}</div>
                    <div><strong>Responses:</strong> {request.responses?.length || 0}</div>
                  </div>
                  
                  {request.description && (
                    <div style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '10px', 
                      borderRadius: '4px',
                      marginTop: '10px'
                    }}>
                      <strong>Description:</strong> {request.description}
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginTop: '10px',
                    textAlign: 'right'
                  }}>
                    Created: {formatDate(request.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showRequestForm && (
          <BloodRequestForm
            onClose={() => setShowRequestForm(false)}
            onSuccess={handleRequestSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default HospitalDashboard
