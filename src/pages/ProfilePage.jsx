import { useState, useEffect } from 'react';
import { Award, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

function SkeletonRect({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

function Heatmap({ dates }) {
  const today = new Date();
  const cells = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const str = d.toISOString().slice(0, 10);
    const hits = dates.filter(dt => new Date(dt).toISOString().slice(0, 10) === str).length;
    const level = hits === 0 ? '' : hits === 1 ? 'l1' : hits === 2 ? 'l2' : hits <= 4 ? 'l3' : 'l4';
    return { str, level };
  });
  return (
    <div className="heatmap">
      {cells.map(({ str, level }) => (
        <div key={str} className={`cell ${level}`} title={str} />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, activityDates: [] });
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, streakRes] = await Promise.all([
          client.get('/courses'),
          client.get('/streak').catch(() => ({ data: { currentStreak: 0, longestStreak: 0, activityDates: [] } })),
        ]);
        setCourses(coursesRes.data);
        setStreak(streakRes.data);
        const results = await Promise.all(
          coursesRes.data.map(c => client.get(`/progress/${c._id}`).then(pr => ({ id: c._id, data: pr.data })))
        );
        const map = {};
        results.forEach(r => { map[r.id] = r.data; });
        setProgressMap(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const certificates = courses.filter(c => progressMap[c._id]?.certificateIssued);

  if (loading) {
    return (
      <div className="page">
        <div className="profile-grid">
          <div className="profile-card">
            <SkeletonRect w={88} h={88} r={44} style={{ margin: '0 auto 14px' }} />
            <SkeletonRect w="70%" h={26} r={6} style={{ margin: '0 auto 8px' }} />
            <SkeletonRect w="55%" h={14} r={4} style={{ margin: '0 auto' }} />
          </div>
          <div className="profile-main">
            {[0,1].map(i => <SkeletonRect key={i} h={160} r={16} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">{user?.name?.[0] || 'V'}</div>
          <h2>{user?.name}</h2>
          <div className="em">{user?.email}</div>
          <div className="profile-stat-row">
            <div className="profile-stat">
              <div className="v">{streak.currentStreak}</div>
              <div className="k">Streak</div>
            </div>
            <div className="profile-stat">
              <div className="v">{streak.longestStreak}</div>
              <div className="k">Best</div>
            </div>
            <div className="profile-stat">
              <div className="v">{certificates.length}</div>
              <div className="k">Certs</div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-section">
            <h3>Activity — last 30 days</h3>
            <Heatmap dates={streak.activityDates || []} />
          </div>

          <div className="profile-section">
            <h3>Course progress</h3>
            {courses.map(c => {
              const prog = progressMap[c._id];
              const pct = prog?.overallPercent || 0;
              return (
                <div key={c._id} className="course-prog-row">
                  <div className="spread">
                    <span className="name">{c.title}</span>
                    <span className="pct">{pct}%</span>
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="profile-section">
            <h3>Certificates</h3>
            {certificates.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: 0 }}>
                Complete all chapters in a course to earn a certificate.
              </p>
            ) : (
              certificates.map(c => {
                const prog = progressMap[c._id];
                return (
                  <div key={c._id} className="cert-row">
                    <Award size={20} className="cert-icon" />
                    <div className="cert-info">
                      <div className="cert-name">{c.title}</div>
                      <div className="cert-hash">{prog.certificateTxHash?.slice(0, 24)}…</div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}/certificates/${user?.userId}-${c._id}.pdf`}
                      download
                      className="btn btn-ghost btn-sm"
                      style={{ gap: 6 }}
                    >
                      <Download size={14} /> PDF
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
