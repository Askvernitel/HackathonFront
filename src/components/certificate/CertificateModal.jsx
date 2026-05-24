import { useEffect } from 'react';
import { Copy, ExternalLink, Download, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CertificateModal({ open, onClose, courseName, studentName, txHash, pdfUrl }) {
  useEffect(() => {
    if (open) confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 } });
  }, [open]);

  if (!open) return null;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  function copyTx() { navigator.clipboard.writeText(txHash); }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span className="modal-title">Certificate earned</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div className="cert">
          <div className="stamp">V</div>
          <div className="kicker">Verso · Certificate of Completion</div>
          <div className="cert-label">This certifies that</div>
          <div className="name">{studentName}</div>
          <div className="for">has successfully completed</div>
          <div className="course">{courseName}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 10 }}>{date} · Issued on Solana Devnet</div>
        </div>

        <div className="cert-meta">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>TX</span>
          <span className="hash">{txHash}</span>
          <button onClick={copyTx} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 2 }}>
            <Copy size={14} />
          </button>
        </div>

        <div className="cert-actions">
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <ExternalLink size={14} /> View on Explorer
          </a>
          <a
            href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${pdfUrl}`}
            download
            className="btn btn-primary btn-sm"
          >
            <Download size={14} /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
