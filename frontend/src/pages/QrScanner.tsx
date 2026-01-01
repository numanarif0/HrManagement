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
  const processingRef = useRef(false);
  const scannerActiveRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
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
    if (!scannerContainerRef.current || scannerActiveRef.current) return;
    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
      scannerActiveRef.current = true;
      setScanning(true);
      setMessage('');
    } catch (err) {
      console.error('Kamera baslatilamadi:', err);
      setMessage('Kamera erisimi saglanamadi. Lutfen kamera iznini kontrol edin.');
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
        console.error('Tarayici durdurulurken hata:', err);
        html5QrCodeRef.current = null;
        scannerActiveRef.current = false;
        setScanning(false);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (processingRef.current || !scannerActiveRef.current) return;
    processingRef.current = true;
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        scannerActiveRef.current = false;
        setScanning(false);
      }
    } catch (err) {
      console.error('Scanner durdurulamadi:', err);
    }
    await processQrCode(decodedText);
    processingRef.current = false;
  };

  const processQrCode = async (qrCode: string) => {
    if (loading) return;
    setLoading(true);
    setMessage('');
    try {
      const result = await attendanceService.checkInByQr(qrCode);
      setMessage(`OK Giris basarili! Hos geldiniz ${result.employeeName || ''}`);
      setMessageType('success');
      setLastAction(result);
    } catch (checkInError: any) {
      try {
        const result = await attendanceService.checkOutByQr(qrCode);
        setMessage(`OK Cikis basarili! Gule gule ${result.employeeName || ''}`);
        setMessageType('success');
        setLastAction(result);
      } catch (checkOutError: any) {
        setMessage(checkOutError.response?.data?.message || checkInError.response?.data?.message || 'Islem basarisiz. QR kodu gecersiz olabilir.');
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
      setMessage('Lutfen QR kodu girin.');
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

  return (
    <div className="qr-simple-wrapper">
      <div className="qr-simple-header">
        <div>
          <p className="qr-chip">Herkese acik QR terminali</p>
          <h1>QR Tarayici</h1>
          <p className="qr-sub">Calisanlarin QR kodlarini tarayarak giris/cikis kaydi olusturun.</p>
        </div>
        <div className="qr-clock">
          <span className="qr-time">{timeDisplay}</span>
          <span className="qr-date">{dateDisplay}</span>
        </div>
      </div>

      {message && (
        <div className={`qr-message-large ${messageType}`}>
          {message}
        </div>
      )}

      {lastAction && (
        <div className="card last-action-card">
          <h3>Son Islem</h3>
          <div className="last-action-grid">
            <div className="action-detail">
              <span className="label">Calisan</span>
              <span className="value">{lastAction.employeeName}</span>
            </div>
            <div className="action-detail">
              <span className="label">Tarih</span>
              <span className="value">{lastAction.date}</span>
            </div>
            <div className="action-detail">
              <span className="label">Giris</span>
              <span className="value success">{lastAction.checkInTime?.substring(0, 5) || '-'}</span>
            </div>
            <div className="action-detail">
              <span className="label">Cikis</span>
              <span className="value danger">{lastAction.checkOutTime?.substring(0, 5) || '-'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card scanner-card">
        <h2>Kamera ile Tara</h2>
        <div id="qr-reader" ref={scannerContainerRef} className="qr-reader-container"></div>
        <div className="scanner-controls">
          {!scanning ? (
            <button onClick={startScanner} className="btn-start-scan" disabled={loading}>
              Taramayi Baslat
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-stop-scan">
              Taramayi Durdur
            </button>
          )}
        </div>
      </div>

      <div className="card manual-card">
        <h2>Manuel QR Girisi</h2>
        <p>Kamera calismazsa QR kodunu manuel olarak girebilirsiniz.</p>
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
            {loading ? 'Isleniyor...' : 'Gonder'}
          </button>
        </form>
      </div>

      <style>{`
        .qr-simple-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1rem 2rem;
        }

        .qr-simple-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          background: #f6f8fb;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 1rem 1.25rem;
        }

        .qr-simple-header h1 {
          margin: 4px 0;
          font-size: 24px;
          color: #0f172a;
        }

        .qr-sub {
          margin: 0;
          color: #4b5563;
          font-size: 14px;
        }

        .qr-chip {
          display: inline-block;
          margin: 0;
          padding: 4px 10px;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 999px;
          font-size: 12px;
          border: 1px solid #e0e7ff;
        }

        .qr-clock {
          text-align: right;
        }

        .qr-time {
          display: block;
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          font-family: 'Courier New', monospace;
        }

        .qr-date {
          display: block;
          color: #6b7280;
          font-size: 13px;
        }

        .qr-message-large {
          padding: 1.2rem;
          border-radius: 12px;
          text-align: center;
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1rem 0;
        }

        .qr-message-large.success {
          background: #ecfdf3;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .qr-message-large.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .last-action-card, .scanner-card, .manual-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 24px rgba(0,0,0,0.05);
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .last-action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .action-detail {
          display: flex;
          flex-direction: column;
          padding: 0.65rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .action-detail .label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .action-detail .value {
          font-size: 1.05rem;
          font-weight: 600;
          color: #111827;
        }

        .action-detail .value.success { color: #16a34a; }
        .action-detail .value.danger { color: #dc2626; }

        .scanner-card h2, .manual-card h2 { margin: 0 0 0.75rem 0; }

        .qr-reader-container {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          background: #0f172a;
        }

        .scanner-controls { margin-top: 1rem; }

        .btn-start-scan, .btn-stop-scan, .btn-manual-submit {
          padding: 0.9rem 1.4rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-start-scan { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
        .btn-stop-scan { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
        .btn-start-scan:hover, .btn-stop-scan:hover, .btn-manual-submit:hover { transform: translateY(-1px); }
        .btn-start-scan:disabled { opacity: 0.6; cursor: not-allowed; }

        .manual-form {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .manual-input {
          flex: 1;
          min-width: 180px;
          padding: 0.9rem;
          font-size: 1.05rem;
          text-align: center;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
        }

        .manual-input:focus { border-color: #4f46e5; outline: none; }

        .btn-manual-submit { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; }
        .btn-manual-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 640px) {
          .qr-simple-header { flex-direction: column; align-items: flex-start; }
          .qr-clock { text-align: left; }
          .last-action-grid { grid-template-columns: 1fr; }
          .manual-form { flex-direction: column; align-items: stretch; }
          .manual-input { width: 100%; }
          .btn-manual-submit { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default QrScanner;
