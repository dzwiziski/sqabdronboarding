import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, DollarSign, Zap, Download, RefreshCw } from 'lucide-react';
import { getAIConfig, updateAIConfig, AVAILABLE_MODELS, type ModelId } from '../services/aiConfigService';
import { getAIUsageStats, getRecentAIUsage, exportUsageToCSV, type AIUsageStats, type AIUsageRecord } from '../services/aiUsageService';

const AISettingsPanel: React.FC = () => {
    const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-2.5-flash');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<AIUsageStats | null>(null);
    const [recentUsage, setRecentUsage] = useState<AIUsageRecord[]>([]);
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

    useEffect(() => {
        loadConfig();
        loadStats();
    }, [dateRange]);

    const loadConfig = async () => {
        setLoading(true);
        const config = await getAIConfig();
        setSelectedModel(config.selectedModel);
        setLoading(false);
    };

    const loadStats = async () => {
        const now = new Date();
        let startDate: Date | undefined;

        switch (dateRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
        }

        const [usageStats, recent] = await Promise.all([
            getAIUsageStats(startDate),
            getRecentAIUsage(20)
        ]);

        setStats(usageStats);
        setRecentUsage(recent);
    };

    const handleModelChange = async (modelId: ModelId) => {
        setSaving(true);
        setSelectedModel(modelId);
        await updateAIConfig({ selectedModel: modelId });
        setSaving(false);
    };

    const handleExportCSV = () => {
        const csv = exportUsageToCSV(recentUsage);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-usage-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading AI settings...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Model Selection */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Brain size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">AI Model Selection</h2>
                        <p className="text-sm text-slate-400">Choose which model to use for AI features</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVAILABLE_MODELS.gemini.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => handleModelChange(model.id as ModelId)}
                            disabled={saving}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${selectedModel === model.id
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-white text-sm">{model.name}</h3>
                                {selectedModel === model.id && (
                                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                )}
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-slate-400">
                                    <span>Speed:</span>
                                    <span className="text-white">{model.speed}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Quality:</span>
                                    <span className="text-white">{model.quality}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Cost:</span>
                                    <span className="text-white">{model.cost}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <TrendingUp size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Usage Statistics</h2>
                            <p className="text-sm text-slate-400">AI token consumption and costs</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="today">Today</option>
                            <option value="week">Past Week</option>
                            <option value="month">Past Month</option>
                            <option value="all">All Time</option>
                        </select>
                        <button
                            onClick={loadStats}
                            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {stats && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <Zap size={12} />
                                    Total Calls
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalCalls}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div className="text-slate-400 text-xs mb-1">Input Tokens</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {(stats.totalInputTokens / 1000).toFixed(1)}K
                                </div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div className="text-slate-400 text-xs mb-1">Output Tokens</div>
                                <div className="text-2xl font-bold text-emerald-400">
                                    {(stats.totalOutputTokens / 1000).toFixed(1)}K
                                </div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                    <DollarSign size={12} />
                                    Total Cost
                                </div>
                                <div className="text-2xl font-bold text-amber-400">
                                    ${stats.totalCostUSD.toFixed(4)}
                                </div>
                            </div>
                        </div>

                        {/* Feature Breakdown */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-white mb-3">By Feature</h3>
                            <div className="space-y-2">
                                {Object.entries(stats.byFeature).map(([feature, data]) => (
                                    <div key={feature} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-medium text-white capitalize">{feature}</div>
                                            <div className="text-xs text-slate-400">{data.calls} calls</div>
                                        </div>
                                        <div className="text-sm text-amber-400">${data.cost.toFixed(4)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-white">Recent Activity</h3>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-white transition-colors"
                                >
                                    <Download size={14} />
                                    Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-400 border-b border-slate-800">
                                            <th className="pb-2 font-medium">Time</th>
                                            <th className="pb-2 font-medium">Feature</th>
                                            <th className="pb-2 font-medium">Model</th>
                                            <th className="pb-2 font-medium text-right">Tokens In</th>
                                            <th className="pb-2 font-medium text-right">Tokens Out</th>
                                            <th className="pb-2 font-medium text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsage.map((record, idx) => (
                                            <tr key={idx} className="border-b border-slate-800/50">
                                                <td className="py-2 text-slate-400">
                                                    {record.timestamp.toDate().toLocaleTimeString()}
                                                </td>
                                                <td className="py-2 text-white capitalize">{record.feature}</td>
                                                <td className="py-2 text-slate-400 text-xs">{record.model}</td>
                                                <td className="py-2 text-right text-blue-400">{record.inputTokens}</td>
                                                <td className="py-2 text-right text-emerald-400">{record.outputTokens}</td>
                                                <td className="py-2 text-right text-amber-400">
                                                    ${record.costUSD.toFixed(4)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AISettingsPanel;
