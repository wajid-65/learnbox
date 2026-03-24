import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

function QuestionPapersPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const user = JSON.parse(localStorage.getItem('dkh_admin') || 'null');

  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questionpapers');
      setPapers(res.data.data || []);
    } catch { setError('Failed to load question papers.'); }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return fetchPapers();
    try {
      const res = await api.get(`/questionpapers/search?query=${encodeURIComponent(searchQuery)}`);
      setPapers(res.data.data || []);
    } catch { setError('Search failed.'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!subject || !year || !semester || !file) {
      setError('All fields are required.'); return;
    }
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('uploaded_by', user?.name || 'Admin');
    formData.append('file', file);

    setUploading(true); setError(''); setSuccess('');
    try {
      await api.post('/questionpapers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Question paper uploaded successfully.');
      setSubject(''); setYear(''); setSemester(''); setFile(null);
      e.target.reset();
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question paper?')) return;
    try {
      await api.delete(`/questionpapers/${id}`);
      setSuccess('Question paper deleted.');
      setPapers(prev => prev.filter(p => p._id !== id));
    } catch { setError('Delete failed.'); }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="h5 fw-bold mb-1">Question Papers</h1>
            <p className="text-muted small mb-0">Upload and manage previous year question papers</p>
          </div>
          <span className="badge text-bg-secondary">{papers.length} items</span>
        </div>

        {/* Upload Form */}
        <div className="card border mb-4">
          <div className="card-body">
            <div className="fw-semibold small mb-3">Upload Question Paper</div>
            <form onSubmit={handleUpload}>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Subject</label>
                  <input id="qp-subject" type="text" className="form-control form-control-sm"
                    placeholder="e.g. Database Management" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Exam Year</label>
                  <select id="qp-year" className="form-select form-select-sm" value={year} onChange={e => setYear(e.target.value)}>
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Semester</label>
                  <select id="qp-semester" className="form-select form-select-sm" value={semester} onChange={e => setSemester(e.target.value)}>
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">File (PDF / DOC)</label>
                  <input id="qp-file" type="file" className="form-control form-control-sm"
                    accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} />
                </div>
              </div>
              <button id="upload-qp-btn" type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Paper'}
              </button>
            </form>
          </div>
        </div>

        {error   && <div className="alert alert-danger py-2 small">{error}</div>}
        {success && <div className="alert alert-success py-2 small">{success}</div>}

        {/* Table */}
        <div className="card border">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-2">
            <div className="fw-semibold small">All Question Papers</div>
            <div className="input-group input-group-sm" style={{ width: 'auto' }}>
              <input type="text" className="form-control" style={{ width: '200px' }}
                placeholder="Search by subject or year..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
              {searchQuery && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => { setSearchQuery(''); fetchPapers(); }}>✕</button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="d-flex align-items-center gap-2 p-4 text-muted small">
              <div className="spinner"></div> Loading...
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center text-muted small p-5">No question papers found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>#</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>SUBJECT</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>YEAR</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>SEMESTER</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>UPLOADED BY</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((p, i) => (
                    <tr key={p._id}>
                      <td className="row-num small">{i + 1}</td>
                      <td className="small">{p.subject}</td>
                      <td><span className="badge text-bg-success">{p.year}</span></td>
                      <td><span className="badge text-bg-secondary">Sem {p.semester}</span></td>
                      <td className="small">{p.uploaded_by}</td>
                      <td>
                        <div className="actions-cell">
                          <a href={p.file_url} target="_blank" rel="noreferrer"
                            className="btn btn-outline-secondary btn-sm">Download</a>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPapersPage;
