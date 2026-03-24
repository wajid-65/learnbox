import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function LoginPage() {
  const [userId, setUserId]     = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !name || !password) {
      setError('Please fill in all fields.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.post('/login', { user_id: userId, name, password });
      if (res.data.success) {
        const user = res.data.user;
        if (user.role !== 'admin') {
          setError('Access denied. This portal is for Faculty/Admin only.');
          setLoading(false); return;
        }
        localStorage.setItem('dkh_admin', JSON.stringify(user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div style={{ width: '100%', maxWidth: '420px' }} className="px-3">
        <div className="text-center mb-4">
          <h1 className="h4 fw-bold mb-1">Knowledge Hub</h1>
          <p className="text-muted small mb-0">CS Department — Admin Portal</p>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body p-4">
            <div className="portal-badge">Admin Login</div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Admin ID</label>
                <input id="admin-user-id" type="text" className="form-control" value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="Your registered Admin ID" autoComplete="username" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <input id="admin-name" type="text" className="form-control" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your registered full name" autoComplete="name" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Password</label>
                <input id="admin-password" type="password" className="form-control" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" autoComplete="current-password" />
              </div>
              <button id="admin-login-btn" type="submit" className="btn btn-primary w-100 mt-1" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <hr className="my-3" />
            <p className="text-center small text-muted mb-1">
              New admin? <Link to="/register">Create an account</Link>
            </p>
            <p className="text-center small text-muted mb-0">
              Students: <a href="https://learnbox-65-1.netlify.app" target="_blank">Student Portal</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
