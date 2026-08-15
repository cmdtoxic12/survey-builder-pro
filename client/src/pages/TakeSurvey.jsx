import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function TakeSurvey() {
  const { shareId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get(`/surveys/public/${shareId}`)
      .then((res) => {
        setSurvey(res.data);
        // init answers
        const init = {};
        res.data.questions.forEach((q) => {
          if (q.type === 'checkboxes') init[q.id] = [];
          else init[q.id] = '';
        });
        setAnswers(init);
      })
      .catch((err) => setError(err.response?.data?.message || 'Survey not found'))
      .finally(() => setLoading(false));
  }, [shareId]);

  const setAnswer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const toggleCheckbox = (qId, opt) => {
    setAnswers((prev) => {
      const current = prev[qId] || [];
      if (current.includes(opt)) {
        return { ...prev, [qId]: current.filter((x) => x !== opt) };
      }
      return { ...prev, [qId]: [...current, opt] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        surveyId: survey._id,
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
        isAnonymous: true,
      };
      await api.post('/responses', payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '3rem' }}>Loading survey...</div>;
  if (error && !survey) {
    return (
      <div className="container" style={{ padding: '3rem' }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container survey-take">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2>Thank you!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Your response has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container survey-take">
      <div className="card">
        <h1 style={{ marginBottom: '0.5rem' }}>{survey.title}</h1>
        {survey.description && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{survey.description}</p>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {survey.questions.map((q, idx) => (
            <div key={q.id} className="question-block">
              <label style={{ fontWeight: 600, marginBottom: '0.6rem', display: 'block' }}>
                {idx + 1}. {q.question}
                {q.required && <span className="required-star"> *</span>}
              </label>

              {q.type === 'short-answer' && (
                <input
                  className="form-control"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                />
              )}

              {q.type === 'long-answer' && (
                <textarea
                  className="form-control"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                />
              )}

              {(q.type === 'multiple-choice' || q.type === 'yes-no') && (
                <div>
                  {(q.options || []).map((opt) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswer(q.id, opt)}
                        required={q.required}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'checkboxes' && (
                <div>
                  {(q.options || []).map((opt) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={(answers[q.id] || []).includes(opt)}
                        onChange={() => toggleCheckbox(q.id, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'dropdown' && (
                <select
                  className="form-control"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                >
                  <option value="">Select...</option>
                  {(q.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === 'rating' && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={q.id}
                        value={n}
                        checked={String(answers[q.id]) === String(n)}
                        onChange={() => setAnswer(q.id, String(n))}
                        required={q.required}
                      />
                      <span style={{ marginTop: '0.25rem' }}>{n}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      </div>
    </div>
  );
}
