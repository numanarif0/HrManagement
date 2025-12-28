import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Employee, Attendance } from '../types';
import { attendanceService } from '../services/attendanceService';
import './Dashboard.css';

interface DashboardProps {
  employee: Employee | null;
}

function Dashboard({ employee }: DashboardProps) {
  const [monthlyRecords, setMonthlyRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (employee?.id) {
      loadMonthlyData();
    }
  }, [employee?.id]);

  const loadMonthlyData = async () => {
    if (!employee?.id) return;
    try {
      const now = new Date();
      const records = await attendanceService.getMonthlyRecords(
        employee.id,
        now.getFullYear(),
        now.getMonth() + 1
      );
      setMonthlyRecords(records);
    } catch (error) {
      console.error('Aylık veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aylık özet hesaplamaları
  const workingDays = monthlyRecords.filter(r => r.checkInTime).length;
  const totalHours = monthlyRecords.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);
  const overtimeHours = Math.max(0, totalHours - (workingDays * 8));

  // TC No maskeleme
  const maskedTcNo = employee?.tcNo 
    ? `${employee.tcNo.slice(0, 3)}*****${employee.tcNo.slice(-2)}`
    : '-';

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Hoş Geldiniz, {employee?.firstname}!</h1>
        <p>{today}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Departman</h3>
          <div className="value">{employee?.department || '-'}</div>
        </div>
        <div className="stat-card success">
          <h3>Pozisyon</h3>
          <div className="value">{employee?.position || '-'}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>👤 Profil Bilgileri</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Ad Soyad:</span>
              <span className="value">{employee?.firstname} {employee?.lastname}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{employee?.email || '-'}</span>
            </div>
            <div className="info-row">
              <span className="label">Telefon:</span>
              <span className="value">{employee?.phoneNumber || '-'}</span>
            </div>
            <div className="info-row">
              <span className="label">TC No:</span>
              <span className="value">{maskedTcNo}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>📌 Hızlı İşlemler</h2>
          <div className="quick-actions">
            <Link to="/attendance" className="action-btn">
              <span className="action-icon">⏰</span>
              <span>Giriş/Çıkış Yap</span>
            </Link>
            <Link to="/payroll" className="action-btn">
              <span className="action-icon">💰</span>
              <span>Maaş Bordrosu</span>
            </Link>
            <Link to="/reviews" className="action-btn">
              <span className="action-icon">⭐</span>
              <span>Değerlendirmeler</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📅 Bu Ayki Özet</h2>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : (
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-icon">📊</span>
              <div className="summary-content">
                <span className="summary-value">{workingDays}</span>
                <span className="summary-label">Çalışılan Gün</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏱️</span>
              <div className="summary-content">
                <span className="summary-value">{totalHours.toFixed(1)} saat</span>
                <span className="summary-label">Toplam Çalışma</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🌙</span>
              <div className="summary-content">
                <span className="summary-value">{overtimeHours.toFixed(1)} saat</span>
                <span className="summary-label">Fazla Mesai</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
