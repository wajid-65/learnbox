import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('dkh_admin') || 'null');
  const [materialsCount, setMaterialsCount] = useState(0);
  const [papersCount, setPapersCount] = useState(0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    api.get('/materials').then(r => setMaterialsCount(r.data.data?.length || 0)).catch(() => {});
    api.get('/questionpapers').then(r => setPapersCount(r.data.data?.length || 0)).catch(() => {});
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="h5 fw-bold mb-1">{greeting()}, {user?.name}</h1>
            <p className="text-muted small mb-0">CS Department — Faculty / Admin Portal</p>
          </div>
          <span className="badge text-bg-primary fs-6 fw-normal">{user?.department}</span>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border h-100">
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>Study Materials</div>
                <h3 className="fw-bold mb-1">{materialsCount}</h3>
                <p className="text-muted small mb-0">Total uploaded</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border h-100">
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>Question Papers</div>
                <h3 className="fw-bold mb-1">{papersCount}</h3>
                <p className="text-muted small mb-0">Total uploaded</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border h-100">
              <div className="card-body">
                <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>Role</div>
                <h3 className="fw-bold mb-1" style={{ fontSize: '1.1rem' }}>Admin</h3>
                <p className="text-muted small mb-0">{user?.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fw-semibold mb-3">Quick Actions</div>
        <div className="row g-3">
          <div className="col-md-4">
            <Link to="/materials" className="card border quick-card h-100 text-decoration-none">
              <div className="card-body">
                <h3 className="h6 fw-semibold mb-1">Upload Study Material</h3>
                <p className="text-muted small mb-0">Upload notes, slides, or assignments for students</p>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/question-papers" className="card border quick-card h-100 text-decoration-none">
              <div className="card-body">
                <h3 className="h6 fw-semibold mb-1">Upload Question Paper</h3>
                <p className="text-muted small mb-0">Add previous year exam papers to the repository</p>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/materials" className="card border quick-card h-100 text-decoration-none">
              <div className="card-body">
                <h3 className="h6 fw-semibold mb-1">Manage Materials</h3>
                <p className="text-muted small mb-0">View and delete uploaded study materials</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
