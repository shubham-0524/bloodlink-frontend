import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Save Lives with <span className="text-accent">BloodLink</span>
          </h1>
          <p className="hero-subtitle">
            Connecting blood recipients with verified nearby donors in real-time during emergencies.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Login
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="blood-drop">🩸</div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">How BloodLink Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Register as Donor/Recipient</h3>
            <p>Create your profile with blood type, location, and contact details</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Real-time Matching</h3>
            <p>Our system matches blood requests with nearby compatible donors instantly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Hospital Integration</h3>
            <p>Hospitals can post urgent requests and access donor maps</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Instant Notifications</h3>
            <p>Get notified via SMS/Email when there's a blood request or match</p>
          </div>
        </div>
      </section>

      <section className="user-types">
        <h2 className="section-title">Choose Your Role</h2>
        <div className="user-types-grid">
          <div className="user-type-card">
            <h3>Blood Donor</h3>
            <p>Register to donate blood and help save lives in your community</p>
            <ul>
              <li>Set your availability status</li>
              <li>Receive nearby blood requests</li>
              <li>Track your donation history</li>
            </ul>
            <Link to="/register?type=donor" className="btn btn-primary">
              Register as Donor
            </Link>
          </div>
          <div className="user-type-card">
            <h3>Blood Recipient</h3>
            <p>Find compatible blood donors near you during emergencies</p>
            <ul>
              <li>Search for compatible donors</li>
              <li>Send urgent blood requests</li>
              <li>View donor availability</li>
            </ul>
            <Link to="/register?type=recipient" className="btn btn-primary">
              Register as Recipient
            </Link>
          </div>
          <div className="user-type-card">
            <h3>Hospital</h3>
            <p>Manage blood bank inventory and connect with donors</p>
            <ul>
              <li>Post urgent blood requests</li>
              <li>Access donor maps</li>
              <li>Manage multiple requests</li>
            </ul>
            <Link to="/register?type=hospital" className="btn btn-primary">
              Register as Hospital
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home