import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

function SkeletonRect({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, streakRes] = await Promise.all([
          client.get('/courses'),
          client.get('/streak').catch(() => ({ data: { currentStreak: 0 } })),
        ]);
        setCourses(coursesRes.data);
        setStreak(streakRes.data.currentStreak || 0);
        const fetches = coursesRes.data.map(c =>
          client.get(`/progress/${c._id}`).then(pr => ({ id: c._id, data: pr.data }))
        );
        const results = await Promise.all(fetches);
        const map = {};
        results.forEach(r => { map[r.id] = r.data; });
        setProgressMap(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCompleted = Object.values(progressMap).reduce((sum, p) =>
    sum + (p?.chapterProgress?.filter(cp => cp.currentStage === 'completed').length || 0), 0);
  const certCount = Object.values(progressMap).filter(p => p?.certificateIssued).length;

  if (loading) {
    return (
      <div className="page">
        <div className="hero">
          <SkeletonRect w={320} h={56} r={8} style={{ marginBottom: 8 }} />
          <SkeletonRect w={200} h={16} r={4} style={{ marginBottom: 28 }} />
        </div>
        <div className="stat-row">
          {[0,1,2].map(i => <SkeletonRect key={i} h={88} r={16} />)}
        </div>
        <div className="section-h">
          <SkeletonRect w={160} h={28} r={6} />
        </div>
        <div className="course-grid">
          {[0,1].map(i => <SkeletonRect key={i} h={220} r={16} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Welcome back, {user?.name?.split(' ')[0]}.</h1>
        <div className="tag">{courses.length} courses · pick one to keep going</div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="v">{totalCompleted}<span className="unit">/ {courses.reduce((s,c) => s + (c.chapterCount||0), 0)} ch</span></div>
          <div className="k">Completed</div>
        </div>
        <div className="stat">
          <div className="v">{streak}<span className="unit">days</span></div>
          <div className="k">Current streak</div>
        </div>
        <div className="stat">
          <div className="v">{certCount}<span className="unit">/ {courses.length}</span></div>
          <div className="k">Certificates</div>
        </div>
      </div>

      <div className="section-h">
        <span className="ttl">Your courses</span>
        <span className="sub">{courses.length} active</span>
      </div>

      <div className="course-grid">
        {courses.map(c => {
          const prog = progressMap[c._id];
          const done = prog?.chapterProgress?.filter(cp => cp.currentStage === 'completed').length || 0;
          const total = c.chapterCount || 0;
          const pct = total > 0 ? Math.round(done / total * 100) : 0;
          const started = done > 0 || prog?.chapterProgress?.some(cp => cp.currentStage !== 'tutor' || cp.stages?.tutor?.completed);
          const certified = prog?.certificateIssued;

          return (
            <div
              key={c._id}
              className={`card card-hover course-card ${started ? 'card-active' : ''}`}
              onClick={() => navigate(`/courses/${c.slug}`)}
            >
              <span className="eyebrow">{c.slug?.toUpperCase()}</span>
              <div className="ttl">{c.title}</div>
              <div className="desc">{c.description}</div>
              <div className="meta-row">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="progress-pct">{done} / {total}</span>
              </div>
              <div className="cta-row">
                <span className={`badge ${certified ? 'badge-success' : started ? 'badge-info' : 'badge-default'}`}>
                  {certified ? 'Certified' : started ? 'In progress' : 'Not started'}
                </span>
                <button className="btn btn-link" style={{ gap: 4, padding: '6px 0' }}>
                  {started ? 'Continue' : 'Start'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
