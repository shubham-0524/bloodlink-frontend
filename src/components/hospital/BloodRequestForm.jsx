import React, { useState } from 'react'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function BloodRequestForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bloodType: 'O+',
    unitsNeeded: 1,
    urgency: 'medium',
    location: '',
    requiredBy: '',
    description: '',
    hospitalName: '',
    patientDetails: {
      patientId: '',
      age: '',
      gender: 'male',
      condition: ''
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('patientDetails.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        patientDetails: {
          ...prev.patientDetails,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Set required by date if not provided (default to 24 hours from now)
    if (!formData.requiredBy) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      formData.requiredBy = tomorrow.toISOString().split('T')[0]
    }

    try {
      const data = await apiRequest(API_ENDPOINTS.bloodRequests.create, {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (data.success) {
        onSuccess(data.data.request)
        onClose()
      } else {
        setError(data.message || 'Failed to create blood request')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
      console.error('Blood request creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Set default required date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData(prev => ({
      ...prev,
      requiredBy: tomorrow.toISOString().split('T')[0]
    }))
  }, [])

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#dc2626', margin: 0 }}>Create Blood Request</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Blood Type *</label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
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
                name="unitsNeeded"
                value={formData.unitsNeeded}
                onChange={handleChange}
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
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
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
                name="requiredBy"
                value={formData.requiredBy}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-control"
                placeholder="Hospital location"
                required
              />
            </div>

            <div className="form-group">
              <label>Hospital Name</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="form-control"
                placeholder="Hospital name"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Additional details about the blood request"
            />
          </div>

          <h4 style={{ color: '#374151', marginBottom: '15px' }}>Patient Details (Optional)</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                name="patientDetails.patientId"
                value={formData.patientDetails.patientId}
                onChange={handleChange}
                className="form-control"
                placeholder="Patient ID or case number"
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="patientDetails.age"
                value={formData.patientDetails.age}
                onChange={handleChange}
                className="form-control"
                min="0"
                max="150"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Gender</label>
              <select
                name="patientDetails.gender"
                value={formData.patientDetails.gender}
                onChange={handleChange}
                className="form-control"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Condition</label>
              <input
                type="text"
                name="patientDetails.condition"
                value={formData.patientDetails.condition}
                onChange={handleChange}
                className="form-control"
                placeholder="Medical condition"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Request...' : 'Create Blood Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BloodRequestForm