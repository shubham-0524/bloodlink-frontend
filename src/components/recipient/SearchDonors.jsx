import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS, apiRequest } from '../../config/api'

function SearchDonors() {
  const [searchCriteria, setSearchCriteria] = useState({
    bloodType: 'A+',
    location: 'Pune',
    urgency: 'medium',
    radius: '25'
  })
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleInputChange = (e) => {
    setSearchCriteria({
      ...searchCriteria,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)
    
    try {
      const queryParams = new URLSearchParams({
        bloodType: searchCriteria.bloodType,
        location: searchCriteria.location,
        radius: searchCriteria.radius
      })
      
      const data = await apiRequest(`${API_ENDPOINTS.bloodRequests.searchDonors}?${queryParams}`)
      
      if (data.success) {
        setDonors(data.data.donors || [])
      } else {
        setDonors([])
        console.error('Search failed:', data.message)
      }
    } catch (err) {
      console.error('Search error:', err)
      setDonors([])
    } finally {
      setLoading(false)
    }
  }

  const handleContactDonor = (donorId) => {
    // TODO: Implement contact functionality - create blood request
    alert(`This will create a blood request to contact donor ${donorId}`)
  }

  return (
    <div className="search-container">
      <h1>Search for Blood Donors</h1>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Search Criteria</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>Blood Type</label>
            <select
              name="bloodType"
              value={searchCriteria.bloodType}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={searchCriteria.location}
              onChange={handleInputChange}
              className="form-control"
              placeholder="City, State"
            />
          </div>
          
          <div className="form-group">
            <label>Urgency</label>
            <select
              name="urgency"
              value={searchCriteria.urgency}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Search Radius</label>
            <select
              name="radius"
              value={searchCriteria.radius}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>
        </div>
        
        <button 
          className="btn btn-primary" 
          style={{ marginTop: '15px' }}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Donors'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {hasSearched ? `Search Results (${donors.length} donors found)` : 'Available Donors'}
          </h3>
        </div>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Searching for donors...</p>
          </div>
        )}
        
        {!loading && !hasSearched && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            <p>Use the search form above to find available blood donors.</p>
          </div>
        )}
        
        {!loading && hasSearched && donors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            <p>No donors found for the selected criteria. Try adjusting your search parameters.</p>
          </div>
        )}
        
        {!loading && donors.length > 0 && donors.map(donor => (
          <div key={donor.id} style={{ 
            padding: '15px', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <h4 style={{ margin: 0 }}>{donor.firstName} {donor.lastName}</h4>
                <span className="blood-type-badge">{donor.bloodType}</span>
                <span className="status-available">Available</span>
              </div>
              <p style={{ color: '#6b7280', margin: '5px 0' }}>
                📍 {donor.location} • {donor.distance}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                {donor.lastDonation ? `Last donation: ${new Date(donor.lastDonation).toLocaleDateString()}` : 'First time donor'} • {donor.responseRate}% response rate
              </p>
            </div>
            
            <div>
              <button 
                onClick={() => handleContactDonor(donor.id)}
                className="btn btn-primary"
              >
                Contact Donor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchDonors