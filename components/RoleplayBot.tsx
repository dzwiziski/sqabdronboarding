import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, RotateCcw, Award, Phone, Search, ShieldAlert, Target, AlertCircle } from 'lucide-react';
import { roleplayChat, getRoleplayFeedback, RoleplayScenario, RoleplayMessage, isAIConfigured } from '../services/aiService';

interface Feedback {
    score: number;
    strengths: string[];
    improvements: string[];
    tips: string[];
}

const SCENARIOS: { id: RoleplayScenario; name: string; icon: React.ReactNode; description: string }[] = [
    { id: 'cold-call', name: 'Cold Call', icon: <Phone size={18} />, description: 'Practice your opening pitch with a skeptical prospect' },
    { id: 'discovery', name: 'Discovery', icon: <Search size={18} />, description: 'Run a discovery call and uncover pain points' },
    { id: 'objection', name: 'Objection Handling', icon: <ShieldAlert size={18} />, description: 'Handle budget, timing, and competitor objections' },
    { id: 'closing', name: 'Closing', icon: <Target size={18} />, description: 'Secure commitment and next steps' }
];

const RoleplayBot: React.FC = () => {
    const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
    const [messages, setMessages] = useState<RoleplayMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !scenario || sending) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setSending(true);

        const newMessages: RoleplayMessage[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        try {
            const response = await roleplayChat(scenario, messages, userMessage);
            setMessages([...newMessages, { role: 'prospect', content: response }]);
        } catch (error) {
            console.error('Roleplay error:', error);
        } finally {
            setSending(false);
        }
    };

    const handleEndSession = async () => {
        if (messages.length < 2 || !scenario) return;

        setLoadingFeedback(true);
        try {
            const result = await getRoleplayFeedback(scenario, messages);
            setFeedback(result);
        } catch (error) {
            console.error('Feedback error:', error);
        } finally {
            setLoadingFeedback(false);
        }
    };

    const handleRestart = () => {
        setMessages([]);
        setFeedback(null);
        setScenario(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-emerald-400';
        if (score >= 6) return 'text-blue-400';
        if (score >= 4) return 'text-amber-400';
        return 'text-red-400';
    };

    if (!isAIConfigured()) {
        return (
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
                <AlertCircle size={48} className="text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">AI Not Configured</h3>
                <p className="text-slate-400 text-sm">Add VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY to enable AI features.</p>
            </div>
        );
    }

    // Scenario Selection
    if (!scenario) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                            <MessageCircle size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Roleplay Practice</h2>
                            <p className="text-sm text-slate-400">Practice sales conversations with an AI prospect</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SCENARIOS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setScenario(s.id)}
                                className="flex items-start gap-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-colors"
                            >
                                <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                                    {s.icon}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white mb-1">{s.name}</h3>
                                    <p className="text-xs text-slate-400">{s.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Feedback View
    if (feedback) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-600/20 rounded-lg">
                                <Award size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Session Complete!</h2>
                                <p className="text-sm text-slate-400">{SCENARIOS.find(s => s.id === scenario)?.name} Practice</p>
                            </div>
                        </div>
                        <div className={`text-4xl font-bold ${getScoreColor(feedback.score)}`}>
                            {feedback.score}/10
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-emerald-400 mb-2">Strengths</h4>
                            <ul className="space-y-1">
                                {feedback.strengths.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-300">• {s}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-amber-400 mb-2">Areas to Improve</h4>
                            <ul className="space-y-1">
                                {feedback.improvements.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-300">• {s}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-400 mb-2">Tips</h4>
                            <ul className="space-y-1">
                                {feedback.tips.map((s, i) => (
                                    <li key={i} className="text-xs text-slate-300">• {s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleRestart}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                    >
                        <RotateCcw size={18} /> Practice Again
                    </button>
                </div>
            </div>
        );
    }

    // Chat View
    return (
        <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                            {SCENARIOS.find(s => s.id === scenario)?.icon}
                        </div>
                        <div>
                            <h3 className="font-medium text-white">{SCENARIOS.find(s => s.id === scenario)?.name}</h3>
                            <p className="text-xs text-slate-400">Type your response below</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {messages.length >= 2 && (
                            <button
                                onClick={handleEndSession}
                                disabled={loadingFeedback}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
                            >
                                {loadingFeedback ? 'Getting feedback...' : 'End & Get Feedback'}
                            </button>
                        )}
                        <button
                            onClick={handleRestart}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-400 text-sm">Start the conversation! Try your opening line.</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-br-md'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-md'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {sending && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-md">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your response..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || sending}
                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-white transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleplayBot;
