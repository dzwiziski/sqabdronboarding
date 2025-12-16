// AI Service supporting multiple LLM providers (Gemini, OpenAI)

type LLMProvider = 'gemini' | 'openai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const LLM_PROVIDER = (import.meta.env.VITE_LLM_PROVIDER as LLMProvider) || 'gemini';

export interface CoachingRecommendation {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
}

export interface BDRProgressData {
    name: string;
    completedDays: number;
    expectedDay: number;
    daysOffset: number;
    status: 'ahead' | 'on-track' | 'behind' | 'not-started';
    progressPercentage: number;
}

// Gemini API call
async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// OpenAI API call
async function callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt }
            ],
            max_tokens: 1024,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

// Unified LLM call using configured provider
async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
    const provider = getActiveProvider();
    if (provider === 'openai') {
        return callOpenAI(prompt, systemPrompt);
    }
    return callGemini(prompt, systemPrompt);
}

// Parse JSON from LLM response (handles markdown code blocks)
function parseJSONResponse(response: string): any {
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '');
    }
    return jsonStr;
}

export async function getSmartCoachingRecommendations(bdr: BDRProgressData): Promise<CoachingRecommendation[]> {
    const systemPrompt = `You are an expert sales manager and BDR coach. You help managers coach their BDRs through a 60-day onboarding program.

Program phases:
- Week 1: Foundation & Orientation
- Week 2: ICP Deep Dive + Prospecting Launch  
- Week 3: Qualification Deep Dive (SPICED methodology)
- Week 4: Live Calling & First Meetings
- Weeks 5-8: Building Pipeline
- Weeks 9-12: Quota Achievement

Provide actionable, specific coaching recommendations.`;

    const userPrompt = `Analyze this BDR's progress and provide 2-3 specific coaching recommendations:

BDR: ${bdr.name}
Status: ${bdr.status}
Progress: Day ${bdr.completedDays} of 60 (${bdr.progressPercentage}% complete)
Expected Day: ${bdr.expectedDay}
${bdr.daysOffset !== 0 ? `Days ${bdr.daysOffset > 0 ? 'ahead' : 'behind'}: ${Math.abs(bdr.daysOffset)}` : 'On track'}

Return ONLY a JSON array (no markdown):
[{"priority": "high|medium|low", "title": "Brief title", "description": "Why this matters", "action": "Specific action"}]`;

    try {
        const response = await callLLM(userPrompt, systemPrompt);
        const jsonStr = parseJSONResponse(response);
        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error('Error getting coaching recommendations:', error);
        return [];
    }
}

export async function getDailyActivityAdvice(
    bdr: BDRProgressData,
    currentWeek: number
): Promise<{ priorities: string[]; reasoning: string }> {
    const systemPrompt = `You are a BDR productivity coach helping BDRs prioritize daily activities.`;

    const userPrompt = `BDR needs daily guidance:
Name: ${bdr.name}, Week: ${currentWeek}, Day ${bdr.completedDays}/60, Status: ${bdr.status}

Suggest top 3 priorities and brief reasoning.
Return ONLY JSON (no markdown): {"priorities": ["Activity 1", "Activity 2", "Activity 3"], "reasoning": "Brief explanation"}`;

    try {
        const response = await callLLM(userPrompt, systemPrompt);
        const jsonStr = parseJSONResponse(response);
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { priorities: [], reasoning: '' };
    } catch (error) {
        console.error('Error getting daily advice:', error);
        return { priorities: [], reasoning: '' };
    }
}

export async function analyzeCallTranscript(transcript: string): Promise<{
    scores: { category: string; score: number; feedback: string }[];
    overallScore: number;
    strengths: string[];
    improvements: string[];
}> {
    const systemPrompt = `You are a sales call analyst using the SPICED framework (Situation, Pain, Impact, Critical Event, Decision, Champion).`;

    const userPrompt = `Analyze this call transcript:

${transcript}

Return ONLY JSON (no markdown):
{"scores": [{"category": "Opening & Hook", "score": 1-10, "feedback": "..."},...], "overallScore": 1-10, "strengths": [...], "improvements": [...]}`;

    const response = await callLLM(userPrompt, systemPrompt);
    const jsonStr = parseJSONResponse(response);
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Invalid response format');
}

export async function generateWeeklySummary(
    bdrs: BDRProgressData[]
): Promise<{ summary: string; needsAttention: string[]; wins: string[]; recommendations: string[] }> {
    const systemPrompt = `You are a sales enablement leader generating weekly BDR team reports.`;

    const bdrSummary = bdrs.map(b => `- ${b.name}: ${b.status} (Day ${b.completedDays}, ${b.progressPercentage}%)`).join('\n');

    const userPrompt = `Generate weekly summary:

${bdrSummary}

Stats: ${bdrs.length} total, ${bdrs.filter(b => b.status === 'ahead').length} ahead, ${bdrs.filter(b => b.status === 'on-track').length} on track, ${bdrs.filter(b => b.status === 'behind').length} behind

Return ONLY JSON (no markdown):
{"summary": "2-3 sentences", "needsAttention": [...], "wins": [...], "recommendations": [...]}`;

    const response = await callLLM(userPrompt, systemPrompt);
    const jsonStr = parseJSONResponse(response);
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Invalid response format');
}

export type RoleplayScenario = 'cold-call' | 'discovery' | 'objection' | 'closing';

export interface RoleplayMessage {
    role: 'user' | 'prospect';
    content: string;
}

const SCENARIO_PROMPTS: Record<RoleplayScenario, string> = {
    'cold-call': `You are a busy VP of Sales at a mid-market SaaS company. A BDR is cold calling you. 
Be realistic - you're skeptical but not rude. You have limited time. 
Ask about their company if the pitch is good. Push back on vague claims.
If they handle objections well, show some interest in a follow-up.`,

    'discovery': `You are a Director of Operations who agreed to a discovery call.
You have real pain points around efficiency and cost. Share them if asked good questions.
Be slightly guarded at first. Open up more if the BDR asks thoughtful questions.
Don't volunteer information - make them work for it through good questioning.`,

    'objection': `You are an interested prospect but have concerns: budget constraints, timing issues, and a competitor relationship.
Raise these objections naturally throughout the conversation.
If the BDR handles them well with specifics, start to soften.
If they give generic responses, push back harder.`,

    'closing': `You are a prospect who has done discovery and a demo. You're 70% convinced.
You need to get approval from your CFO. You're worried about implementation time.
If the BDR helps you build a business case and addresses concerns, commit to next steps.
Don't make it easy - make them earn the commitment.`
};

export async function roleplayChat(
    scenario: RoleplayScenario,
    conversationHistory: RoleplayMessage[],
    userMessage: string
): Promise<string> {
    const scenarioPrompt = SCENARIO_PROMPTS[scenario];

    const systemPrompt = `${scenarioPrompt}

IMPORTANT RULES:
- Stay in character as the prospect throughout
- Keep responses concise (2-4 sentences max)
- React realistically to what the BDR says
- Don't give coaching feedback during the conversation
- Just respond as the prospect would`;

    const historyContext = conversationHistory.map(m =>
        `${m.role === 'user' ? 'BDR' : 'Prospect'}: ${m.content}`
    ).join('\n');

    const userPrompt = `Previous conversation:
${historyContext}

BDR: ${userMessage}

Respond as the prospect (2-4 sentences, stay in character):`;

    return await callLLM(userPrompt, systemPrompt);
}

export async function getRoleplayFeedback(
    scenario: RoleplayScenario,
    conversation: RoleplayMessage[]
): Promise<{ score: number; strengths: string[]; improvements: string[]; tips: string[] }> {
    const systemPrompt = `You are a sales coach analyzing a practice roleplay session.`;

    const convoText = conversation.map(m =>
        `${m.role === 'user' ? 'BDR' : 'Prospect'}: ${m.content}`
    ).join('\n');

    const userPrompt = `Analyze this ${scenario} roleplay practice:

${convoText}

Provide feedback. Return ONLY JSON (no markdown):
{"score": 1-10, "strengths": ["strength 1", "strength 2"], "improvements": ["area 1", "area 2"], "tips": ["specific tip 1", "specific tip 2"]}`;

    const response = await callLLM(userPrompt, systemPrompt);
    const jsonStr = parseJSONResponse(response);
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Invalid response format');
}

export function isAIConfigured(): boolean {
    return !!(GEMINI_API_KEY || OPENAI_API_KEY);
}

export function getActiveProvider(): LLMProvider {
    if (LLM_PROVIDER === 'openai' && OPENAI_API_KEY) return 'openai';
    if (GEMINI_API_KEY) return 'gemini';
    if (OPENAI_API_KEY) return 'openai';
    return 'gemini';
}
