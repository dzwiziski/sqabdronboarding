import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Target,
  CheckCircle,
  MessageSquare,
  Calendar,
  Phone,
  Award,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Shield,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  CalendarDays,
  FileText
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const ManagerGuide: React.FC = () => {
  const [currentTrackingWeek, setCurrentTrackingWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [weeklySummary, setWeeklySummary] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('bdr-manager-tracker');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setChecklist(parsed.checklist || {});
        setDailyNotes(parsed.dailyNotes || {});
        setWeeklySummary(parsed.weeklySummary || parsed.notes || {});
      } catch (e) {
        console.error("Failed to parse manager data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bdr-manager-tracker', JSON.stringify({
      checklist, dailyNotes, weeklySummary
    }));
  }, [checklist, dailyNotes, weeklySummary]);

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDailyNoteChange = (week: number, day: number, value: string) => {
    setDailyNotes(prev => ({ ...prev, [`w${week}_d${day}`]: value }));
  };

  const handleWeeklySummaryChange = (week: number, value: string) => {
    setWeeklySummary(prev => ({ ...prev, [week.toString()]: value }));
  };

  const handleManualSave = () => {
    localStorage.setItem('bdr-manager-tracker', JSON.stringify({ checklist, dailyNotes, weeklySummary }));
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const weeklyAggregatedNotes = useMemo(() => {
    const notes: string[] = [];
    for (let d = 0; d < 5; d++) {
      const note = dailyNotes[`w${currentTrackingWeek}_d${d}`];
      if (note?.trim()) notes.push(`**${DAYS_OF_WEEK[d]}:**\n${note}`);
    }
    return notes.join('\n\n');
  }, [currentTrackingWeek, dailyNotes]);

  const dailyNotesCount = useMemo(() => {
    return DAYS_OF_WEEK.filter((_, d) => dailyNotes[`w${currentTrackingWeek}_d${d}`]?.trim()).length;
  }, [currentTrackingWeek, dailyNotes]);

  const weekTasks = [
    { id: 'mon_standup', label: 'Mon Standup' },
    { id: 'tue_standup', label: 'Tue Standup' },
    { id: 'wed_standup', label: 'Wed Standup' },
    { id: 'thu_standup', label: 'Thu Standup' },
    { id: 'fri_standup', label: 'Fri Standup' },
    { id: 'weekly_1on1', label: 'Weekly 1:1' },
    { id: 'call_review', label: 'Call Reviews' },
    { id: 'roleplay', label: 'Skill Roleplay' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Coaching Tracker */}
      <div className="bg-white border border-granite-blush/30 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-bg-secondary p-4 border-b border-granite-blush/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-ridge rounded-lg">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Coaching Tracker</h2>
              <p className="text-xs text-granite-blush">Track your rhythms & document feedback</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-1.5 rounded-lg border border-granite-blush/30">
            <button onClick={() => setCurrentTrackingWeek(Math.max(1, currentTrackingWeek - 1))} disabled={currentTrackingWeek <= 1}
              className="p-1 hover:bg-bg-tertiary rounded disabled:opacity-30 transition-colors">
              <ChevronLeft size={18} className="text-charcoal" />
            </button>
            <span className="text-sm font-medium text-charcoal min-w-[80px] text-center">Week {currentTrackingWeek}</span>
            <button onClick={() => setCurrentTrackingWeek(Math.min(12, currentTrackingWeek + 1))} disabled={currentTrackingWeek >= 12}
              className="p-1 hover:bg-bg-tertiary rounded disabled:opacity-30 transition-colors">
              <ChevronRight size={18} className="text-charcoal" />
            </button>
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-wider">Weekly Rhythms</h3>
            <div className="grid grid-cols-2 gap-3">
              {weekTasks.map(task => {
                const key = `w${currentTrackingWeek}_${task.id}`;
                const isChecked = !!checklist[key];
                return (
                  <button key={task.id} onClick={() => toggleCheck(key)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all
                      ${isChecked ? 'bg-blue-ridge/10 border-blue-ridge/50 text-blue-ridge' : 'bg-bg-secondary border-granite-blush/30 text-charcoal hover:border-blue-ridge/30'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                      ${isChecked ? 'bg-blue-ridge border-blue-ridge' : 'border-granite-blush bg-white'}`}>
                      {isChecked && <Check size={12} className="text-white" />}
                    </div>
                    {task.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-granite-blush mb-1">
                <span>Manager Activity Completion</span>
                <span>{Math.round((weekTasks.filter(t => checklist[`w${currentTrackingWeek}_${t.id}`]).length / weekTasks.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-blue-ridge transition-all duration-300 rounded-full"
                  style={{ width: `${(weekTasks.filter(t => checklist[`w${currentTrackingWeek}_${t.id}`]).length / weekTasks.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider flex items-center gap-2">
                <CalendarDays size={14} /> Notes
              </h3>
              {showSaveConfirm && <span className="text-xs text-sage-brush flex items-center gap-1"><CheckCircle size={12} /> Saved</span>}
            </div>

            <div className="flex gap-1 mb-3 bg-bg-secondary p-1 rounded-lg">
              <button onClick={() => setSelectedDay(null)}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1
                  ${selectedDay === null ? 'bg-blue-ridge text-white' : 'text-charcoal hover:bg-bg-tertiary'}`}>
                <FileText size={12} /> Weekly Summary
                {dailyNotesCount > 0 && <span className="bg-blue-ridge/30 text-white px-1.5 py-0.5 rounded text-[10px]">{dailyNotesCount}</span>}
              </button>
            </div>

            <div className="flex gap-1 mb-3">
              {DAYS_OF_WEEK.map((day, idx) => {
                const hasNote = dailyNotes[`w${currentTrackingWeek}_d${idx}`]?.trim();
                return (
                  <button key={day} onClick={() => setSelectedDay(idx)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all relative
                      ${selectedDay === idx ? 'bg-sage-brush text-white' : 'bg-bg-secondary text-charcoal hover:bg-bg-tertiary'}`}>
                    {day.slice(0, 3)}
                    {hasNote && <span className="absolute -top-1 -right-1 w-2 h-2 bg-sage-brush rounded-full" />}
                  </button>
                );
              })}
            </div>

            {selectedDay === null ? (
              <div className="flex-1 flex flex-col">
                {weeklyAggregatedNotes && (
                  <div className="bg-bg-secondary border border-granite-blush/20 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-wider text-granite-blush mb-2 flex items-center gap-1">
                      <CalendarDays size={10} /> Daily Notes Roll-up
                    </div>
                    <div className="text-xs text-charcoal whitespace-pre-wrap">{weeklyAggregatedNotes}</div>
                  </div>
                )}
                <textarea value={weeklySummary[currentTrackingWeek] || ''} onChange={(e) => handleWeeklySummaryChange(currentTrackingWeek, e.target.value)}
                  placeholder={`Week ${currentTrackingWeek} Summary:\n• Key wins and progress made\n• Areas needing attention...`}
                  className="flex-1 bg-bg-secondary border border-granite-blush/30 rounded-lg p-4 text-sm text-charcoal placeholder-granite-blush focus:outline-none focus:border-blue-ridge resize-none min-h-[140px]" />
              </div>
            ) : (
              <textarea value={dailyNotes[`w${currentTrackingWeek}_d${selectedDay}`] || ''} onChange={(e) => handleDailyNoteChange(currentTrackingWeek, selectedDay, e.target.value)}
                placeholder={`${DAYS_OF_WEEK[selectedDay]} notes:\n• Coaching moments\n• Key observations...`}
                className="flex-1 bg-bg-secondary border border-granite-blush/30 rounded-lg p-4 text-sm text-charcoal placeholder-granite-blush focus:outline-none focus:border-sage-brush resize-none min-h-[200px]" />
            )}

            <div className="mt-2 flex justify-end">
              <button onClick={handleManualSave} className="text-xs flex items-center gap-1 text-granite-blush hover:text-charcoal transition-colors">
                <Save size={14} /> Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Sections with Light Theme */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-ridge/10 rounded-lg"><Shield className="text-blue-ridge" size={24} /></div>
            <h3 className="text-xl font-semibold text-charcoal">Core Responsibilities</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3"><Target className="text-blue-ridge flex-shrink-0 mt-1" size={18} /><div><strong className="text-charcoal">Skill Development</strong><p className="text-granite-blush text-sm">Master cold calling, email writing, SPICED qualification.</p></div></li>
            <li className="flex gap-3"><TrendingUp className="text-blue-ridge flex-shrink-0 mt-1" size={18} /><div><strong className="text-charcoal">Activity Management</strong><p className="text-granite-blush text-sm">Ensure 10-15 quality touches daily.</p></div></li>
            <li className="flex gap-3"><CheckCircle className="text-blue-ridge flex-shrink-0 mt-1" size={18} /><div><strong className="text-charcoal">Quality Assurance</strong><p className="text-granite-blush text-sm">Review calls and emails for quality.</p></div></li>
          </ul>
        </div>

        <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-soft-amethyst/10 rounded-lg"><Calendar className="text-soft-amethyst" size={24} /></div>
            <h3 className="text-xl font-semibold text-charcoal">Coaching Rhythms</h3>
          </div>
          <div className="space-y-4">
            <div><h4 className="font-semibold text-soft-amethyst mb-1">Daily Standup (5-10 min)</h4><p className="text-granite-blush text-sm">9:00 AM - Goals, blockers, learnings</p></div>
            <div><h4 className="font-semibold text-soft-amethyst mb-1">Weekly 1:1 (60 min)</h4><p className="text-granite-blush text-sm">Update, call review, skill dev, goals</p></div>
          </div>
        </div>
      </div>

      {/* Call Review */}
      <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-sage-brush/10 rounded-lg"><Phone className="text-sage-brush" size={24} /></div>
          <h3 className="text-xl font-semibold text-charcoal">Call Review Framework</h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[{ title: "Opening", time: "0-30s", points: ["Clear intro", "Pattern interrupt"] },
          { title: "Value Prop", time: "30-60s", points: ["Problem articulation", "Credibility"] },
          { title: "Discovery", time: "Middle", points: ["Open questions", "SPICED"] },
          { title: "Close", time: "End", points: ["Clear ask", "Scheduling"] }
          ].map((s, i) => (
            <div key={i} className="bg-bg-secondary rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-charcoal">{s.title}</span>
                <span className="text-xs text-sage-brush bg-sage-brush/10 px-2 py-0.5 rounded">{s.time}</span>
              </div>
              <ul className="text-sm text-granite-blush">{s.points.map((p, j) => <li key={j}>• {p}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="bg-bg-secondary rounded-lg p-4 border-l-4 border-sage-brush">
          <h4 className="font-semibold text-sage-brush mb-2 flex items-center gap-2"><MessageSquare size={16} />SBI Feedback Model</h4>
          <p className="text-sm text-granite-blush">Situation → Behavior → Impact</p>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-soft-amethyst/10 rounded-lg"><Award className="text-soft-amethyst" size={24} /></div>
          <h3 className="text-xl font-semibold text-charcoal">Certification Checkpoints</h3>
        </div>
        <div className="space-y-3">
          {[{ title: "Week 1: Value Prop", day: "Day 5", desc: "Who SQA is, what we do, differentiators" },
          { title: "Week 3: SPICED Roleplay", day: "Day 15", desc: "All 6 elements in 30-min mock call" },
          { title: "Week 4: Live Cold Call", day: "Day 20", desc: "Shadow calls, advance 1 to next step" }
          ].map((c, i) => (
            <div key={i} className="flex gap-4 p-4 bg-bg-secondary rounded-lg">
              <div className="bg-soft-amethyst/10 text-soft-amethyst font-bold px-3 py-1 rounded text-sm h-fit">{c.day}</div>
              <div><h4 className="font-semibold text-charcoal">{c.title}</h4><p className="text-sm text-granite-blush">{c.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Signs & Interventions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="text-red-500" size={24} /></div>
            <h3 className="text-xl font-semibold text-charcoal">Early Warning Signs</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {["Week 2: Not executing 3-5 touches/day", "Week 4: Zero conversations", "Day 25: No meetings"].map((w, i) => (
              <li key={i} className="p-2 bg-bg-secondary rounded text-granite-blush">{w}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-ridge/10 rounded-lg"><Lightbulb className="text-blue-ridge" size={24} /></div>
            <h3 className="text-xl font-semibold text-charcoal">Intervention Strategies</h3>
          </div>
          <ul className="space-y-2 text-sm text-charcoal">
            <li><strong>Diagnose:</strong> Skill, Will, or Process?</li>
            <li><strong>Frequency:</strong> Daily call reviews</li>
            <li><strong>Focus:</strong> Narrow to one industry</li>
          </ul>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white border border-granite-blush/30 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-charcoal mb-6">Manager Roadmap</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[{ month: "Month 1", title: "Foundation", desc: "Build trust, heavy shadowing", color: "blue-ridge" },
          { month: "Month 2", title: "Accountability", desc: "Daily goals, 4 meetings by Day 60", color: "soft-amethyst" },
          { month: "Month 3", title: "Strategic", desc: "Independence, 6+ meetings", color: "sage-brush" }
          ].map((m, i) => (
            <div key={i} className={`pl-4 border-l-2 border-${m.color}`}>
              <h4 className="font-bold text-charcoal mb-1">{m.month}: {m.title}</h4>
              <p className="text-sm text-granite-blush">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerGuide;