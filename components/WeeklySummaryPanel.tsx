import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertTriangle, Trophy, Target, ChevronDown, ChevronUp, Sparkles, Users } from 'lucide-react';
import { generateWeeklySummary, BDRProgressData, isAIConfigured } from '../services/aiService';
import { getAllBDRs, getBDROnboardingData } from '../services/firestoreService';
import { getExpectedDay, getProgressStatus } from '../utils/dateUtils';

interface WeeklySummaryData {
    summary: string;
    needsAttention: string[];
    wins: string[];
    recommendations: string[];
}

const WeeklySummaryPanel: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<WeeklySummaryData | null>(null);
    const [bdrs, setBdrs] = useState<BDRProgressData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    const loadBDRsAndGenerateSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            // First load all BDRs with their progress
            const bdrList = await getAllBDRs();
            const bdrsWithProgress: BDRProgressData[] = await Promise.all(
                bdrList.map(async (bdr) => {
                    const data = await getBDROnboardingData(bdr.id);

                    let completedDays = 0;
                    if (data?.completedActivities) {
                        const dayMap = new Map<number, number>();
                        Object.keys(data.completedActivities).forEach(key => {
                            if (data.completedActivities[key]) {
                                const [dayStr] = key.split('-');
                                dayMap.set(parseInt(dayStr), 1);
                            }
                        });
                        completedDays = dayMap.size;
                    }

                    let expectedDay = 1;
                    let status: 'ahead' | 'on-track' | 'behind' | 'not-started' = 'not-started';
                    let daysOffset = 0;

                    if (data?.startDate) {
                        const startDate = data.startDate.toDate();
                        expectedDay = getExpectedDay(startDate);
                        const progressResult = getProgressStatus(startDate, completedDays, 0);
                        status = progressResult.status;
                        daysOffset = progressResult.daysOffset;
                    }

                    return {
                        name: bdr.profile.name,
                        completedDays,
                        expectedDay,
                        daysOffset,
                        status,
                        progressPercentage: Math.round((completedDays / 60) * 100)
                    };
                })
            );

            setBdrs(bdrsWithProgress);

            // Only generate summary if we have BDRs
            if (bdrsWithProgress.length > 0) {
                const summary = await generateWeeklySummary(bdrsWithProgress);
                setSummaryData(summary);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAIConfigured()) {
            loadBDRsAndGenerateSummary();
        }
    }, []);

    if (!isAIConfigured()) {
        return (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 text-center">
                <AlertTriangle size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Configure AI to generate weekly summaries</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <FileText size={20} className="text-blue-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            Weekly Team Summary
                            <Sparkles size={14} className="text-purple-400" />
                        </h3>
                        <p className="text-xs text-slate-400">AI-generated overview of BDR progress</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); loadBDRsAndGenerateSummary(); }}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                        title="Regenerate summary"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
            </button>

            {expanded && (
                <div className="p-5 pt-0 border-t border-slate-800">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm text-slate-400">Analyzing team progress...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 rounded-lg text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    ) : bdrs.length === 0 ? (
                        <div className="text-center py-8">
                            <Users size={32} className="text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No BDRs to summarize yet</p>
                        </div>
                    ) : summaryData ? (
                        <div className="space-y-5 mt-4">
                            {/* Executive Summary */}
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                                <p className="text-sm text-slate-200 leading-relaxed">{summaryData.summary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Needs Attention */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle size={16} className="text-red-400" />
                                        <h4 className="text-sm font-medium text-red-400">Needs Attention</h4>
                                    </div>
                                    {summaryData.needsAttention.length > 0 ? (
                                        <ul className="space-y-2">
                                            {summaryData.needsAttention.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <span className="text-red-400 mt-0.5">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-500">All BDRs are on track! 🎉</p>
                                    )}
                                </div>

                                {/* Wins */}
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Trophy size={16} className="text-emerald-400" />
                                        <h4 className="text-sm font-medium text-emerald-400">Wins</h4>
                                    </div>
                                    {summaryData.wins.length > 0 ? (
                                        <ul className="space-y-2">
                                            {summaryData.wins.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <span className="text-emerald-400 mt-0.5">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-500">Keep encouraging progress!</p>
                                    )}
                                </div>

                                {/* Recommendations */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target size={16} className="text-blue-400" />
                                        <h4 className="text-sm font-medium text-blue-400">Recommended Actions</h4>
                                    </div>
                                    {summaryData.recommendations.length > 0 ? (
                                        <ul className="space-y-2">
                                            {summaryData.recommendations.map((item, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-500">Continue current approach</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default WeeklySummaryPanel;
