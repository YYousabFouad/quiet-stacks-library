let audioContext;

/** Create the paper-turn sound procedurally with Web Audio, without assets. */
export function playPaperTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();

    const duration = 0.42;
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555;
      b1 = 0.99332 * b1 + white * 0.075;
      b2 = 0.96900 * b2 + white * 0.1538;
      data[i] = (b0 + b1 + b2 + white * 0.5) * 0.08;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2100, audioContext.currentTime + 0.14);
    filter.frequency.exponentialRampToValueAtTime(750, audioContext.currentTime + duration);
    filter.Q.setValueAtTime(1.5, audioContext.currentTime);
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.11, audioContext.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.03, audioContext.currentTime + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.07, audioContext.currentTime + 0.32);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start();
  } catch (_) {
    // Audio is an enhancement; a browser restriction should not interrupt sign-in.
  }
}
