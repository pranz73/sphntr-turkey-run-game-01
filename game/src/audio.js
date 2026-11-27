'use strict';
/* Gobble Dash — tiny synthesized sounds. WebAudio oscillators only;
   no audio files, no network. Everything is guarded so a browser
   without audio (or a headless screenshot run) never breaks the game. */

const SoundBank = {
  ctx: null,
  muted: false,

  ensure: function () {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try { this.ctx.resume(); } catch (e) { /* audio stays off */ }
      }
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
  },

  /* One short oscillator note, optionally sliding to another pitch. */
  tone: function (freq, dur, type, vol, slideTo, delay) {
    if (this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
      gain.gain.setValueAtTime(vol || 0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) { /* never let sound break the game */ }
  },

  /* A quick rising blip when the turkey jumps. */
  jump: function () {
    this.tone(280, 0.14, 'square', 0.05, 640);
  },

  /* Two bright chirps when corn is grabbed. */
  corn: function () {
    this.tone(880, 0.08, 'sine', 0.09);
    this.tone(1318, 0.1, 'sine', 0.09, 0, 0.07);
  },

  /* A low thud when the turkey is hit. */
  thud: function () {
    this.tone(140, 0.22, 'sine', 0.16, 55);
    this.tone(90, 0.18, 'triangle', 0.1, 45, 0.02);
  },

  /* A descending sting when the farmer catches the turkey. */
  caught: function () {
    this.tone(392, 0.16, 'sawtooth', 0.07, 370);
    this.tone(311, 0.16, 'sawtooth', 0.07, 294, 0.16);
    this.tone(233, 0.3, 'sawtooth', 0.08, 196, 0.32);
  },

  /* A rising little fanfare when the turkey escapes. */
  escaped: function () {
    const notes = [523, 659, 784, 1047];
    for (let i = 0; i < notes.length; i++) {
      this.tone(notes[i], 0.16, 'triangle', 0.09, 0, i * 0.11);
    }
  },

  /* A comical two-note gobble when the run starts. */
  gobble: function () {
    this.tone(320, 0.09, 'square', 0.05, 240);
    this.tone(300, 0.12, 'square', 0.05, 200, 0.1);
  },
};
