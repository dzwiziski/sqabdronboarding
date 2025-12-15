import { Certification, DayInfo, Phase, ActivityTarget } from './types';

export const certifications: Record<number, Certification> = {
  5: { name: "Value Prop Pitch", icon: "🎯" },
  10: { name: "Account Research Mastery", icon: "🎯" },
  15: { name: "SPICED Discovery Call", icon: "🎯" },
  20: { name: "Live Cold Calling", icon: "🎯" },
  45: { name: "Mid-Ramp Review", icon: "🎯" },
  60: { name: "Advanced SPICED", icon: "🎯" },
  90: { name: "Full Cycle Mastery", icon: "🏆" }
};

export const phases: Phase[] = [
  { name: "Foundation & Orientation", days: [1, 5], color: "bg-blue-500", borderColor: "border-blue-500", week: 1 },
  { name: "ICP Deep Dive + Prospecting Launch", days: [6, 10], color: "bg-indigo-500", borderColor: "border-indigo-500", week: 2 },
  { name: "Qualification Deep Dive", days: [11, 15], color: "bg-purple-500", borderColor: "border-purple-500", week: 3 },
  { name: "Live Calling & First Meetings", days: [16, 20], color: "bg-violet-500", borderColor: "border-violet-500", week: 4 },
  { name: "Building Pipeline", days: [21, 60], color: "bg-emerald-500", borderColor: "border-emerald-500", weeks: "5-8" },
  { name: "Quota Achievement", days: [61, 90], color: "bg-amber-500", borderColor: "border-amber-500", weeks: "9-12" }
];

export const activityTargets: ActivityTarget[] = [
  { days: "1-5", touches: "Learning", meetings: "-" },
  { days: "6-10", touches: "3-5/day", meetings: "-" },
  { days: "11-15", touches: "5-8/day", meetings: "-" },
  { days: "16-30", touches: "10-12/day", meetings: "2" },
  { days: "31-60", touches: "10-15/day", meetings: "4 total" },
  { days: "61-90", touches: "10-15/day", meetings: "6+ (12 total)" }
];

export const staticDayDetails: Record<number, DayInfo> = {
  1: {
    title: "Welcome & Setup",
    activities: [
      "9:00 AM - Kickoff with Karla & Adam",
      "10:00 AM - HR orientation",
      "11:00 AM - IT/Systems setup",
      "Complete 'About Me' tab in Master Workbook",
      "Review Resources tab in Master Workbook",
      "Review GTM Foundations Deck",
      "Read ICP & Persona Playbook",
      "Explore sqaservices.com & STEPQ platform",
      "EOD check-in with Karla"
    ],
    focus: "Orientation"
  },
  2: {
    title: "Learn from the Best",
    activities: [
      "Meet AE #1 (30 min introduction)",
      "Shadow first discovery call",
      "Meet AE #2 (30 min introduction)",
      "Study GTM Foundations Assessment Deck",
      "Read ICP & Buyer Personas deep dive",
      "Draft 60-second value prop pitch"
    ],
    focus: "AE Shadowing"
  },
  3: {
    title: "SPICED Framework Training",
    activities: [
      "SPICED training with Adam (60 min)",
      "Read Discovery Call Blueprint",
      "Shadow another discovery call",
      "Read SPICED Qualification Framework Guide",
      "Study FDA/cGMP regulatory primer",
      "Study ISO 13485 regulatory primer",
      "Study AS9100 regulatory primer",
      "Practice value prop pitch"
    ],
    focus: "SPICED Training"
  },
  4: {
    title: "Customer Success & Competitive Intel",
    activities: [
      "Meet Nick Healy, Head of CS (30 min)",
      "Shadow another AE call",
      "Review Competitive Battle Cards",
      "Study customer case studies",
      "Review customer success stories",
      "Practice value prop pitch with colleague"
    ],
    focus: "CS & Intel"
  },
  5: {
    title: "First Certification & Week 1 Review",
    certification: true,
    activities: [
      "🎯 Deliver Value Prop Pitch to Karla (3-5 min)",
      "Cover: Who SQA is",
      "Cover: What we do",
      "Cover: Who we serve",
      "Cover: Key differentiators",
      "SPICED framework review with Adam & Karla",
      "Week 1 reflection - wins & challenges",
      "Preview Week 2 prospecting launch plan"
    ],
    focus: "Certification"
  },
  6: {
    title: "Prospecting Launch",
    activities: [
      "Shadow 1-2 AE calls",
      "Meet AE #3 (30 min introduction)",
      "Complete 3-5 prospecting touches",
      "Build target account list in Sales Navigator",
      "Research accounts using Account Research Template",
      "Log all activities in HubSpot"
    ],
    focus: "Prospecting Start"
  },
  7: {
    title: "Prospecting Ramp",
    activities: [
      "Shadow AE calls",
      "Complete 3-5 prospecting touches",
      "Make cold calls using Call Script Framework",
      "Send personalized emails using Email Template Library",
      "LinkedIn connection requests and messages",
      "Industry deep dive: Life Sciences (FDA/cGMP)"
    ],
    focus: "Prospecting"
  },
  8: {
    title: "Account Research Focus",
    activities: [
      "Shadow AE calls",
      "Meet AE #4 (30 min introduction)",
      "Complete 3-5 prospecting touches",
      "Deep research on 2-3 target accounts",
      "Industry deep dive: Medical Devices (ISO 13485)",
      "Log all activities in HubSpot"
    ],
    focus: "Research"
  },
  9: {
    title: "Multi-Touch Campaigns",
    activities: [
      "Shadow AE calls",
      "Complete 3-5 prospecting touches",
      "Industry deep dive: Aerospace (AS9100)",
      "Review Objection Handling Library",
      "Prepare 5 accounts for certification",
      "Plan multi-touch campaign for each account"
    ],
    focus: "Campaigns"
  },
  10: {
    title: "Account Research Certification",
    certification: true,
    activities: [
      "🎯 Present research on 5 accounts to Karla & Adam",
      "Demonstrate ICP fit analysis",
      "Present pain point hypotheses",
      "Explain regulatory context for each",
      "Present multi-touch campaign plan",
      "Receive feedback and pass/revise"
    ],
    focus: "Certification"
  },
  11: {
    title: "SPICED Deep Dive Begins",
    activities: [
      "SPICED deep dive training with Jake (2 hrs)",
      "Complete 5-8 targeted touches",
      "Study Discovery Call Blueprint in detail",
      "Research 3-4 new accounts",
      "Practice discovery questions with regulatory focus",
      "Log all activities in HubSpot"
    ],
    focus: "SPICED Mastery"
  },
  12: {
    title: "Regulatory Focus",
    activities: [
      "Complete 5-8 targeted touches",
      "Practice discovery with regulatory angle",
      "Research 3-4 new accounts",
      "Review 2-3 call recordings",
      "Refine SPICED approach based on feedback",
      "HubSpot hygiene - update all records"
    ],
    focus: "Regulatory"
  },
  13: {
    title: "Expanding Coverage",
    activities: [
      "Complete 5-8 targeted touches",
      "Research 3-4 new accounts",
      "Practice SPICED roleplay with colleague",
      "Listen to 2-3 successful call recordings",
      "Refine messaging based on learnings",
      "Prepare for Week 3 certification"
    ],
    focus: "Expansion"
  },
  14: {
    title: "Certification Prep",
    activities: [
      "Complete 5-8 targeted touches",
      "Final account research batch (3-4 accounts)",
      "SPICED roleplay practice session",
      "Review all regulatory primers",
      "Mock certification run with colleague",
      "Confirm 15-20 accounts in coverage"
    ],
    focus: "Prep"
  },
  15: {
    title: "SPICED Discovery Certification",
    certification: true,
    activities: [
      "🎯 30-min roleplay with Karla & Adam",
      "Demonstrate SPICED in regulatory scenario",
      "Handle objections appropriately",
      "Score 70+ on Discovery Call Rubric",
      "Week 3 review and feedback",
      "Prepare for Week 4 live calling"
    ],
    focus: "Certification"
  },
  16: {
    title: "Full Prospecting Mode",
    activities: [
      "Complete 10-12 touches",
      "Target 3-4 meaningful conversations",
      "Work toward booking first meeting",
      "Apply SPICED in real calls",
      "Track conversion metrics",
      "Call coaching session with Karla"
    ],
    focus: "Live Calling"
  },
  17: {
    title: "Meeting Generation Push",
    activities: [
      "Complete 10-12 touches",
      "Focus on meaningful conversations",
      "Follow up on all warm leads",
      "Multi-thread 2-3 target accounts",
      "Review and refine approach",
      "Update HubSpot pipeline tracking"
      ],
      focus: "Meetings"
  },
  18: {
    title: "Conversion Focus",
    activities: [
      "Complete 10-12 touches",
      "Analyze and improve conversion rates",
      "Practice better qualification",
      "Push for first meeting bookings",
      "Review 2-3 call recordings",
      "Coaching session with Karla"
    ],
    focus: "Conversion"
  },
  19: {
    title: "Meeting Close Push",
    activities: [
      "Complete 10-12 touches",
      "Prioritize warmest prospects",
      "Push to book meetings before Day 20",
      "Prepare for live call certification",
      "Track all activities in HubSpot",
      "Final push toward 2 meeting goal"
      ],
      focus: "Closing"
    },
  20: {
    title: "Live Cold Call Certification",
    certification: true,
    activities: [
      "🎯 Karla shadows 3-5 live cold calls",
      "Advance at least 1 call (meeting/follow-up/next step)",
      "Demonstrate SPICED application",
      "Handle real objections effectively",
      "Month 1 performance review",
      "Preview Month 2 independence plan"
    ],
    focus: "Certification"
  },
  30: {
    title: "Month 1 Complete",
    milestone: true,
    activities: [
      "Confirm 2 meetings booked (Month 1 goal)",
      "Review Month 1 activity metrics",
      "Analyze conversion rates",
      "Identify strategy adjustments",
      "Plan Month 2 account expansion",
      "Set 150+ account coverage target"
    ],
    focus: "Milestone"
  },
  45: {
    title: "Mid-Ramp Review",
    certification: true,
    activities: [
      "🎯 60-min comprehensive review with Karla",
      "Pipeline review - meetings booked & in progress",
      "Activity analysis - touches & conversations",
      "Conversion rate review",
      "SPICED application assessment",
      "Course corrections and Month 2 strategy"
    ],
    focus: "Review"
  },
  60: {
    title: "Advanced SPICED Certification",
    certification: true,
    activities: [
      "🎯 Complex regulatory scenario roleplay",
      "Handle multiple stakeholder dynamics",
      "Score 80+ on Discovery Call Rubric",
      "Confirm 4 total meetings (Month 2 goal)",
      "Month 2 performance review",
      "Plan Month 3 quota achievement"
    ],
    focus: "Certification"
  },
  90: {
    title: "Full Cycle Mastery",
    certification: true,
    milestone: true,
    activities: [
      "🏆 30-min strategic insight presentation",
      "Share market insights from 90 days",
      "Present persona refinements learned",
      "Share messaging that works",
      "Pipeline forecast presentation",
      "Book 1 meeting live during session",
      "Confirm 12+ total meetings (90-day goal)",
      "Full independence certification"
      ],
      focus: "Graduation"
    }
};

export const getDefaultDayInfo = (day: number): DayInfo | null => {
  if (day >= 21 && day <= 60) {
    return {
      title: `Month 2 - Day ${day}`,
      activities: [
        "Complete 10-15 prospecting touches",
        "Expand account coverage",
        "Multi-thread target accounts",
        "Track and improve conversion rates",
        "Independent prospecting execution",
        "Log all activities in HubSpot"
      ],
      focus: "Pipeline Building"
    };
  } else if (day >= 61 && day <= 90) {
    return {
      title: `Month 3 - Day ${day}`,
      activities: [
        "Complete 10-15 strategic touches",
        "Maintain 50+ accounts in active coverage",
        "Work toward 6+ qualified meetings",
        "Effective SPICED qualification on all calls",
        "Independent operation - minimal oversight",
        "Full ramp execution"
      ],
      focus: "Quota Achievement"
    };
  }
  return null;
};

export const getDayInfo = (day: number): DayInfo | null => {
  return staticDayDetails[day] || getDefaultDayInfo(day);
};

export const getPhase = (day: number): Phase | undefined => {
  return phases.find(p => day >= p.days[0] && day <= p.days[1]);
};
