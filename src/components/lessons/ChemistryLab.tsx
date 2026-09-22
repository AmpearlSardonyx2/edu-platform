"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Beaker, Play, RotateCcw, Droplets, Flame, 
  Sparkles, CheckCircle2, HelpCircle, Award, Volume2, Info, ChevronRight
} from "lucide-react";

interface ChemicalReactionState {
  acidVolume: number; // in mL (0 - 50)
  baseVolume: number; // in mL (0 - 50)
  hasIndicator: boolean;
  temperature: number; // Celsius
  pH: number;
  isPouring: boolean;
  color: string; // RGB string
  statusMessage: string;
}

export default function ChemistryLab({ slug = "chemistry-titration" }: { slug?: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lab simulation state
  const [acidVolume, setAcidVolume] = useState<number>(25); // Initial 25 mL 0.1M HCl in beaker
  const [baseVolumeAdded, setBaseVolumeAdded] = useState<number>(0); // 0.1M NaOH added from buret/flask
  const [hasIndicator, setHasIndicator] = useState<boolean>(true); // Phenolphthalein
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [pourRate, setPourRate] = useState<number>(1); // mL per click/hold
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  // Physics & Particle animation refs
  const pourAnimRef = useRef<number | null>(null);
  const bubblesRef = useRef<Array<{ x: number; y: number; radius: number; speed: number; opacity: number }>>([]);

  // Calculate live chemical values
  // M1V1 = M2V2: 25 mL of 0.1M HCl requires exactly 25 mL of 0.1M NaOH for neutral pH 7
  const totalVolume = acidVolume + baseVolumeAdded;
  const molesAcid = 0.025 * 0.1; // 0.0025 moles HCl
  const molesBase = (baseVolumeAdded / 1000) * 0.1;

  let pH = 1.0;
  if (baseVolumeAdded === 0) {
    pH = 1.0;
  } else if (baseVolumeAdded < 25) {
    const unreactedAcidMoles = molesAcid - molesBase;
    const concH = unreactedAcidMoles / (totalVolume / 1000);
    pH = Math.max(1.0, Number((-Math.log10(concH)).toFixed(2)));
  } else if (baseVolumeAdded === 25) {
    pH = 7.0;
  } else {
    const excessBaseMoles = molesBase - molesAcid;
    const concOH = excessBaseMoles / (totalVolume / 1000);
    const pOH = -Math.log10(concOH);
    pH = Math.min(13.8, Number((14 - pOH).toFixed(2)));
  }

  // Exothermic reaction: Neutralization releases deltaH ~ -57 kJ/mol
  const neutralMoles = Math.min(molesAcid, molesBase);
  const tempRise = (neutralMoles * 57000) / (totalVolume * 4.184); // Q = mcΔT
  const currentTemp = Number((22.0 + tempRise).toFixed(1));

  // Determine liquid color: Phenolphthalein is colorless in acid (pH < 8.2) and vivid magenta/pink in base (pH >= 8.3)
  const getFluidColor = useCallback(() => {
    if (!hasIndicator) {
      return "rgba(224, 242, 254, 0.65)"; // clear water with slight glass tint
    }
    if (pH < 7.5) {
      return "rgba(240, 249, 255, 0.7)"; // crystal clear acid + indicator
    } else if (pH >= 7.5 && pH < 8.5) {
      // Endpoint transition: delicate faint pale pink
      return "rgba(244, 114, 182, 0.6)";
    } else {
      // Strong basic solution: vibrant glowing magenta
      return "rgba(219, 39, 119, 0.85)";
    }
  }, [hasIndicator, pH]);

  // Canvas render loop for realistic beaker, liquid level, and pouring stream
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const beakerWidth = 140;
      const beakerHeight = 180;
      const beakerX = canvas.width / 2 - beakerWidth / 2;
      const beakerY = canvas.height - beakerHeight - 40;

      // 1. Draw Lab Table Surface with neon reflections
      const tableY = canvas.height - 35;
      const gradTable = ctx.createLinearGradient(0, tableY, 0, canvas.height);
      gradTable.addColorStop(0, "#1e293b");
      gradTable.addColorStop(1, "#0f172a");
      ctx.fillStyle = gradTable;
      ctx.fillRect(0, tableY, canvas.width, 35);
      
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, tableY);
      ctx.lineTo(canvas.width, tableY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // 2. Liquid Level in Receiver Beaker (scaled by totalVolume up to 70mL)
      const maxVolumeCap = 60;
      const fillRatio = Math.min(1, totalVolume / maxVolumeCap);
      const fluidHeight = fillRatio * (beakerHeight - 30);
      const fluidY = beakerY + beakerHeight - fluidHeight;

      // Draw Receiver Liquid
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(beakerX + 6, fluidY, beakerWidth - 12, fluidHeight - 4, [0, 0, 12, 12]);
      ctx.fillStyle = getFluidColor();
      ctx.fill();

      // Liquid Meniscus curve at surface
      ctx.beginPath();
      ctx.ellipse(beakerX + beakerWidth / 2, fluidY, (beakerWidth - 12) / 2, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fill();
      ctx.restore();

      // 3. Bubbles in receiver beaker during pouring/reaction
      if (isPouring || baseVolumeAdded > 0) {
        if (Math.random() < 0.35 && bubblesRef.current.length < 25) {
          bubblesRef.current.push({
            x: beakerX + 15 + Math.random() * (beakerWidth - 30),
            y: beakerY + beakerHeight - 10,
            radius: 1 + Math.random() * 2.5,
            speed: 0.6 + Math.random() * 1.5,
            opacity: 0.7,
          });
        }
      }

      ctx.save();
      bubblesRef.current.forEach((b, index) => {
        b.y -= b.speed;
        b.opacity -= 0.005;
        if (b.y < fluidY || b.opacity <= 0) {
          bubblesRef.current.splice(index, 1);
        } else {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
          ctx.fill();
        }
      });
      ctx.restore();

      // 4. Draw Receiver Glass Beaker Outline & Measurement Hashmarks
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
      ctx.beginPath();
      // Lip spout
      ctx.moveTo(beakerX - 5, beakerY);
      ctx.lineTo(beakerX + 5, beakerY);
      ctx.lineTo(beakerX + 5, beakerY + beakerHeight - 12);
      ctx.arcTo(beakerX + 5, beakerY + beakerHeight, beakerX + 20, beakerY + beakerHeight, 14);
      ctx.lineTo(beakerX + beakerWidth - 20, beakerY + beakerHeight);
      ctx.arcTo(beakerX + beakerWidth - 5, beakerY + beakerHeight, beakerX + beakerWidth - 5, beakerY + beakerHeight - 12, 14);
      ctx.lineTo(beakerX + beakerWidth - 5, beakerY);
      ctx.lineTo(beakerX + beakerWidth + 5, beakerY);
      ctx.stroke();

      // Glass shine highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(beakerX + 14, beakerY + 10);
      ctx.lineTo(beakerX + 14, beakerY + beakerHeight - 20);
      ctx.stroke();

      // Volume Graduations (10mL, 20mL, 30mL, 40mL, 50mL)
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      for (let vol = 10; vol <= 50; vol += 10) {
        const markY = beakerY + beakerHeight - (vol / maxVolumeCap) * (beakerHeight - 30);
        ctx.beginPath();
        ctx.moveTo(beakerX + beakerWidth - 22, markY);
        ctx.lineTo(beakerX + beakerWidth - 6, markY);
        ctx.stroke();
        ctx.fillText(`${vol}ml`, beakerX + beakerWidth - 48, markY + 3);
      }
      ctx.restore();

      // 5. Draw Digital pH Probe submerged in liquid
      ctx.save();
      const probeX = beakerX + 35;
      const probeTipY = fluidY + 25;
      ctx.fillStyle = "#334155";
      ctx.fillRect(probeX - 4, beakerY - 50, 8, probeTipY - (beakerY - 50));
      // Glass electrode bulb
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(probeX, probeTipY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 6. Draw Titration Burette / Dispenser Tube from Above
      const buretX = beakerX + beakerWidth / 2 + 10;
      const buretTipY = beakerY - 15;
      ctx.save();
      ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
      ctx.fillRect(buretX - 5, 10, 10, buretTipY - 20);
      // Tapered tip
      ctx.beginPath();
      ctx.moveTo(buretX - 5, buretTipY - 20);
      ctx.lineTo(buretX + 5, buretTipY - 20);
      ctx.lineTo(buretX + 2, buretTipY);
      ctx.lineTo(buretX - 2, buretTipY);
      ctx.closePath();
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.fill();
      ctx.restore();

      // 7. Pouring Liquid Stream & Drops
      if (isPouring) {
        ctx.save();
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 4;
        ctx.strokeStyle = "rgba(186, 230, 253, 0.95)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(buretX, buretTipY);
        ctx.lineTo(buretX, fluidY);
        ctx.stroke();

        // Splash ripples at fluid impact point
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(buretX, fluidY, 8 + Math.random() * 4, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [totalVolume, isPouring, getFluidColor, baseVolumeAdded]);

  // Handle continuous pouring with mouse / touch hold
  const handleStartPour = () => {
    if (baseVolumeAdded >= 45) return;
    setIsPouring(true);
    pourAnimRef.current = window.setInterval(() => {
      setBaseVolumeAdded((prev) => {
        if (prev >= 45) {
          if (pourAnimRef.current) clearInterval(pourAnimRef.current);
          setIsPouring(false);
          return 45;
        }
        return Number((prev + 0.5).toFixed(1));
      });
    }, 100);
  };

  const handleStopPour = () => {
    setIsPouring(false);
    if (pourAnimRef.current) {
      clearInterval(pourAnimRef.current);
      pourAnimRef.current = null;
    }
  };

  const handleAddSingleDrop = (amount: number) => {
    setBaseVolumeAdded((prev) => Math.min(45, Number((prev + amount).toFixed(1))));
  };

  const handleReset = () => {
    handleStopPour();
    setBaseVolumeAdded(0);
    setQuizAnswered(false);
    setQuizResult(null);
    setCompleted(false);
  };

  const handleQuizSelect = (option: string) => {
    setQuizAnswered(true);
    if (option === "pink") {
      setQuizResult("correct");
      setScore(150);
      setCompleted(true);
    } else {
      setQuizResult("incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Sci-Fi Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/learn")} 
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 transition"
          >
            <ArrowLeft size={16} /> Learning Map
          </button>
          <div className="h-4 w-[1px] bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Chemistry Virtual Lab</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-slate-300">Reward:</span>
            <span className="font-semibold text-amber-400">+150 XP</span>
          </div>

          <button 
            onClick={handleReset} 
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RotateCcw size={14} /> Reset Lab
          </button>
        </div>
      </header>

      {/* Main Interactive Workstation */}
      <div className="flex-1 grid lg:grid-cols-12 gap-5 p-5 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Mission Guide & Reaction Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Mission Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                Mission 01
              </span>
              <span className="text-xs text-slate-400">Neutralization Lab</span>
            </div>
            <h2 className="text-base font-bold text-white mb-1">Acid-Base Titration</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Titrate 25 mL of unknown hydrochloric acid (<span className="text-cyan-400 font-mono">HCl</span>) with sodium hydroxide (<span className="text-emerald-400 font-mono">NaOH</span>). Find the exact equivalence point where the pH reaches 7.0!
            </p>
          </div>

          {/* Live Sensor Gauges (pH meter & Thermometer) */}
          <div className="grid grid-cols-2 gap-3">
            {/* pH Meter */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-1.5 right-2 text-[10px] font-mono text-slate-500">pH PROBE</div>
              <div className={`text-2xl font-mono font-bold mt-2 ${pH >= 7.5 ? "text-pink-400" : pH === 7 ? "text-emerald-400" : "text-cyan-400"}`}>
                {pH.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                {pH < 7 ? "Acidic" : pH === 7 ? "Neutral (Equivalence)" : "Basic / Alkaline"}
              </span>
              {/* Mini pH Color Bar */}
              <div className="w-full h-1.5 rounded-full mt-2 bg-gradient-to-r from-rose-500 via-emerald-400 to-indigo-600" />
            </div>

            {/* Digital Thermometer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative">
              <div className="absolute top-1.5 right-2 text-[10px] font-mono text-slate-500">THERMAL</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-2 flex items-center gap-1">
                <Flame size={18} className="text-amber-500 animate-bounce" />
                {currentTemp}°C
              </div>
              <span className="text-[11px] text-slate-400 mt-1">Exothermic Heat</span>
            </div>
          </div>

          {/* Chemical Reaction Formula HUD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Reaction Equation</span>
              <span className="text-emerald-400 text-[10px]">BALANCED</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-center text-slate-200">
              <span className="text-cyan-400">HCl (aq)</span> + <span className="text-emerald-400">NaOH (aq)</span> → <span className="text-amber-300">NaCl</span> + <span className="text-blue-300">H₂O</span> + <span className="text-rose-400">ΔH</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Receiver Beaker:</span>
                <span className="text-slate-200 font-mono">{acidVolume} mL HCl (0.1 M)</span>
              </div>
              <div className="flex justify-between">
                <span>Base Dispensed:</span>
                <span className="text-emerald-400 font-mono">{baseVolumeAdded.toFixed(1)} mL NaOH</span>
              </div>
              <div className="flex justify-between">
                <span>Equivalence Target:</span>
                <span className="text-pink-400 font-mono">25.0 mL</span>
              </div>
            </div>
          </div>

          {/* Step Prediction Quiz */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <HelpCircle size={15} />
              <span>Step 2: Lab Prediction Quiz</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              What color does <span className="text-pink-400 font-semibold">Phenolphthalein indicator</span> turn when NaOH neutralizes all the acid and makes the solution alkaline?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuizSelect("pink")}
                disabled={quizAnswered}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition text-left ${
                  quizAnswered && quizResult === "correct" 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-800/80 border-slate-700 hover:border-pink-500 text-slate-200"
                }`}
              >
                A) Bright Magenta / Pink
              </button>
              <button
                onClick={() => handleQuizSelect("yellow")}
                disabled={quizAnswered}
                className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:border-slate-600 text-xs text-slate-400 text-left"
              >
                B) Bright Yellow
              </button>
            </div>
            {quizAnswered && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 size={13} />
                <span>Correct! In base (pH &gt; 8.2), phenolphthalein turns vivid pink!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Apparatus & Beaker Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Workstation Top Bar */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker size={18} className="text-cyan-400" />
              <span className="text-xs font-medium text-slate-200">Interactive Glassware Apparatus</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasIndicator} 
                  onChange={(e) => setHasIndicator(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                />
                Indicator Added
              </label>
            </div>
          </div>

          {/* The Canvas Simulation Viewport */}
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-[380px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <canvas 
              ref={canvasRef} 
              width={520} 
              height={360} 
              className="max-w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            />

            {/* Real-time Indicator Tooltip Overlay */}
            {pH >= 7.5 && hasIndicator && (
              <div className="absolute top-8 right-8 bg-pink-950/80 border border-pink-700/60 rounded-xl px-3.5 py-2 text-pink-200 text-xs shadow-lg animate-pulse backdrop-blur">
                ✨ Endpoint Reached! Solution turned Pink
              </div>
            )}
          </div>

          {/* Interactive Chemical Pour Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Dispense NaOH:</span>
              <button
                onClick={() => handleAddSingleDrop(0.5)}
                disabled={baseVolumeAdded >= 45}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                +0.5 mL (Drop)
              </button>
              <button
                onClick={() => handleAddSingleDrop(2.0)}
                disabled={baseVolumeAdded >= 45}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                +2.0 mL
              </button>
            </div>

            {/* Big Hold-to-Pour Button */}
            <div className="flex items-center gap-3">
              <button
                onMouseDown={handleStartPour}
                onMouseUp={handleStopPour}
                onMouseLeave={handleStopPour}
                onTouchStart={handleStartPour}
                onTouchEnd={handleStopPour}
                disabled={baseVolumeAdded >= 45}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition shadow-lg ${
                  isPouring 
                    ? "bg-pink-600 text-white shadow-pink-500/30 scale-95" 
                    : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20"
                }`}
              >
                <Droplets size={16} />
                {isPouring ? "Dispensing Chemical..." : "Hold to Pour NaOH"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal / Banner when user achieves equivalence */}
      {Math.abs(baseVolumeAdded - 25.0) < 1.0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl max-w-lg w-full flex items-center justify-between gap-4 backdrop-blur animate-fade-in z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Lab Objective Complete!</h4>
              <p className="text-xs text-slate-300">You neutralized the acid at 25.0 mL and verified the equivalence point.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/learn")}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            Claim +150 XP
          </button>
        </div>
      )}
    </div>
  );
}
