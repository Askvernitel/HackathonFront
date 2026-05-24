import { useState, useEffect, useRef, useCallback } from 'react';
import Md from '../components/Md';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Dumbbell, RefreshCw, HelpCircle, BarChart2, Award,
  ArrowLeft, ArrowRight, Check, X, Loader2, AlertCircle, RotateCcw,
} from 'lucide-react';
import { useChapter } from '../hooks/useChapter';
import { useProgress } from '../context/ProgressContext';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import MCQExercise from '../components/exercises/MCQExercise';
import ShortAnswerExercise from '../components/exercises/ShortAnswerExercise';
import BigOChart from '../components/visualizations/BigOChart';
import SortingViz from '../components/visualizations/SortingViz';
import BSTViz from '../components/visualizations/BSTViz';
import BinaryRepViz from '../components/visualizations/BinaryRepViz';
import MemoryBoxViz from '../components/visualizations/MemoryBoxViz';
import ControlFlowViz from '../components/visualizations/ControlFlowViz';
import DPTableViz from '../components/visualizations/DPTableViz';
import ActivitySelectionViz from '../components/visualizations/ActivitySelectionViz';
import GraphBFSDFSViz from '../components/visualizations/GraphBFSDFSViz';
import DijkstraViz from '../components/visualizations/DijkstraViz';
import HeapViz from '../components/visualizations/HeapViz';
import CertificateModal from '../components/certificate/CertificateModal';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const VIZ_MAP = {
  bigO: BigOChart, sorting: SortingViz, bst: BSTViz,
  binaryRep: BinaryRepViz, memoryBox: MemoryBoxViz, controlFlow: ControlFlowViz,
  dpTable: DPTableViz, activitySelection: ActivitySelectionViz,
  graphBFSDFS: GraphBFSDFSViz, dijkstra: DijkstraViz, heap: HeapViz,
};

const STAGES = [
  { key: 'tutor',    label: 'Tutor',      icon: BookOpen   },
  { key: 'practice', label: 'Practice',   icon: Dumbbell   },
  { key: 'reverse',  label: 'Reverse AI', icon: RefreshCw  },
  { key: 'quiz',     label: 'Quiz',       icon: HelpCircle },
  { key: 'summary',  label: 'Summary',    icon: BarChart2  },
];

function StageStepper({ currentStage, completedStages }) {
  return (
    <div className="stage-stepper">
      <div className="stage-stepper-inner">
        {STAGES.map((s, i) => {
          const isDone = completedStages[s.key];
          const isActive = currentStage === s.key;
          const cls = `stage-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`;
          const dotCls = `stage-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`;
          const Icon = s.icon;
          return (
            <div key={s.key} className={cls}>
              <span className={dotCls}>{isDone ? '✓' : i + 1}</span>
              <Icon size={13} />
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Skeleton({ w = '100%', h = 20, r = 8 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

function ExerciseSkeleton() {
  return (
    <div className="ex-wrap">
      {[0,1,2].map(i => (
        <div key={i} className="ex-card">
          <Skeleton w={80} h={12} r={4} />
          <Skeleton w="85%" h={28} r={6} style={{ margin: '12px 0 20px' }} />
          {[0,1,2,3].map(j => <Skeleton key={j} h={48} r={8} style={{ marginBottom: 8 }} />)}
        </div>
      ))}
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="ex-wrap">
      <Skeleton w={200} h={14} r={4} style={{ marginBottom: 16 }} />
      {[0,1,2,3,4].map(i => (
        <div key={i} className="ex-card">
          <Skeleton w={80} h={12} r={4} />
          <Skeleton w="85%" h={28} r={6} style={{ margin: '12px 0 20px' }} />
          {[0,1,2,3].map(j => <Skeleton key={j} h={48} r={8} style={{ marginBottom: 8 }} />)}
        </div>
      ))}
    </div>
  );
}

function ErrorStrip({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--cinnabar-50)', border: '1px solid var(--cinnabar-300)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
      <AlertCircle size={16} color="var(--cinnabar-500)" />
      <span style={{ flex: 1, fontSize: 14, color: 'var(--cinnabar-700)' }}>{message}</span>
      {onRetry && (
        <button className="btn btn-sm" style={{ background: 'var(--cinnabar-500)', color: '#fff', border: 'none' }} onClick={onRetry}>
          <RotateCcw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export default function ChapterStagePage() {
  const { slug, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chapter, loading: chapterLoading } = useChapter(chapterId);
  const { fetchProgress, advanceStage, failReverseTutor } = useProgress();
  const [courseId, setCourseId] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [completedStages, setCompletedStages] = useState({});

  const initializedStageRef = useRef(null);

  // Tutor
  const [tutorHistory, setTutorHistory] = useState([]);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState(null);
  const [studentMsgCount, setStudentMsgCount] = useState(0);
  const [lectureLoading, setLectureLoading] = useState(false);

  // Exercise
  const [exercises, setExercises] = useState([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [exerciseResult, setExerciseResult] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingError, setGradingError] = useState(null);

  // Reverse tutor
  const [rtHistory, setRtHistory] = useState([]);
  const [rtLoading, setRtLoading] = useState(false);
  const [rtError, setRtError] = useState(null);
  const [rtExchangeCount, setRtExchangeCount] = useState(0);
  const [rtSessionComplete, setRtSessionComplete] = useState(false);
  const [rtEvalResult, setRtEvalResult] = useState(null);
  const [rtEvalLoading, setRtEvalLoading] = useState(false);

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Certificate
  const [certModal, setCertModal] = useState(false);
  const [certData, setCertData] = useState(null);

  function scoreClip(score) {
    if (score > 80) return 'success';
    if (score > 50) return 'happy';
    return 'sad';
  }

  useEffect(() => {
    if (exerciseResult) {
      window.dispatchEvent(new CustomEvent('mascot', { detail: { clip: scoreClip(exerciseResult.totalScore) } }));
    }
  }, [exerciseResult]);

  useEffect(() => {
    if (quizResult) {
      window.dispatchEvent(new CustomEvent('mascot', { detail: { clip: scoreClip(quizResult.score) } }));
    }
  }, [quizResult]);

  useEffect(() => {
    if (!chapter) return;
    client.get(`/courses/${slug}`).then(res => {
      const cId = res.data._id;
      setCourseId(cId);
      fetchProgress(cId).then(progress => {
        const cp = progress?.chapterProgress?.find(c => String(c.chapterId) === chapterId);
        if (cp) {
          const stage = cp.currentStage === 'completed' ? 'summary' : cp.currentStage;
          setCurrentStage(stage);
          // Build completedStages map
          const done = {};
          STAGES.forEach(s => { done[s.key] = cp.stages?.[s.key]?.completed || false; });
          setCompletedStages(done);
        }
      });
    });
  }, [chapter, slug, chapterId]);

  const loadExercises = useCallback(async () => {
    setExerciseLoading(true);
    setExerciseError(null);
    setExercises([]);
    setAnswers({});
    setExerciseResult(null);
    try {
      const { data } = await client.post('/exercises/generate', { chapterId, difficulty: 'medium' });
      setExercises(data);
    } catch {
      setExerciseError('Failed to generate exercises. Please try again.');
    } finally {
      setExerciseLoading(false);
    }
  }, [chapterId]);

  const loadQuiz = useCallback(async () => {
    setQuizLoading(true);
    setQuizError(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
    try {
      const { data } = await client.post('/quiz/generate', { chapterId });
      setQuizQuestions(data);
    } catch {
      setQuizError('Failed to generate quiz. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  }, [chapterId]);

  const initTutor = useCallback(async () => {
    setLectureLoading(true);
    setTutorError(null);
    try {
      const { data } = await client.post('/tutor/start', { chapterId });
      setTutorHistory([{ role: 'assistant', content: data.reply }]);
    } catch (err) {
      setTutorError(err.response?.data?.error || 'Failed to load the lecture. Please refresh.');
    } finally {
      setLectureLoading(false);
    }
  }, [chapterId]);

  const initReverseTutor = useCallback(async () => {
    setRtLoading(true);
    try {
      const { data } = await client.post('/reverse-tutor/start', { chapterId });
      setRtHistory([{ role: 'assistant', content: data.reply }]);
    } finally {
      setRtLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    if (!currentStage || !chapter) return;
    if (initializedStageRef.current === currentStage) return;
    initializedStageRef.current = currentStage;

    if (currentStage === 'tutor') {
      initTutor();
    } else if (currentStage === 'reverse') {
      setRtHistory([]);
      setRtExchangeCount(0);
      setRtSessionComplete(false);
      initReverseTutor();
    } else if (currentStage === 'practice') {
      loadExercises();
    } else if (currentStage === 'quiz') {
      loadQuiz();
    }
  }, [currentStage, chapter]);

  function reinitStage(stage) {
    initializedStageRef.current = null;
    if (stage === 'tutor') { setTutorHistory([]); setStudentMsgCount(0); initTutor(); }
    else if (stage === 'practice') loadExercises();
    else if (stage === 'quiz') loadQuiz();
    else if (stage === 'reverse') initReverseTutor();
  }

  async function sendTutorMessage(message) {
    setTutorLoading(true);
    setTutorError(null);
    const newHistory = [...tutorHistory, { role: 'user', content: message }];
    setTutorHistory(newHistory);
    setStudentMsgCount(c => c + 1);
    try {
      const { data } = await client.post('/tutor/message', { chapterId, history: tutorHistory, message });
      if (data.reply.trim() === '__OFF_TOPIC__') {
        setTutorHistory([]);
        setStudentMsgCount(0);
        initTutor();
        return;
      }
      setTutorHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get a response. Please try again.';
      setTutorError(msg);
      setTutorHistory(tutorHistory);
      setStudentMsgCount(c => c - 1);
    } finally {
      setTutorLoading(false);
    }
  }

  async function completeTutorStage() {
    const progress = await advanceStage(courseId, chapterId, 'tutor');
    const cp = progress.chapterProgress.find(c => String(c.chapterId) === chapterId);
    const next = cp?.currentStage || 'practice';
    initializedStageRef.current = null;
    setCurrentStage(next);
    setCompletedStages(prev => ({ ...prev, tutor: true }));
  }

  function handleExerciseAnswer(idx, answer, callback) {
    setAnswers(prev => ({ ...prev, [idx]: { answer, callback } }));
  }

  async function gradeExercises() {
    setGradingLoading(true);
    setGradingError(null);
    try {
      const answersArr = exercises.map((_, i) => answers[i]?.answer);
      const { data } = await client.post('/exercises/grade', { exercises, answers: answersArr });
      exercises.forEach((ex, i) => {
        if (ex.type === 'short' && answers[i]?.callback) {
          answers[i].callback(data.results[i]);
        }
      });
      setExerciseResult(data);
    } catch (err) {
      setGradingError(err.response?.data?.error || 'Grading failed. Please try again.');
    } finally {
      setGradingLoading(false);
    }
  }

  async function completeExerciseStage() {
    const progress = await advanceStage(courseId, chapterId, currentStage, { score: exerciseResult.totalScore });
    const cp = progress.chapterProgress.find(c => String(c.chapterId) === chapterId);
    const next = cp?.currentStage || 'reverse';
    setCompletedStages(prev => ({ ...prev, [currentStage]: true }));
    initializedStageRef.current = null;
    setCurrentStage(next);
    setExercises([]);
    setExerciseResult(null);
  }

  async function sendRTMessage(message) {
    setRtLoading(true);
    setRtError(null);
    const newHistory = [...rtHistory, { role: 'user', content: message }];
    setRtHistory(newHistory);
    const newCount = rtExchangeCount + 1;
    setRtExchangeCount(newCount);
    try {
      const { data } = await client.post('/reverse-tutor/message', { chapterId, history: rtHistory, message });
      setRtHistory([...newHistory, { role: 'assistant', content: data.reply }]);
      if (data.sessionComplete || newCount >= 6) setRtSessionComplete(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get a response. Please try again.';
      setRtError(msg);
      setRtHistory(rtHistory);
      setRtExchangeCount(rtExchangeCount);
    } finally {
      setRtLoading(false);
    }
  }

  async function evaluateRT() {
    setRtEvalLoading(true);
    setRtError(null);
    try {
      const { data } = await client.post('/reverse-tutor/evaluate', { chapterId, history: rtHistory });
      setRtEvalResult(data);
    } catch (err) {
      setRtError(err.response?.data?.error || 'Evaluation failed. Please try again.');
    } finally {
      setRtEvalLoading(false);
    }
  }

  async function handleRTResult() {
    if (!rtEvalResult) return;
    if (rtEvalResult.passed) {
      const objectives = rtEvalResult.objectives || [];
      const progress = await advanceStage(courseId, chapterId, 'reverse', {
        score: rtEvalResult.score,
        objectivesCovered: objectives.filter(o => o.covered).map(o => o.objective),
      });
      const cp = progress.chapterProgress.find(c => String(c.chapterId) === chapterId);
      const next = cp?.currentStage || 'quiz';
      setCompletedStages(prev => ({ ...prev, reverse: true }));
      setRtEvalResult(null);
      setRtHistory([]);
      initializedStageRef.current = null;
      setCurrentStage(next);
    } else {
      await failReverseTutor(courseId, chapterId);
      setRtEvalResult(null);
      setRtHistory([]);
      setRtExchangeCount(0);
      setRtSessionComplete(false);
      setTutorHistory([]);
      setStudentMsgCount(0);
      setCompletedStages({});
      initializedStageRef.current = null;
      setCurrentStage('tutor');
    }
  }

  async function submitQuiz() {
    const answersArr = quizQuestions.map((_, i) => quizAnswers[i] ?? -1);
    const { data } = await client.post('/quiz/submit', { chapterId, questions: quizQuestions, answers: answersArr });
    setQuizResult(data);
  }

  async function completeQuizStage() {
    const progress = await advanceStage(courseId, chapterId, 'quiz', { score: quizResult.score });
    const cp = progress.chapterProgress.find(c => String(c.chapterId) === chapterId);
    const next = cp?.currentStage || 'summary';
    setCompletedStages(prev => ({ ...prev, quiz: true }));
    initializedStageRef.current = null;
    setCurrentStage(next);
    setQuizResult(null);
  }

  async function completeSummary() {
    const progress = await advanceStage(courseId, chapterId, 'summary');
    const allComplete = progress.chapterProgress.every(cp => cp.currentStage === 'completed');
    if (allComplete) {
      try {
        const { data } = await client.post('/certificate/issue', { courseId });
        setCertData(data);
        setCertModal(true);
      } catch {
        navigate(`/courses/${slug}`);
      }
    } else {
      navigate(`/courses/${slug}`);
    }
  }

  // Loading state
  if (chapterLoading || !chapter) {
    return (
      <>
        <div className="stage-stepper">
          <div className="stage-stepper-inner">
            {STAGES.map(s => (
              <div key={s.key} className="stage-step">
                <span className="stage-dot pending">&nbsp;</span>
                <Skeleton w={60} h={12} r={4} />
              </div>
            ))}
          </div>
        </div>
        <div className="stage-page">
          <Skeleton w="50%" h={40} r={8} style={{ marginBottom: 8 }} />
          <Skeleton w="30%" h={16} r={4} style={{ marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <Skeleton h={560} r={16} />
            <Skeleton h={400} r={16} />
          </div>
        </div>
      </>
    );
  }

  if (!currentStage) {
    return (
      <>
        <div className="stage-stepper"><div className="stage-stepper-inner" /></div>
        <div className="stage-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Loader2 size={32} color="var(--indigo-500)" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  const stageInfo = STAGES.find(s => s.key === currentStage) || STAGES[0];
  const StageIcon = stageInfo.icon;
  const vizComponents = (chapter.visualizations || []).map(v => {
    const Comp = VIZ_MAP[v.type];
    return Comp ? <div key={v.type} className="viz-frame"><Comp {...(v.props || {})} /></div> : null;
  }).filter(Boolean);

  return (
    <>
      <StageStepper currentStage={currentStage} completedStages={completedStages} />

      <div className="stage-page">
        {/* Stage header */}
        <div className="stage-h">
          <div className="ttl-block">
            <button className="btn btn-link" style={{ marginBottom: 4, padding: '4px 0' }} onClick={() => navigate(`/courses/${slug}`)}>
              <ArrowLeft size={14} /> Back to course
            </button>
            <div className="eyebrow">Chapter {String(chapter.order || '').padStart(2, '0')}</div>
            <h1>{chapter.title}</h1>
          </div>
          <div className="stage-label">
            <StageIcon size={14} />
            {stageInfo.label} stage
          </div>
        </div>

        {/* ── TUTOR ── */}
        {currentStage === 'tutor' && (
          <div className="stage-fade">
            <div className="ready-strip">
              <span className="hint">
                {studentMsgCount >= 3
                  ? "Done reinforcing? Move to exercises when you're ready."
                  : lectureLoading
                    ? 'Loading your lecture…'
                    : `Read the lecture, then ask questions — ${3 - studentMsgCount} more message${3 - studentMsgCount !== 1 ? 's' : ''} to unlock exercises.`}
              </span>
              <button
                className="btn btn-primary"
                disabled={studentMsgCount < 3}
                onClick={completeTutorStage}
              >
                I'm ready <ArrowRight size={14} />
              </button>
            </div>
            {tutorError && <ErrorStrip message={tutorError} onRetry={initTutor} />}
            <div className="tutor-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Lecture panel — the AI's opening comprehensive explanation */}
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, borderBottom: '1px solid var(--border-hairline)', paddingBottom: 10 }}>
                    <BookOpen size={15} color="var(--indigo-500)" />
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Lecture</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginLeft: 'auto' }}>Read first</span>
                  </div>
                  {lectureLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[100, 85, 92, 78, 95, 70, 88].map((w, i) => (
                        <div key={i} className="skeleton" style={{ width: `${w}%`, height: 16, borderRadius: 4 }} />
                      ))}
                    </div>
                  ) : tutorHistory.length > 0 ? (
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink)', maxHeight: 'min(420px, 60vh)', overflowY: 'auto' }}>
                      <Md>{tutorHistory[0]?.content}</Md>
                    </div>
                  ) : null}
                </div>

                {/* Reinforcement chat — only shows Q&A messages (not the lecture) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Reinforcement Q&amp;A
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>
                    · {studentMsgCount}/3 exchanges
                  </span>
                </div>
                <ChatWindow messages={tutorHistory.slice(1)} />
                <ChatInput
                  onSend={sendTutorMessage}
                  loading={tutorLoading}
                  placeholder="Ask a follow-up question to reinforce your understanding…"
                />
              </div>
              <aside className="side-panel">
                <span className="eyebrow">Learning objectives</span>
                <h3>{chapter.title}</h3>
                <div className="desc">{chapter.description}</div>
                <div className="objectives">
                  {chapter.learningObjectives.map((obj, i) => (
                    <div key={i} className="objective">
                      <span className="box" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
                {vizComponents}
              </aside>
            </div>
          </div>
        )}

        {/* ── EXERCISE 1 / 2 ── */}
        {currentStage === 'practice' && (
          <div className="stage-fade">
            {exerciseLoading && <ExerciseSkeleton />}
            {exerciseError && <ErrorStrip message={exerciseError} onRetry={() => reinitStage(currentStage)} />}
            {!exerciseLoading && !exerciseError && exercises.length > 0 && (
              <div className="ex-wrap">
                {exercises.map((ex, i) =>
                  ex.type === 'mcq'
                    ? <MCQExercise key={i} exercise={ex} index={i}
                        onAnswer={(idx, val) => setAnswers(prev => ({ ...prev, [idx]: { answer: val } }))} />
                    : <ShortAnswerExercise key={i} exercise={ex} index={i} onAnswer={handleExerciseAnswer} />
                )}
                {!exerciseResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gradingError && <div style={{ color: 'var(--red-500)', fontSize: 13 }}>{gradingError}</div>}
                    <button className="btn btn-primary" onClick={gradeExercises} disabled={gradingLoading}>
                      {gradingLoading
                        ? <><Loader2 size={14} className="spin" /> Grading…</>
                        : <>Submit all & get score <ArrowRight size={14} /></>}
                    </button>
                  </div>
                )}
                {exerciseResult && (
                  <div className="ex-card result-card">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Your score</div>
                    <div className="score">{exerciseResult.totalScore}<span className="unit">%</span></div>
                    <div className="feedback">
                      {exerciseResult.passed
                        ? "Great job! You're ready to continue."
                        : "You need 60% to pass. Review the explanations and try again."}
                    </div>
                    <div className="row-h">
                      {exerciseResult.passed
                        ? <button className="btn btn-primary" onClick={completeExerciseStage}>Continue <ArrowRight size={14} /></button>
                        : <button className="btn btn-ghost" onClick={() => reinitStage('practice')}><RotateCcw size={14} /> Try again</button>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── REVERSE TUTOR ── */}
        {currentStage === 'reverse' && (
          <div className="stage-fade">
            <div className="rt-info-strip">
              <RefreshCw size={16} color="var(--saffron-700)" />
              <span><strong>Reverse Tutor:</strong> teach the AI about "{chapter.title}". Cover ≥65% of objectives to pass.</span>
            </div>
            <div className="ready-strip">
              <span className="hint">
                {rtExchangeCount >= 3
                  ? `${rtExchangeCount} explanations in — end when you've covered the objectives.`
                  : `Teach through ${3 - rtExchangeCount} more explanation${3 - rtExchangeCount !== 1 ? 's' : ''} before evaluating.`}
              </span>
              <button
                className="btn btn-accent"
                disabled={rtExchangeCount < 3 || rtEvalLoading}
                onClick={rtSessionComplete ? evaluateRT : () => { setRtSessionComplete(true); evaluateRT(); }}
              >
                {rtEvalLoading
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating…</>
                  : <><Check size={14} /> End session & evaluate</>}
              </button>
            </div>
            {rtError && <ErrorStrip message={rtError} />}
            <div className="tutor-grid">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ChatWindow messages={rtHistory} reversed />
                {!rtSessionComplete && (
                  <ChatInput onSend={sendRTMessage} loading={rtLoading} placeholder="Explain the concept in your own words…" />
                )}
              </div>
              <aside className="side-panel">
                <span className="eyebrow">Probe these objectives</span>
                <h3>{chapter.title}</h3>
                <div className="desc">Cover at least 65% of these in your explanations to pass.</div>
                <div className="objectives">
                  {chapter.learningObjectives.map((obj, i) => (
                    <div key={i} className="objective">
                      <span className="box" />
                      <span>{obj}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 10, lineHeight: 1.5 }}>
                    Coverage is evaluated when you end the session.
                  </div>
                </div>
              </aside>
            </div>

            {/* Eval result modal */}
            {rtEvalResult && (
              <div className="modal-scrim" onClick={() => {}}>
                <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                  <div className={`eval-banner ${rtEvalResult.passed ? 'pass' : 'fail'}`}>
                    {rtEvalResult.passed
                      ? <Check size={28} color="var(--moss-700)" />
                      : <X size={28} color="var(--cinnabar-700)" />}
                    <div>
                      <span className="eyebrow">Reverse tutor · evaluation</span>
                      <div className="eval-banner-title">
                        {rtEvalResult.score}% — {rtEvalResult.passed ? 'Passed!' : 'Needs more practice'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 10 }}><Md>{rtEvalResult.feedback}</Md></div>
                  <div className="eval-list">
                    {(rtEvalResult.objectives || []).map((obj, i) => (
                      <div key={i} className={`eval-row ${obj.covered ? 'covered' : 'missed'}`}>
                        <span className="mark">
                          {obj.covered ? <Check size={13} /> : <X size={13} />}
                        </span>
                        <div className="text">
                          {obj.objective}
                          <span className="ev">{obj.evidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="row-h" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
                    {rtEvalResult.passed
                      ? <button className="btn btn-primary" onClick={handleRTResult}>Continue <ArrowRight size={14} /></button>
                      : <button className="btn btn-ghost" onClick={handleRTResult}><ArrowLeft size={14} /> Back to tutor</button>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── QUIZ ── */}
        {currentStage === 'quiz' && (
          <div className="stage-fade">
            {quizLoading && <QuizSkeleton />}
            {quizError && <ErrorStrip message={quizError} onRetry={() => reinitStage('quiz')} />}
            {!quizLoading && !quizError && quizQuestions.length > 0 && !quizResult && (
              <div className="ex-wrap">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    5 questions · need 70% to pass
                  </span>
                  <div className="quiz-dots">
                    {quizQuestions.map((_, i) => (
                      <span key={i} className={`d ${quizAnswers[i] !== undefined ? 'on' : ''}`} />
                    ))}
                  </div>
                </div>
                {quizQuestions.map((q, i) => (
                  <MCQExercise
                    key={i} exercise={q} index={i}
                    onAnswer={(idx, val) => setQuizAnswers(prev => ({ ...prev, [idx]: val }))}
                  />
                ))}
                <div>
                  <button className="btn btn-primary" onClick={submitQuiz}>
                    Submit quiz <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
            {quizResult && (
              <div className="ex-card result-card">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Quiz score</div>
                <div className="score">{quizResult.score}<span className="unit">%</span></div>
                <div className="feedback">
                  {quizResult.passed
                    ? 'Quiz passed! Great work — onward to the summary.'
                    : 'You need 70% to pass. Review the answers and try again.'}
                </div>
                <div className="row-h">
                  {quizResult.passed
                    ? <button className="btn btn-primary" onClick={completeQuizStage}>View summary <ArrowRight size={14} /></button>
                    : <button className="btn btn-ghost" onClick={() => reinitStage('quiz')}><RotateCcw size={14} /> Retry quiz</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUMMARY ── */}
        {(currentStage === 'summary' || currentStage === 'completed') && (
          <div className="stage-fade summary-card">
            <span className="eyebrow">Chapter {String(chapter.order || '').padStart(2, '0')} · summary</span>
            <h1>You finished {chapter.title}.</h1>
            <p>{chapter.description} You worked through four stages and built solid intuition for each objective below.</p>

            <div className="summary-stats">
              <div className="summary-stat"><div className="v">✓</div><div className="k">Tutor</div></div>
              <div className="summary-stat"><div className="v">✓</div><div className="k">Practice</div></div>
              <div className="summary-stat"><div className="v">✓</div><div className="k">Reverse AI</div></div>
              <div className="summary-stat"><div className="v">✓</div><div className="k">Quiz</div></div>
            </div>

            <span className="eyebrow" style={{ marginBottom: 10, display: 'block' }}>What you now know</span>
            <ul style={{ paddingLeft: 18, margin: '0 0 24px', fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>
              {chapter.learningObjectives.map((obj, i) => <li key={i} style={{ marginBottom: 4 }}>{obj}</li>)}
            </ul>

            <div className="row-h">
              {currentStage === 'summary' && (
                <button className="btn btn-primary" onClick={completeSummary}>
                  <Award size={16} /> Continue to next chapter
                </button>
              )}
              <button className="btn btn-link" onClick={() => navigate(`/courses/${slug}`)}>
                Back to course
              </button>
            </div>
          </div>
        )}
      </div>

      <CertificateModal
        open={certModal}
        onClose={() => { setCertModal(false); navigate(`/courses/${slug}`); }}
        courseName={slug === 'dsa' ? 'Data Structures & Algorithms' : 'Introduction to Computer Science'}
        studentName={user?.name || ''}
        txHash={certData?.txHash || ''}
        pdfUrl={certData?.pdfUrl || ''}
      />
    </>
  );
}
