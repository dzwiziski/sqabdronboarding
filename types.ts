export interface ActivityState {
  [key: string]: boolean;
}

export interface DayInfo {
  title: string;
  activities: string[];
  focus: string;
  certification?: boolean;
  milestone?: boolean;
}

export interface Phase {
  name: string;
  days: [number, number];
  color: string;
  borderColor: string;
  week?: number;
  weeks?: string;
}

export interface Certification {
  name: string;
  icon: string;
}

export interface ActivityTarget {
  days: string;
  touches: string;
  meetings: string;
}

export interface DayProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface CertificationEvidence {
  type: 'link' | 'file';
  value: string;
  name?: string;
  date: string;
}