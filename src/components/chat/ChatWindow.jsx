import { useRef, useEffect } from 'react';
import { MessageSquare, MessagesSquare } from 'lucide-react';
import Md from '../Md';

export default function ChatWindow({ messages, reversed = false, title, sub }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const Icon = reversed ? MessagesSquare : MessageSquare;
  const headerLabel = title || (reversed ? 'Reverse Tutor · you are teaching' : 'Tutor');
  const headerSub = sub || (reversed ? 'YOU TEACH · AI PROBES' : 'AI TUTOR');

  return (
    <div className="chat-window">
      <div className="chat-header">
        <Icon size={16} color="var(--indigo-500)" />
        <span className="who">{headerLabel}</span>
        <span className="sub" style={{ marginLeft: 'auto' }}>{headerSub}</span>
      </div>
      <div className="chat-stream">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {reversed ? 'Start explaining the topic…' : 'Ask the tutor anything…'}
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isRight = isUser;
          const bubbleClass = isUser ? 'msg-user' : (reversed ? 'msg-reverse' : 'msg-tutor');
          const speaker = isUser
            ? (reversed ? 'You (Tutor)' : 'You')
            : (reversed ? 'Curious Learner' : 'AI Tutor');

          return (
            <div key={i} className={`msg-row ${isRight ? 'right' : ''}`}>
              <span className="msg-speaker">{speaker}</span>
              <div className={`msg-bubble ${bubbleClass}`}>
                {msg.typing
                  ? <span className="msg-dots"><span /><span /><span /></span>
                  : <Md>{msg.content}</Md>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
