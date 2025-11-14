import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function BloodRequest() {
  const [bloodRequests, setBloodRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [newRequest, setNewRequest] = useState({
    bloodType: 'O+',
    unitsNeeded: 1,
    urgency: 'medium',
    location: '',
    requiredBy: '',
    description: ''
  })

  useEffect(() => {
    fetchBloodRequests()
  }, [])

  const fetchBloodRequests = async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.list)
      if (data.success) {
        setBloodRequests(data.data.requests || [])
      }
    } catch (err) {
      setError('Failed to load blood requests')
      console.error('Blood requests fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    
    // Set default required date if not provided
    if (!newRequest.requiredBy) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      newRequest.requiredBy = tomorrow.toISOString().split('T')[0]
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.create, {
        method: 'POST',
        body: JSON.stringify(newRequest)
      })

      if (data.success) {
        setBloodRequests(prev => [data.data.request, ...prev])
        setShowCreateForm(false)
        // Reset form
        setNewRequest({
          bloodType: 'O+',
          unitsNeeded: 1,
          urgency: 'medium',
          location: '',
          requiredBy: '',
          description: ''
        })
        alert('Blood request created successfully!')
      }
    } catch (err) {
      alert('Failed to create blood request: ' + err.message)
      console.error('Create request error:', err)
    }
  }

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this blood request?')) {
      return
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.cancel(requestId), {
        method: 'PATCH'
      })

      if (data.success) {
        setBloodRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'cancelled' }
              : req
          )
        )
        alert('Blood request cancelled successfully')
      }
    } catch (err) {
      alert('Failed to cancel request: ' + err.message)
      console.error('Cancel request error:', err)
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

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  if (loading) {
    return (
      <div className="blood-request" style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading your blood requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blood-request" style={{ padding: '20px' }}>
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
    <div className="blood-request" style={{ padding: '20px' }}>
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <div>
          <h2 style={{ color: '#dc2626', margin: '0 0 5px 0' }}>My Blood Requests</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Manage your blood requests and track responses
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          + Create Request
        </button>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <div className="create-form" style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>Create New Blood Request</h3>
          
          <form onSubmit={handleCreateRequest}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>Blood Type *</label>
                <select
                  value={newRequest.bloodType}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, bloodType: e.target.value }))}
                  className="form-control"
                  required
                >
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Units Needed *</label>
                <input
                  type="number"
                  value={newRequest.unitsNeeded}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, unitsNeeded: parseInt(e.target.value) }))}
                  className="form-control"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>Urgency *</label>
                <select
                  value={newRequest.urgency}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, urgency: e.target.value }))}
                  className="form-control"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Required By *</label>
                <input
                  type="date"
                  value={newRequest.requiredBy}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, requiredBy: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Location *</label>
              <input
                type="text"
                value={newRequest.location}
                onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                className="form-control"
                placeholder="Enter location where blood is needed"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Description</label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                className="form-control"
                rows="3"
                placeholder="Additional details about the blood request"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blood Requests List */}
      <div className="requests-list">
        {bloodRequests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>
              No blood requests found. Create your first request to get started.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Request
            </button>
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
                  backgroundColor: 'white'
                }}
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
                    <span style={{
                      backgroundColor: request.status === 'active' ? '#10b981' : '#6b7280',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {request.status}
                    </span>
                  </div>

                  {request.status === 'active' && (
                    <button
                      onClick={() => handleCancelRequest(request._id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Cancel Request
                    </button>
                  )}
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
                    <strong>Location:</strong> {request.location}
                  </div>
                  <div>
                    <strong>Required By:</strong> {formatDate(request.requiredBy)}
                  </div>
                  <div>
                    <strong>Responses:</strong> {request.responses?.length || 0}
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
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div>
                    Posted: {formatDate(request.createdAt)}
                  </div>
                  <div>
                    ID: {request._id.slice(-8)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BloodRequest