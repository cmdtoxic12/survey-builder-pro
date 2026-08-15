import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Build & Share Surveys Instantly
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 2rem' }}>
        Create custom surveys with multiple question types, collect responses, and analyze results
        with beautiful charts — all in one place.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
            <Link to="/surveys/create" className="btn btn-outline">
              Create New Survey
            </Link>
          </>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginTop: '4rem',
          textAlign: 'left',
        }}
      >
        {[
          { icon: '📝', title: 'Dynamic Questions', desc: 'Short answer, multiple choice, rating, checkboxes and more.' },
          { icon: '🔗', title: 'Easy Sharing', desc: 'Generate a unique link and share with anyone instantly.' },
          { icon: '📊', title: 'Analytics', desc: 'Visualize responses with charts and export to CSV.' },
          { icon: '🔒', title: 'Secure', desc: 'JWT auth, private drafts, and optional anonymous responses.' },
        ].map((f) => (
          <div key={f.title} className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ marginBottom: '0.4rem' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
