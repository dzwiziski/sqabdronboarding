import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Target, CheckCircle, MessageSquare, Calendar, Phone, Award, TrendingUp, AlertTriangle, Lightbulb, Shield, ChevronLeft, ChevronRight, Save, Check, CalendarDays, FileText } from 'lucide-react';
import { getManagerNotes, saveManagerNotes } from '../services/firestoreService';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface ManagerGuideProps {
  userId: string;
  targetBdrId: string;
  isManager: boolean;
}

const ManagerGuide: React.FC<ManagerGuideProps> = ({ userId, targetBdrId, isManager }) => {
  const [currentTrackingWeek, setCurrentTrackingWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [weeklySummary, setWeeklySummary] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load notes from Firestore (scoped by BDR for managers)
  useEffect(() => {
    const loadNotes = async () => {
      if (!targetBdrId) { setLoading(false); return; }
      setLoading(true);
      try {
        const data = await getManagerNotes(userId, targetBdrId);
        if (data) {
          setChecklist(data.checklist || {});
          setDailyNotes(data.dailyNotes || {});
          setWeeklySummary(data.weeklySummary || {});
        } else {
          setChecklist({});
          setDailyNotes({});
          setWeeklySummary({});
        }
      } catch (error) {
        console.error('Error loading manager notes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [userId, targetBdrId]);

  // Save to Firestore
  const saveToFirestore = useCallback(async (newChecklist: Record<string, boolean>, newDailyNotes: Record<string, string>, newWeeklySummary: Record<string, string>) => {
    if (!targetBdrId) return;
    setSaving(true);
    try {
      await saveManagerNotes(userId, targetBdrId, { checklist: newChecklist, dailyNotes: newDailyNotes, weeklySummary: newWeeklySummary });
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 2000);
    } catch (error) {
      console.error('Error saving manager notes:', error);
    } finally {
      setSaving(false);
    }
  }, [userId, targetBdrId]);

  const toggleCheck = async (id: string) => {
    const newChecklist = { ...checklist, [id]: !checklist[id] };
    setChecklist(newChecklist);
    await saveToFirestore(newChecklist, dailyNotes, weeklySummary);
  };

  const handleDailyNoteChange = (week: number, day: number, value: string) => {
    setDailyNotes(prev => ({ ...prev, [`w${week}_d${day}`]: value }));
  };

  const handleWeeklySummaryChange = (week: number, value: string) => {
    setWeeklySummary(prev => ({ ...prev, [week.toString()]: value }));
  };

  const handleManualSave = async () => {
    await saveToFirestore(checklist, dailyNotes, weeklySummary);
  };

  const weeklyAggregatedNotes = useMemo(() => DAYS_OF_WEEK.map((d, i) => dailyNotes[`w${currentTrackingWeek}_d${i}`]?.trim() ? `**${d}:**\n${dailyNotes[`w${currentTrackingWeek}_d${i}`]}` : '').filter(Boolean).join('\n\n'), [currentTrackingWeek, dailyNotes]);
  const dailyNotesCount = useMemo(() => DAYS_OF_WEEK.filter((_, i) => dailyNotes[`w${currentTrackingWeek}_d${i}`]?.trim()).length, [currentTrackingWeek, dailyNotes]);

  const weekTasks = [
    { id: 'mon_standup', label: 'Mon Standup' }, { id: 'tue_standup', label: 'Tue Standup' }, { id: 'wed_standup', label: 'Wed Standup' },
    { id: 'thu_standup', label: 'Thu Standup' }, { id: 'fri_standup', label: 'Fri Standup' }, { id: 'weekly_1on1', label: 'Weekly 1:1' },
    { id: 'call_review', label: 'Call Reviews' }, { id: 'roleplay', label: 'Skill Roleplay' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Coaching Tracker */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg"><Users className="text-white" size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-white">Coaching Tracker</h2>
              <p className="text-xs text-slate-400">Track rhythms & document feedback {saving && '• Saving...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700">
            <button onClick={() => setCurrentTrackingWeek(Math.max(1, currentTrackingWeek - 1))} disabled={currentTrackingWeek <= 1} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"><ChevronLeft size={18} className="text-slate-300" /></button>
            <span className="text-sm font-medium text-white min-w-[80px] text-center">Week {currentTrackingWeek}</span>
            <button onClick={() => setCurrentTrackingWeek(Math.min(12, currentTrackingWeek + 1))} disabled={currentTrackingWeek >= 12} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"><ChevronRight size={18} className="text-slate-300" /></button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Weekly Rhythms</h3>
            <div className="grid grid-cols-2 gap-3">
              {weekTasks.map(task => {
                const key = `w${currentTrackingWeek}_${task.id}`;
                const isChecked = !!checklist[key];
                return (
                  <button key={task.id} onClick={() => toggleCheck(key)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all ${isChecked ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-900'}`}>{isChecked && <Check size={12} className="text-white" />}</div>
                    {task.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Manager Activity Completion</span><span>{Math.round((weekTasks.filter(t => checklist[`w${currentTrackingWeek}_${t.id}`]).length / weekTasks.length) * 100)}%</span></div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300 rounded-full" style={{ width: `${(weekTasks.filter(t => checklist[`w${currentTrackingWeek}_${t.id}`]).length / weekTasks.length) * 100}%` }} /></div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2"><CalendarDays size={14} /> Notes</h3>
              {showSaveConfirm && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Saved</span>}
            </div>
            <div className="flex gap-1 mb-3 bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setSelectedDay(null)} className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${selectedDay === null ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                <FileText size={12} /> Weekly Summary {dailyNotesCount > 0 && <span className="bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">{dailyNotesCount}</span>}
              </button>
            </div>
            <div className="flex gap-1 mb-3">
              {DAYS_OF_WEEK.map((day, idx) => {
                const hasNote = dailyNotes[`w${currentTrackingWeek}_d${idx}`]?.trim();
                return (<button key={day} onClick={() => setSelectedDay(idx)} className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all relative ${selectedDay === idx ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>{day.slice(0, 3)}{hasNote && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />}</button>);
              })}
            </div>
            {selectedDay === null ? (
              <div className="flex-1 flex flex-col">
                {weeklyAggregatedNotes && <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto"><div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><CalendarDays size={10} /> Daily Notes Roll-up</div><div className="text-xs text-slate-300 whitespace-pre-wrap">{weeklyAggregatedNotes}</div></div>}
                <textarea value={weeklySummary[currentTrackingWeek] || ''} onChange={(e) => handleWeeklySummaryChange(currentTrackingWeek, e.target.value)} placeholder={`Week ${currentTrackingWeek} Summary...`} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none min-h-[140px]" />
              </div>
            ) : (
              <textarea value={dailyNotes[`w${currentTrackingWeek}_d${selectedDay}`] || ''} onChange={(e) => handleDailyNoteChange(currentTrackingWeek, selectedDay, e.target.value)} placeholder={`${DAYS_OF_WEEK[selectedDay]} notes...`} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none min-h-[200px]" />
            )}
            <div className="mt-2 flex justify-end"><button onClick={handleManualSave} disabled={saving} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-50"><Save size={14} /> Save Notes</button></div>
          </div>
        </div>
      </div>

      {/* Reference Sections - unchanged from before */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-500/20 rounded-lg"><Shield className="text-blue-400" size={24} /></div><h3 className="text-xl font-semibold text-white">Core Responsibilities</h3></div>
          <ul className="space-y-4">
            <li className="flex gap-3"><Target className="text-blue-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Skill Development</strong><p className="text-slate-400 text-sm">Master cold calling, email writing, SPICED qualification.</p></div></li>
            <li className="flex gap-3"><TrendingUp className="text-blue-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Activity Management</strong><p className="text-slate-400 text-sm">Ensure 10-15 quality touches daily.</p></div></li>
            <li className="flex gap-3"><CheckCircle className="text-blue-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Quality Assurance</strong><p className="text-slate-400 text-sm">Review calls and emails for quality.</p></div></li>
          </ul>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-500/20 rounded-lg"><Calendar className="text-purple-400" size={24} /></div><h3 className="text-xl font-semibold text-white">Coaching Rhythms</h3></div>
          <div className="space-y-4">
            <div><h4 className="font-semibold text-purple-300 mb-1">Daily Standup (5-10 min)</h4><p className="text-slate-400 text-sm">9:00 AM - Goals, blockers, learnings</p></div>
            <div><h4 className="font-semibold text-purple-300 mb-1">Weekly 1:1 (60 min)</h4><p className="text-slate-400 text-sm">Update, call review, skill dev, goals</p></div>
          </div>
        </div>
      </div>

      {/* Call Review */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-emerald-500/20 rounded-lg"><Phone className="text-emerald-400" size={24} /></div><h3 className="text-xl font-semibold text-white">Call Review Framework</h3></div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[{ title: "Opening", time: "0-30s", points: ["Clear intro", "Pattern interrupt"] }, { title: "Value Prop", time: "30-60s", points: ["Problem articulation", "Credibility"] }, { title: "Discovery", time: "Middle", points: ["Open questions", "SPICED"] }, { title: "Close", time: "End", points: ["Clear ask", "Scheduling"] }].map((s, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4"><div className="flex justify-between items-center mb-2"><span className="font-semibold text-white">{s.title}</span><span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{s.time}</span></div><ul className="text-sm text-slate-400">{s.points.map((p, j) => <li key={j}>• {p}</li>)}</ul></div>
          ))}
        </div>
        <div className="bg-slate-800/30 rounded-lg p-4 border-l-4 border-emerald-500"><h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2"><MessageSquare size={16} /> SBI Feedback Model</h4><p className="text-sm text-slate-400">Situation → Behavior → Impact</p></div>
      </div>

      {/* Certifications */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-amber-500/20 rounded-lg"><Award className="text-amber-400" size={24} /></div><h3 className="text-xl font-semibold text-white">Certification Checkpoints</h3></div>
        <div className="space-y-3">
          {[{ title: "Week 1: Value Prop", day: "Day 5", desc: "Who SQA is, what we do, differentiators" }, { title: "Week 3: SPICED Roleplay", day: "Day 15", desc: "All 6 elements in 30-min mock call" }, { title: "Week 4: Live Cold Call", day: "Day 20", desc: "Shadow calls, advance 1 to next step" }].map((c, i) => (
            <div key={i} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg"><div className="bg-amber-500/10 text-amber-500 font-bold px-3 py-1 rounded text-sm h-fit">{c.day}</div><div><h4 className="font-semibold text-white">{c.title}</h4><p className="text-sm text-slate-400">{c.desc}</p></div></div>
          ))}
        </div>
      </div>

      {/* Warning Signs */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle className="text-red-400" size={24} /></div><h3 className="text-xl font-semibold text-white">Early Warning Signs</h3></div>
          <ul className="space-y-2 text-sm">{["Week 2: Not executing 3-5 touches/day", "Week 4: Zero conversations", "Day 25: No meetings"].map((w, i) => <li key={i} className="p-2 bg-slate-800/50 rounded text-slate-300">{w}</li>)}</ul>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-500/20 rounded-lg"><Lightbulb className="text-blue-400" size={24} /></div><h3 className="text-xl font-semibold text-white">Intervention Strategies</h3></div>
          <ul className="space-y-2 text-sm text-slate-300"><li><strong>Diagnose:</strong> Skill, Will, or Process?</li><li><strong>Frequency:</strong> Daily call reviews</li><li><strong>Focus:</strong> Narrow to one industry</li></ul>
        </div>
      </div>
    </div>
  );
};

export default ManagerGuide;