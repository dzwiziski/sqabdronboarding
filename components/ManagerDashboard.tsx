import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Calendar, ChevronRight, BarChart3, Target, Lightbulb } from 'lucide-react';
import { getAllBDRs, getBDROnboardingData, UserProfile, BDROnboardingData } from '../services/firestoreService';
import { getExpectedDay, getProgressStatus, formatWeekRange } from '../utils/dateUtils';
import { phases } from '../data';

interface BDRWithProgress {
    id: string;
    profile: UserProfile;
    onboardingData: BDROnboardingData | null;
    completedDays: number;
    totalActivities: number;
    expectedDay: number;
    progressPercentage: number;
    status: 'ahead' | 'on-track' | 'behind' | 'not-started';
    daysOffset: number;
}

interface ManagerDashboardProps {
    onSelectBdr: (bdrId: string, bdrName: string) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onSelectBdr }) => {
    const [bdrs, setBdrs] = useState<BDRWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'name' | 'progress' | 'status'>('status');

    useEffect(() => {
        const loadBDRs = async () => {
            setLoading(true);
            try {
                const bdrList = await getAllBDRs();
                const bdrsWithProgress: BDRWithProgress[] = await Promise.all(
                    bdrList.map(async (bdr) => {
                        const data = await getBDROnboardingData(bdr.id);

                        // Calculate completed days
                        let completedDays = 0;
                        let totalActivities = 0;
                        if (data?.completedActivities) {
                            const dayMap = new Map<number, number>();
                            Object.keys(data.completedActivities).forEach(key => {
                                if (data.completedActivities[key]) {
                                    const [dayStr] = key.split('-');
                                    const day = parseInt(dayStr);
                                    dayMap.set(day, (dayMap.get(day) || 0) + 1);
                                    totalActivities++;
                                }
                            });
                            completedDays = dayMap.size;
                        }

                        // Calculate expected progress
                        let expectedDay = 1;
                        let status: 'ahead' | 'on-track' | 'behind' | 'not-started' = 'not-started';
                        let daysOffset = 0;

                        if (data?.startDate) {
                            const startDate = data.startDate.toDate();
                            expectedDay = getExpectedDay(startDate);
                            const progressResult = getProgressStatus(startDate, completedDays, totalActivities);
                            status = progressResult.status;
                            daysOffset = progressResult.daysOffset;
                        }

                        const progressPercentage = Math.round((completedDays / 60) * 100);

                        return {
                            id: bdr.id,
                            profile: bdr.profile,
                            onboardingData: data,
                            completedDays,
                            totalActivities,
                            expectedDay,
                            progressPercentage,
                            status,
                            daysOffset
                        };
                    })
                );
                setBdrs(bdrsWithProgress);
            } catch (error) {
                console.error('Error loading BDRs:', error);
            } finally {
                setLoading(false);
            }
        };
        loadBDRs();
    }, []);

    const sortedBdrs = [...bdrs].sort((a, b) => {
        if (sortBy === 'name') return a.profile.name.localeCompare(b.profile.name);
        if (sortBy === 'progress') return b.progressPercentage - a.progressPercentage;
        // Sort by status: behind first, then on-track, then ahead, then not-started
        const statusOrder = { 'behind': 0, 'on-track': 1, 'ahead': 2, 'not-started': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    const stats = {
        total: bdrs.length,
        onTrack: bdrs.filter(b => b.status === 'on-track').length,
        ahead: bdrs.filter(b => b.status === 'ahead').length,
        behind: bdrs.filter(b => b.status === 'behind').length,
        notStarted: bdrs.filter(b => b.status === 'not-started').length,
        avgProgress: bdrs.length > 0 ? Math.round(bdrs.reduce((acc, b) => acc + b.progressPercentage, 0) / bdrs.length) : 0
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ahead': return <TrendingUp size={16} className="text-emerald-400" />;
            case 'on-track': return <Minus size={16} className="text-blue-400" />;
            case 'behind': return <TrendingDown size={16} className="text-red-400" />;
            default: return <Calendar size={16} className="text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ahead': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'on-track': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'behind': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getCoachingTip = (bdr: BDRWithProgress): string => {
        if (bdr.status === 'not-started') return 'Help them set their start date to begin tracking';
        if (bdr.status === 'behind' && bdr.daysOffset <= -5) return '🚨 Schedule immediate 1:1 to identify blockers';
        if (bdr.status === 'behind') return 'Increase check-in frequency, review daily activity targets';
        if (bdr.status === 'ahead') return 'Consider peer mentoring opportunities';
        return 'Continue current rhythm, reinforce positive behaviors';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={18} className="text-slate-400" />
                        <span className="text-sm text-slate-400">Total BDRs</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={18} className="text-slate-400" />
                        <span className="text-sm text-slate-400">Avg Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.avgProgress}%</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-emerald-400" />
                        <span className="text-sm text-slate-400">Ahead</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.ahead}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={18} className="text-blue-400" />
                        <span className="text-sm text-slate-400">On Track</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">{stats.onTrack}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-red-400" />
                        <span className="text-sm text-slate-400">Behind</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">{stats.behind}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} className="text-slate-400" />
                        <span className="text-sm text-slate-400">Not Started</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-400">{stats.notStarted}</div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    {[
                        { key: 'status', label: 'Status' },
                        { key: 'progress', label: 'Progress' },
                        { key: 'name', label: 'Name' }
                    ].map(option => (
                        <button
                            key={option.key}
                            onClick={() => setSortBy(option.key as 'status' | 'progress' | 'name')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${sortBy === option.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* BDR List */}
            {sortedBdrs.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                    <Users size={48} className="text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No BDRs Yet</h3>
                    <p className="text-slate-400">BDRs will appear here once they sign up</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedBdrs.map((bdr) => (
                        <div
                            key={bdr.id}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white">
                                        {bdr.profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{bdr.profile.name}</h3>
                                        <p className="text-sm text-slate-400">{bdr.profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(bdr.status)}`}>
                                        {getStatusIcon(bdr.status)}
                                        {bdr.status === 'not-started' ? 'Not Started' : bdr.status === 'on-track' ? 'On Track' : bdr.status.charAt(0).toUpperCase() + bdr.status.slice(1)}
                                        {bdr.status !== 'not-started' && bdr.daysOffset !== 0 && (
                                            <span className="ml-1">({bdr.daysOffset > 0 ? '+' : ''}{bdr.daysOffset}d)</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onSelectBdr(bdr.id, bdr.profile.name)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                                    >
                                        View <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Progress Bar */}
                                <div className="md:col-span-2">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Day {bdr.completedDays} of 60</span>
                                        <span>{bdr.progressPercentage}% complete</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${bdr.status === 'ahead' ? 'bg-emerald-500' :
                                                    bdr.status === 'on-track' ? 'bg-blue-500' :
                                                        bdr.status === 'behind' ? 'bg-red-500' : 'bg-slate-600'
                                                }`}
                                            style={{ width: `${bdr.progressPercentage}%` }}
                                        />
                                    </div>
                                    {bdr.onboardingData?.startDate && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Started: {bdr.onboardingData.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>

                                {/* Coaching Tip */}
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                        <Lightbulb size={12} /> Coaching Tip
                                    </div>
                                    <p className="text-xs text-slate-300">{getCoachingTip(bdr)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
