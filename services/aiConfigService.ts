import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AVAILABLE_MODELS = {
    gemini: [
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', speed: 'Fastest', quality: 'Good', cost: 'Free' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', speed: 'Fast', quality: 'Good', cost: '$' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', speed: 'Medium', quality: 'Best', cost: '$$' },
    ],
    openai: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', speed: 'Fast', quality: 'Good', cost: '$' },
    ]
} as const;

export type ModelId =
    | 'gemini-2.0-flash-exp'
    | 'gemini-1.5-flash'
    | 'gemini-1.5-pro'
    | 'gpt-4o-mini';

export interface AIConfig {
    selectedModel: ModelId;
    provider: 'gemini' | 'openai';
}

const DEFAULT_CONFIG: AIConfig = {
    selectedModel: 'gemini-1.5-pro',
    provider: 'gemini'
};

/**
 * Get the current AI configuration
 */
export async function getAIConfig(): Promise<AIConfig> {
    try {
        const configRef = doc(db, 'settings', 'aiConfig');
        const configSnap = await getDoc(configRef);

        if (configSnap.exists()) {
            return configSnap.data() as AIConfig;
        }

        // Initialize with default if doesn't exist
        await setDoc(configRef, DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Error getting AI config:', error);
        return DEFAULT_CONFIG;
    }
}

/**
 * Update the AI configuration
 */
export async function updateAIConfig(config: Partial<AIConfig>): Promise<void> {
    const configRef = doc(db, 'settings', 'aiConfig');
    const current = await getAIConfig();

    const updated: AIConfig = {
        ...current,
        ...config
    };

    await setDoc(configRef, updated);
}

/**
 * Get model info by ID
 */
export function getModelInfo(modelId: ModelId) {
    const allModels = [...AVAILABLE_MODELS.gemini, ...AVAILABLE_MODELS.openai];
    return allModels.find(m => m.id === modelId);
}
