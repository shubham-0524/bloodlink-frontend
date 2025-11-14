import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function DonorProfile() {
  const navigate = useNavigate()
  
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    bloodType: 'O+',
    location: 'New York',
    emergencyContact: '+1 (555) 987-6543',
    medicalConditions: 'No known allergies',
    isAvailable: true,
    preferredDonationCenters: ['Manhattan Blood Center', 'NYC Hospital'],
    lastDonation: '2024-08-15',
    donationFrequency: 'every-3-months',
    notifications: {
      email: true,
      sms: true,
      emergencyOnly: false
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      // Handle nested objects like notifications.email
      const [parent, child] = name.split('.')
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest(API_ENDPOINTS.users.profile, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })

      if (data.success) {
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Donor Profile</h1>
        <div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="profile-form"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
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

      <form id="profile-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Basic Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                className="form-control"
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                className="form-control"
                disabled={!isEditing}
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="form-control"
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="form-control"
                disabled={!isEditing}
                required
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Medical Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Blood Type</label>
              {isEditing ? (
                <select
                  name="bloodType"
                  value={profileData.bloodType}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : (
                <div className="form-control" style={{ backgroundColor: '#f9fafb' }}>
                  <span className="blood-type-badge">{profileData.bloodType}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="form-control"
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Medical Conditions</label>
            <textarea
              name="medicalConditions"
              value={profileData.medicalConditions}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
              disabled={!isEditing}
              placeholder="Any relevant medical conditions or medications"
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <input
              type="tel"
              name="emergencyContact"
              value={profileData.emergencyContact}
              onChange={handleInputChange}
              className="form-control"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Donation Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Donation Preferences</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Last Donation</label>
              {isEditing ? (
                <input
                  type="date"
                  name="lastDonation"
                  value={profileData.lastDonation}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                <div className="form-control" style={{ backgroundColor: '#f9fafb' }}>
                  {formatDate(profileData.lastDonation)}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Donation Frequency</label>
              {isEditing ? (
                <select
                  name="donationFrequency"
                  value={profileData.donationFrequency}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="every-2-months">Every 2 months</option>
                  <option value="every-3-months">Every 3 months</option>
                  <option value="every-6-months">Every 6 months</option>
                  <option value="yearly">Yearly</option>
                </select>
              ) : (
                <div className="form-control" style={{ backgroundColor: '#f9fafb' }}>
                  {profileData.donationFrequency.replace('-', ' ').toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Notification Preferences</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="notifications.email"
                checked={profileData.notifications.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              Email notifications for blood requests
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="notifications.sms"
                checked={profileData.notifications.sms}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              SMS notifications for blood requests
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="notifications.emergencyOnly"
                checked={profileData.notifications.emergencyOnly}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              Emergency requests only
            </label>
          </div>
        </div>

        {/* Availability Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Availability Status</h3>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
            <input
              type="checkbox"
              name="isAvailable"
              checked={profileData.isAvailable}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <span className={profileData.isAvailable ? 'status-available' : 'status-unavailable'}>
              {profileData.isAvailable ? 'Available for donations' : 'Currently unavailable'}
            </span>
          </label>
        </div>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/donor/dashboard')}
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default DonorProfile