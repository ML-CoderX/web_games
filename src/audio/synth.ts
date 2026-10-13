export class Synth {
  context:AudioContext|null=null;muted=false;
  unlock(){this.context??=new AudioContext();if(this.context.state==='suspended')void this.context.resume();}
  tone(freq:number,duration:number,delay=0,type:OscillatorType='sine',volume=.09){if(this.muted||!this.context)return;const ctx=this.context,t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(type==='triangle')o.frequency.exponentialRampToValueAtTime(35,t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+duration);}
  thud(){this.tone(140,.23,0,'triangle',.25);}
  ding(){this.tone(660,.25);this.tone(990,.3,.1);}
  win(){[523,659,784,1047].forEach((f,i)=>this.tone(f,.4,i*.13));}
}
