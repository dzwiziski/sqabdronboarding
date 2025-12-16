import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';

// Model pricing per 1M tokens (USD) - estimated based on tier
const MODEL_PRICING = {
    'gemini-3-pro': { input: 2.50, output: 10.00 }, // Estimated premium pricing
    'gemini-2.5-pro': { input: 1.25, output: 5.00 },
    'gemini-2.5-flash': { input: 0.075, output: 0.30 },
    'gemini-2.5-flash-lite': { input: 0.00, output: 0.00 }, // Free tier
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-2.0-flash-exp': { input: 0.00, output: 0.00 }, // Free during preview
    'gemini-1.5-pro-latest': { input: 1.25, output: 5.00 }, // Alias
    'gemini-1.5-flash-latest': { input: 0.075, output: 0.30 }, // Alias
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
} as const;

export type AIModel = keyof typeof MODEL_PRICING;
export type AIFeature = 'coaching' | 'summary' | 'roleplay' | 'advice' | 'call-analysis';

export interface AIUsageRecord {
    id?: string;
    timestamp: Timestamp;
    userId: string;
    feature: AIFeature;
    model: AIModel;
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
    latencyMs: number;
}

export interface AIUsageStats {
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostUSD: number;
    byFeature: Record<AIFeature, { calls: number; cost: number }>;
    byModel: Record<string, { calls: number; cost: number }>;
}

/**
 * Calculate cost for a given token usage
 */
export function calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return 0;

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
}

/**
 * Log an AI usage event to Firestore
 */
export async function logAIUsage(
    userId: string,
    feature: AIFeature,
    model: AIModel,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number
): Promise<void> {
    const costUSD = calculateCost(model, inputTokens, outputTokens);

    const record: Omit<AIUsageRecord, 'id'> = {
        timestamp: Timestamp.now(),
        userId,
        feature,
        model,
        inputTokens,
        outputTokens,
        costUSD,
        latencyMs
    };

    try {
        await addDoc(collection(db, 'aiUsage'), record);
    } catch (error) {
        console.error('Failed to log AI usage:', error);
        // Don't throw - logging failure shouldn't break AI features
    }
}

/**
 * Get AI usage statistics for a date range
 */
export async function getAIUsageStats(
    startDate?: Date,
    endDate?: Date
): Promise<AIUsageStats> {
    const usageRef = collection(db, 'aiUsage');
    let q = query(usageRef, orderBy('timestamp', 'desc'));

    if (startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
    }
    if (endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
    }

    const snapshot = await getDocs(q);

    const stats: AIUsageStats = {
        totalCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostUSD: 0,
        byFeature: {} as any,
        byModel: {} as any
    };

    snapshot.docs.forEach(doc => {
        const record = doc.data() as AIUsageRecord;

        stats.totalCalls++;
        stats.totalInputTokens += record.inputTokens;
        stats.totalOutputTokens += record.outputTokens;
        stats.totalCostUSD += record.costUSD;

        // By feature
        if (!stats.byFeature[record.feature]) {
            stats.byFeature[record.feature] = { calls: 0, cost: 0 };
        }
        stats.byFeature[record.feature].calls++;
        stats.byFeature[record.feature].cost += record.costUSD;

        // By model
        if (!stats.byModel[record.model]) {
            stats.byModel[record.model] = { calls: 0, cost: 0 };
        }
        stats.byModel[record.model].calls++;
        stats.byModel[record.model].cost += record.costUSD;
    });

    return stats;
}

/**
 * Get recent AI usage records
 */
export async function getRecentAIUsage(limitCount: number = 50): Promise<AIUsageRecord[]> {
    const usageRef = collection(db, 'aiUsage');
    const q = query(usageRef, orderBy('timestamp', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as AIUsageRecord));
}

/**
 * Export usage data as CSV
 */
export function exportUsageToCSV(records: AIUsageRecord[]): string {
    const headers = ['Date', 'Time', 'Feature', 'Model', 'Input Tokens', 'Output Tokens', 'Cost (USD)', 'Latency (ms)'];
    const rows = records.map(r => [
        r.timestamp.toDate().toLocaleDateString(),
        r.timestamp.toDate().toLocaleTimeString(),
        r.feature,
        r.model,
        r.inputTokens.toString(),
        r.outputTokens.toString(),
        r.costUSD.toFixed(4),
        r.latencyMs.toString()
    ]);

    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
}

/**
 * Get model pricing info
 */
export function getModelPricing() {
    return MODEL_PRICING;
}
