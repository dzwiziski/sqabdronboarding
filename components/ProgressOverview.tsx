import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Phase } from '../types';

interface PhaseProgressData {
    name: string;
    activitiesCompleted: number;
    totalActivities: number;
    percentage: number;
    daysComplete: number;
    totalDays: number;
}

interface OverallProgressData {
    activitiesCompleted: number;
    totalActivities: number;
    percentage: number;
    daysCompleted: number;
    totalDays: number;
}

interface ProgressOverviewProps {
    overallProgress: OverallProgressData;
    phaseProgress: PhaseProgressData[];
    phases: Phase[];
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
    overallProgress,
    phaseProgress,
    phases
}) => {
    return (
        <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle size={20} className="text-emerald-400" />
                    Overall Progress
                </h3>
                <div className="text-right">
                    <span className="text-3xl font-bold text-emerald-400">{overallProgress.percentage}%</span>
                    <div className="text-slate-400 text-sm">
                        {overallProgress.daysCompleted}/{overallProgress.totalDays} days • {overallProgress.activitiesCompleted}/{overallProgress.totalActivities} activities
                    </div>
                </div>
            </div>

            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${overallProgress.percentage}%` }}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {phaseProgress.map((phase, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-[10px] text-slate-400 mb-1 truncate" title={phase.name}>{phase.name}</div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white">{phase.percentage}%</span>
                            <span className="text-[10px] text-slate-500">{phase.daysComplete}/{phase.totalDays} days</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${phases[idx].color} transition-all duration-500 rounded-full`}
                                style={{ width: `${phase.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressOverview;
