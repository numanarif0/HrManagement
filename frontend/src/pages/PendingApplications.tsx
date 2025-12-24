import { useState, useEffect } from 'react';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import './Employees.css';

interface PendingApplicationsProps {
  employee: Employee | null;
}

function PendingApplications({ employee }: PendingApplicationsProps) {
  const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadPendingEmployees();
  }, []);

  const loadPendingEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getPending();
      setPendingEmployees(data);
    } catch (error) {
      console.error('Başvurular yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // İK kontrolü
  const isHR = employee?.department === 'İnsan Kaynakları' || employee?.role === 'HR' || employee?.role === 'ADMIN';

  if (!isHR) {
    return (
      <div className="employees-page">
        <div className="access-denied">
          <span className="denied-icon">🚫</span>
          <h2>Erişim Engellendi</h2>
          <p>Bu sayfaya yalnızca İnsan Kaynakları departmanı çalışanları erişebilir.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (id: number) => {
    if (!employee?.id) return;
    
    try {
      await employeeService.approve(id, employee.id);
      setMessage('✅ Başvuru onaylandı! Çalışana QR kod atandı.');
      loadPendingEmployees();
      setSelectedEmployee(null);
    } catch (error) {
      setMessage('❌ Onaylama sırasında bir hata oluştu.');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Bu başvuruyu reddetmek istediğinizden emin misiniz?')) return;
    
    try {
      await employeeService.reject(id);
      setMessage('Başvuru reddedildi.');
      loadPendingEmployees();
      setSelectedEmployee(null);
    } catch (error) {
      setMessage('❌ Reddetme sırasında bir hata oluştu.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="employees-page">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div className="header-left">
          <h1>📋 Onay Bekleyen Başvurular</h1>
          <p>{pendingEmployees.length} başvuru bekliyor</p>
        </div>
      </div>

      {message && (
        <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')} className="close-btn">✕</button>
        </div>
      )}

      {pendingEmployees.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-icon">🎉</div>
          <h2>Tüm Başvurular İşlendi</h2>
          <p>Şu anda bekleyen başvuru bulunmuyor.</p>
        </div>
      ) : (
        <div className="applications-grid">
          {pendingEmployees.map((emp) => (
            <div key={emp.id} className="application-card">
              <div className="application-header">
                <div className="applicant-avatar">
                  {emp.firstname?.charAt(0)}{emp.lastname?.charAt(0)}
                </div>
                <div className="applicant-info">
                  <h3>{emp.firstname} {emp.lastname}</h3>
                  <span className="pending-badge">⏳ Onay Bekliyor</span>
                </div>
              </div>
              
              <div className="application-details">
                <div className="detail-row">
                  <span className="label">📧 Email:</span>
                  <span className="value">{emp.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📞 Telefon:</span>
                  <span className="value">{emp.phoneNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">🏢 Departman:</span>
                  <span className="value">{emp.department}</span>
                </div>
                <div className="detail-row">
                  <span className="label">💼 Pozisyon:</span>
                  <span className="value">{emp.position}</span>
                </div>
                <div className="detail-row">
                  <span className="label">🆔 TC No:</span>
                  <span className="value">{emp.tcNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📅 Başvuru:</span>
                  <span className="value">{formatDate(emp.createdAt)}</span>
                </div>
              </div>

              <div className="application-actions">
                <button
                  onClick={() => emp.id && handleApprove(emp.id)}
                  className="btn-approve"
                >
                  ✅ Onayla
                </button>
                <button
                  onClick={() => emp.id && handleReject(emp.id)}
                  className="btn-reject"
                >
                  ❌ Reddet
                </button>
                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="btn-details"
                >
                  🔍 Detay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detay Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Başvuru Detayı</h3>
              <button className="modal-close" onClick={() => setSelectedEmployee(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Kişisel Bilgiler</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Ad Soyad</span>
                    <span className="value">{selectedEmployee.firstname} {selectedEmployee.lastname}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">TC Kimlik No</span>
                    <span className="value">{selectedEmployee.tcNo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email</span>
                    <span className="value">{selectedEmployee.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Telefon</span>
                    <span className="value">{selectedEmployee.phoneNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Başvuru Bilgileri</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Departman</span>
                    <span className="value">{selectedEmployee.department}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Pozisyon</span>
                    <span className="value">{selectedEmployee.position}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Başvuru Tarihi</span>
                    <span className="value">{formatDate(selectedEmployee.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => selectedEmployee.id && handleReject(selectedEmployee.id)}
                className="btn-danger"
              >
                ❌ Reddet
              </button>
              <button
                onClick={() => selectedEmployee.id && handleApprove(selectedEmployee.id)}
                className="btn-success"
              >
                ✅ Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .message-banner {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .message-banner.success {
          background: #dcfce7;
          color: #166534;
        }
        .message-banner.error {
          background: #fee2e2;
          color: #991b1b;
        }
        .message-banner .close-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .empty-state-card {
          text-align: center;
          padding: 3rem;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .application-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }
        .application-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .applicant-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .applicant-info h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        .pending-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #fef3c7;
          color: #92400e;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        .application-details {
          margin-bottom: 1rem;
        }
        .application-details .detail-row {
          display: flex;
          padding: 0.4rem 0;
          font-size: 0.9rem;
        }
        .application-details .label {
          width: 110px;
          color: #666;
        }
        .application-details .value {
          flex: 1;
          font-weight: 500;
        }
        .application-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .btn-approve, .btn-reject, .btn-details {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: transform 0.2s;
        }
        .btn-approve {
          background: #22c55e;
          color: white;
        }
        .btn-reject {
          background: #ef4444;
          color: white;
        }
        .btn-details {
          background: #3b82f6;
          color: white;
        }
        .btn-approve:hover, .btn-reject:hover, .btn-details:hover {
          transform: scale(1.02);
        }
        .detail-modal {
          max-width: 600px;
        }
        .detail-section {
          margin-bottom: 1.5rem;
        }
        .detail-section h4 {
          margin: 0 0 1rem;
          color: #374151;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .detail-item .label {
          font-size: 0.85rem;
          color: #666;
        }
        .detail-item .value {
          font-weight: 600;
          color: #111;
        }
      `}</style>
    </div>
  );
}

export default PendingApplications;
