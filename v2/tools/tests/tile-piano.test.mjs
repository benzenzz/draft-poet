import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TILE_MELODY,midiFrequency,createToyPiano} from '../../tile-piano-audio.mjs';
import {orderPianoTiles} from '../../tile-piano.mjs';

test('geometric ring order is stable despite reversed/shuffled DOM order',()=>{
  const tiles=[];
  for(let u=0;u<9;u++)for(let v=0;v<9;v++){
    if(u===0||u===8||v===0||v===8)tiles.push({dataset:{center:`${58+u*88},${58+v*88}`}});
  }
  const ring=orderPianoTiles(tiles);
  assert.equal(ring.length,32);assert.equal(ring[0].dataset.center,'58,58');
  assert.deepEqual(orderPianoTiles([...tiles].reverse()),ring);
  assert.deepEqual(orderPianoTiles([...tiles.filter((_,i)=>i%2),...tiles.filter((_,i)=>!(i%2))]),ring);
  for(let i=0;i<ring.length;i++){
    const [u,v]=ring[i].dataset.center.split(',').map(Number),[x,y]=ring[(i+1)%ring.length].dataset.center.split(',').map(Number);
    assert.equal(Math.abs(u-x)+Math.abs(v-y),88);
  }
  assert.equal(ring[1].dataset.center,'146,58'); // clockwise in screen projection
});

test('fixed pentatonic pitches use A4=440 and a smooth 32-tile seam',()=>{
  assert.deepEqual(TILE_MELODY,[60,62,64,67,69,72,69,67,64,62]);
  assert.equal(midiFrequency(69),440);
  assert(Math.abs(midiFrequency(60)-261.625565)<.000001);
  assert(Math.abs(TILE_MELODY[31%10]-TILE_MELODY[0])<=2);
});

test('construction/muting/disposal are silent and unsupported audio fails on opt-in only',async()=>{
  let contexts=0;
  const audio=createToyPiano({AudioContext:class{constructor(){contexts++;throw Error('unavailable');}}});
  assert.equal(contexts,0);assert.equal(audio.play(60),false);audio.mute();
  await assert.rejects(audio.enable());assert.equal(contexts,1);assert.equal(audio.running,false);
  audio.dispose();assert.equal(audio.play(60),false);
});
