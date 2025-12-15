import React, { useState } from 'react';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { setStartDate } from '../services/firestoreService';
import { getNextMonday, formatWeekRange } from '../utils/dateUtils';

interface OnboardingWizardProps {
    userId: string;
    userName: string;
    onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userId, userName, onComplete }) => {
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        const nextMonday = getNextMonday(today);
        return nextMonday.toISOString().split('T')[0];
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const startDate = new Date(selectedDate + 'T00:00:00');
            await setStartDate(userId, startDate);
            onComplete();
        } catch (error) {
            console.error('Error setting start date:', error);
        } finally {
            setSaving(false);
        }
    };

    const previewDate = new Date(selectedDate + 'T00:00:00');
    const week1Range = formatWeekRange(previewDate, 1);
    const week2Range = formatWeekRange(previewDate, 2);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome, {userName}!</h1>
                    <p className="text-slate-400">Let's set up your onboarding calendar</p>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            When do you start?
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            We recommend starting on a Monday for best alignment
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">Preview</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Week 1</span>
                                <span className="text-white">{week1Range}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Week 2</span>
                                <span className="text-white">{week2Range}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>...</span>
                                <span>12 weeks total</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Start My Journey <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
