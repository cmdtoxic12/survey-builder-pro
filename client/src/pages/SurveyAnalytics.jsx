import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SurveyAnalytics() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/surveys/${id}`), api.get(`/surveys/${id}/analytics`)])
      .then(([sRes, aRes]) => {
        setSurvey(sRes.data);
        setAnalytics(aRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [id]);

  const exportCsv = async () => {
    try {
      const res = await api.get(`/responses/survey/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-${id}-responses.csv`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading analytics...</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>{survey?.title}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={exportCsv}>
            Export CSV
          </button>
          <Link to={`/surveys/${id}/edit`} className="btn btn-outline">
            Edit Survey
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{analytics?.totalResponses ?? 0}</div>
          <div className="label">Total Responses</div>
        </div>
        <div className="stat-card">
          <div className="value">{survey?.questions?.length ?? 0}</div>
          <div className="label">Questions</div>
        </div>
        <div className="stat-card">
          <div className="value">
            <span className={`badge badge-${survey?.status}`}>{survey?.status}</span>
          </div>
          <div className="label">Status</div>
        </div>
      </div>

      {analytics?.totalResponses === 0 ? (
        <div className="empty-state">
          <h3>No responses yet</h3>
          <p>Share your survey link to start collecting data.</p>
        </div>
      ) : (
        Object.entries(analytics.questions || {}).map(([qId, data]) => (
          <div key={qId} className="chart-container">
            <h3 style={{ marginBottom: '1rem' }}>{data.question}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {data.total} answer(s) · Type: {data.type}
            </p>

            {data.distribution && Object.keys(data.distribution).length > 0 ? (
              <div style={{ maxWidth: 480, margin: '0 auto' }}>
                {['rating', 'yes-no'].includes(data.type) ? (
                  <Bar
                    data={{
                      labels: Object.keys(data.distribution),
                      datasets: [
                        {
                          label: 'Responses',
                          data: Object.values(data.distribution),
                          backgroundColor: colors,
                        },
                      ],
                    }}
                    options={{ responsive: true, plugins: { legend: { display: false } } }}
                  />
                ) : (
                  <Pie
                    data={{
                      labels: Object.keys(data.distribution),
                      datasets: [
                        {
                          data: Object.values(data.distribution),
                          backgroundColor: colors,
                        },
                      ],
                    }}
                    options={{ responsive: true }}
                  />
                )}
              </div>
            ) : data.answers ? (
              <ul style={{ listStyle: 'none' }}>
                {data.answers.map((a, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.95rem',
                    }}
                  >
                    {String(a)}
                  </li>
                ))}
                {data.total > 50 && (
                  <li style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
                    … and {data.total - 50} more
                  </li>
                )}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No chart data</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
