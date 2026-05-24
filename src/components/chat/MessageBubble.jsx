// Legacy shim — ChatWindow now renders bubbles inline. This file is kept
// in case other components import MessageBubble directly.
export default function MessageBubble({ message, reversed = false }) {
  const isUser = message.role === 'user';
  const bubbleClass = isUser ? 'msg-user' : (reversed ? 'msg-reverse' : 'msg-tutor');
  const speaker = isUser
    ? (reversed ? 'You (Tutor)' : 'You')
    : (reversed ? 'Curious Learner' : 'AI Tutor');

  return (
    <div className={`msg-row ${isUser ? 'right' : ''}`}>
      <span className="msg-speaker">{speaker}</span>
      <div className={`msg-bubble ${bubbleClass}`}>{message.content}</div>
    </div>
  );
}
