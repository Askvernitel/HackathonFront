import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import SquirrelMascot from '../SquirrelMascot';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [streak, setStreak] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    client.get('/streak').then(r => setStreak(r.data.currentStreak || 0)).catch(() => {});
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  const pathParts = location.pathname.split('/').filter(Boolean);
  let crumb = null;
  if (pathParts[0] === 'courses' && pathParts[1]) crumb = pathParts[1].toUpperCase();
  else if (pathParts[0] === 'profile') crumb = 'PROFILE';

  return (
    <>
      <header className="app-bar">
        <button className="brand" onClick={() => navigate('/dashboard')}>
          <img src="/assets/Logo.svg" className="brand-logo" alt="" />
          <span>verso</span>
        </button>
        {crumb && <span className="crumb">{crumb}</span>}
        <span className="spacer" />
        <div className="right">
          {streak > 0 && (
            <span className="streak-pill">
              <Flame size={14} />
              <span>{streak}-day streak</span>
            </span>
          )}
          <button className="app-avatar" onClick={() => setMenuOpen(o => !o)} title={user?.name}>
            {user?.name?.[0] || 'V'}
          </button>
        </div>
      </header>

      {/* Dropdown rendered at root level so it can't be clipped by sticky children */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 499 }}
          />
          <div style={{
            position: 'fixed', top: 60, right: 12, minWidth: 200,
            background: 'var(--bg-card)', border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-2)',
            zIndex: 500, overflow: 'hidden',
          }}>
            <button onClick={() => { setMenuOpen(false); navigate('/profile'); }} style={{
              display: 'block', width: '100%', padding: '12px 16px',
              background: 'none', border: 'none', textAlign: 'left',
              fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink)',
              cursor: 'pointer', borderBottom: '1px solid var(--border-hairline)',
            }}>
              {user?.name}
              <span style={{ display: 'block', fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {user?.email}
              </span>
            </button>
            <button onClick={handleLogout} style={{
              display: 'block', width: '100%', padding: '11px 16px',
              background: 'none', border: 'none', textAlign: 'left',
              fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--cinnabar-500)',
              cursor: 'pointer',
            }}>
              Sign out
            </button>
          </div>
        </>
      )}

      <Outlet />
      <SquirrelMascot />
    </>
  );
}
