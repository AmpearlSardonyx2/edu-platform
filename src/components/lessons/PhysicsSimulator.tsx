"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Orbit, Play, RotateCcw, Target, Sparkles, 
  Award, Gauge, CheckCircle2, Sliders, ChevronRight
} from "lucide-react";

export default function PhysicsSimulator({ slug = "physics-projectile" }: { slug?: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics Simulation parameters
  const [angleDeg, setAngleDeg] = useState<number>(45); // Launch angle
  const [velocity, setVelocity] = useState<number>(32); // Initial velocity v0 (m/s)
  const [gravityPreset, setGravityPreset] = useState<"earth" | "moon" | "mars">("earth");
  const [targetDistance, setTargetDistance] = useState<number>(100); // Target position in meters
  const [targetWidth] = useState<number>(14); // Target hit zone width (meters)

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [hitResult, setHitResult] = useState<"hit" | "miss" | null>(null);
  const [hasWon, setHasWon] = useState<boolean>(false);

  // Gravity acceleration mapping (m/s^2)
  const gravityMap = {
    earth: 9.8,
    moon: 1.62,
    mars: 3.72,
  };
  const g = gravityMap[gravityPreset];

  // Mathematical kinematics
  const angleRad = (angleDeg * Math.PI) / 180;
  const vx0 = velocity * Math.cos(angleRad);
  const vy0 = velocity * Math.sin(angleRad);

  const flightTime = (2 * vy0) / g;
  const maxHeight = (vy0 * vy0) / (2 * g);
  const totalRange = (velocity * velocity * Math.sin(2 * angleRad)) / g;

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const groundY = canvas.height - 40;
      const cannonX = 50;
      const cannonY = groundY;

      // Coordinate scaling (meters to canvas pixels)
      const scale = (canvas.width - 100) / 130; // 130 meters fit on screen

      // 1. Draw Starry Sci-Fi Ground & Grid
      ctx.save();
      // Ground plane
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
      groundGrad.addColorStop(0, "#1e1b4b");
      groundGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, canvas.width, 40);

      // Glowing grid line
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#818cf8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Distance markers every 20m
      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(165, 180, 252, 0.6)";
      for (let dist = 20; dist <= 120; dist += 20) {
        const markerX = cannonX + dist * scale;
        ctx.beginPath();
        ctx.moveTo(markerX, groundY);
        ctx.lineTo(markerX, groundY + 6);
        ctx.stroke();
        ctx.fillText(`${dist}m`, markerX - 8, groundY + 18);
      }
      ctx.restore();

      // 2. Draw Target Landing Depot
      ctx.save();
      const targetCanvasX = cannonX + targetDistance * scale;
      const targetCanvasW = targetWidth * scale;

      ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.strokeRect(targetCanvasX - targetCanvasW / 2, groundY - 6, targetCanvasW, 6);
      ctx.fillRect(targetCanvasX - targetCanvasW / 2, groundY - 6, targetCanvasW, 6);

      // Target Beacon Ring
      ctx.fillStyle = "#f43f5e";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(targetCanvasX, groundY - 14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 3. Draw Precomputed Parabolic Trajectory Guide (Dotted curve)
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cannonX, cannonY);

      for (let t = 0; t <= flightTime; t += flightTime / 40) {
        const px = cannonX + (vx0 * t) * scale;
        const py = cannonY - ((vy0 * t) - 0.5 * g * t * t) * scale;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Draw Cannon Barrel at set angle
      ctx.save();
      const barrelLength = 32;
      const barrelTipX = cannonX + barrelLength * Math.cos(angleRad);
      const barrelTipY = cannonY - barrelLength * Math.sin(angleRad);

      ctx.strokeStyle = "#a5b4fc";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cannonX, cannonY - 4);
      ctx.lineTo(barrelTipX, barrelTipY);
      ctx.stroke();

      // Cannon base
      ctx.fillStyle = "#4338ca";
      ctx.beginPath();
      ctx.arc(cannonX, cannonY - 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Animated Projectile (Flying Cannonball / Space Capsule)
      if (isSimulating) {
        const curX = cannonX + (vx0 * simTime) * scale;
        const curY = cannonY - ((vy0 * simTime) - 0.5 * g * simTime * simTime) * scale;

        ctx.save();
        // Glowing Projectile
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(curX, curY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Velocity vector components arrows
        const curVy = vy0 - g * simTime;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX + vx0 * 0.6, curY); // vx
        ctx.stroke();

        ctx.strokeStyle = "#ec4899";
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX, curY - curVy * 0.6); // vy
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [angleRad, velocity, g, flightTime, isSimulating, simTime, targetDistance, targetWidth, vx0, vy0]);

  // Handle Launch Simulation loop
  const handleLaunch = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimTime(0);
    setHitResult(null);

    const stepMs = 25;
    const interval = setInterval(() => {
      setSimTime((prevTime) => {
        const nextTime = prevTime + 0.05;
        if (nextTime >= flightTime) {
          clearInterval(interval);
          setIsSimulating(false);
          // Check if landed inside target zone
          const finalRange = (velocity * velocity * Math.sin(2 * angleRad)) / g;
          const isHit = Math.abs(finalRange - targetDistance) <= targetWidth / 2;
          if (isHit) {
            setHitResult("hit");
            setHasWon(true);
          } else {
            setHitResult("miss");
          }
          return flightTime;
        }
        return nextTime;
      });
    }, stepMs);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimTime(0);
    setHitResult(null);
    setHasWon(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Sci-Fi Navigation Header */}
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
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Physics Kinematics Lab</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-slate-300">Mission Reward:</span>
            <span className="font-semibold text-amber-400">+150 XP</span>
          </div>

          <button 
            onClick={handleReset} 
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </header>

      {/* Main Grid Viewport */}
      <div className="flex-1 grid lg:grid-cols-12 gap-5 p-5 max-w-7xl mx-auto w-full">
        {/* Left Column: Sliders, Gravity Preset, Kinematics Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Mission Briefing */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                Mission 02
              </span>
              <span className="text-xs text-slate-400">Orbital Slingshot</span>
            </div>
            <h2 className="text-base font-bold text-white mb-1">Projectile Target Lock</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust launch angle $\theta$ and muzzle velocity $v_0$ to land the emergency cargo container inside the receptor ring located at <span className="text-pink-400 font-bold">{targetDistance} meters</span>.
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-400" /> Launch Controls
              </span>
            </div>

            {/* Launch Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Launch Angle (θ):</span>
                <span className="font-mono text-indigo-300 font-bold">{angleDeg}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="85"
                value={angleDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Velocity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Muzzle Velocity (v₀):</span>
                <span className="font-mono text-cyan-300 font-bold">{velocity} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={velocity}
                onChange={(e) => setVelocity(Number(e.target.value))}
                disabled={isSimulating}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Gravity Environment Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs text-slate-400">Gravity Field:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["earth", "moon", "mars"] as const).map((planet) => (
                  <button
                    key={planet}
                    onClick={() => setGravityPreset(planet)}
                    disabled={isSimulating}
                    className={`py-1.5 text-xs font-medium rounded-lg border uppercase tracking-wider transition ${
                      gravityPreset === planet
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                        : "bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-400"
                    }`}
                  >
                    {planet}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-right font-mono text-slate-500">
                g = {g} m/s²
              </div>
            </div>
          </div>

          {/* Kinematics Telemetry Gauges */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Telemetry HUD</span>
              <span className="text-cyan-400 text-[10px]">REAL-TIME</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Range (R)</div>
                <div className="text-sm font-mono font-bold text-indigo-400">{totalRange.toFixed(1)}m</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Max Height</div>
                <div className="text-sm font-mono font-bold text-amber-400">{maxHeight.toFixed(1)}m</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Flight Time</div>
                <div className="text-sm font-mono font-bold text-cyan-400">{flightTime.toFixed(1)}s</div>
              </div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400 text-center">
              R = (v₀² · sin(2θ)) / g = <span className="text-white font-bold">{totalRange.toFixed(1)}m</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Physics Canvas & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Orbit size={18} className="text-indigo-400" />
              <span className="text-xs font-medium text-slate-200">Orbital Trajectory Viewport</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Target: <span className="text-pink-400">{targetDistance}m ± {(targetWidth / 2).toFixed(1)}m</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-[380px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-black">
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={360} 
              className="max-w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            />

            {/* Hit / Miss Status Indicator */}
            {hitResult && (
              <div className={`absolute top-6 right-6 px-4 py-2 rounded-xl text-xs font-bold border backdrop-blur shadow-lg animate-fade-in ${
                hitResult === "hit" 
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-300" 
                  : "bg-rose-950/80 border-rose-500 text-rose-300"
              }`}>
                {hitResult === "hit" ? "🎯 DIRECT HIT! Target Secured" : "❌ MISSED TARGET - Recalculate Trajectory"}
              </div>
            )}
          </div>

          {/* Launch Controls Bottom Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {hitResult === "miss" ? (
                <span>Tip: At 45°, you get maximum range on flat terrain.</span>
              ) : (
                <span>Vector components: <span className="text-cyan-400">vx = {vx0.toFixed(1)} m/s</span>, <span className="text-pink-400">vy = {vy0.toFixed(1)} m/s</span></span>
              )}
            </div>

            <button
              onClick={handleLaunch}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition shadow-lg ${
                isSimulating 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/20"
              }`}
            >
              <Play size={16} fill="currentColor" />
              {isSimulating ? "In Flight..." : "Launch Cannon"}
            </button>
          </div>
        </div>
      </div>

      {/* Victory Reward Toast */}
      {hasWon && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl max-w-lg w-full flex items-center justify-between gap-4 backdrop-blur animate-fade-in z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct Hit! Target Reached</h4>
              <p className="text-xs text-slate-300">You mastered kinematics and landed the capsule with precision.</p>
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
