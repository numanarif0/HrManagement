import { Outlet, NavLink } from 'react-router-dom';
import { Employee } from '../types';
import './Layout.css';

interface LayoutProps {
  employee: Employee | null;
  onLogout: () => void;
}

function Layout({ employee, onLogout }: LayoutProps) {
  const isHR = employee?.department === 'İnsan Kaynakları' || employee?.role === 'HR' || employee?.role === 'ADMIN';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏢 HR System</h2>
          <p className="user-info">
            {employee?.firstname} {employee?.lastname}
          </p>
          <span className="user-role">{employee?.department} - {employee?.position}</span>
          {employee?.qrCode && (
            <span className="user-qr">QR: {employee.qrCode}</span>
          )}
        </div>
        
        <nav className="nav-menu">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⏰</span>
            Devam Takibim
          </NavLink>
          <NavLink to="/payroll" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">💰</span>
            Maaş Bordrosu
          </NavLink>
          <NavLink to="/reviews" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⭐</span>
            Değerlendirmeler
          </NavLink>
          
          {isHR && (
            <>
              <div className="nav-divider">
                <span>İK Yönetimi</span>
              </div>
              <NavLink to="/pending-applications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span className="nav-icon">📋</span>
                Onay Bekleyenler
              </NavLink>
              <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span className="nav-icon">👥</span>
                Çalışan Yönetimi
              </NavLink>
              <NavLink to="/qr-scanner" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span className="nav-icon">📱</span>
                QR Tarayıcı
              </NavLink>
            </>
          )}

          <div className="nav-divider">
            <span>Hesap</span>
          </div>
          <button onClick={onLogout} className="nav-item logout-nav-btn">
            <span className="nav-icon">🚪</span>
            Oturumu Kapat
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
