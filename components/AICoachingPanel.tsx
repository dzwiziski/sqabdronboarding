import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { getSmartCoachingRecommendations, CoachingRecommendation, BDRProgressData, isAIConfigured } from '../services/aiService';

interface AICoachingPanelProps {
    bdr: BDRProgressData;
}

const AICoachingPanel: React.FC<AICoachingPanelProps> = ({ bdr }) => {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<CoachingRecommendation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const handleExpand = async () => {
        if (!expanded && !hasFetched) {
            setLoading(true);
            setError(null);
            try {
                const recs = await getSmartCoachingRecommendations(bdr);
                setRecommendations(recs);
                setHasFetched(true);
            } catch (err: any) {
                setError(err.message || 'Failed to get recommendations');
            } finally {
                setLoading(false);
            }
        }
        setExpanded(!expanded);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-400/10';
            case 'medium': return 'text-amber-400 bg-amber-400/10';
            default: return 'text-blue-400 bg-blue-400/10';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertCircle size={14} />;
            case 'medium': return <Target size={14} />;
            default: return <CheckCircle size={14} />;
        }
    };

    if (!isAIConfigured()) {
        return null;
    }

    return (
        <div className="mt-3 border-t border-slate-700/50 pt-3">
            <button
                onClick={handleExpand}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
                <Sparkles size={14} />
                <span>AI Coaching Insights</span>
                {loading ? (
                    <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                ) : expanded ? (
                    <ChevronUp size={14} />
                ) : (
                    <ChevronDown size={14} />
                )}
            </button>

            {expanded && (
                <div className="mt-3 space-y-2 animate-in fade-in duration-300">
                    {error && (
                        <div className="text-sm text-red-400 bg-red-400/10 rounded-lg p-2">
                            {error}
                        </div>
                    )}

                    {recommendations.length === 0 && !loading && !error && (
                        <div className="text-sm text-slate-500">No recommendations available</div>
                    )}

                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getPriorityColor(rec.priority)}`}>
                                    {getPriorityIcon(rec.priority)}
                                    {rec.priority}
                                </span>
                                <span className="text-sm font-medium text-white">{rec.title}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-1">{rec.description}</p>
                            <p className="text-xs text-emerald-400">→ {rec.action}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AICoachingPanel;
