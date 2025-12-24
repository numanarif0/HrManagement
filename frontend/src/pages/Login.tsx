import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types';
import './Auth.css';

interface LoginProps {
  onLogin: (employee: Employee) => void;
}

function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const employee = await employeeService.login(formData);
      if (employee) {
        // Giriş yapıldığında QR süresini sıfırla
        localStorage.setItem('qrLastRefresh', Date.now().toString());
        onLogin(employee);
        navigate('/dashboard');
      } else {
        setError('Giriş başarısız. Hesabınız henüz onaylanmamış olabilir veya bilgileriniz hatalı.');
      }
    } catch (err) {
      setError('Giriş başarısız. Email veya şifre hatalı ya da hesabınız henüz onaylanmamış.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏢 HR Management</h1>
          <p>İnsan Kaynakları Yönetim Sistemi</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@sirket.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Şirkette yeni misiniz? <Link to="/register">İş Başvurusu Yap</Link>
          </p>
          <p className="auth-note">
            ⚠️ Başvurunuz İK tarafından onaylandıktan sonra sisteme giriş yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
