import React from 'react';
import { Award } from 'lucide-react';
import { getDayInfo } from '../data';
import { Certification, ActivityState } from '../types';

interface CertificationTimelineProps {
    certifications: Record<number, Certification>;
    completedActivities: ActivityState;
    onNavigateToCert: (day: number, weekNum: number) => void;
}

const CertificationTimeline: React.FC<CertificationTimelineProps> = ({
    certifications,
    completedActivities,
    onNavigateToCert
}) => {
    const isDayComplete = (day: number): boolean => {
        const dayInfo = getDayInfo(day);
        if (!dayInfo || !dayInfo.activities || dayInfo.activities.length === 0) return false;
        return dayInfo.activities.every((_, idx) => completedActivities[`${day}-${idx}`]);
    };

    return (
        <div className="bg-white rounded-xl p-6 mb-8 border border-granite-blush/30 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-charcoal">
                <Award size={20} className="text-soft-amethyst" />
                Certification Milestones
            </h3>
            <div className="flex flex-wrap gap-3">
                {Object.entries(certifications).map(([dayStr, cert]: [string, Certification]) => {
                    const day = parseInt(dayStr);
                    const isComplete = isDayComplete(day);
                    const weekNum = Math.ceil(day / 5);

                    return (
                        <button
                            key={day}
                            onClick={() => onNavigateToCert(day, weekNum)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all border
                ${isComplete
                                    ? 'bg-sage-brush text-white border-sage-brush'
                                    : 'bg-bg-secondary text-charcoal border-granite-blush/30 hover:bg-bg-tertiary'}
              `}
                        >
                            <span>{isComplete ? '✅' : cert.icon}</span>
                            <div className="text-left">
                                <div className="text-xs opacity-70">Day {day}</div>
                                <div className="text-sm font-medium">{cert.name}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CertificationTimeline;
