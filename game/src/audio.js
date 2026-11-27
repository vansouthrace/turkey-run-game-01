// Gobble Dash sound: every note is synthesized with WebAudio, no audio files.
// A plucky autumn banjo loop, a gobble, a corn chirp, a thud and a fanfare.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  tone(freq, seconds, type, volume, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const start = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, start + seconds);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    osc.connect(gain).connect(this.master);
    osc.start(start);
    osc.stop(start + seconds + 0.02);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  jump() { this.tone(280, 0.16, 'square', 0.12, 0, 560); }
  corn() { this.tone(880, 0.09, 'sine', 0.16); this.tone(1318, 0.12, 'sine', 0.14, 0.07); }
  thud() { this.tone(140, 0.22, 'sawtooth', 0.22, 0, 55); }
  gobble() {
    for (let i = 0; i < 4; i += 1) this.tone(320 - i * 40, 0.09, 'sawtooth', 0.1, i * 0.09, 180);
  }
  hide() { this.tone(520, 0.12, 'triangle', 0.12, 0, 340); }
  spotted() { this.tone(196, 0.3, 'sawtooth', 0.18, 0, 392); }
  caught() {
    [392, 311, 233, 175].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.18, i * 0.22));
  }
  escaped() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.16, i * 0.13));
  }

  startMusic() {
    this.ensure();
    if (!this.ctx || this.musicTimer) return;
    const melody = [392, 0, 523, 659, 0, 587, 523, 440, 392, 0, 440, 523, 587, 0, 659, 0];
    this.musicTimer = window.setInterval(() => {
      if (this.muted || !this.ctx) return;
      const note = melody[this.musicStep % melody.length];
      this.musicStep += 1;
      if (note) this.tone(note, 0.22, 'triangle', 0.05);
    }, 210);
  }

  stopMusic() {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}
