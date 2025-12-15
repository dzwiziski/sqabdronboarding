import React, { useState } from 'react';
import { RotateCcw, CheckCircle, CheckSquare, Square, Link as LinkIcon, Upload, Trash2, FileText, Check, Award } from 'lucide-react';
import { DayInfo, Phase, Certification, DayProgress, CertificationEvidence } from '../types';

interface FlipCardProps {
  day: number;
  isFlipped: boolean;
  dayInfo: DayInfo | null;
  phase: Phase | undefined;
  hasCert: Certification | undefined;
  isCompleted: boolean;
  progress: DayProgress;
  completedActivities: Record<string, boolean>;
  evidence: CertificationEvidence | undefined;
  onFlip: (day: number) => void;
  onToggleActivity: (day: number, idx: number, e: React.MouseEvent) => void;
  onToggleAll: (day: number, activities: string[], e: React.MouseEvent) => void;
  onSaveEvidence: (day: number, evidence: CertificationEvidence) => void;
  onRemoveEvidence: (day: number) => void;
}

const FlipCard: React.FC<FlipCardProps> = ({
  day,
  isFlipped,
  dayInfo,
  phase,
  hasCert,
  isCompleted,
  progress,
  completedActivities,
  evidence,
  onFlip,
  onToggleActivity,
  onToggleAll,
  onSaveEvidence,
  onRemoveEvidence
}) => {
  const [evidenceType, setEvidenceType] = useState<'link' | 'file'>('link');
  const [evidenceValue, setEvidenceValue] = useState('');
  const [fileName, setFileName] = useState('');

  const isCertification = !!(dayInfo?.certification || hasCert);

  // Calculate height based on content
  const cardHeight = isFlipped
    ? (isCertification ? '340px' : '280px')
    : '140px';

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!evidenceValue) return;

    onSaveEvidence(day, {
      type: evidenceType,
      value: evidenceValue,
      name: evidenceType === 'file' ? fileName : undefined,
      date: new Date().toISOString()
    });

    // Reset form
    setEvidenceValue('');
    setFileName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB limit for localStorage)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert('File is too large. Please select a file under 2MB.');
      return;
    }

    setFileName(file.name);

    // Convert to Base64 for localStorage persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEvidenceValue(base64String);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="w-full"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s',
          height: cardHeight
        }}
      >
        {/* Front of card */}
        <div
          onClick={() => onFlip(day)}
          className={`
            absolute inset-0 rounded-xl flex flex-col items-center justify-center
            ${isCompleted ? 'bg-sage-brush' : (phase?.color || 'bg-bg-tertiary')}
            border-2 ${isCompleted ? 'border-sage-brush' : 'border-transparent'} hover:border-blue-ridge/30
            transition-colors duration-300 shadow-sm
          `}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            height: '140px'
          }}
        >
          {/* Progress ring */}
          <div className="absolute top-2 left-2">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-white/30"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${progress.percentage * 0.754} 100`}
                  className={isCompleted ? "text-white" : "text-white/80"}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                {progress.completed}/{progress.total}
              </span>
            </div>
          </div>

          <span className="text-4xl font-bold text-white">
            {day}
          </span>
          <span className="text-xs text-white/80 mt-1 font-medium">{dayInfo?.focus}</span>

          {hasCert && (
            <span className="absolute top-2 right-2 text-xl">{hasCert.icon}</span>
          )}
          {dayInfo?.milestone && !hasCert && (
            <span className="absolute top-2 right-2 text-xl">⭐</span>
          )}

          {isCompleted && (
            <span className="absolute bottom-2 text-[10px] text-white/80 font-medium flex items-center gap-1">
              <CheckCircle size={10} /> All complete
            </span>
          )}
          {!isCompleted && (
            <span className="absolute bottom-2 text-[10px] text-white/60">Click to expand</span>
          )}
        </div>

        {/* Back of card - Activity checklist */}
        <div
          className={`
            absolute inset-0 rounded-xl p-3 overflow-hidden
            ${isCompleted ? 'bg-sage-brush/10' : 'bg-white'} 
            border-2 ${isCompleted ? 'border-sage-brush' : (phase?.borderColor || 'border-granite-blush/30')}
            shadow-sm
          `}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            height: cardHeight
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${isCompleted ? 'bg-sage-brush' : phase?.color}`}>
                  Day {day}
                </span>
                <span className="text-[10px] text-granite-blush">{progress.completed}/{progress.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => onToggleAll(day, dayInfo?.activities || [], e)}
                  className="text-[9px] text-granite-blush hover:text-charcoal transition-colors"
                >
                  {isCompleted ? 'Uncheck all' : 'Check all'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onFlip(day); }}
                  className="text-granite-blush hover:text-charcoal"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            <h4 className="text-[11px] font-semibold text-charcoal leading-tight mb-2">
              {dayInfo?.title}
            </h4>

            {/* Scrollable activity list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1 mb-1">
              {dayInfo?.activities.map((activity, idx) => {
                const isChecked = completedActivities[`${day}-${idx}`];
                return (
                  <button
                    key={idx}
                    onClick={(e) => onToggleActivity(day, idx, e)}
                    className={`
                      w-full text-left flex items-start gap-2 p-1.5 rounded
                      transition-all duration-150
                      ${isChecked
                        ? 'bg-sage-brush/20 text-sage-brush'
                        : 'bg-bg-secondary hover:bg-bg-tertiary text-charcoal'}
                    `}
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {isChecked ? (
                        <CheckSquare size={12} className="text-sage-brush" />
                      ) : (
                        <Square size={12} className="text-granite-blush" />
                      )}
                    </span>
                    <span className={`text-[10px] leading-tight ${isChecked ? 'line-through opacity-70' : ''}`}>
                      {activity}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Evidence Section for Certifications */}
            {isCertification && (
              <div className="mt-auto mb-2 pt-2 border-t border-granite-blush/30">
                <div className="text-[10px] font-semibold text-granite-blush mb-1.5 flex items-center gap-1">
                  <Award size={10} className="text-soft-amethyst" />
                  Certification Evidence
                </div>

                {evidence ? (
                  <div className="flex items-center justify-between bg-bg-secondary rounded p-1.5 border border-granite-blush/20">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {evidence.type === 'link' ? (
                        <LinkIcon size={12} className="text-blue-ridge flex-shrink-0" />
                      ) : (
                        <FileText size={12} className="text-sage-brush flex-shrink-0" />
                      )}
                      <a
                        href={evidence.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-ridge hover:underline truncate block"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {evidence.name || evidence.value}
                      </a>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveEvidence(day); }}
                      className="text-granite-blush hover:text-red-500 p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Toggle Type */}
                    <div className="flex gap-2 text-[10px]">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEvidenceType('link'); }}
                        className={`flex-1 py-0.5 rounded border transition-colors ${evidenceType === 'link' ? 'bg-blue-ridge/20 border-blue-ridge/50 text-blue-ridge' : 'border-granite-blush/30 bg-bg-secondary text-granite-blush'}`}
                      >Link</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEvidenceType('file'); }}
                        className={`flex-1 py-0.5 rounded border transition-colors ${evidenceType === 'file' ? 'bg-sage-brush/20 border-sage-brush/50 text-sage-brush' : 'border-granite-blush/30 bg-bg-secondary text-granite-blush'}`}
                      >File</button>
                    </div>

                    {/* Input */}
                    <div className="flex gap-1">
                      {evidenceType === 'link' ? (
                        <input
                          type="text"
                          placeholder="Paste URL..."
                          className="flex-1 bg-bg-secondary border border-granite-blush/30 rounded px-2 py-1 text-[10px] text-charcoal focus:outline-none focus:border-blue-ridge placeholder-granite-blush"
                          value={evidenceValue}
                          onChange={(e) => setEvidenceValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex-1 relative">
                          <input
                            type="file"
                            id={`file-${day}`}
                            className="hidden"
                            onChange={handleFileChange}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor={`file-${day}`}
                            className="block w-full text-center bg-bg-secondary border border-granite-blush/30 border-dashed rounded px-2 py-1 text-[10px] text-granite-blush hover:text-charcoal cursor-pointer hover:border-sage-brush truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {fileName || <span className="flex items-center justify-center gap-1"><Upload size={10} /> Choose File</span>}
                          </label>
                        </div>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={!evidenceValue}
                        className="bg-sage-brush hover:bg-sage-brush/80 disabled:opacity-50 disabled:bg-bg-tertiary text-white rounded px-2 py-1 transition-colors"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar at bottom */}
            <div className="mt-0 pt-2 border-t border-granite-blush/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-granite-blush">Progress</span>
                <span className="text-[9px] font-medium text-charcoal">{progress.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full ${isCompleted ? 'bg-sage-brush' : 'bg-blue-ridge'} transition-all duration-300 rounded-full`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;