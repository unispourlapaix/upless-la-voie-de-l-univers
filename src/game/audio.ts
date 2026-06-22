import { loadSave, writeSave } from "./types";

type Wave = OscillatorType;

class UplessAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private musicBus?: GainNode;
  private effectsBus?: GainNode;
  private nextBeat = 0;
  private beat = 0;
  private started = false;

  private readonly tempo = 112;
  private readonly progression = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0], // Am7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0, 246.94, 293.66, 392.0], // Gadd9
  ];

  async start(): Promise<void> {
    if (!loadSave().sound) return;
    this.ensureContext();
    if (!this.context) return;
    if (this.context.state === "suspended") await this.context.resume();
    if (this.started) return;
    this.started = true;
    this.nextBeat = this.context.currentTime + 0.08;
    this.schedule();
    window.setInterval(() => this.schedule(), 100);
  }

  toggle(): boolean {
    const save = loadSave();
    const enabled = !save.sound;
    writeSave({ ...save, sound: enabled });
    if (enabled) {
      void this.start();
      this.setMaster(0.72);
      this.play("confirm");
    } else {
      this.setMaster(0);
    }
    return enabled;
  }

  isEnabled(): boolean {
    return loadSave().sound;
  }

  play(
    name:
      | "tap"
      | "flower"
      | "window"
      | "bee"
      | "ladder"
      | "bridge"
      | "rock"
      | "ogre"
      | "portal"
      | "danger"
      | "confirm",
  ): void {
    if (!loadSave().sound) return;
    this.ensureContext();
    if (!this.context || !this.effectsBus) return;
    const now = this.context.currentTime;
    const effectsBus = this.effectsBus;

    switch (name) {
      case "tap":
        this.tone(520, now, 0.055, 0.025, "sine", effectsBus);
        break;
      case "flower":
        [659.25, 783.99, 987.77].forEach((frequency, index) =>
          this.tone(frequency, now + index * 0.055, 0.22, 0.075, "sine", effectsBus),
        );
        break;
      case "window":
        [392, 523.25, 659.25, 783.99].forEach((frequency, index) =>
          this.tone(frequency, now + index * 0.08, 0.38, 0.055, "triangle", effectsBus),
        );
        break;
      case "bee":
        this.buzz(now, 1.45);
        break;
      case "ladder":
        [293.66, 349.23, 440, 523.25].forEach((frequency, index) =>
          this.tone(frequency, now + index * 0.11, 0.28, 0.065, "triangle", effectsBus),
        );
        break;
      case "bridge":
        [196, 246.94, 293.66].forEach((frequency, index) =>
          this.tone(frequency, now + index * 0.07, 0.42, 0.06, "square", effectsBus),
        );
        break;
      case "rock":
        this.pitchDrop(310, 105, now, 0.34, 0.11);
        break;
      case "ogre":
        this.pitchDrop(150, 52, now, 0.72, 0.18);
        this.noise(now, 0.25, 0.09);
        break;
      case "portal":
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) =>
          this.tone(frequency, now + index * 0.12, 0.75, 0.065, "sine", effectsBus),
        );
        break;
      case "danger":
        this.pitchDrop(260, 80, now, 0.3, 0.09);
        break;
      case "confirm":
        this.tone(659.25, now, 0.16, 0.06, "sine", effectsBus);
        this.tone(987.77, now + 0.07, 0.2, 0.05, "sine", effectsBus);
        break;
    }
  }

  private ensureContext(): void {
    if (this.context) return;
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.musicBus = this.context.createGain();
    this.effectsBus = this.context.createGain();
    this.master.gain.value = loadSave().sound ? 0.72 : 0;
    this.musicBus.gain.value = 0.26;
    this.effectsBus.gain.value = 0.52;
    this.musicBus.connect(this.master);
    this.effectsBus.connect(this.master);
    this.master.connect(this.context.destination);
  }

  private setMaster(value: number): void {
    if (!this.context || !this.master) return;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(value, this.context.currentTime, 0.04);
  }

  private schedule(): void {
    if (!this.context || !this.musicBus || !loadSave().sound) return;
    const secondsPerBeat = 60 / this.tempo;
    while (this.nextBeat < this.context.currentTime + 0.45) {
      const chordIndex = Math.floor(this.beat / 8) % this.progression.length;
      const chord = this.progression[chordIndex];
      const step = this.beat % 8;

      if (step === 0) {
        chord.forEach((frequency, voice) =>
          this.tone(
            frequency,
            this.nextBeat,
            secondsPerBeat * 7.6,
            voice === 0 ? 0.035 : 0.024,
            voice % 2 ? "sine" : "triangle",
            this.musicBus!,
          ),
        );
      }

      if (step % 2 === 0) {
        this.tone(chord[0] / 2, this.nextBeat, secondsPerBeat * 0.72, 0.07, "triangle", this.musicBus);
      }

      const melody = [2, 1, 3, 2, 1, 0, 2, 3];
      if (step === 1 || step === 3 || step === 6) {
        const note = chord[melody[(this.beat + chordIndex) % melody.length]] * 2;
        this.tone(note, this.nextBeat, secondsPerBeat * 0.72, 0.028, "sine", this.musicBus);
      }

      if (step === 0 || step === 4) this.softKick(this.nextBeat);
      if (step === 2 || step === 6) this.noise(this.nextBeat, 0.08, 0.012);

      this.nextBeat += secondsPerBeat / 2;
      this.beat += 1;
    }
  }

  private tone(
    frequency: number,
    start: number,
    duration: number,
    volume: number,
    wave: Wave,
    destination: AudioNode,
  ): void {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private pitchDrop(from: number, to: number, start: number, duration: number, volume: number): void {
    if (!this.context || !this.effectsBus) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.effectsBus);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  private buzz(start: number, duration: number): void {
    if (!this.context || !this.effectsBus) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const wobble = this.context.createOscillator();
    const wobbleGain = this.context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 185;
    wobble.frequency.value = 17;
    wobbleGain.gain.value = 22;
    wobble.connect(wobbleGain);
    wobbleGain.connect(oscillator.frequency);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.effectsBus);
    oscillator.start(start);
    wobble.start(start);
    oscillator.stop(start + duration);
    wobble.stop(start + duration);
  }

  private softKick(start: number): void {
    if (!this.context || !this.musicBus) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.frequency.setValueAtTime(105, start);
    oscillator.frequency.exponentialRampToValueAtTime(48, start + 0.12);
    gain.gain.setValueAtTime(0.045, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    oscillator.connect(gain);
    gain.connect(this.musicBus);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  }

  private noise(start: number, duration: number, volume: number): void {
    if (!this.context || !this.effectsBus) return;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(gain);
    gain.connect(this.effectsBus);
    source.start(start);
  }
}

export const audio = new UplessAudio();
