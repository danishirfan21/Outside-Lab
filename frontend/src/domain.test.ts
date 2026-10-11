import {describe,it,expect} from 'vitest';
import {appendSessionOnce,elapsedSeconds,formatDuration,moodChange,outdoorMinutes,type Session} from './domain';
const base:Session={id:'1', activity:'walk', startedAt:'2026-10-11T00:00:00Z',finishedAt:'2026-10-11T00:05:00Z',seconds:300,moodBefore:2,moodAfter:4,outdoorsReported:true,note:''};
describe('local session calculations',()=>{
 it('uses timestamps rather than a ticking counter',()=>expect(elapsedSeconds('2026-10-11T00:00:00Z', Date.parse('2026-10-11T00:02:10Z'))).toBe(130));
 it('never reports negative elapsed time',()=>expect(elapsedSeconds('2026-10-11T00:02:10Z',Date.parse('2026-10-11T00:00:00Z'))).toBe(0));
 it('treats an invalid stored timestamp as zero elapsed time',()=>expect(elapsedSeconds('not-a-date',Date.now())).toBe(0));
 it('excludes unconfirmed outdoor activity from outdoor minutes',()=>expect(outdoorMinutes([base,{...base,id:'2',outdoorsReported:false,seconds:1200}])).toBe(5));
 it('retains negative mood changes',()=>expect(moodChange({...base,moodAfter:1})).toBe(-1));
 it('formats actual elapsed time',()=>expect(formatDuration(125)).toBe('02:05'));
 it('does not duplicate a completed session when save is repeated',()=>expect(appendSessionOnce([base],base)).toHaveLength(1));
 it('uses the saved return timestamp after the timer is interrupted',()=>expect(elapsedSeconds(base.startedAt,Date.parse(base.finishedAt))).toBe(300));
});
