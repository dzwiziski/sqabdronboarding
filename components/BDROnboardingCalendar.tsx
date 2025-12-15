import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Users, Phone, CheckCircle, Calendar as CalendarIcon, BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { certifications, phases, activityTargets } from '../data';
import { ActivityState, CertificationEvidence } from '../types';
import { useProgress } from '../hooks';
import { UserProfile } from '../services/firestoreService';
import { getBDROnboardingData, updateCompletedActivities, updateEvidence } from '../services/firestoreService';
import ProgressOverview from './ProgressOverview';
import WeekCard from './WeekCard';
import CertificationTimeline from './CertificationTimeline';
import ManagerGuide from './ManagerGuide';
import BDRSelector from './BDRSelector';
import ManagerDashboard from './ManagerDashboard';

interface BDROnboardingCalendarProps {
  userId: string;
  userProfile: UserProfile;
  targetBdrId: string | null;
  targetBdrName: string;
  onSelectBdr: (id: string, name: string) => void;
  onSignOut: () => void;
}

const BDROnboardingCalendar: React.FC<BDROnboardingCalendarProps> = ({
  userId, userProfile, targetBdrId, targetBdrName, onSelectBdr, onSignOut
}) => {
  const [view, setView] = useState<'calendar' | 'guide' | 'dashboard'>(userProfile.role === 'manager' ? 'dashboard' : 'calendar');
  const [flippedDays, setFlippedDays] = useState<Record<number, boolean>>({});
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedActivities, setCompletedActivities] = useState<ActivityState>({});
  const [evidence, setEvidence] = useState<Record<string, CertificationEvidence>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isManager = userProfile.role === 'manager';
  const effectiveBdrId = isManager ? targetBdrId : userId;

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (!effectiveBdrId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getBDROnboardingData(effectiveBdrId);
        if (data) {
          setCompletedActivities(data.completedActivities || {});
          setEvidence(data.evidence || {});
        } else {
          setCompletedActivities({});
          setEvidence({});
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [effectiveBdrId]);

  const { isDayComplete, getDayProgress, overallProgress, phaseProgress, getWeekProgress } = useProgress({
    completedActivities, phases
  });

  const toggleFlip = useCallback((day: number) => {
    setFlippedDays(prev => ({ ...prev, [day]: !prev[day] }));
  }, []);

  const toggleActivity = useCallback(async (day: number, activityIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!effectiveBdrId) return;

    const key = `${day}-${activityIndex}`;
    const newActivities = { ...completedActivities, [key]: !completedActivities[key] };
    setCompletedActivities(newActivities);

    // Save to Firestore
    setSaving(true);
    try {
      await updateCompletedActivities(effectiveBdrId, newActivities);
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setSaving(false);
    }
  }, [completedActivities, effectiveBdrId]);

  const toggleAllActivities = useCallback(async (day: number, activities: string[], e: React.MouseEvent) => {
    e.stopPropagation();
    if (!effectiveBdrId) return;

    const allCompleted = activities.every((_, idx) => completedActivities[`${day}-${idx}`]);
    const updates: ActivityState = {};
    activities.forEach((_, idx) => { updates[`${day}-${idx}`] = !allCompleted; });
    const newActivities = { ...completedActivities, ...updates };
    setCompletedActivities(newActivities);

    setSaving(true);
    try {
      await updateCompletedActivities(effectiveBdrId, newActivities);
    } catch (error) {
      console.error('Error saving activities:', error);
    } finally {
      setSaving(false);
    }
  }, [completedActivities, effectiveBdrId]);

  const handleSaveEvidence = useCallback(async (day: number, newEvidence: CertificationEvidence) => {
    if (!effectiveBdrId) return;

    const newEvidenceState = { ...evidence, [day]: newEvidence };
    setEvidence(newEvidenceState);

    setSaving(true);
    try {
      await updateEvidence(effectiveBdrId, newEvidenceState);
    } catch (error) {
      console.error('Error saving evidence:', error);
    } finally {
      setSaving(false);
    }
  }, [evidence, effectiveBdrId]);

  const handleRemoveEvidence = useCallback(async (day: number) => {
    if (!effectiveBdrId) return;

    const newEvidenceState = { ...evidence };
    delete newEvidenceState[day];
    setEvidence(newEvidenceState);

    setSaving(true);
    try {
      await updateEvidence(effectiveBdrId, newEvidenceState);
    } catch (error) {
      console.error('Error removing evidence:', error);
    } finally {
      setSaving(false);
    }
  }, [evidence, effectiveBdrId]);

  const handleNavigateToCert = useCallback((day: number, weekNum: number) => {
    setCurrentWeek(Math.max(1, Math.min(9, weekNum - 1)));
    setTimeout(() => { setFlippedDays(prev => ({ ...prev, [day]: true })); }, 300);
  }, []);

  const weeks = [];
  for (let w = 1; w <= 12; w++) {
    const weekDays = [];
    for (let d = 1; d <= 5; d++) {
      const dayNum = (w - 1) * 5 + d;
      if (dayNum <= 90) weekDays.push(dayNum);
    }
    if (weekDays.length > 0) weeks.push({ week: w, days: weekDays });
  }

  const getWeekRange = () => weeks.slice(Math.max(1, currentWeek) - 1, Math.min(12, currentWeek + 3));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  // If manager hasn't selected a BDR and view needs one (calendar/guide), show dashboard
  if (isManager && !effectiveBdrId && view !== 'dashboard') {
    setView('dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">BDR Onboarding & Enablement</h1>
              {saving && <span className="text-xs text-slate-400 flex items-center gap-1"><div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /> Saving...</span>}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              {isManager ? (
                <>
                  <span>Viewing:</span>
                  <span className="text-emerald-400 font-medium">{targetBdrName}</span>
                </>
              ) : (
                <span>Welcome, {userProfile.name}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isManager && <BDRSelector selectedBdrId={targetBdrId} onSelectBdr={onSelectBdr} />}

            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              {isManager && (
                <button onClick={() => setView('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <LayoutDashboard size={16} /> Dashboard
                </button>
              )}
              <button onClick={() => setView('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <CalendarIcon size={16} /> {isManager ? 'BDR View' : 'Onboarding'}
              </button>
              <button onClick={() => setView('guide')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'guide' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <BookOpen size={16} /> Guide
              </button>
            </div>

            <button onClick={onSignOut} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProgressOverview overallProgress={overallProgress} phaseProgress={phaseProgress} phases={phases} />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {phases.map((phase, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-900 rounded-lg p-3 border border-slate-800 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${phase.color} flex-shrink-0 mt-0.5`}></div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white leading-tight">{phase.name}</div>
                    <div className="text-xs text-slate-500">{phase.week ? `Week ${phase.week}` : `Weeks ${phase.weeks}`}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-950/90 backdrop-blur-sm z-20 py-4 border-b border-slate-800/50">
              <button onClick={() => setCurrentWeek(Math.max(1, currentWeek - 4))} disabled={currentWeek <= 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
                <ChevronLeft size={20} /><span className="hidden sm:inline">Previous</span>
              </button>
              <div className="text-lg font-semibold text-center">Weeks {currentWeek} - {Math.min(currentWeek + 3, 12)}</div>
              <button onClick={() => setCurrentWeek(Math.min(9, currentWeek + 4))} disabled={currentWeek >= 9}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
                <span className="hidden sm:inline">Next</span><ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getWeekRange().map((weekData) => (
                <WeekCard key={weekData.week} weekData={weekData} weekProgress={getWeekProgress(weekData.days)}
                  flippedDays={flippedDays} completedActivities={completedActivities} evidence={evidence}
                  isDayComplete={isDayComplete} getDayProgress={getDayProgress} onFlip={toggleFlip}
                  onToggleActivity={toggleActivity} onToggleAll={toggleAllActivities}
                  onSaveEvidence={handleSaveEvidence} onRemoveEvidence={handleRemoveEvidence} />
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={20} className="text-emerald-400" /> Activity Targets by Phase
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {activityTargets.map((target, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Days {target.days}</div>
                    <div className="text-sm font-medium text-white">{target.touches}</div>
                    <div className="text-xs text-emerald-400">Meetings: {target.meetings}</div>
                  </div>
                ))}
              </div>
            </div>

            <CertificationTimeline certifications={certifications} completedActivities={completedActivities} onNavigateToCert={handleNavigateToCert} />

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-400" /> Daily Rhythm (Post-Ramp)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { time: "9:15-11:00 AM", activity: "Prime prospecting block", icon: <Phone size={16} /> },
                  { time: "11:00-12:00 PM", activity: "Account research + LinkedIn", icon: <Users size={16} /> },
                  { time: "1:00-3:00 PM", activity: "Second prospecting block", icon: <Phone size={16} /> },
                  { time: "3:00-4:00 PM", activity: "Follow-ups + CRM hygiene", icon: <CheckCircle size={16} /> },
                  { time: "4:00-5:00 PM", activity: "Call review + learning", icon: <Target size={16} /> }
                ].map((block, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">{block.icon}<span className="text-xs font-medium">{block.time}</span></div>
                    <div className="text-sm text-slate-300">{block.activity}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : view === 'dashboard' && isManager ? (
          <ManagerDashboard onSelectBdr={(id, name) => { onSelectBdr(id, name); setView('calendar'); }} />
        ) : (
          <ManagerGuide
            userId={userId}
            targetBdrId={effectiveBdrId || ''}
            isManager={isManager}
          />
        )}
      </div>
    </div>
  );
};

export default BDROnboardingCalendar;