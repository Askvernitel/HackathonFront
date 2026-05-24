import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, CheckCircle } from 'lucide-react';
import client from '../api/client';
import { STAGE_LABELS } from '../utils/stageFlow';

function SkeletonRect({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/courses/${slug}`).then(res => {
      setCourse(res.data);
      return client.get(`/progress/${res.data._id}`);
    }).then(res => setProgress(res.data)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="page">
        <div className="course-hero">
          <SkeletonRect w={100} h={14} r={4} />
          <SkeletonRect w={400} h={56} r={8} />
          <SkeletonRect w="70%" h={20} r={4} />
          <SkeletonRect h={6} r={3} />
        </div>
        <div className="chapter-list">
          {[0,1,2].map(i => <SkeletonRect key={i} h={96} r={16} />)}
        </div>
      </div>
    );
  }
  if (!course) return <div className="page"><p style={{ color: 'var(--fg-3)' }}>Course not found.</p></div>;

  function getChapterProgress(chapterId) {
    return progress?.chapterProgress?.find(cp =>
      String(cp.chapterId) === String(chapterId)
    );
  }

  function isUnlocked(idx) {
    if (idx === 0) return true;
    const prev = getChapterProgress(course.chapters[idx - 1]?._id);
    return prev?.currentStage === 'completed';
  }

  const pct = progress?.overallPercent || 0;

  return (
    <div className="page">
      <div className="course-hero">
        <span className="eyebrow">{course.slug?.toUpperCase()}</span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="course-progress-bar">
          <div className="course-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{pct}% complete</span>
      </div>

      <div className="chapter-list">
        {course.chapters.map((chapter, idx) => {
          const cp = getChapterProgress(chapter._id);
          const unlocked = isUnlocked(idx);
          const completed = cp?.currentStage === 'completed';
          const currentStage = cp?.currentStage || 'tutor';
          const stageLabel = STAGE_LABELS[currentStage] || currentStage;

          return (
            <div
              key={chapter._id}
              className={`chapter-row ${completed ? 'done' : ''} ${unlocked && !completed ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
              onClick={() => unlocked && navigate(`/courses/${slug}/chapters/${chapter._id}`)}
            >
              <div className="chapter-num">
                {completed ? <CheckCircle size={24} /> : !unlocked ? <Lock size={20} /> : idx + 1}
              </div>
              <div className="chapter-meta">
                <div className="ttl">{chapter.title}</div>
                <div className="sub">
                  {chapter.learningObjectives?.length || 0} objectives
                  {!completed && unlocked && ` · ${stageLabel}`}
                </div>
                <div className="desc">{chapter.description}</div>
              </div>
              <div>
                {completed && <span className="badge badge-success"><CheckCircle size={12} /> Complete</span>}
                {!completed && unlocked && (
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/courses/${slug}/chapters/${chapter._id}`); }}>
                    Continue <ArrowRight size={14} />
                  </button>
                )}
                {!unlocked && <span className="badge badge-default"><Lock size={12} /> Locked</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
