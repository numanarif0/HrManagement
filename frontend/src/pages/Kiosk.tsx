import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Attendance } from '../types';
import { attendanceService } from '../services/attendanceService';

function Kiosk() {
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

  // Saat guncelleme
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup on unmount
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

  // Mesaji 5 saniye sonra temizle
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const startScanner = async () => {
    if (!scannerContainerRef.current) return;
    if (scannerActiveRef.current) return;

    try {
      html5QrCodeRef.current = new Html5Qrcode('kiosk-qr-reader');

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 5,
          qrbox: { width: 300, height: 300 },
        },
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
    if (processingRef.current) return;
    if (!scannerActiveRef.current) return;

    processingRef.current = true;

    // Taramayi durdurma - devam etsin
    await processQrCode(decodedText);

    // 2 saniye bekle sonra tekrar taramaya izin ver
    setTimeout(() => {
      processingRef.current = false;
    }, 2000);
  };

  const processQrCode = async (qrCode: string) => {
    if (loading) return;

    setLoading(true);
    setMessage('');

    try {
      // Onca giris yapmayi dene
      const result = await attendanceService.checkInByQr(qrCode);
      setMessage(`Giris basarili! Hos geldiniz ${result.employeeName || ''}`);
      setMessageType('success');
      setLastAction(result);
    } catch (checkInError: any) {
      // Giris basarisizsa cikis yapmayi dene
      try {
        const result = await attendanceService.checkOutByQr(qrCode);
        setMessage(`Cikis basarili! Gule gule ${result.employeeName || ''}`);
        setMessageType('success');
        setLastAction(result);
      } catch (checkOutError: any) {
        const errorMsg = checkOutError.response?.data?.message ||
                        checkInError.response?.data?.message ||
                        'Islem basarisiz. QR kodu gecersiz olabilir.';
        setMessage(errorMsg);
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
    <div className="kiosk-page">
      {/* Header */}
      <div className="kiosk-header">
        <h1>HR Management</h1>
        <p>Giris / Cikis Terminali</p>
      </div>

      {/* Saat */}
      <div className="kiosk-time">
        <div className="time-value">{timeDisplay}</div>
        <div className="date-value">{dateDisplay}</div>
      </div>

      {/* Mesaj */}
      {message && (
        <div className={`kiosk-message ${messageType}`}>
          {messageType === 'success' ? '✓' : '✕'} {message}
        </div>
      )}

      {/* Son Islem */}
      {lastAction && (
        <div className="kiosk-last-action">
          <h3>Son Islem</h3>
          <div className="action-details">
            <span className="employee-name">{lastAction.employeeName}</span>
            <span className="action-time">
              {lastAction.checkOutTime
                ? `Cikis: ${lastAction.checkOutTime?.substring(0, 5)}`
                : `Giris: ${lastAction.checkInTime?.substring(0, 5)}`
              }
            </span>
          </div>
        </div>
      )}

      {/* QR Scanner */}
      <div className="kiosk-scanner">
        <div id="kiosk-qr-reader" ref={scannerContainerRef} className="qr-reader"></div>

        <div className="scanner-controls">
          {!scanning ? (
            <button onClick={startScanner} className="btn-start" disabled={loading}>
              Taramayi Baslat
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-stop">
              Taramayi Durdur
            </button>
          )}
        </div>
      </div>

      {/* Manuel Giris */}
      <div className="kiosk-manual">
        <p>veya QR kodu manuel girin:</p>
        <form onSubmit={handleManualSubmit} className="manual-form">
          <input
            type="text"
            value={manualQrCode}
            onChange={(e) => setManualQrCode(e.target.value.toUpperCase())}
            placeholder="QR-XXXXXXXX"
            className="manual-input"
            disabled={loading}
          />
          <button type="submit" className="btn-submit" disabled={loading || !manualQrCode.trim()}>
            {loading ? 'Isleniyor...' : 'Gonder'}
          </button>
        </form>
      </div>

      <style>{`
        .kiosk-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .kiosk-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .kiosk-header h1 {
          font-size: 2.5rem;
          margin: 0;
          background: linear-gradient(90deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .kiosk-header p {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 0.5rem;
        }

        .kiosk-time {
          text-align: center;
          margin: 1.5rem 0;
          padding: 2rem 3rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .kiosk-time .time-value {
          font-size: 4rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          letter-spacing: 4px;
        }

        .kiosk-time .date-value {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 0.5rem;
          text-transform: capitalize;
        }

        .kiosk-message {
          padding: 1.5rem 3rem;
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .kiosk-message.success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .kiosk-message.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .kiosk-last-action {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
          border-radius: 12px;
          margin: 1rem 0;
          text-align: center;
        }

        .kiosk-last-action h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          opacity: 0.7;
        }

        .kiosk-last-action .action-details {
          display: flex;
          gap: 2rem;
          justify-content: center;
          align-items: center;
        }

        .kiosk-last-action .employee-name {
          font-size: 1.3rem;
          font-weight: 600;
        }

        .kiosk-last-action .action-time {
          font-size: 1.1rem;
          opacity: 0.8;
        }

        .kiosk-scanner {
          margin: 1.5rem 0;
          text-align: center;
        }

        .kiosk-scanner .qr-reader {
          width: 350px;
          max-width: 90vw;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }

        .scanner-controls {
          margin-top: 1rem;
        }

        .btn-start, .btn-stop, .btn-submit {
          padding: 1rem 2.5rem;
          font-size: 1.2rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-start {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .btn-stop {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .btn-start:hover, .btn-stop:hover, .btn-submit:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .btn-start:disabled, .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .kiosk-manual {
          margin-top: 2rem;
          text-align: center;
        }

        .kiosk-manual p {
          opacity: 0.7;
          margin-bottom: 1rem;
        }

        .manual-form {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .manual-input {
          padding: 1rem 1.5rem;
          font-size: 1.2rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-family: 'Courier New', monospace;
          text-align: center;
          width: 200px;
        }

        .manual-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .manual-input:focus {
          outline: none;
          border-color: #667eea;
        }

        @media (max-width: 600px) {
          .kiosk-time .time-value {
            font-size: 3rem;
          }

          .kiosk-message {
            font-size: 1.2rem;
            padding: 1rem 2rem;
          }

          .manual-form {
            flex-direction: column;
            align-items: center;
          }

          .manual-input {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
}

export default Kiosk;
