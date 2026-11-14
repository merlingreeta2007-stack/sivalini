import React, { useState } from 'react';
import { Compass, Send } from 'lucide-react';
import { sendMentorMessage } from '../services/api';
import type { LearnerProfile, MentorMessage } from '../types/elevora';

interface MentorViewProps {
  profile: LearnerProfile;
  missingSkills: string[];
  messages: MentorMessage[];
  onMessagesChange: (messages: MentorMessage[]) => void;
}

export const MentorView: React.FC<MentorViewProps> = ({
  profile,
  missingSkills,
  messages,
  onMessagesChange,
}) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starterPrompts = [
    `Create a realistic 30-day study plan for becoming a ${profile.targetCareer}.`,
    `What portfolio proof or practical project carries the most weight in ${profile.field}?`,
    missingSkills.length > 0
      ? `How should I start learning ${missingSkills[0]} with free resources?`
      : `What are the top beginner mistakes to avoid when entering ${profile.field}?`,
    `How can I highlight my ${profile.education} background on a resume?`,
  ];

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError(null);
    const userMsg: MentorMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    onMessagesChange(nextHistory);
    setInput('');
    setSending(true);

    try {
      const res = await sendMentorMessage({
        profile,
        message: trimmed,
        history: nextHistory.map((m) => ({ role: m.role, content: m.content })),
        missingSkills,
      });

      const mentorMsg: MentorMessage = {
        id: `m-${Date.now()}`,
        role: 'mentor',
        content: res.reply,
        suggestedActions: res.suggestedActions,
        createdAt: new Date().toISOString(),
      };
      onMessagesChange([...nextHistory, mentorMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach AI Mentor.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[540px] max-w-4xl">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-white">AI Career Mentor</h1>
        <p className="text-sm text-slate-400 mt-1">
          Personalized guidance for your {profile.targetCareer} journey in {profile.field}.
        </p>
      </div>

      {/* Chat Transcript Container */}
      <div className="flex-1 rounded-xl border border-white/[0.08] bg-[#0B1224] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="py-8 max-w-xl mx-auto text-center space-y-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/25 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  Ask your Elevora Mentor anything
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Whether you need study advice, concept clarity, resume feedback, or career
                  navigation in {profile.field}, start with a question below.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="p-3 rounded-lg border border-white/[0.08] bg-[#060B18] hover:border-cyan-400/50 text-xs text-slate-200 leading-relaxed transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="text-[11px] text-slate-400 mb-1">
                  {msg.role === 'user' ? profile.fullName : 'Elevora AI Mentor'}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#060B18] border border-white/[0.08] text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'mentor' &&
                  msg.suggestedActions &&
                  msg.suggestedActions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 max-w-[85%]">
                      {msg.suggestedActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => handleSend(action)}
                          disabled={sending}
                          className="px-3 py-1.5 rounded-md border border-cyan-400/25 bg-cyan-500/5 hover:bg-cyan-500/15 text-xs text-cyan-200 transition-colors cursor-pointer text-left"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}

          {sending && (
            <div className="flex items-start flex-col">
              <div className="text-[11px] text-slate-400 mb-1">Elevora AI Mentor</div>
              <div className="px-4 py-3 rounded-xl bg-[#060B18] border border-white/[0.08] text-xs text-slate-400">
                Thinking through a personalized recommendation...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-white/[0.08] bg-[#060B18]/80 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={`Ask about ${profile.targetCareer}, study tips, or a concept...`}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#0B1224] border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Ask Mentor
          </button>
        </form>
      </div>
    </div>
  );
};
