import { useReducer, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

// useReducer — manages all related state in one place instead of 7 separate useState calls
const initialState = {
  materials: [],
  loading: true,
  error: '',
  success: '',
  searchQuery: '',
  title: '',
  subject: '',
  semester: '',
  file: null,
  uploading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MATERIALS':   return { ...state, materials: action.payload, loading: false };
    case 'SET_LOADING':     return { ...state, loading: action.payload };
    case 'SET_ERROR':       return { ...state, error: action.payload };
    case 'SET_SUCCESS':     return { ...state, success: action.payload };
    case 'SET_SEARCH':      return { ...state, searchQuery: action.payload };
    case 'SET_TITLE':       return { ...state, title: action.payload };
    case 'SET_SUBJECT':     return { ...state, subject: action.payload };
    case 'SET_SEMESTER':    return { ...state, semester: action.payload };
    case 'SET_FILE':        return { ...state, file: action.payload };
    case 'SET_UPLOADING':   return { ...state, uploading: action.payload };
    case 'RESET_FORM':      return { ...state, title: '', subject: '', semester: '', file: null };
    case 'CLEAR_MESSAGES':  return { ...state, error: '', success: '' };
    default: return state;
  }
}

function MaterialsPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { materials, loading, error, success, searchQuery, title, subject, semester, file, uploading } = state;
  const user = JSON.parse(localStorage.getItem('dkh_admin') || 'null');

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.get('/materials');
      dispatch({ type: 'SET_MATERIALS', payload: res.data.data || [] });
    } catch { dispatch({ type: 'SET_ERROR', payload: 'Failed to load materials.' }); }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return fetchMaterials();
    try {
      const res = await api.get(`/materials/search?query=${encodeURIComponent(searchQuery)}`);
      dispatch({ type: 'SET_MATERIALS', payload: res.data.data || [] });
    } catch { dispatch({ type: 'SET_ERROR', payload: 'Search failed.' }); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !subject || !semester || !file) {
      dispatch({ type: 'SET_ERROR', payload: 'All fields are required.' }); return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('semester', semester);
    formData.append('uploaded_by', user?.name || 'Admin');
    formData.append('file', file);

    dispatch({ type: 'SET_UPLOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });
    try {
      await api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch({ type: 'SET_SUCCESS', payload: 'Material uploaded successfully.' });
      dispatch({ type: 'RESET_FORM' });
      e.target.reset();
      fetchMaterials();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Upload failed.' });
    }
    dispatch({ type: 'SET_UPLOADING', payload: false });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      dispatch({ type: 'SET_SUCCESS', payload: 'Material deleted.' });
      dispatch({ type: 'SET_MATERIALS', payload: materials.filter(m => m._id !== id) });
    } catch { dispatch({ type: 'SET_ERROR', payload: 'Delete failed.' }); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="h5 fw-bold mb-1">Study Materials</h1>
            <p className="text-muted small mb-0">Upload and manage study materials</p>
          </div>
          <span className="badge text-bg-secondary">{materials.length} items</span>
        </div>

        {/* Upload Form */}
        <div className="card border mb-4">
          <div className="card-body">
            <div className="fw-semibold small mb-3">Upload New Material</div>
            <form onSubmit={handleUpload}>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Title</label>
                  <input id="mat-title" type="text" className="form-control form-control-sm"
                    placeholder="e.g. DBMS Unit 1 Notes" value={title} onChange={e => dispatch({ type: 'SET_TITLE', payload: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Subject</label>
                  <input id="mat-subject" type="text" className="form-control form-control-sm"
                    placeholder="e.g. Database Management" value={subject} onChange={e => dispatch({ type: 'SET_SUBJECT', payload: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Semester</label>
                  <select id="mat-semester" className="form-select form-select-sm" value={semester} onChange={e => dispatch({ type: 'SET_SEMESTER', payload: e.target.value })}>
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">File (PDF / DOC)</label>
                  <input id="mat-file" type="file" className="form-control form-control-sm"
                    accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => dispatch({ type: 'SET_FILE', payload: e.target.files[0] })} />
                </div>
              </div>
              <button id="upload-mat-btn" type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Material'}
              </button>
            </form>
          </div>
        </div>

        {error   && <div className="alert alert-danger py-2 small">{error}</div>}
        {success && <div className="alert alert-success py-2 small">{success}</div>}

        {/* Table */}
        <div className="card border">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-2">
            <div className="fw-semibold small">All Materials</div>
            <div className="input-group input-group-sm" style={{ width: 'auto' }}>
              <input type="text" className="form-control" style={{ width: '200px' }}
                placeholder="Search by title or subject..."
                value={searchQuery}
                onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
              {searchQuery && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => { dispatch({ type: 'SET_SEARCH', payload: '' }); fetchMaterials(); }}>✕</button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="d-flex align-items-center gap-2 p-4 text-muted small">
              <div className="spinner"></div> Loading...
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center text-muted small p-5">No materials found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>#</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>TITLE</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>SUBJECT</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>SEMESTER</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>UPLOADED BY</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>DATE</th>
                    <th className="text-muted small" style={{ fontSize: '0.72rem' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={m._id}>
                      <td className="row-num small">{i + 1}</td>
                      <td className="small">{m.title}</td>
                      <td><span className="badge text-bg-primary">{m.subject}</span></td>
                      <td><span className="badge text-bg-secondary">Sem {m.semester}</span></td>
                      <td className="small">{m.uploaded_by}</td>
                      <td className="small">{formatDate(m.upload_date)}</td>
                      <td>
                        <div className="actions-cell">
                          <a href={m.file_url} target="_blank" rel="noreferrer"
                            className="btn btn-outline-secondary btn-sm">Download</a>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(m._id)}>Delete</button>
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

export default MaterialsPage;
