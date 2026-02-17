import { useEffect, useRef, useCallback } from "react";

// Procedural ambient drone using Web Audio API
class AmbientDrone {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private running = false;

  start(volume = 0.03) {
    if (this.running) return;
    this.ctx = new AudioContext();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.ctx.destination);

    // Layer low-frequency drones
    const freqs = [55, 82.5, 110, 65];
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const oscGain = this.ctx!.createGain();
      oscGain.gain.value = 0.25;

      osc.connect(oscGain);
      oscGain.connect(this.gain!);
      osc.start();
      this.oscillators.push(osc);
    });

    // Fade in
    this.gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 3);
    this.running = true;
  }

  stop() {
    if (!this.running || !this.ctx || !this.gain) return;
    this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    setTimeout(() => {
      this.oscillators.forEach((o) => {
        try { o.stop(); } catch {}
      });
      this.oscillators = [];
      this.ctx?.close();
      this.ctx = null;
      this.gain = null;
      this.running = false;
    }, 1200);
  }

  isRunning() { return this.running; }
}

// Short procedural click/hover sounds
function playUISound(type: "hover" | "click") {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === "hover") {
    osc.type = "sine";
    osc.frequency.value = 800;
    gain.gain.value = 0.02;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.stop(ctx.currentTime + 0.08);
  } else {
    osc.type = "triangle";
    osc.frequency.value = 600;
    gain.gain.value = 0.04;
    osc.start();
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.12);
  }
}

// Hook for components to trigger UI sounds
export function useUISounds() {
  return {
    playHover: () => playUISound("hover"),
    playClick: () => playUISound("click"),
  };
}

// Main audio controller component
interface SpatialAudioProps {
  enabled: boolean;
}

const SpatialAudio = ({ enabled }: SpatialAudioProps) => {
  const droneRef = useRef<AmbientDrone | null>(null);

  useEffect(() => {
    droneRef.current = new AmbientDrone();
    return () => {
      droneRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      droneRef.current?.start(0.025);
    } else {
      droneRef.current?.stop();
    }
  }, [enabled]);

  return null;
};

export default SpatialAudio;
