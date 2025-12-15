import React from 'react';
import { Check } from 'lucide-react';
import { getDayInfo, getPhase, certifications } from '../data';
import { ActivityState, DayProgress, CertificationEvidence } from '../types';
import FlipCard from './FlipCard';

interface WeekData {
    week: number;
    days: number[];
}

interface WeekProgressData {
    activitiesComplete: number;
    activitiesTotal: number;
    daysComplete: number;
    totalDays: number;
    percentage: number;
}

interface WeekCardProps {
    weekData: WeekData;
    weekProgress: WeekProgressData;
    flippedDays: Record<number, boolean>;
    completedActivities: ActivityState;
    evidence: Record<string, CertificationEvidence>;
    isDayComplete: (day: number, activities: string[]) => boolean;
    getDayProgress: (day: number, activities: string[]) => DayProgress;
    onFlip: (day: number) => void;
    onToggleActivity: (day: number, idx: number, e: React.MouseEvent) => void;
    onToggleAll: (day: number, activities: string[], e: React.MouseEvent) => void;
    onSaveEvidence: (day: number, evidence: CertificationEvidence) => void;
    onRemoveEvidence: (day: number) => void;
}

const WeekCard: React.FC<WeekCardProps> = ({
    weekData,
    weekProgress,
    flippedDays,
    completedActivities,
    evidence,
    isDayComplete,
    getDayProgress,
    onFlip,
    onToggleActivity,
    onToggleAll,
    onSaveEvidence,
    onRemoveEvidence
}) => {
    return (
        <div className="bg-white rounded-xl p-4 border border-granite-blush/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-sm font-semibold text-charcoal">
                        Week {weekData.week}
                    </div>
                    <div className="text-xs text-granite-blush">
                        Days {weekData.days[0]}-{weekData.days[weekData.days.length - 1]}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="text-xs text-granite-blush">{weekProgress.daysComplete}/{weekProgress.totalDays} days</div>
                        <div className="text-[10px] text-granite-blush/70">{weekProgress.activitiesComplete}/{weekProgress.activitiesTotal} tasks</div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
            ${weekProgress.daysComplete === weekProgress.totalDays ? 'bg-sage-brush text-white' : 'bg-bg-tertiary text-charcoal'}`}>
                        {weekProgress.daysComplete === weekProgress.totalDays ? <Check size={16} /> : `${weekProgress.percentage}%`}
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                {weekData.days.map((day) => {
                    const dayInfo = getDayInfo(day);
                    return (
                        <FlipCard
                            key={day}
                            day={day}
                            isFlipped={!!flippedDays[day]}
                            dayInfo={dayInfo}
                            phase={getPhase(day)}
                            hasCert={certifications[day]}
                            isCompleted={dayInfo ? isDayComplete(day, dayInfo.activities) : false}
                            progress={dayInfo ? getDayProgress(day, dayInfo.activities) : { completed: 0, total: 0, percentage: 0 }}
                            completedActivities={completedActivities}
                            evidence={evidence[day]}
                            onFlip={onFlip}
                            onToggleActivity={onToggleActivity}
                            onToggleAll={onToggleAll}
                            onSaveEvidence={onSaveEvidence}
                            onRemoveEvidence={onRemoveEvidence}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default WeekCard;
