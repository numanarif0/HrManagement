import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import QrScanner from './pages/QrScanner'
import Payroll from './pages/Payroll'
import Reviews from './pages/Reviews'
import Employees from './pages/Employees'
import PendingApplications from './pages/PendingApplications'
import Layout from './components/Layout'
import { Employee } from './types'

function App() {
  // localStorage'dan başlangıç değerini oku
  const [employee, setEmployee] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('employee')
    return saved ? JSON.parse(saved) : null
  })

  // Employee değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (employee) {
      localStorage.setItem('employee', JSON.stringify(employee))
    } else {
      localStorage.removeItem('employee')
    }
  }, [employee])

  const handleLogin = (emp: Employee) => {
    setEmployee(emp)
  }

  const handleLogout = () => {
    setEmployee(null)
    localStorage.removeItem('employee')
  }

  const updateEmployeeQr = (newQrCode: string) => {
    if (employee) {
      const updatedEmployee = { ...employee, qrCode: newQrCode }
      setEmployee(updatedEmployee)
    }
  }

  return (
    <Router>
      <Routes>
        {/* Tek QR tarama sayfası - login gerektirmez */}
        <Route path="/qr" element={<QrScanner employee={employee} />} />
        <Route path="/qrScan" element={<Navigate to="/qr" replace />} />

        <Route path="/login" element={
          employee ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          employee ? <Navigate to="/dashboard" /> : <Register />
        } />
        <Route path="/" element={
          employee ? <Layout employee={employee} onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard employee={employee} />} />
          <Route path="attendance" element={<Attendance employee={employee} onQrUpdate={updateEmployeeQr} />} />
          <Route path="payroll" element={<Payroll employee={employee} />} />
          <Route path="reviews" element={<Reviews employee={employee} />} />
          <Route path="employees" element={<Employees employee={employee} />} />
          <Route path="pending-applications" element={<PendingApplications employee={employee} />} />
          <Route path="qr-scanner" element={<Navigate to="/qr" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
