import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Target, Users, Phone, CheckCircle, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { certifications, phases, activityTargets } from '../data';
import { ActivityState, CertificationEvidence } from '../types';
import { useLocalStorage, useProgress } from '../hooks';
import ProgressOverview from './ProgressOverview';
import WeekCard from './WeekCard';
import CertificationTimeline from './CertificationTimeline';
import ManagerGuide from './ManagerGuide';

const BDROnboardingCalendar: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'guide'>('calendar');
  const [flippedDays, setFlippedDays] = useState<Record<number, boolean>>({});
  const [currentWeek, setCurrentWeek] = useState(1);

  // Use localStorage hooks for persistence
  const [completedActivities, setCompletedActivities, clearActivities] = useLocalStorage<ActivityState>(
    'bdr-onboarding-activities',
    {}
  );
  const [evidence, setEvidence, clearEvidence] = useLocalStorage<Record<string, CertificationEvidence>>(
    'bdr-onboarding-evidence',
    {}
  );

  // Use progress hook for calculations
  const { isDayComplete, getDayProgress, overallProgress, phaseProgress, getWeekProgress } = useProgress({
    completedActivities,
    phases
  });

  const toggleFlip = useCallback((day: number) => {
    setFlippedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  }, []);

  const toggleActivity = useCallback((day: number, activityIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${day}-${activityIndex}`;
    setCompletedActivities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, [setCompletedActivities]);

  const toggleAllActivities = useCallback((day: number, activities: string[], e: React.MouseEvent) => {
    e.stopPropagation();
    const allCompleted = activities.every((_, idx) => completedActivities[`${day}-${idx}`]);

    const updates: ActivityState = {};
    activities.forEach((_, idx) => {
      updates[`${day}-${idx}`] = !allCompleted;
    });

    setCompletedActivities(prev => ({
      ...prev,
      ...updates
    }));
  }, [completedActivities, setCompletedActivities]);

  const handleSaveEvidence = useCallback((day: number, newEvidence: CertificationEvidence) => {
    setEvidence(prev => ({
      ...prev,
      [day]: newEvidence
    }));
  }, [setEvidence]);

  const handleRemoveEvidence = useCallback((day: number) => {
    setEvidence(prev => {
      const newState = { ...prev };
      delete newState[day];
      return newState;
    });
  }, [setEvidence]);

  const handleNavigateToCert = useCallback((day: number, weekNum: number) => {
    const startWeek = Math.max(1, Math.min(9, weekNum - 1));
    setCurrentWeek(startWeek);
    setTimeout(() => {
      setFlippedDays(prev => ({ ...prev, [day]: true }));
    }, 300);
  }, []);

  const handleResetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      clearActivities();
      clearEvidence();
    }
  }, [clearActivities, clearEvidence]);

  // Generate weeks data
  const weeks = [];
  for (let w = 1; w <= 12; w++) {
    const weekDays = [];
    for (let d = 1; d <= 5; d++) {
      const dayNum = (w - 1) * 5 + d;
      if (dayNum <= 90) {
        weekDays.push(dayNum);
      }
    }
    if (weekDays.length > 0) {
      weeks.push({ week: w, days: weekDays });
    }
  }

  const getWeekRange = () => {
    const startWeek = Math.max(1, currentWeek);
    const endWeek = Math.min(12, currentWeek + 3);
    return weeks.slice(startWeek - 1, endWeek);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-charcoal p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">BDR Onboarding & Enablement</h1>
            <p className="text-granite-blush">SQA Services • Foundation to Full Ramp</p>
          </div>

          <div className="flex bg-bg-tertiary p-1 rounded-lg border border-granite-blush/30 self-start md:self-auto">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'calendar'
                  ? 'bg-blue-ridge text-white shadow-lg'
                  : 'text-charcoal hover:text-blue-ridge hover:bg-bg-secondary'
                }`}
            >
              <CalendarIcon size={16} />
              Onboarding Track
            </button>
            <button
              onClick={() => setView('guide')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'guide'
                  ? 'bg-blue-ridge text-white shadow-lg'
                  : 'text-charcoal hover:text-blue-ridge hover:bg-bg-secondary'
                }`}
            >
              <BookOpen size={16} />
              Manager's Guide
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Progress Overview */}
            <ProgressOverview
              overallProgress={overallProgress}
              phaseProgress={phaseProgress}
              phases={phases}
            />

            {/* Phase Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {phases.map((phase, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-granite-blush/30 shadow-sm">
                  <div className={`w-3 h-3 rounded-full ${phase.color} flex-shrink-0`}></div>
                  <div>
                    <div className="text-xs font-medium text-charcoal truncate" title={phase.name}>{phase.name}</div>
                    <div className="text-xs text-granite-blush">
                      {phase.week ? `Week ${phase.week}` : `Weeks ${phase.weeks}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-bg-primary/90 backdrop-blur-sm z-20 py-4 border-b border-granite-blush/20">
              <button
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 4))}
                disabled={currentWeek <= 1}
                className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary rounded-lg hover:bg-granite-blush/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-granite-blush/30"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="text-lg font-semibold text-center text-charcoal">
                Weeks {currentWeek} - {Math.min(currentWeek + 3, 12)}
              </div>
              <button
                onClick={() => setCurrentWeek(Math.min(9, currentWeek + 4))}
                disabled={currentWeek >= 9}
                className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary rounded-lg hover:bg-granite-blush/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-granite-blush/30"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid with Week Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getWeekRange().map((weekData) => (
                <WeekCard
                  key={weekData.week}
                  weekData={weekData}
                  weekProgress={getWeekProgress(weekData.days)}
                  flippedDays={flippedDays}
                  completedActivities={completedActivities}
                  evidence={evidence}
                  isDayComplete={isDayComplete}
                  getDayProgress={getDayProgress}
                  onFlip={toggleFlip}
                  onToggleActivity={toggleActivity}
                  onToggleAll={toggleAllActivities}
                  onSaveEvidence={handleSaveEvidence}
                  onRemoveEvidence={handleRemoveEvidence}
                />
              ))}
            </div>

            {/* Activity Targets Summary */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-granite-blush/30 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-charcoal">
                <Target size={20} className="text-sage-brush" />
                Activity Targets by Phase
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {activityTargets.map((target, idx) => (
                  <div key={idx} className="bg-bg-secondary rounded-lg p-3 border border-granite-blush/20">
                    <div className="text-xs text-granite-blush mb-1">Days {target.days}</div>
                    <div className="text-sm font-medium text-charcoal">{target.touches}</div>
                    <div className="text-xs text-sage-brush">Meetings: {target.meetings}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Timeline */}
            <CertificationTimeline
              certifications={certifications}
              completedActivities={completedActivities}
              onNavigateToCert={handleNavigateToCert}
            />

            {/* Daily Rhythm Reference */}
            <div className="bg-white rounded-xl p-6 border border-granite-blush/30 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-charcoal">
                <CalendarIcon size={20} className="text-blue-ridge" />
                Daily Rhythm (Post-Ramp)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { time: "9:15-11:00 AM", activity: "Prime prospecting block", icon: <Phone size={16} /> },
                  { time: "11:00-12:00 PM", activity: "Account research + LinkedIn", icon: <Users size={16} /> },
                  { time: "1:00-3:00 PM", activity: "Second prospecting block", icon: <Phone size={16} /> },
                  { time: "3:00-4:00 PM", activity: "Follow-ups + CRM hygiene", icon: <CheckCircle size={16} /> },
                  { time: "4:00-5:00 PM", activity: "Call review + learning", icon: <Target size={16} /> }
                ].map((block, idx) => (
                  <div key={idx} className="bg-bg-secondary rounded-lg p-3 border border-granite-blush/20">
                    <div className="flex items-center gap-2 text-blue-ridge mb-1">
                      {block.icon}
                      <span className="text-xs font-medium">{block.time}</span>
                    </div>
                    <div className="text-sm text-charcoal">{block.activity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Progress Button */}
            <div className="mt-8 text-center pb-8">
              <button
                onClick={handleResetProgress}
                className="text-sm text-granite-blush hover:text-red-500 transition-colors"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        ) : (
          <ManagerGuide />
        )}
      </div>
    </div>
  );
};

export default BDROnboardingCalendar;