import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Calendar, ChevronRight, BarChart3, Lightbulb, Play, X } from 'lucide-react';
import { getAllBDRs, getBDROnboardingData, setStartDate, UserProfile, BDROnboardingData } from '../services/firestoreService';
import { getExpectedDay, getProgressStatus, getNextMonday, formatWeekRange } from '../utils/dateUtils';
import AICoachingPanel from './AICoachingPanel';

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
    const [showStartDateModal, setShowStartDateModal] = useState<BDRWithProgress | null>(null);
    const [selectedStartDate, setSelectedStartDate] = useState<string>('');
    const [savingStartDate, setSavingStartDate] = useState(false);

    const loadBDRs = async () => {
        setLoading(true);
        try {
            const bdrList = await getAllBDRs();
            const bdrsWithProgress: BDRWithProgress[] = await Promise.all(
                bdrList.map(async (bdr) => {
                    const data = await getBDROnboardingData(bdr.id);

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

    useEffect(() => { loadBDRs(); }, []);

    const handleOpenStartDateModal = (bdr: BDRWithProgress) => {
        const nextMonday = getNextMonday(new Date());
        setSelectedStartDate(nextMonday.toISOString().split('T')[0]);
        setShowStartDateModal(bdr);
    };

    const handleSetStartDate = async () => {
        if (!showStartDateModal || !selectedStartDate) return;
        setSavingStartDate(true);
        try {
            const startDate = new Date(selectedStartDate + 'T00:00:00');
            await setStartDate(showStartDateModal.id, startDate);
            setShowStartDateModal(null);
            await loadBDRs(); // Refresh list
        } catch (error) {
            console.error('Error setting start date:', error);
        } finally {
            setSavingStartDate(false);
        }
    };

    const sortedBdrs = [...bdrs].sort((a, b) => {
        if (sortBy === 'name') return a.profile.name.localeCompare(b.profile.name);
        if (sortBy === 'progress') return b.progressPercentage - a.progressPercentage;
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
        if (bdr.status === 'not-started') return 'Set their start date to begin tracking progress';
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
            {/* Start Date Modal */}
            {showStartDateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Start Onboarding</h3>
                            <button onClick={() => setShowStartDateModal(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-slate-400 mb-4">
                            Set the start date for <span className="text-white font-medium">{showStartDateModal.profile.name}</span>'s onboarding journey.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={selectedStartDate}
                                onChange={(e) => setSelectedStartDate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">We recommend starting on a Monday</p>
                        </div>
                        {selectedStartDate && (
                            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                                <div className="text-xs text-slate-400 mb-1">Week 1 Preview</div>
                                <div className="text-sm text-white">{formatWeekRange(new Date(selectedStartDate + 'T00:00:00'), 1)}</div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setShowStartDateModal(null)} className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800">
                                Cancel
                            </button>
                            <button onClick={handleSetStartDate} disabled={savingStartDate || !selectedStartDate} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white flex items-center justify-center gap-2">
                                {savingStartDate ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Play size={16} /> Start</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2"><Users size={18} className="text-slate-400" /><span className="text-sm text-slate-400">Total BDRs</span></div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2"><BarChart3 size={18} className="text-slate-400" /><span className="text-sm text-slate-400">Avg Progress</span></div>
                    <div className="text-2xl font-bold text-white">{stats.avgProgress}%</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-emerald-400" /><span className="text-sm text-slate-400">Ahead</span></div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.ahead}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} className="text-blue-400" /><span className="text-sm text-slate-400">On Track</span></div>
                    <div className="text-2xl font-bold text-blue-400">{stats.onTrack}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-red-400" /><span className="text-sm text-slate-400">Behind</span></div>
                    <div className="text-2xl font-bold text-red-400">{stats.behind}</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2"><Calendar size={18} className="text-slate-400" /><span className="text-sm text-slate-400">Not Started</span></div>
                    <div className="text-2xl font-bold text-slate-400">{stats.notStarted}</div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    {[{ key: 'status', label: 'Status' }, { key: 'progress', label: 'Progress' }, { key: 'name', label: 'Name' }].map(option => (
                        <button key={option.key} onClick={() => setSortBy(option.key as 'status' | 'progress' | 'name')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${sortBy === option.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
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
                        <div key={bdr.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors">
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
                                    {bdr.status === 'not-started' ? (
                                        <button onClick={() => handleOpenStartDateModal(bdr)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors">
                                            <Play size={14} /> Start
                                        </button>
                                    ) : (
                                        <button onClick={() => onSelectBdr(bdr.id, bdr.profile.name)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors">
                                            View <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Day {bdr.completedDays} of 60</span>
                                        <span>{bdr.progressPercentage}% complete</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${bdr.status === 'ahead' ? 'bg-emerald-500' : bdr.status === 'on-track' ? 'bg-blue-500' : bdr.status === 'behind' ? 'bg-red-500' : 'bg-slate-600'}`}
                                            style={{ width: `${bdr.progressPercentage}%` }} />
                                    </div>
                                    {bdr.onboardingData?.startDate && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Started: {bdr.onboardingData.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-800/50 rounded-lg p-3">
                                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Lightbulb size={12} /> Quick Tip</div>
                                    <p className="text-xs text-slate-300">{getCoachingTip(bdr)}</p>
                                </div>
                            </div>

                            {/* AI Coaching Panel */}
                            {bdr.status !== 'not-started' && (
                                <AICoachingPanel bdr={{
                                    name: bdr.profile.name,
                                    completedDays: bdr.completedDays,
                                    expectedDay: bdr.expectedDay,
                                    daysOffset: bdr.daysOffset,
                                    status: bdr.status,
                                    progressPercentage: bdr.progressPercentage
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
