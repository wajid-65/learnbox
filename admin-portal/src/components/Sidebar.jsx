import { NavLink } from 'react-router-dom';
import api from '../api/axios';

function Sidebar() {
  const user = JSON.parse(localStorage.getItem('dkh_admin') || 'null');

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('dkh_admin');
    // Use hard redirect so React fully resets — prevents stale auth state
    window.location.replace('/admin/login');
  };

  return (
    <nav className="sidebar">
      <div className="p-3 border-bottom">
        <div className="fw-bold" style={{ fontSize: '0.95rem', color: '#111827' }}>Knowledge Hub</div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>Admin Portal</div>
      </div>

      {user && (
        <div className="d-flex align-items-center gap-2 p-3 border-bottom bg-light">
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate" style={{ fontSize: '0.82rem', color: '#111827' }}>{user.name}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{user.department}</div>
          </div>
        </div>
      )}

      <ul className="nav flex-column flex-grow-1 py-2">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/materials" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Study Materials
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/question-papers" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Question Papers
          </NavLink>
        </li>
      </ul>

      <div className="p-3 border-top">
        <button className="btn btn-outline-danger btn-sm w-100" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Sidebar;
