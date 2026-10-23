import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TILE_MELODY,ALPHABET_PHRASES,melodyForTiles,midiFrequency,createToyPiano} from '../../tile-piano-audio.mjs';
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

test('Alphabet preserves repeated notes, F4 and complete phrases on the 32-tile ring',()=>{
  assert.equal(TILE_MELODY.length,43);
  const ring=melodyForTiles(32);
  assert.equal(ring.length,32);
  assert.deepEqual(ring.slice(0,7),[60,60,67,67,69,69,67]);
  assert.deepEqual(ring.slice(7,16),[65,65,64,64,62,62,62,62,60]);
  assert.deepEqual(ring.slice(0,29),ALPHABET_PHRASES.slice(0,4).flat());
  assert.deepEqual(ring.slice(29),[62,62,60]);
  assert.deepEqual(melodyForTiles(32),ring);
  assert.deepEqual(melodyForTiles(43),TILE_MELODY);
  assert.deepEqual(melodyForTiles(50),[...TILE_MELODY,...ALPHABET_PHRASES[0]]);
  assert.equal(midiFrequency(69),440);
  assert(Math.abs(midiFrequency(60)-261.625565)<.000001);
  assert(Math.abs(midiFrequency(65)-349.228231)<.000001);
  assert.equal(ring.at(-1),ring[0]);
});

test('construction/muting/disposal are silent and unsupported audio fails on opt-in only',async()=>{
  let contexts=0;
  const audio=createToyPiano({AudioContext:class{constructor(){contexts++;throw Error('unavailable');}}});
  assert.equal(contexts,0);assert.equal(audio.play(60),false);audio.mute();
  await assert.rejects(audio.enable());assert.equal(contexts,1);assert.equal(audio.running,false);
  audio.dispose();assert.equal(audio.play(60),false);
});
