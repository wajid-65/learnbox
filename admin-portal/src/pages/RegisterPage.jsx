import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Mathematics', 'Physics'
];

function RegisterPage() {
  const [userId, setUserId]                   = useState('');
  const [name, setName]                       = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment]           = useState('');
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [loading, setLoading]                 = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!userId || !name || !password || !confirmPassword || !department) {
      setError('All fields are required.'); return;
    }
    if (userId.trim().length < 4) { setError('Admin ID must be at least 4 characters.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await api.post('/register', {
        user_id: userId.trim().toUpperCase(), name: name.trim(),
        password, role: 'admin', department
      });
      if (res.data.success) {
        setSuccess('Account created. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div style={{ width: '100%', maxWidth: '480px' }} className="px-3">
        <div className="text-center mb-4">
          <h1 className="h4 fw-bold mb-1">Create Admin Account</h1>
          <p className="text-muted small mb-0">CS Department — Admin Portal</p>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body p-4">
            <div className="portal-badge">Admin Registration</div>

            {error   && <div className="alert alert-danger py-2 small">{error}</div>}
            {success && <div className="alert alert-success py-2 small">{success}</div>}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Admin / Faculty ID</label>
                <input id="reg-admin-id" type="text" className="form-control" value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="Choose a unique ID e.g. FAC2024" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <input id="reg-admin-name" type="text" className="form-control" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Department</label>
                <select id="reg-admin-dept" className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Password</label>
                <input id="reg-admin-password" type="password" className="form-control" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Confirm Password</label>
                <input id="reg-admin-confirm" type="password" className="form-control" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
              </div>
              <button id="reg-admin-btn" type="submit" className="btn btn-primary w-100 mt-1" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center small text-muted mt-3 mb-0">
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
