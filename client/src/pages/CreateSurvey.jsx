import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuestionBuilder from '../components/QuestionBuilder';

export default function CreateSurvey() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [expiresAt, setExpiresAt] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (questions.some((q) => !q.question.trim())) {
      setError('All questions must have text');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        questions,
        allowAnonymous,
        expiresAt: expiresAt || null,
        status: publish ? 'published' : 'draft',
      };
      const res = await api.post('/surveys', payload);
      // If we want published, update status (create always starts draft, so update)
      if (publish) {
        await api.put(`/surveys/${res.data._id}`, { status: 'published' });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Create Survey</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Survey Title *</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Satisfaction Survey"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for respondents"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label>Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['General', 'Education', 'Business', 'Feedback', 'Research', 'Event'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label>Expiration Date (optional)</label>
              <input
                type="datetime-local"
                className="form-control"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allowAnonymous}
              onChange={(e) => setAllowAnonymous(e.target.checked)}
            />
            Allow anonymous responses
          </label>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <QuestionBuilder questions={questions} setQuestions={setQuestions} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-outline" disabled={loading}>
            Save as Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
          >
            {loading ? 'Saving...' : 'Publish Survey'}
          </button>
        </div>
      </form>
    </div>
  );
}
