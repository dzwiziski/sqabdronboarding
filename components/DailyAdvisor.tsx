import React, { useState, useEffect } from 'react';
import { Sparkles, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { getDailyActivityAdvice, BDRProgressData, isAIConfigured } from '../services/aiService';

interface DailyAdvisorProps {
    bdr: BDRProgressData;
    currentWeek: number;
}

const DailyAdvisor: React.FC<DailyAdvisorProps> = ({ bdr, currentWeek }) => {
    const [loading, setLoading] = useState(false);
    const [priorities, setPriorities] = useState<string[]>([]);
    const [reasoning, setReasoning] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchAdvice = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getDailyActivityAdvice(bdr, currentWeek);
            setPriorities(result.priorities);
            setReasoning(result.reasoning);
            setHasFetched(true);
        } catch (err: any) {
            setError(err.message || 'Failed to get advice');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAIConfigured() && !hasFetched) {
            fetchAdvice();
        }
    }, [bdr.name, currentWeek]);

    if (!isAIConfigured()) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Sparkles size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Today's AI Advisor</h3>
                        <p className="text-xs text-slate-400">Based on your Week {currentWeek} progress</p>
                    </div>
                </div>
                <button
                    onClick={fetchAdvice}
                    disabled={loading}
                    className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh recommendations"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading && !hasFetched ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-lg">
                    <AlertCircle size={16} />
                    {error}
                </div>
            ) : (
                <>
                    <div className="space-y-2 mb-4">
                        {priorities.map((priority, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white">{priority}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {reasoning && (
                        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/30 rounded-lg p-3">
                            <Target size={14} className="flex-shrink-0 mt-0.5 text-slate-500" />
                            <p>{reasoning}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DailyAdvisor;
