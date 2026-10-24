import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fundraisingState,fundraisingMilestones} from '../../fundraising-progress.mjs';

test('UI-002 preserves financial milestone boundaries, clamping and remaining',()=>{
  for(const [raised,name,percent,remaining] of [[0,'coral',0,100],[24.99,'coral',24.99,75.01],[25,'yellow',25,75],[50,'green',50,50],[75,'blue',75,25],[100,'blue',100,0],[125,'blue',100,0]]){
    const state=fundraisingState(raised,100);
    assert.equal(state.known,true);assert.equal(state.milestone.name,name);assert.equal(state.progress,percent);assert.equal(state.remaining,remaining);
  }
});
test('UI-002 unknown/error amounts never become invented totals',()=>{
  for(const [raised,target] of [[null,100],[-1,100],[NaN,100],[Infinity,100],[10,null],[10,0],[10,-1],[10,NaN]]){
    const state=fundraisingState(raised,target);
    assert.equal(state.known,false);assert.equal(state.progress,0);assert.equal(state.remaining,null);
  }
});
function luminance(hex){const c=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('UI-002 milestone CTAs and white-on-dark badges meet 4.5:1',()=>{
  for(const m of fundraisingMilestones){assert.ok(contrast(m.color,'#10251d')>=4.5,`${m.name} CTA`);assert.ok(contrast(m.ink,'#ffffff')>=4.5,`${m.name} badge`);}
});
