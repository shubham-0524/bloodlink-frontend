import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/shared/Header'
import Home from './components/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import OTPVerification from './components/auth/OTPVerification'
import DonorDashboard from './components/donor/DonorDashboard'
import DonorProfile from './components/donor/DonorProfile'
import DonorMap from './components/donor/DonorMap'
import RecipientDashboard from './components/recipient/RecipientDashboard'
import SearchDonors from './components/recipient/SearchDonors'
import BloodRequest from './components/recipient/BloodRequest'
import HospitalDashboard from './components/hospital/HospitalDashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            
            {/* Donor Routes */}
            <Route path="/donor/dashboard" element={<DonorDashboard />} />
            <Route path="/donor/profile" element={<DonorProfile />} />
            <Route path="/donor/map" element={<DonorMap />} />
            
            {/* Recipient Routes */}
            <Route path="/recipient/dashboard" element={<RecipientDashboard />} />
            <Route path="/recipient/search" element={<SearchDonors />} />
            <Route path="/recipient/requests" element={<BloodRequest />} />
            
            {/* Hospital Routes */}
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App