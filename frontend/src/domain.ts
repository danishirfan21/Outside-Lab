export type Activity = 'sit' | 'walk' | 'pet';
export type Mood = 1 | 2 | 3 | 4 | 5;
export interface Session {
  id: string; activity: Activity; startedAt: string; finishedAt: string;
  seconds: number; moodBefore: Mood; moodAfter: Mood; outdoorsReported: boolean; note: string;
}
export interface ActiveSession {
  id: string; activity: Activity; startedAt: string; moodBefore: Mood; targetMinutes: number;
}
export interface Recommendation {
  title: string; instruction: string; rationale: string; focus_question: string;
  activity: Activity; minutes: number; evidence_note: string;
}
export const DEFAULT_REC: Recommendation = {
  title: 'A few minutes under the open sky',
  instruction: 'Step into a safe outdoor space, leave your phone in your pocket, and notice how you feel.',
  rationale: 'This is a starter experiment. Ask the open-weight AI for a personalized suggestion.',
  focus_question: 'Did a short break change how you felt?', activity: 'sit', minutes: 5,
  evidence_note: 'Starter suggestion, not AI-generated.'
};
export const ACTIVITY_LABELS: Record<Activity,string> = {sit:'Sit outside',walk:'Take a gentle walk',pet:'Spend time with a pet'};
export function outdoorMinutes(sessions: Session[]): number {
  return Math.round(sessions.filter(s=>s.outdoorsReported).reduce((sum,s)=>sum+Math.max(0,s.seconds),0)/60);
}
export function moodChange(session: Session): number { return session.moodAfter - session.moodBefore; }
export function elapsedSeconds(start: string, nowMs=Date.now()):number {
  return Math.max(0,Math.floor((nowMs - new Date(start).getTime())/1000));
}
export function formatDuration(seconds: number): string {
  const s=Math.max(0,Math.floor(seconds)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}
export function readStorage<T>(key: string, fallback: T): T {
  try {const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback;}catch{return fallback;}
}
export function niceDate(iso:string){return new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'});}
