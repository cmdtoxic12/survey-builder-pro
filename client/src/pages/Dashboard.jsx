import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get('/surveys', { params });
      setSurveys(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this survey and all responses?')) return;
    try {
      await api.delete(`/surveys/${id}`);
      setSurveys((s) => s.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const copyLink = (shareId) => {
    const url = `${window.location.origin}/s/${shareId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Surveys</h1>
        <Link to="/surveys/create" className="btn btn-primary">
          + Create Survey
        </Link>
      </div>

      <div className="filters">
        <input
          type="text"
          className="form-control"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          style={{ maxWidth: 260 }}
        />
        <select
          className="form-control"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
        <button className="btn btn-outline" onClick={load}>
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : surveys.length === 0 ? (
        <div className="empty-state">
          <h3>No surveys yet</h3>
          <p>Create your first survey to get started.</p>
          <Link to="/surveys/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Create Survey
          </Link>
        </div>
      ) : (
        surveys.map((s) => (
          <div key={s._id} className="survey-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ marginBottom: '0.35rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {s.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${s.status}`}>{s.status}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {s.questions?.length || 0} questions · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {s.status === 'published' && s.shareId && (
                  <button className="btn btn-outline btn-sm" onClick={() => copyLink(s.shareId)}>
                    Copy Link
                  </button>
                )}
                <Link to={`/surveys/${s._id}/edit`} className="btn btn-outline btn-sm">
                  Edit
                </Link>
                <Link to={`/surveys/${s._id}/analytics`} className="btn btn-outline btn-sm">
                  Analytics
                </Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
