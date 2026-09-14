import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { askDocumentQuestion } from '../services/api';

export default function ChatAssistant({ documentId, documentText }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your JurisLens AI assistant. What would you like to clarify about this document?',
      relevant_clauses: [],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    'What are the termination conditions?',
    'Is there an auto-renewal penalty or clause?',
    'What are my intellectual property rights?',
    'What is the governing law and jurisdiction?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryToSend) => {
    const question = (queryToSend || inputQuery).trim();
    if (!question || isAnswering) return;

    setInputQuery('');
    const newHistory = [...messages, { role: 'user', content: question }];
    setMessages(newHistory);
    setIsAnswering(true);

    try {
      const response = await askDocumentQuestion({
        documentId,
        documentText,
        question,
        chatHistory: newHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          relevant_clauses: response.relevant_clauses || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an issue analyzing that question: ${err.message}`,
          relevant_clauses: [],
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-white">Ask JurisLens AI</span>
        </div>
        <span className="text-[11px] text-slate-400">Grounded in document text</span>
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div className="p-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Suggested questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isAnswering}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                <p>{msg.content}</p>

                {msg.relevant_clauses && msg.relevant_clauses.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-indigo-400 uppercase mb-1">
                      Cited Clause(s):
                    </div>
                    {msg.relevant_clauses.map((clause, cIdx) => (
                      <div
                        key={cIdx}
                        className="text-xs text-slate-400 italic bg-black/40 p-2 rounded border border-slate-800 mb-1"
                      >
                        "{clause}"
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAnswering && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Reviewing document clauses...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={isAnswering}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAnswering}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
