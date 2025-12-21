import { Outlet, NavLink } from 'react-router-dom';
import { Employee } from '../types';
import './Layout.css';

interface LayoutProps {
  employee: Employee | null;
  onLogout: () => void;
}

function Layout({ employee, onLogout }: LayoutProps) {
  const isHR = employee?.department === 'İnsan Kaynakları';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HR System</h2>
          <p className="user-info">
            {employee?.firstname} {employee?.lastname}
          </p>
          <span className="user-role">{employee?.position}</span>
        </div>
        
        <nav className="nav-menu">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⏰</span>
            Devam Takibi
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
            <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">👥</span>
              Çalışan Yönetimi
            </NavLink>
          )}
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
