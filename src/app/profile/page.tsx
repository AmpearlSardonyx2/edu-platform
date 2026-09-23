"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { 
  Sparkles, Check, ShoppingBag, ShieldCheck, User, 
  Award, Zap, Bot, Star, Palette
} from "lucide-react";

interface RobotSkin {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  equipped: boolean;
  category: "all" | "body" | "face" | "accessories";
  color: string;
  glowColor: string;
  emoji: string;
  tagline: string;
}

const INITIAL_SKINS: RobotSkin[] = [
  {
    id: "default-bot",
    name: "Default Bot",
    cost: 0,
    unlocked: true,
    equipped: true,
    category: "all",
    color: "#94a3b8",
    glowColor: "rgba(148, 163, 184, 0.4)",
    emoji: "🤖",
    tagline: "Standard issue warehouse cargo assistant.",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    cost: 1200,
    unlocked: false,
    equipped: false,
    category: "body",
    color: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.5)",
    emoji: "⚡",
    tagline: "High-voltage neon conduits with glowing optical sensors.",
  },
  {
    id: "galaxy-explorer",
    name: "Galaxy Explorer",
    cost: 1500,
    unlocked: false,
    equipped: false,
    category: "body",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.5)",
    emoji: "🌌",
    tagline: "Deep space cosmic chassis tuned for dark nebula sorting.",
  },
  {
    id: "retro-pixel",
    name: "Retro Pixel",
    cost: 1000,
    unlocked: false,
    equipped: false,
    category: "face",
    color: "#eab308",
    glowColor: "rgba(234, 179, 8, 0.5)",
    emoji: "👾",
    tagline: "8-bit CRT arcade casing with chiptune sound effects.",
  },
  {
    id: "samurai-bot",
    name: "Samurai Bot",
    cost: 1800,
    unlocked: false,
    equipped: false,
    category: "accessories",
    color: "#f43f5e",
    glowColor: "rgba(244, 63, 94, 0.5)",
    emoji: "⚔️",
    tagline: "Reinforced titanium kabuto plating and honor algorithms.",
  },
  {
    id: "stealth-black",
    name: "Stealth Black",
    cost: 1200,
    unlocked: false,
    equipped: false,
    category: "body",
    color: "#1e293b",
    glowColor: "rgba(15, 23, 42, 0.6)",
    emoji: "🥷",
    tagline: "Matte radar-absorbent shell for covert coding operations.",
  },
];

export default function ProfilePage() {
  const [xp, setXp] = useState(2450);
  const [skins, setSkins] = useState<RobotSkin[]>(INITIAL_SKINS);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "body" | "face" | "accessories">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUnlockOrEquip = (skin: RobotSkin) => {
    if (skin.equipped) return;

    if (skin.unlocked) {
      // Equip skin
      setSkins((prev) =>
        prev.map((s) => ({
          ...s,
          equipped: s.id === skin.id,
        }))
      );
      showToast(`Equipped ${skin.name}!`);
    } else {
      // Purchase skin with XP
      if (xp >= skin.cost) {
        setXp((prev) => prev - skin.cost);
        setSkins((prev) =>
          prev.map((s) => ({
            ...s,
            unlocked: s.id === skin.id ? true : s.unlocked,
            equipped: s.id === skin.id ? true : false,
          }))
        );
        showToast(`Unlocked & equipped ${skin.name}! -${skin.cost} XP`);
      } else {
        showToast(`Not enough XP! Complete more missions to earn ${skin.cost - xp} more XP.`);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredSkins = skins.filter(
    (s) => selectedFilter === "all" || s.category === selectedFilter || s.category === "all"
  );

  const equippedSkin = skins.find((s) => s.equipped) || skins[0];

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto py-8 px-6 space-y-8 select-none">
        
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
              Command Center
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Profile &amp; Robot Skins</h1>
            <p className="text-xs text-slate-400 mt-1">
              Customize your learning companion and inspect your astronaut achievements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#090e17] border border-amber-500/40 rounded-2xl px-4 py-2 shadow-lg">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Available Balance</span>
                <span className="text-base font-black text-amber-400 font-mono">{xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currently Equipped Companion Showcase */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-[#0c1424] via-[#0f172a] to-[#1e1b4b] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl border-2"
              style={{
                backgroundColor: "#080d16",
                borderColor: equippedSkin.color,
                boxShadow: `0 0 25px ${equippedSkin.glowColor}`,
              }}
            >
              {equippedSkin.emoji}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ACTIVE COMPANION
                </span>
                <span className="text-xs text-slate-400">Level 12 Robot Buddy</span>
              </div>
              <h2 className="text-xl font-black text-white">{equippedSkin.name}</h2>
              <p className="text-xs text-slate-400 max-w-md">{equippedSkin.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Lessons Completed</div>
              <div className="text-base font-bold font-mono text-cyan-400">32</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Global Rank</div>
              <div className="text-base font-bold font-mono text-purple-400">#1420</div>
            </div>
          </div>
        </div>

        {/* Robot Skins Store matching concept.jpeg */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-cyan-400" size={18} />
              <h3 className="text-base font-bold text-white">Robot Skins Store (Spend XP)</h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-[#090e17] p-1 rounded-xl border border-slate-800 text-xs font-medium">
              {(["all", "body", "face", "accessories"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    selectedFilter === cat
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat === "all" ? "All Skins" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skins Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredSkins.map((skin) => (
              <div
                key={skin.id}
                className={`bg-[#090e17] rounded-2xl border p-4 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xl ${
                  skin.equipped 
                    ? "border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Skin Avatar Preview */}
                  <div
                    className="w-full h-28 rounded-xl flex items-center justify-center text-4xl mb-3 shadow-inner relative overflow-hidden"
                    style={{
                      background: "radial-gradient(circle, #1e293b 0%, #070b14 100%)",
                      border: `1.5px solid ${skin.color}`,
                    }}
                  >
                    {skin.emoji}
                    {skin.equipped && (
                      <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check size={10} /> Active
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white">{skin.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {skin.tagline}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {skin.cost === 0 ? "Free" : `${skin.cost} XP`}
                  </span>

                  <button
                    onClick={() => handleUnlockOrEquip(skin)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                      skin.equipped
                        ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 cursor-default"
                        : skin.unlocked
                        ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        : xp >= skin.cost
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                    }`}
                  >
                    {skin.equipped ? "Equipped" : skin.unlocked ? "Equip" : "Unlock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-cyan-500/60 rounded-2xl px-5 py-3 shadow-2xl text-xs font-semibold text-cyan-200 z-50 backdrop-blur animate-fade-in flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </AppShell>
  );
}
