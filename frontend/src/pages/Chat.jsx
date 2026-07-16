import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../api/services';
import { MessageSquare, Send, Sparkles, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const chatEndRef = useRef(null);

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await aiAPI.getChatSessions();
      setSessions(res.data.data.sessions || []);
      if (res.data.data.sessions?.length > 0 && !activeSessionId) {
        setActiveSessionId(res.data.data.sessions[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadActiveSession = async (id) => {
    if (!id) return;
    try {
      const res = await aiAPI.getChatSession(id);
      setMessages(res.data.data.session.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadActiveSession(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(userMsg.content, activeSessionId);
      const aiMsg = res.data.data.message;
      
      // Update session tracking
      if (!activeSessionId) {
        setActiveSessionId(res.data.data.sessionId);
        loadSessions();
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error('AI model failed to respond. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6 overflow-hidden">
      {/* Session Sidebar */}
      <div className="w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-display font-bold text-sm">Conversations</span>
            <button onClick={handleStartNewSession} className="p-1.5 hover:bg-[var(--border-subtle)] rounded-lg text-[var(--primary-500)]">
              <Plus className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="space-y-1">
            {sessionsLoading ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center text-xs text-[var(--text-muted)] py-4">No recent chats</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setActiveSessionId(s._id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs truncate flex items-center gap-2 ${
                    activeSessionId === s._id ? 'bg-[var(--primary-50)] text-[var(--primary-700)] font-semibold' : 'hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="truncate">{s.sessionTitle || 'Chat Session'}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main chat interface */}
      <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 border-b border-[var(--border-color)] px-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--primary-500)]" />
          <h3 className="font-display font-bold text-sm">AI Career Coach</h3>
        </div>

        {/* Chat message body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-sm mx-auto space-y-3">
              <div className="h-12 w-12 rounded-full bg-[var(--primary-50)] flex items-center justify-center text-[var(--primary-500)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-display font-bold">Ask SkillBridge AI Anything</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                "What should I study next?", "Which projects look good for DevOps?", "Review React certifications."
              </p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                <p className="text-xs leading-relaxed whitespace-pre-line">{m.content}</p>
              </div>
            ))
          )}
          {loading && (
            <div className="chat-message-ai flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--text-secondary)] animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-[var(--text-secondary)] animate-bounce delay-75"></div>
              <div className="h-2 w-2 rounded-full bg-[var(--text-secondary)] animate-bounce delay-150"></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="h-16 border-t border-[var(--border-color)] px-6 flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="input py-2 text-xs"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary p-2.5 rounded-lg shrink-0">
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
