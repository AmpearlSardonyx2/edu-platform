"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Bot, Send, Sparkles, Terminal, Lightbulb, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "robot" | "user";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "robot",
    text: "Beep boop! Hello Ampearl! 🤖 I'm your AI Robot Mentor. What topic or simulation are you working on today? (Ask me about Bubble Sort passes, acid-base titration equivalence, or projectile trajectory formulas!)",
    time: "Just now",
  },
];

export default function AiTutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input.toLowerCase();
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      let reply = "Beep boop! That's a great question. Let's think step by step!";

      if (currentInput.includes("bubble sort") || currentInput.includes("sorting")) {
        reply = "In Bubble Sort, why do you think we compare adjacent pairs rather than random elements? Because comparing neighbors guarantees that the maximum value bubbles up to the very end on every pass! Have you tried adjusting the loop to stop at n - i - 1?";
      } else if (currentInput.includes("titration") || currentInput.includes("acid") || currentInput.includes("base") || currentInput.includes("ph")) {
        reply = "In our Chemistry Lab, phenolphthalein is special because it stays completely clear in acidic and neutral water (pH < 8.2), but the moment a single extra drop of NaOH creates excess OH⁻ ions, it turns hot pink! What volume did you measure at the color change?";
      } else if (currentInput.includes("projectile") || currentInput.includes("cannon") || currentInput.includes("gravity") || currentInput.includes("angle")) {
        reply = "Kinematics check! Did you know that on flat ground, a launch angle of 45° yields the maximum horizontal range? But on the Moon, because gravity is only 1.62 m/s², your cannonball will fly roughly 6 times further with the exact same velocity!";
      } else {
        reply = "Interesting! Remember our golden rule: try looking at the visual simulation first. What does your intuition say happens before we write the code or balance the equation?";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "robot",
        text: reply,
        time: "Just now",
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto py-8 px-6 flex flex-col h-[calc(100vh-2rem)] select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Robot AI Mentor
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.2 rounded border border-emerald-800">
                  ONLINE
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Socratic interactive tutor — hints, intuitions, and debugging guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Stream Viewport */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === "robot"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-purple-600 text-white"
                }`}
              >
                {m.sender === "robot" ? "🤖" : "U"}
              </div>

              <div
                className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                  m.sender === "robot"
                    ? "bg-[#090e17] border border-slate-800 text-slate-200"
                    : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Robot buddy is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 bg-[#090e17] border border-slate-800 rounded-2xl p-2 focus-within:border-cyan-500 transition shadow-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question (e.g. 'Why does phenolphthalein turn pink?' or 'How does Bubble Sort swap?')..."
              className="bg-transparent flex-1 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold p-2.5 rounded-xl shadow-lg transition"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
