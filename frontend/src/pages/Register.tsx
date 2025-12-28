import { useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    position: '',
    department: '',
    email: '',
    phoneNumber: '',
    password: '',
    tcNo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await employeeService.register(formData);
      setSuccess('✅ Başvurunuz başarıyla alındı! İnsan Kaynakları departmanı başvurunuzu inceleyecek. Onaylandığında sisteme giriş yapabilirsiniz.');
      setFormData({
        firstname: '',
        lastname: '',
        position: '',
        department: '',
        email: '',
        phoneNumber: '',
        password: '',
        tcNo: '',
      });
    } catch (err) {
      setError('Başvuru gönderilemedi. Lütfen bilgilerinizi kontrol edin veya bu email/TC ile daha önce başvuru yapılmış olabilir.');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['Bilgi Teknolojileri', 'Finans', 'Pazarlama', 'Satış', 'Operasyon', 'Müşteri Hizmetleri', 'Ar-Ge', 'Üretim', 'Lojistik'];
  const positions = ['Stajyer', 'Junior', 'Mid-Level', 'Senior', 'Uzman', 'Takım Lideri'];

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>📝 İş Başvurusu</h1>
          </div>
          <div className="success-container">
            <div className="success-icon">✅</div>
            <p className="success-message-large">{success}</p>
            <Link to="/login" className="btn-primary auth-btn">
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>📝 İş Başvurusu</h1>
          <p>Şirketimize katılmak için başvuru formu</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">Ad</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="Adınız"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Soyad</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Soyadınız"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tcNo">TC Kimlik No</label>
            <input
              type="text"
              id="tcNo"
              name="tcNo"
              value={formData.tcNo}
              onChange={handleChange}
              placeholder="11 haneli TC No"
              maxLength={11}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Başvurulan Departman</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Seçiniz</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="position">Başvurulan Pozisyon</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="">Seçiniz</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Telefon</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="05XX XXX XX XX"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre (Onaylandığında kullanacağınız)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Başvuru gönderiliyor...' : '📤 Başvuru Gönder'}
          </button>

          <div className="info-box">
            <p>ℹ️ Başvurunuz İnsan Kaynakları tarafından incelendikten sonra onaylanacaktır.</p>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Zaten çalışan mısınız? <Link to="/login">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
