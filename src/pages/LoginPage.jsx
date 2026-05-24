import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const QUICK = [
  { name: 'Alex',   email: 'demo@student.io'   },
  { name: 'Sarah',  email: 'sarah@student.io'  },
  { name: 'Jordan', email: 'jordan@student.io' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(e, quickEmail) {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', {
        email: quickEmail || email,
        password: quickEmail ? 'demo123' : password,
      });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <img src="/assets/Logo.svg" alt="verso" style={{ height: 36, width: 'auto' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.05em', color: 'var(--ink)' }}>verso</span>
        </div>
        <h1>Sign in.</h1>
        <div className="tag">learn by teaching — ai tutoring platform</div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </div>
          <div className="submit">
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="divider">Demo accounts</div>

        <div className="quick-row">
          {QUICK.map(q => (
            <button key={q.email} className="quick-btn" onClick={() => handleLogin(null, q.email)} disabled={loading}>
              <span className="qa">{q.name[0]}</span>
              <span className="qn">{q.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
