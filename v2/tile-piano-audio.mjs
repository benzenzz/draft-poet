// Small, bounded Web Audio instrument. One context serves tiles and the Have fun chord.
export const TILE_MELODY=[60,62,64,67,69,72,69,67,64,62];
export const midiFrequency=midi=>440*2**((midi-69)/12);

export function createToyPiano({AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext,onStateChange=()=>{}}={}){
  let context,master,enabled=false,disposed=false,closing=false,sequence=0,generation=0;
  const slots=Array.from({length:4},()=>({voice:null,availableAt:0})),live=new Set();
  function hold(param,now){
    if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);
    else{const value=param.value;param.cancelScheduledValues(now);param.setValueAtTime(value,now);}
  }
  function close(){
    if(!context||closing)return;closing=true;
    for(const voice of [...live])voice.cleanup();
    context.close().catch(()=>{});
  }
  function fade(voice,now,duration){
    const gain=voice.gain.gain;
    hold(gain,now);
    gain.linearRampToValueAtTime(0,now+duration);
    voice.oscillators.forEach(osc=>osc.stop(now+duration));
  }
  function hush(){
    if(!context)return;
    const now=context.currentTime;
    for(const voice of live)fade(voice,now,.03);
    for(const slot of slots){slot.voice=null;slot.availableAt=now+.03;}
  }
  function mute(){
    generation++;enabled=false;hush();
    if(!context)return;
    const now=context.currentTime;
    hold(master.gain,now);master.gain.linearRampToValueAtTime(0,now+.03);
    if(!live.size)context.suspend().catch(()=>{});
  }
  async function enable({autoplay=false}={}){
    const token=++generation;
    if(disposed||!AudioContext)throw new Error('Audio unavailable');
    if(!context){
      context=new AudioContext();master=context.createGain();master.gain.value=0;master.connect(context.destination);
      context.addEventListener('statechange',()=>{onStateChange(context.state);if(disposed&&context.state!=='running')close();});
    }
    // Called directly by the button's user gesture, before its first await.
    const resumed=context.resume();
    if(autoplay){
      let timer;
      try{await Promise.race([resumed,new Promise(resolve=>{timer=setTimeout(resolve,250);})]);}
      finally{clearTimeout(timer);}
      if(context.state!=='running')return false;
    }else await resumed;
    if(token!==generation)return false;
    if(disposed||context.state!=='running')throw new Error('Audio unavailable');
    enabled=true;
    const now=context.currentTime;hold(master.gain,now);master.gain.linearRampToValueAtTime(.2,now+.02);
    return true;
  }
  function play(midi,{sustain=false,onEnded=()=>{}}={}){
    const duration=sustain?1.8:.3,peak=sustain?.095:.22;
    if(!enabled||context.state!=='running')return false;
    const now=context.currentTime;
    const slot=slots.find(s=>!s.voice)||slots.reduce((a,b)=>a.voice.sequence<b.voice.sequence?a:b);
    let start=Math.max(now,slot.availableAt);
    if(slot.voice){fade(slot.voice,now,.008);start=Math.max(start,now+.008);}
    // A replacement begins after the stolen voice fades: at most four audible
    // voices, including simultaneous landings, without a backlog of notes.
    slot.availableAt=start;
    const gain=context.createGain(),oscillators=[],partials=[];
    const voice={gain,oscillators,sequence:sequence++,start};slot.voice=voice;live.add(voice);
    gain.connect(master);
    gain.gain.setValueAtTime(0,start);
    gain.gain.linearRampToValueAtTime(peak,start+(sustain?.018:.006));
    gain.gain.exponentialRampToValueAtTime(peak*.5,start+(sustain?.18:.05));
    gain.gain.exponentialRampToValueAtTime(.003,start+duration-.03);
    gain.gain.linearRampToValueAtTime(0,start+duration);
    for(const [ratio,level,decay]of [[1,1,.3],[2,.13,.09],[3,.035,.055]]){
      const osc=context.createOscillator(),partial=context.createGain();
      osc.type='sine';osc.frequency.value=midiFrequency(midi)*ratio;
      partial.gain.setValueAtTime(level,start);
      if(ratio>1)partial.gain.exponentialRampToValueAtTime(.0001,start+decay);
      osc.connect(partial);partial.connect(gain);oscillators.push(osc);partials.push(partial);
      osc.start(start);osc.stop(start+duration);
    }
    voice.cleanup=()=>{
      if(!live.has(voice))return;
      oscillators.forEach(osc=>osc.disconnect());partials.forEach(partial=>partial.disconnect());gain.disconnect();
      live.delete(voice);if(slot.voice===voice)slot.voice=null;
    };
    oscillators[0].onended=()=>{voice.cleanup();onEnded();if(disposed&&!live.size)close();else if(!enabled&&!live.size&&context.state==='running')context.suspend().catch(()=>{});};
    return {midi,frequency:midiFrequency(midi),time:start};
  }
  function playChord(onEnded){
    if(!enabled||context.state!=='running')return false;
    [60,64,67].forEach((midi,i)=>play(midi,{sustain:true,onEnded:i===2?onEnded:()=>{}}));
    return true;
  }
  return {enable,mute,hush,play,playChord,get running(){return enabled&&context?.state==='running';},
    dispose(){disposed=true;mute();if(!live.size||context?.state!=='running')close();}};
}
