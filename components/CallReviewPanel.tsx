import React, { useState } from 'react';
import { Mic, Send, BarChart3, ThumbsUp, AlertCircle, RefreshCw, X } from 'lucide-react';
import { analyzeCallTranscript, isAIConfigured } from '../services/aiService';

interface CallAnalysis {
    scores: { category: string; score: number; feedback: string }[];
    overallScore: number;
    strengths: string[];
    improvements: string[];
}

const CallReviewPanel: React.FC = () => {
    const [transcript, setTranscript] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!transcript.trim()) return;

        setAnalyzing(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await analyzeCallTranscript(transcript);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze call');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setTranscript('');
        setAnalysis(null);
        setError(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-emerald-400 bg-emerald-400/10';
        if (score >= 6) return 'text-blue-400 bg-blue-400/10';
        if (score >= 4) return 'text-amber-400 bg-amber-400/10';
        return 'text-red-400 bg-red-400/10';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 8) return 'bg-emerald-500';
        if (score >= 6) return 'bg-blue-500';
        if (score >= 4) return 'bg-amber-500';
        return 'bg-red-500';
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

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                            <Mic size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Call Review Assistant</h2>
                            <p className="text-sm text-slate-400">Paste a call transcript for AI-powered feedback</p>
                        </div>
                    </div>
                    {analysis && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            <RefreshCw size={14} /> New Analysis
                        </button>
                    )}
                </div>

                {!analysis ? (
                    <>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste your call transcript here...

Example format:
BDR: Hi, this is [Name] from [Company]. I noticed you recently...
Prospect: Hi, actually I'm in a meeting right now.
BDR: I understand! Would a quick 30-second overview work, or should I call back at a better time?
..."
                            className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                        />

                        {error && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!transcript.trim() || analyzing}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <Send size={18} /> Analyze Call
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Overall Score */}
                        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={24} className="text-slate-400" />
                                <span className="text-lg font-medium text-white">Overall Score</span>
                            </div>
                            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.overallScore)}`}>
                                {analysis.overallScore}/10
                            </div>
                        </div>

                        {/* Category Scores */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Category Breakdown</h3>
                            {analysis.scores.map((score, idx) => (
                                <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white">{score.category}</span>
                                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${getScoreColor(score.score)}`}>
                                            {score.score}/10
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score.score)}`}
                                            style={{ width: `${score.score * 10}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">{score.feedback}</p>
                                </div>
                            ))}
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <ThumbsUp size={16} className="text-emerald-400" />
                                    <h3 className="text-sm font-medium text-emerald-400">Strengths</h3>
                                </div>
                                <ul className="space-y-2">
                                    {analysis.strengths.map((s, idx) => (
                                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                            <span className="text-emerald-400 mt-1">•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle size={16} className="text-amber-400" />
                                    <h3 className="text-sm font-medium text-amber-400">Areas to Improve</h3>
                                </div>
                                <ul className="space-y-2">
                                    {analysis.improvements.map((i, idx) => (
                                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span> {i}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallReviewPanel;
