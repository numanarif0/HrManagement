import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Reviews from './pages/Reviews'
import Employees from './pages/Employees'
import Layout from './components/Layout'
import { Employee } from './types'

function App() {
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('employee')
    if (stored) {
      setEmployee(JSON.parse(stored))
    }
  }, [])

  const handleLogin = (emp: Employee) => {
    setEmployee(emp)
    localStorage.setItem('employee', JSON.stringify(emp))
  }

  const handleLogout = () => {
    setEmployee(null)
    localStorage.removeItem('employee')
  }

  return (
    <Router>
      <Routes>
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
          <Route path="attendance" element={<Attendance employee={employee} />} />
          <Route path="payroll" element={<Payroll employee={employee} />} />
          <Route path="reviews" element={<Reviews employee={employee} />} />
          <Route path="employees" element={<Employees employee={employee} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
