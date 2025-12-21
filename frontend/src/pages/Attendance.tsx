import { useState, useEffect } from 'react';
import { Employee, Attendance as AttendanceType } from '../types';
import { attendanceService } from '../services/attendanceService';
import './Attendance.css';

interface AttendanceProps {
  employee: Employee | null;
}

function Attendance({ employee }: AttendanceProps) {
  const [recentRecords, setRecentRecords] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('18:00');

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState<AttendanceType | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (employee?.id) {
      loadRecentRecords();
    }
  }, [employee?.id]);

  const loadRecentRecords = async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      const data = await attendanceService.getRecentRecords(employee.id, 10);
      setRecentRecords(data || []);
    } catch (err) {
      console.log('Kayıtlar yüklenemedi', err);
      setRecentRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!employee?.id) {
      setMessage('Çalışan bilgisi bulunamadı.');
      return;
    }

    if (!checkInTime || !checkOutTime) {
      setMessage('Giriş ve çıkış saatlerini giriniz.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await attendanceService.saveRecord({
        employeeId: employee.id,
        date: selectedDate,
        checkInTime: checkInTime + ':00',
        checkOutTime: checkOutTime + ':00'
      });
      setMessage('Kayıt başarıyla eklendi!');
      loadRecentRecords();
      // Formu sıfırla
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setCheckInTime('09:00');
      setCheckOutTime('18:00');
    } catch {
      setMessage('Kayıt eklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (record: AttendanceType) => {
    setEditingRecord(record);
    setEditDate(record.date || '');
    setEditCheckIn(record.checkInTime?.substring(0, 5) || '09:00');
    setEditCheckOut(record.checkOutTime?.substring(0, 5) || '18:00');
  };

  const handleUpdate = async () => {
    if (!editingRecord?.id) return;

    setLoading(true);
    try {
      await attendanceService.updateRecord(editingRecord.id, {
        date: editDate,
        checkInTime: editCheckIn + ':00',
        checkOutTime: editCheckOut + ':00'
      });
      setMessage('Kayıt güncellendi!');
      setEditingRecord(null);
      loadRecentRecords();
    } catch {
      setMessage('Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      await attendanceService.deleteRecord(id);
      setMessage('Kayıt silindi!');
      loadRecentRecords();
    } catch {
      setMessage('Silme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const formatHours = (hours?: number) => {
    if (!hours || hours === 0) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}s ${m}dk`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: 'short',
      weekday: 'short'
    });
  };

  const today = currentTime.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timeDisplay = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Haftalık toplam hesapla
  const weeklyTotal = recentRecords
    .filter(r => {
      if (!r.date) return false;
      const recordDate = new Date(r.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    })
    .reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

  return (
    <div className="attendance">
      <div className="page-header">
        <h1>⏰ Devam Takibi</h1>
        <p>Giriş ve çıkış saatlerinizi kaydedin</p>
      </div>

      {/* Üst Kartlar */}
      <div className="attendance-stats">
        <div className="stat-card time-stat">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <span className="stat-value">{timeDisplay}</span>
            <span className="stat-label">{today}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{recentRecords.length}</span>
            <span className="stat-label">Toplam Kayıt</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <span className="stat-value">{formatHours(weeklyTotal)}</span>
            <span className="stat-label">Bu Hafta</span>
          </div>
        </div>
      </div>

      {/* Yeni Kayıt Formu */}
      <div className="card form-card">
        <h2>➕ Yeni Kayıt Ekle</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>📅 Tarih</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>🟢 Giriş Saati</label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>🔴 Çıkış Saati</label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSaveRecord} className="btn-save" disabled={loading}>
            {loading ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('başarı') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Son Kayıtlar */}
      <div className="card records-card">
        <h2>📋 Son 10 Kayıt</h2>
        
        {loading && recentRecords.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">⏳</span>
            <p>Yükleniyor...</p>
          </div>
        ) : recentRecords.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>Henüz kayıt bulunmuyor</p>
          </div>
        ) : (
          <div className="records-list">
            {recentRecords.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-date">
                  <span className="date-day">{formatDate(record.date)}</span>
                </div>
                <div className="record-times">
                  <div className="time-block">
                    <span className="time-label">Giriş</span>
                    <span className="time-value in">{formatTime(record.checkInTime)}</span>
                  </div>
                  <div className="time-separator">→</div>
                  <div className="time-block">
                    <span className="time-label">Çıkış</span>
                    <span className="time-value out">{formatTime(record.checkOutTime)}</span>
                  </div>
                </div>
                <div className="record-hours">
                  <span className="hours-value">{formatHours(record.hoursWorked)}</span>
                </div>
                <div className="record-actions">
                  <button 
                    onClick={() => openEditModal(record)} 
                    className="btn-icon-only edit"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => record.id && handleDelete(record.id)} 
                    className="btn-icon-only delete"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Kaydı Düzenle</h3>
              <button className="modal-close" onClick={() => setEditingRecord(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>📅 Tarih</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div className="form-row-modal">
                <div className="form-group">
                  <label>🟢 Giriş</label>
                  <input
                    type="time"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>🔴 Çıkış</label>
                  <input
                    type="time"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditingRecord(null)} className="btn-secondary">
                İptal
              </button>
              <button onClick={handleUpdate} className="btn-success" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
