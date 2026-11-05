import { useState, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { askMedicationAI } from '../lib/awsApi';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export function MedicationAssistantPage() {
  const { medicines } = useAppData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), role: 'user', text: question, timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const medContext = medicines.map(m => ({
        name: m.name, dosage: m.dosage, form: m.form, notes: m.notes,
      }));

      const response = await askMedicationAI(question, medContext);

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(), role: 'ai', text: response, timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setError(e.message || 'Failed to get a response. Make sure the AWS backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What are common side effects of my medications?",
    "What is each of my medications used for?",
    "What should I know about taking my medications together?",
  ];

  return (
    <div>
      <div className="row-between mb-6">
        <div>
          <div className="page-title">Medication Assistant</div>
          <div className="page-sub">AI-powered answers about your medications</div>
        </div>
        <span className="badge badge-info">
          {medicines.length} med{medicines.length !== 1 ? 's' : ''} in context
        </span>
      </div>

      {/* Disclaimer */}
      <div className="ai-disclaimer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          <strong>Informational only — not medical advice.</strong>{' '}
          This AI assistant provides general medication information. Always consult your healthcare
          professional before making any changes to your medication.
        </span>
      </div>

      {/* Chat container */}
      <div className="chat-container">
        <div className="chat-messages" ref={scrollRef}>
          {messages.length === 0 && !loading && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="chat-welcome-title">Ask about your medications</div>
              <div className="chat-welcome-desc">
                I can help with general information about your medications, common side effects,
                what each medication is used for, and general medication guidance.
              </div>
              <div className="chat-quick-questions">
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    className="chat-quick-btn"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`chat-msg ${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'user' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                )}
              </div>
              <div className="chat-msg-bubble">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg ai">
              <div className="chat-msg-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="chat-msg-bubble">
                <div className="chat-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="auth-error" style={{ margin: '12px 16px' }}>{error}</div>}

        {/* Input bar */}
        <div className="chat-input-bar">
          <textarea
            className="chat-input"
            placeholder="Ask about your medications…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{ flexShrink: 0 }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
