"use client";

import { useState, useRef } from "react";

type Skill = { raw: string; name: string; tagline: string };

const CATEGORIES = [
  { label: "Frontend", icon: "◈", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 text-blue-300" },
  { label: "Backend", icon: "◉", color: "from-violet-500/20 to-purple-500/10 border-violet-500/20 text-violet-300" },
  { label: "AI & ML", icon: "◎", color: "from-pink-500/20 to-rose-500/10 border-pink-500/20 text-pink-300" },
  { label: "DevOps", icon: "◆", color: "from-orange-500/20 to-amber-500/10 border-orange-500/20 text-orange-300" },
  { label: "Mobile", icon: "◇", color: "from-emerald-500/20 to-green-500/10 border-emerald-500/20 text-emerald-300" },
  { label: "Security", icon: "◐", color: "from-red-500/20 to-rose-500/10 border-red-500/20 text-red-300" },
  { label: "Tools", icon: "◑", color: "from-zinc-500/20 to-slate-500/10 border-zinc-500/20 text-zinc-300" },
];

function parseSkills(text: string): Skill[] {
  return text
    .split(/---\s*NEXT SKILL\s*---/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const nameMatch = raw.match(/^name:\s*(.+)/m);
      const descMatch = raw.match(/^description:\s*(.+)/m);
      return {
        raw,
        name: nameMatch ? nameMatch[1].trim() : "skill",
        tagline: descMatch ? descMatch[1].trim() : "",
      };
    });
}

function SkillCard({ skill, index, copied, onCopy }: {
  skill: Skill;
  index: number;
  copied: string | null;
  onCopy: (raw: string, name: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  }

  const cat = CATEGORIES[index % 3];
  const isCopied = copied === skill.name;

  return (
    <div
      ref={cardRef}
      className="card-3d glass rounded-2xl p-5 cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1.5">
          <span className={`text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r border font-medium ${cat.color}`}>
            {cat.icon} {cat.label}
          </span>
          <h3 className="text-white font-mono font-semibold text-base">/{skill.name}</h3>
          {skill.tagline && (
            <p className="text-zinc-400 text-xs leading-relaxed">{skill.tagline}</p>
          )}
        </div>
        <button
          onClick={() => onCopy(skill.raw, skill.name)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium ${
            isCopied
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
          }`}
        >
          {isCopied ? "✓ Done" : "Kopírovat"}
        </button>
      </div>
      <pre className="text-xs font-mono text-zinc-500 whitespace-pre-wrap bg-black/30 rounded-xl p-3 max-h-48 overflow-y-auto leading-relaxed border border-white/[0.04]">
        {skill.raw}
      </pre>
    </div>
  );
}

function GlowButton({ onClick, disabled, children }: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-glow relative px-10 py-3.5 rounded-2xl font-semibold text-white
        bg-gradient-to-r from-violet-600 to-blue-600
        hover:from-violet-500 hover:to-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)]
        active:scale-95 text-base"
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [genStreaming, setGenStreaming] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genCopied, setGenCopied] = useState<string | null>(null);

  const [inputSkill, setInputSkill] = useState("");
  const [improved, setImproved] = useState("");
  const [improveStreaming, setImproveStreaming] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveCopied, setImproveCopied] = useState(false);

  async function generate() {
    setGenLoading(true);
    setSkills([]);
    setGenStreaming("");
    setGenCopied(null);
    try {
      const res = await fetch("/api/generate-skill", { method: "POST" });
      if (!res.ok) return;
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setGenStreaming(full);
      }
      setSkills(parseSkills(full));
      setGenStreaming("");
    } finally {
      setGenLoading(false);
    }
  }

  async function improve() {
    if (!inputSkill.trim()) return;
    setImproveLoading(true);
    setImproved("");
    setImproveStreaming("");
    setImproveCopied(false);
    try {
      const res = await fetch("/api/improve-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: inputSkill }),
      });
      if (!res.ok) return;
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setImproveStreaming(full);
      }
      setImproved(full);
      setImproveStreaming("");
    } finally {
      setImproveLoading(false);
    }
  }

  async function copySkill(text: string, name: string) {
    await navigator.clipboard.writeText(text);
    setGenCopied(name);
    setTimeout(() => setGenCopied(null), 2000);
  }

  async function copyImproved() {
    await navigator.clipboard.writeText(improved);
    setImproveCopied(true);
    setTimeout(() => setImproveCopied(false), 2000);
  }

  return (
    <div className="relative min-h-screen bg-[#080810] overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-violet-600/20 top-[-200px] left-[-100px]" />
      <div className="orb w-[500px] h-[500px] bg-blue-600/15 top-[200px] right-[-150px]" />
      <div className="orb w-[400px] h-[400px] bg-emerald-600/10 bottom-[-100px] left-[30%]" />

      <main className="relative z-10 flex flex-col items-center px-4 py-16 md:py-24">
        <div className="w-full max-w-2xl space-y-20">

          {/* Hero */}
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gemini 2.5 Flash · Free tier
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
              Skill <span className="gradient-text">Generator</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
              Praktické Claude Code skilly pro každou oblast vývoje — vygenerované AI.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              {CATEGORIES.map((c) => (
                <span key={c.label} className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r border font-medium ${c.color}`}>
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Generate */}
          <section className="space-y-6">
            <div className="flex justify-center">
              <GlowButton onClick={generate} disabled={genLoading}>
                {genLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generuji...
                  </span>
                ) : "✦ Vygenerovat skilly"}
              </GlowButton>
            </div>

            {genLoading && genStreaming && (
              <div className="glass rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-xs text-zinc-500 font-mono">Gemini přemýšlí...</span>
                </div>
                <pre className="text-xs font-mono text-zinc-600 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {genStreaming.slice(-600)}
                </pre>
              </div>
            )}

            {skills.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-500 text-sm">
                    <span className="text-white font-semibold">{skills.length}</span> skillů vygenerováno
                  </p>
                  <span className="text-xs text-zinc-600 font-mono">~/.claude/skills/</span>
                </div>
                <div className="space-y-3">
                  {skills.map((skill, i) => (
                    <SkillCard key={i} skill={skill} index={i} copied={genCopied} onCopy={copySkill} />
                  ))}
                </div>
                <p className="text-center text-xs text-zinc-600 pt-2">
                  Ulož jako <code className="text-zinc-500">~/.claude/skills/název.md</code> a volej přes <code className="text-zinc-500">/název</code>
                </p>
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest">nebo</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Improve */}
          <section className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-white">Vylepšit existující skill</h2>
              <p className="text-zinc-500 text-sm">Vlož svůj skill a AI ho upgraduje</p>
            </div>

            <div className="glass rounded-2xl p-4 border border-white/5">
              <textarea
                value={inputSkill}
                onChange={(e) => setInputSkill(e.target.value)}
                placeholder="Vlož sem obsah svého .md skill souboru..."
                className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 text-sm font-mono resize-none outline-none leading-relaxed min-h-[180px]"
              />
            </div>

            <div className="flex justify-center">
              <GlowButton onClick={improve} disabled={improveLoading || !inputSkill.trim()}>
                {improveLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Vylepšuji...
                  </span>
                ) : "⚡ Vylepšit skill"}
              </GlowButton>
            </div>

            {improveLoading && improveStreaming && (
              <div className="glass rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs text-zinc-500 font-mono">Gemini vylepšuje...</span>
                </div>
                <pre className="text-xs font-mono text-zinc-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {improveStreaming.slice(-600)}
                </pre>
              </div>
            )}

            {improved && !improveLoading && (
              <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-white font-medium">Vylepšený skill</span>
                  </div>
                  <button
                    onClick={copyImproved}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium ${
                      improveCopied
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {improveCopied ? "✓ Zkopírováno" : "Kopírovat"}
                  </button>
                </div>
                <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap p-5 max-h-[500px] overflow-y-auto leading-relaxed">
                  {improved}
                </pre>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
