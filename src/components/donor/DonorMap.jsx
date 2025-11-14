import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function DonorMap() {
  const [bloodRequests, setBloodRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchBloodRequests()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.auth.profile)
      if (data.success) {
        setCurrentUser(data.data.user)
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err)
    }
  }

  const fetchBloodRequests = async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.list)
      if (data.success) {
        // Filter only active requests
        const activeRequests = data.data.requests.filter(req => req.status === 'active')
        setBloodRequests(activeRequests)
      }
    } catch (err) {
      setError('Failed to load blood requests')
      console.error('Blood requests fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId, response) => {
    const confirmMessage = response === 'accept' 
      ? 'Are you sure you want to accept this blood request?' 
      : 'Are you sure you want to decline this blood request?'
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.respond(requestId), {
        method: 'POST',
        body: JSON.stringify({ 
          response,
          notes: response === 'accept' 
            ? 'I am available and willing to help with this blood request.' 
            : 'I am unable to help with this request at this time.'
        })
      })

      if (data.success) {
        alert(`You have ${response}ed the blood request successfully!`)
        // Refresh requests
        fetchBloodRequests()
      }
    } catch (err) {
      alert('Failed to respond to request: ' + err.message)
      console.error('Response error:', err)
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Check if current user has responded to a request
  const getUserResponse = (request) => {
    if (!currentUser || !request.matchedDonors) return null
    
    const userMatch = request.matchedDonors.find(
      match => match.donor && match.donor._id === currentUser._id
    )
    
    return userMatch ? userMatch.response : null
  }

  if (loading) {
    return (
      <div className="donor-map" style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading blood requests map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="donor-map" style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchBloodRequests}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="donor-map" style={{ padding: '20px' }}>
      <div className="map-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>Blood Requests Map</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Find blood requests near you and help save lives
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="map-container" style={{
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)
          `,
        }} />
        
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Interactive map will be shown here
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '5px' }}>
            {bloodRequests.length} active blood requests in your area
          </p>
        </div>

        {/* Map pins for visualization */}
        <div style={{ position: 'absolute', top: '20%', left: '30%', fontSize: '20px' }}>📍</div>
        <div style={{ position: 'absolute', top: '60%', left: '70%', fontSize: '20px' }}>📍</div>
        <div style={{ position: 'absolute', top: '40%', left: '50%', fontSize: '20px' }}>📍</div>
        <div style={{ position: 'absolute', top: '80%', left: '20%', fontSize: '20px' }}>📍</div>
      </div>

      {/* Blood Requests List */}
      <div className="requests-list">
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>
          Active Blood Requests ({bloodRequests.length})
        </h3>
        
        {bloodRequests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            <p style={{ color: '#6b7280', margin: 0 }}>
              No active blood requests at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {bloodRequests.map(request => (
              <div 
                key={request._id} 
                className="request-card"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ...(selectedRequest === request._id && {
                    borderColor: '#dc2626',
                    boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.1)'
                  })
                }}
                onClick={() => setSelectedRequest(selectedRequest === request._id ? null : request._id)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '14px'
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
                      {request.urgency} Priority
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                    <div>📍 {request.location}</div>
                    <div style={{ marginTop: '2px' }}>
                      Required by: {new Date(request.requiredBy).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div>
                    <strong>Units Needed:</strong> {request.unitsNeeded}
                  </div>
                  <div>
                    <strong>Hospital:</strong> {request.hospitalName || 'Not specified'}
                  </div>
                </div>

                {request.description && (
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '14px'
                  }}>
                    <strong>Description:</strong> {request.description}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Posted: {formatDate(request.createdAt)}
                    {request.responses?.length > 0 && (
                      <span style={{ marginLeft: '10px' }}>
                        • {request.responses.length} responses
                      </span>
                    )}
                  </div>
                  
                  {(() => {
                    const userResponse = getUserResponse(request)
                    
                    if (userResponse === 'accepted') {
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#dcfce7',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #16a34a'
                        }}>
                          <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '14px' }}>
                            ✓ You Accepted This Request
                          </span>
                        </div>
                      )
                    } else if (userResponse === 'declined') {
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#fef2f2',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #dc2626'
                        }}>
                          <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>
                            ✗ You Declined This Request
                          </span>
                        </div>
                      )
                    } else {
                      // User hasn't responded yet - show buttons
                      return (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRespondToRequest(request._id, 'accept')
                            }}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            ✓ Accept
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRespondToRequest(request._id, 'decline')
                            }}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            ✗ Decline
                          </button>
                        </div>
                      )
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DonorMap