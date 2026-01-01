import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Employee, Attendance as AttendanceType } from '../types';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import './Attendance.css';

interface AttendanceProps {
  employee: Employee | null;
  onQrUpdate?: (newQrCode: string) => void;
}

function Attendance({ employee, onQrUpdate }: AttendanceProps) {
  const [recentRecords, setRecentRecords] = useState<AttendanceType[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'my' | 'hr'>('my');
  const [currentQrCode, setCurrentQrCode] = useState(employee?.qrCode || '');
  const [qrCountdown, setQrCountdown] = useState(180);

  // Form state for HR adding records
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('18:00');

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState<AttendanceType | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');

  // Filter state for HR
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | undefined>(undefined);

  const isHR = employee?.department === 'İnsan Kaynakları' || employee?.role === 'HR' || employee?.role === 'ADMIN';

  // Kalan süreyi hesapla (3 dakika = 180 saniye)
  const calculateRemainingTime = () => {
    const lastRefresh = localStorage.getItem('qrLastRefresh');
    if (lastRefresh) {
      const elapsed = Math.floor((Date.now() - parseInt(lastRefresh)) / 1000);
      const remaining = 180 - (elapsed % 180);
      return remaining > 0 ? remaining : 180;
    }
    return 180;
  };

  // QR kodunu her dakika yenile
  useEffect(() => {
    if (!employee?.id) return;

    // İlk yüklemede kalan süreyi hesapla
    const initialRemaining = calculateRemainingTime();
    setQrCountdown(initialRemaining);

    const refreshQrCode = async () => {
      try {
        const updatedEmployee = await employeeService.regenerateQrCode(employee.id!);
        if (updatedEmployee.qrCode) {
          setCurrentQrCode(updatedEmployee.qrCode);
          onQrUpdate?.(updatedEmployee.qrCode);
          localStorage.setItem('qrLastRefresh', Date.now().toString());
        }
      } catch (err) {
        console.log('QR kod yenilenemedi', err);
      }
    };

    // Backend'den güncel QR kodunu al (sayfa açıldığında)
    const fetchCurrentQr = async () => {
      try {
        const currentEmployee = await employeeService.getById(employee.id!);
        if (currentEmployee.qrCode) {
          setCurrentQrCode(currentEmployee.qrCode);
          onQrUpdate?.(currentEmployee.qrCode);
        }
      } catch (err) {
        console.log('Güncel QR alınamadı', err);
      }
    };

    // Sayfa açıldığında güncel QR'ı al
    fetchCurrentQr();

    // İlk yükleme: eğer localStorage'da kayıt yoksa başlat
    if (!localStorage.getItem('qrLastRefresh')) {
      localStorage.setItem('qrLastRefresh', Date.now().toString());
    }

    // Her 3 dakika backend'den güncel QR'ı al (backend zaten yeniliyor)
    const qrTimer = setInterval(() => {
      fetchCurrentQr();
      setQrCountdown(180);
      localStorage.setItem('qrLastRefresh', Date.now().toString());
    }, 180000);

    // Geri sayım
    const countdownTimer = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);

    return () => {
      clearInterval(qrTimer);
      clearInterval(countdownTimer);
    };
  }, [employee?.id, onQrUpdate]);

  // Employee QR değiştiğinde güncelle
  useEffect(() => {
    if (employee?.qrCode) {
      setCurrentQrCode(employee.qrCode);
    }
  }, [employee?.qrCode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (employee?.id) {
      loadRecentRecords();
    }
  }, [employee?.id]);

  useEffect(() => {
    if (isHR) {
      loadEmployees();
      if (activeTab === 'hr') {
        loadAllRecords();
      }
    }
  }, [activeTab, isHR]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getApproved();
      setEmployees(data);
    } catch (err) {
      console.log('Çalışanlar yüklenemedi', err);
    }
  };

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

  const loadAllRecords = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.searchRecords({
        employeeId: filterEmployeeId,
        employeeName: filterName || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined
      });
      setAllRecords(data || []);
    } catch (err) {
      console.log('Kayıtlar yüklenemedi', err);
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadAllRecords();
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterEmployeeId(undefined);
  };

  // İK için çalışana kayıt ekleme
  const handleAddRecordForEmployee = async () => {
    if (!selectedEmployeeId) {
      setMessage('Lütfen bir çalışan seçin.');
      setMessageType('error');
      return;
    }

    if (!checkInTime || !checkOutTime) {
      setMessage('Giriş ve çıkış saatlerini giriniz.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await attendanceService.saveRecord({
        employeeId: selectedEmployeeId,
        date: selectedDate,
        checkInTime: checkInTime + ':00',
        checkOutTime: checkOutTime + ':00'
      });
      setMessage('✅ Kayıt başarıyla eklendi!');
      setMessageType('success');
      loadAllRecords();
      // Formu sıfırla
      setSelectedEmployeeId(undefined);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setCheckInTime('09:00');
      setCheckOutTime('18:00');
    } catch {
      setMessage('Kayıt eklenemedi. Lütfen tekrar deneyin.');
      setMessageType('error');
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
    if (!editingRecord?.id || !employee?.id) return;

    setLoading(true);
    try {
      await attendanceService.updateRecord(editingRecord.id, {
        date: editDate,
        checkInTime: editCheckIn + ':00',
        checkOutTime: editCheckOut + ':00'
      }, employee.id);
      setMessage('✅ Kayıt güncellendi!');
      setMessageType('success');
      setEditingRecord(null);
      if (activeTab === 'hr') {
        loadAllRecords();
      } else {
        loadRecentRecords();
      }
    } catch {
      setMessage('Güncelleme başarısız.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!employee?.id) return;
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      await attendanceService.deleteRecord(id, employee.id);
      setMessage('✅ Kayıt silindi!');
      setMessageType('success');
      if (activeTab === 'hr') {
        loadAllRecords();
      } else {
        loadRecentRecords();
      }
    } catch {
      setMessage('Silme başarısız.');
      setMessageType('error');
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

  // HR icin kendi giris/cikis islemleri
  const handleSelfCheckIn = async () => {
    if (!employee?.id) return;
    setLoading(true);
    setMessage('');
    try {
      const result = await attendanceService.checkIn(employee.id);
      setMessage('Giris basarili!');
      setMessageType('success');
      // Optimistic: bugun kaydini aninda guncelle
      setRecentRecords((prev) => {
        const today = new Date().toISOString().split('T')[0];
        const filtered = prev.filter((r) => r.date !== today);
        return [{ ...result, date: today }, ...filtered];
      });
      loadRecentRecords();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Giris yapilamadi.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelfCheckOut = async () => {
    if (!employee?.id) return;
    setLoading(true);
    setMessage('');
    try {
      const result = await attendanceService.checkOut(employee.id);
      setMessage('Cikis basarili!');
      setMessageType('success');
      setRecentRecords((prev) => {
        const today = new Date().toISOString().split('T')[0];
        const filtered = prev.filter((r) => r.date !== today);
        return [{ ...result, date: today }, ...filtered];
      });
      loadRecentRecords();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Cikis yapilamadi.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
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

  // Bugün giriş yapıldı mı kontrol et
  const todayRecord = recentRecords.find(r => r.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="attendance">
      <div className="page-header">
        <h1>⏰ Devam Takibi</h1>
        <p>{isHR ? 'Çalışan giriş/çıkış kayıtlarını yönetin' : 'Giriş ve çıkış kayıtlarınızı görüntüleyin'}</p>
      </div>

      {/* Tab Navigation for HR */}
      {isHR && (
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            👤 Benim Kayıtlarım
          </button>
          <button 
            className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
            onClick={() => setActiveTab('hr')}
          >
            📊 Tüm Kayıtlar (İK)
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {activeTab === 'my' && (
        <>
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

          {/* Bugünkü Durum */}
          {todayRecord && (
            <div className="card today-card">
              <h2>📅 Bugünkü Kayıt</h2>
              <div className="today-info">
                <div className="today-time-block">
                  <span className="label">Giriş</span>
                  <span className="value success">{formatTime(todayRecord.checkInTime)}</span>
                </div>
                <div className="today-separator">→</div>
                <div className="today-time-block">
                  <span className="label">Çıkış</span>
                  <span className="value danger">{formatTime(todayRecord.checkOutTime)}</span>
                </div>
                {todayRecord.hoursWorked && (
                  <div className="today-hours">
                    <span className="label">Süre</span>
                    <span className="value">{formatHours(todayRecord.hoursWorked)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Kod Kartı */}
          {currentQrCode && (
            <div className="card qr-code-card">
              <h2>QR Kodunuz</h2>
              <p>Sirket girisindeki kiosk terminalinde bu kodu okutarak giris/cikis yapabilirsiniz.</p>
              <div className="kiosk-info-box">
                <span className="info-icon">i</span>
                <span>QR Tarama adresi: <strong>/qr</strong></span>
              </div>
              
              <div className="qr-display">
                <QRCodeSVG 
                  value={currentQrCode} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  style={{ background: 'white', padding: '10px', borderRadius: '8px' }}
                />
                <div className="qr-code-text">{currentQrCode}</div>
                <div className="qr-countdown">
                  <span className="countdown-icon">~</span>
                  <span>Yeni kod: {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* HR icin hizli giris/cikis */}
              {isHR && (
                <div className="hr-quick-actions">
                  <p className="quick-action-label">Hizli Islem (IK Yetkisi):</p>
                  <div className="quick-action-buttons">
                    <button
                      onClick={handleSelfCheckIn}
                      className="btn-checkin"
                      disabled={loading || !!todayRecord?.checkInTime}
                    >
                      {todayRecord?.checkInTime ? 'Giris Yapildi' : 'Giris Yap'}
                    </button>
                    <button
                      onClick={handleSelfCheckOut}
                      className="btn-checkout"
                      disabled={loading || !todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
                    >
                      {todayRecord?.checkOutTime ? 'Cikis Yapildi' : 'Cikis Yap'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
                <p className="empty-hint">QR kodunuzu taratarak giriş/çıkış yapabilirsiniz.</p>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* HR Tab - Tüm Kayıtlar ve Kayıt Ekleme */}
      {activeTab === 'hr' && isHR && (
        <>
          {/* Çalışan için Kayıt Ekleme Formu */}
          <div className="card form-card">
            <h2>➕ Çalışan İçin Kayıt Ekle</h2>
            <p className="form-subtitle">Bir çalışan seçerek giriş/çıkış kaydı ekleyebilirsiniz</p>
            
            <div className="form-grid-hr">
              <div className="form-group">
                <label>👤 Çalışan</label>
                <select
                  value={selectedEmployeeId || ''}
                  onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">-- Çalışan Seçin --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstname} {emp.lastname} - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
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
              <button onClick={handleAddRecordForEmployee} className="btn-save" disabled={loading}>
                {loading ? '⏳ Kaydediliyor...' : '💾 Kayıt Ekle'}
              </button>
            </div>
          </div>

          {/* Filtre ve Kayıtlar */}
          <div className="card hr-filter-card">
            <h2>🔍 Kayıtları Filtrele</h2>
            <p className="form-subtitle">Herhangi bir alanı doldurup arama yapabilirsiniz</p>
            <div className="filter-grid">
              <div className="form-group">
                <label>👤 Çalışan Seç</label>
                <select
                  value={filterEmployeeId || ''}
                  onChange={(e) => setFilterEmployeeId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">-- Tümü --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstname} {emp.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>🔤 İsim Ara</label>
                <input
                  type="text"
                  placeholder="Ad veya soyad..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>📅 Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>📅 Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-actions">
              <button onClick={handleSearch} className="btn-search">
                🔍 Ara
              </button>
              <button onClick={clearFilters} className="btn-clear">
                🗑️ Temizle
              </button>
            </div>
          </div>

          <div className="card records-card">
            <h2>📊 Devam Kayıtları ({allRecords.length} sonuç)</h2>
            
            {loading ? (
              <div className="empty-state">
                <span className="empty-icon">⏳</span>
                <p>Yükleniyor...</p>
              </div>
            ) : allRecords.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Bu tarihte kayıt bulunmuyor</p>
              </div>
            ) : (
              <div className="hr-records-table">
                <table>
                  <thead>
                    <tr>
                      <th>Çalışan</th>
                      <th>Tarih</th>
                      <th>Giriş</th>
                      <th>Çıkış</th>
                      <th>Süre</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRecords.map((record) => (
                      <tr key={record.id}>
                        <td>{record.employeeName || `ID: ${record.employeeId}`}</td>
                        <td>{formatDate(record.date)}</td>
                        <td className="time-in">{formatTime(record.checkInTime)}</td>
                        <td className="time-out">{formatTime(record.checkOutTime)}</td>
                        <td>{formatHours(record.hoursWorked)}</td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Kaydı Düzenle</h3>
              <button className="modal-close" onClick={() => setEditingRecord(null)}>✕</button>
            </div>
            <div className="modal-body">
              {editingRecord.employeeName && (
                <div className="edit-info">
                  <strong>Çalışan:</strong> {editingRecord.employeeName}
                </div>
              )}
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
