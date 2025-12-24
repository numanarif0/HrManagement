import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Employee, Attendance } from '../types';
import { attendanceService } from '../services/attendanceService';
import './Attendance.css';

interface QrScannerProps {
  employee: Employee | null;
}

function QrScanner({ employee }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [lastAction, setLastAction] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualQrCode, setManualQrCode] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false); // Prevent multiple calls
  const scannerActiveRef = useRef(false); // Track scanner state

  const isHR = employee?.department === 'İnsan Kaynakları' || employee?.role === 'HR' || employee?.role === 'ADMIN';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current?.clear();
          }).catch(() => {});
        } catch (e) {}
        html5QrCodeRef.current = null;
      }
      scannerActiveRef.current = false;
    };
  }, []);

  const startScanner = async () => {
    if (!scannerContainerRef.current) return;
    if (scannerActiveRef.current) return; // Already running

    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 5, // Reduced fps to prevent too many scans
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {} // Ignore scan errors
      );
      
      scannerActiveRef.current = true;
      setScanning(true);
      setMessage('');
    } catch (err) {
      console.error('Kamera başlatılamadı:', err);
      setMessage('Kamera erişimi sağlanamadı. Lütfen kamera iznini kontrol edin.');
      setMessageType('error');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scannerActiveRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        scannerActiveRef.current = false;
        setScanning(false);
      } catch (err) {
        console.error('Tarayıcı durdurulurken hata:', err);
        // Force reset
        html5QrCodeRef.current = null;
        scannerActiveRef.current = false;
        setScanning(false);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Prevent multiple simultaneous calls
    if (processingRef.current) return;
    if (!scannerActiveRef.current) return;
    
    processingRef.current = true;

    // Taramayı hemen durdur
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        scannerActiveRef.current = false;
        setScanning(false);
      }
    } catch (err) {
      console.error('Scanner durdurulamadı:', err);
    }
    
    // QR kodu ile giriş/çıkış işlemi yap
    await processQrCode(decodedText);
    
    processingRef.current = false;
  };

  const processQrCode = async (qrCode: string) => {
    if (loading) return;

    setLoading(true);
    setMessage('');

    try {
      // Önce giriş yapmayı dene
      const result = await attendanceService.checkInByQr(qrCode);
      setMessage(`✅ Giriş başarılı! Hoş geldiniz ${result.employeeName || ''}`);
      setMessageType('success');
      setLastAction(result);
    } catch (checkInError: any) {
      // Giriş başarısızsa çıkış yapmayı dene
      try {
        const result = await attendanceService.checkOutByQr(qrCode);
        setMessage(`✅ Çıkış başarılı! Güle güle ${result.employeeName || ''}`);
        setMessageType('success');
        setLastAction(result);
      } catch (checkOutError: any) {
        setMessage(checkOutError.response?.data?.message || checkInError.response?.data?.message || 'İşlem başarısız. QR kodu geçersiz olabilir.');
        setMessageType('error');
      }
    } finally {
      setLoading(false);
      setManualQrCode('');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQrCode.trim()) {
      setMessage('Lütfen QR kodu girin.');
      setMessageType('error');
      return;
    }
    await processQrCode(manualQrCode.trim().toUpperCase());
  };

  const timeDisplay = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateDisplay = currentTime.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (!isHR) {
    return (
      <div className="qr-scanner-page">
        <div className="access-denied-card">
          <span className="denied-icon">🚫</span>
          <h2>Erişim Engellendi</h2>
          <p>Bu sayfa sadece İnsan Kaynakları tarafından kullanılabilir.</p>
          <p className="hint">QR tarayıcı terminali olarak kullanılmak üzere tasarlanmıştır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-scanner-page">
      <div className="page-header">
        <h1>📱 QR Tarayıcı</h1>
        <p>Çalışan QR kodlarını tarayarak giriş/çıkış kaydı oluşturun</p>
      </div>

      {/* Saat Göstergesi */}
      <div className="time-display-large">
        <div className="time-value">{timeDisplay}</div>
        <div className="date-value">{dateDisplay}</div>
      </div>

      {/* Message */}
      {message && (
        <div className={`qr-message-large ${messageType}`}>
          {message}
        </div>
      )}

      {/* Son İşlem */}
      {lastAction && (
        <div className="card last-action-card">
          <h3>📋 Son İşlem</h3>
          <div className="last-action-grid">
            <div className="action-detail">
              <span className="label">Çalışan</span>
              <span className="value">{lastAction.employeeName}</span>
            </div>
            <div className="action-detail">
              <span className="label">Tarih</span>
              <span className="value">{lastAction.date}</span>
            </div>
            <div className="action-detail">
              <span className="label">Giriş</span>
              <span className="value success">{lastAction.checkInTime?.substring(0, 5) || '-'}</span>
            </div>
            <div className="action-detail">
              <span className="label">Çıkış</span>
              <span className="value danger">{lastAction.checkOutTime?.substring(0, 5) || '-'}</span>
            </div>
          </div>
        </div>
      )}

      {/* QR Tarayıcı */}
      <div className="card scanner-card">
        <h2>📷 Kamera ile Tara</h2>
        
        <div id="qr-reader" ref={scannerContainerRef} className="qr-reader-container"></div>
        
        <div className="scanner-controls">
          {!scanning ? (
            <button onClick={startScanner} className="btn-start-scan" disabled={loading}>
              📷 Taramayı Başlat
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-stop-scan">
              ⏹️ Taramayı Durdur
            </button>
          )}
        </div>
      </div>

      {/* Manuel QR Girişi */}
      <div className="card manual-card">
        <h2>⌨️ Manuel QR Girişi</h2>
        <p>Kamera çalışmazsa QR kodunu manuel olarak girebilirsiniz</p>
        
        <form onSubmit={handleManualSubmit} className="manual-form">
          <input
            type="text"
            value={manualQrCode}
            onChange={(e) => setManualQrCode(e.target.value.toUpperCase())}
            placeholder="QR-XXXXXXXX"
            className="manual-input"
            disabled={loading}
          />
          <button type="submit" className="btn-manual-submit" disabled={loading || !manualQrCode.trim()}>
            {loading ? '⏳ İşleniyor...' : '✓ Gönder'}
          </button>
        </form>
      </div>

      <style>{`
        .qr-scanner-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .time-display-large {
          text-align: center;
          margin: 1.5rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }

        .time-value {
          font-size: 3.5rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
        }

        .date-value {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-top: 0.5rem;
        }

        .qr-message-large {
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .qr-message-large.success {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border: 2px solid #22c55e;
        }

        .qr-message-large.error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border: 2px solid #ef4444;
        }

        .last-action-card {
          margin-bottom: 1.5rem;
        }

        .last-action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .action-detail {
          display: flex;
          flex-direction: column;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .action-detail .label {
          font-size: 0.85rem;
          color: #666;
        }

        .action-detail .value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .action-detail .value.success {
          color: #22c55e;
        }

        .action-detail .value.danger {
          color: #ef4444;
        }

        .scanner-card {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .qr-reader-container {
          width: 100%;
          max-width: 400px;
          margin: 1rem auto;
          border-radius: 12px;
          overflow: hidden;
        }

        .scanner-controls {
          margin-top: 1rem;
        }

        .btn-start-scan, .btn-stop-scan {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-start-scan {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
        }

        .btn-stop-scan {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-start-scan:hover, .btn-stop-scan:hover {
          transform: scale(1.05);
        }

        .btn-start-scan:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .manual-card {
          text-align: center;
        }

        .manual-form {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          justify-content: center;
        }

        .manual-input {
          flex: 1;
          max-width: 200px;
          padding: 1rem;
          font-size: 1.2rem;
          text-align: center;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        }

        .manual-input:focus {
          border-color: #667eea;
          outline: none;
        }

        .btn-manual-submit {
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-manual-submit:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .btn-manual-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .access-denied-card {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }

        .denied-icon {
          font-size: 4rem;
        }

        .access-denied-card h2 {
          margin: 1rem 0 0.5rem;
          color: #ef4444;
        }

        .access-denied-card p {
          color: #666;
        }

        .access-denied-card .hint {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #999;
        }

        @media (max-width: 480px) {
          .time-value {
            font-size: 2.5rem;
          }

          .manual-form {
            flex-direction: column;
            align-items: center;
          }

          .manual-input {
            max-width: 100%;
          }

          .btn-manual-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default QrScanner;
