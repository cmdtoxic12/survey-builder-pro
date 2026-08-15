import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuestionBuilder from '../components/QuestionBuilder';

export default function EditSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [expiresAt, setExpiresAt] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [status, setStatus] = useState('draft');
  const [questions, setQuestions] = useState([]);
  const [shareId, setShareId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/surveys/${id}`)
      .then((res) => {
        const s = res.data;
        setTitle(s.title);
        setDescription(s.description || '');
        setCategory(s.category || 'General');
        setExpiresAt(s.expiresAt ? s.expiresAt.slice(0, 16) : '');
        setAllowAnonymous(s.allowAnonymous !== false);
        setStatus(s.status);
        setQuestions(s.questions || []);
        setShareId(s.shareId || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e, newStatus) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        category,
        questions,
        allowAnonymous,
        expiresAt: expiresAt || null,
        status: newStatus || status,
      };
      const res = await api.put(`/surveys/${id}`, payload);
      setStatus(res.data.status);
      setShareId(res.data.shareId || '');
      if (newStatus === 'published') {
        alert('Survey published! Share link is ready.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (!shareId) return;
    navigator.clipboard.writeText(`${window.location.origin}/s/${shareId}`);
    alert('Link copied!');
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Edit Survey</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {shareId && (
            <button type="button" className="btn btn-outline" onClick={copyLink}>
              Copy Share Link
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={(e) => handleSave(e)}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Survey Title *</label>
            <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label>Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['General', 'Education', 'Business', 'Feedback', 'Research', 'Event'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
              <label>Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label>Expires</label>
              <input type="datetime-local" className="form-control" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={allowAnonymous} onChange={(e) => setAllowAnonymous(e.target.checked)} />
            Allow anonymous responses
          </label>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <QuestionBuilder questions={questions} setQuestions={setQuestions} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {status !== 'published' && (
            <button type="button" className="btn btn-outline" disabled={saving} onClick={(e) => handleSave(e, 'published')}>
              Publish
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
