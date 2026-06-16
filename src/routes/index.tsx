import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Github,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Cpu,
  MessageSquare,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RepoChat — Chat with any GitHub repository" },
      {
        name: "description",
        content:
          "Paste a GitHub repository URL and ask questions about the codebase. RepoChat indexes the source and answers grounded in the code.",
      },
      { property: "og:title", content: "RepoChat — Chat with any GitHub repository" },
      {
        property: "og:description",
        content: "Paste a GitHub URL, ask anything about the code.",
      },
    ],
  }),
  component: Landing,
});



/* ─── Floating particles canvas ───────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: {
      x: number; y: number; vy: number; vx: number;
      r: number; alpha: number; color: string;
    }[] = [];

    const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#0ea5e9", "#22d3ee"];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const spawn = () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vy: -(0.3 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * 0.4,
        r: 1.5 + Math.random() * 2.5,
        alpha: 0,
        color,
      });
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame % 18 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        // fade in near bottom, fade out near top
        const progress = 1 - p.y / canvas.height;
        p.alpha = progress < 0.15
          ? progress / 0.15
          : progress > 0.85
          ? (1 - progress) / 0.15
          : 1;

        if (p.y < -10) { particles.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ─── Landing page ─────────────────────────────────────────────────── */
function Landing() {
  const [typed, setTyped] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  const phrases = [
    "What does this repo do?",
    "Explain the auth flow.",
    "Where is routing handled?",
    "Summarize the README.",
  ];

  useEffect(() => {
    // Trigger mount animations
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Typewriter loop
  useEffect(() => {
    const phrase = phrases[phraseIdx];
    let i = 0;
    setTyped("");
    const typing = setInterval(() => {
      i++;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(typing);
        setTimeout(() => setPhraseIdx((p) => (p + 1) % phrases.length), 1800);
      }
    }, 55);
    return () => clearInterval(typing);
  }, [phraseIdx]);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">

      {/* ── Live animated background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Aurora orbs */}
        <div
          className="animate-aurora-1 absolute left-[20%] top-[15%] h-[45rem] w-[45rem] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", transformOrigin: "center" }}
        />
        <div
          className="animate-aurora-2 absolute right-[10%] top-[30%] h-[35rem] w-[35rem] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)", transformOrigin: "center" }}
        />
        <div
          className="animate-aurora-3 absolute left-[40%] bottom-[5%] h-[30rem] w-[30rem] rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", transformOrigin: "center" }}
        />
        {/* Animated grid */}
        <div className="animate-grid-fade absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        {/* Particles */}
        <ParticleCanvas />
      </div>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-all group-hover:rotate-6 group-hover:scale-110">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">RepoChat</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#how" className="story-link transition-colors hover:text-slate-900">How it works</a>
            <a href="#try" className="story-link transition-colors hover:text-slate-900">Try it</a>
          </nav>
          <Link
            to="/app"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:gap-2.5 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5"
          >
            Launch app
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">

          {/* Live badge */}
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
              transition: "opacity 0.5s 0.1s ease, transform 0.5s 0.1s ease",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live now · AI-powered code Q&amp;A
          </div>

          {/* Headline */}
          <h1
            className="mx-auto max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.6s 0.15s ease, transform 0.6s 0.15s ease",
            }}
          >
            Chat with any{" "}
            <span className="animate-shimmer-text">GitHub repository</span>
          </h1>

          {/* Sub */}
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s 0.25s ease, transform 0.6s 0.25s ease",
            }}
          >
            Paste a repo URL, let RepoChat index the code, then ask anything.
            Answers come back grounded in the actual source.
          </p>

          {/* CTA buttons */}
          <div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s 0.35s ease, transform 0.6s 0.35s ease",
            }}
          >
            <Link
              to="/app"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/25 hover:-translate-y-1 active:translate-y-0"
            >
              {/* shimmer sweep on hover */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
              Open the app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 backdrop-blur transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <Zap className="h-4 w-4 text-slate-400" />
              See how it works
            </a>
          </div>

          {/* Mock app preview */}
          <div
            className="mx-auto mt-16 max-w-3xl"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.8s 0.5s ease, transform 0.8s 0.5s ease",
            }}
          >
            <div className="animate-float-y overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-shadow hover:shadow-slate-900/18">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300 transition-transform hover:scale-125" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 transition-transform hover:scale-125" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 transition-transform hover:scale-125" />
                <span className="ml-3 font-mono text-xs text-slate-400">repochat</span>
              </div>
              <div className="space-y-4 p-6 text-left">
                {/* Repo URL bar */}
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Github className="h-4 w-4 text-slate-500" />
                  <span className="font-mono text-sm text-slate-600">github.com/your/repo</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Indexed
                  </span>
                </div>
                {/* User bubble with typewriter */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-sm bg-slate-900 px-4 py-3 text-sm text-slate-100">
                    {typed}
                    <span className="ml-0.5 inline-block h-4 w-0.5 -mb-0.5 animate-pulse bg-slate-100 align-middle" />
                  </div>
                </div>
                {/* Bot thinking */}
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-t border-slate-100 bg-slate-50/60 py-24 relative overflow-hidden">
        {/* Subtle accent */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-aurora-3 absolute right-[-10%] top-[-20%] h-[30rem] w-[30rem] rounded-full blur-[90px]"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", transformOrigin: "center" }} />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Three steps
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              No setup. Just a repository URL and a question.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: FolderGit2, step: "01", title: "Paste a repo URL", body: "Drop a link to any public GitHub repository.", delay: 0 },
              { icon: Cpu,         step: "02", title: "Let it index",     body: "Source is chunked and embedded for semantic search.", delay: 120 },
              { icon: MessageSquare, step: "03", title: "Ask anything",   body: "Get answers grounded in the actual code.", delay: 240 },
            ].map((s) => (
              <div
                key={s.step}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/8"
                style={{ animationDelay: `${s.delay}ms` }}
              >
                {/* hover shimmer */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-50/80 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {/* Pulse ring behind icon */}
                <div className="relative mb-4 flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-lg bg-slate-900/10 transition-transform duration-700 group-hover:scale-150 group-hover:opacity-0" />
                    <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <s.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="font-mono text-xs font-medium text-slate-400">{s.step}</span>
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="try" className="mx-auto max-w-6xl px-6 py-24">
        <div className="group relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center text-white shadow-xl">
          {/* Live aurora inside CTA */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="animate-aurora-1 absolute left-[10%] top-[-30%] h-[30rem] w-[30rem] rounded-full blur-[80px]"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)", transformOrigin: "center" }} />
            <div className="animate-aurora-2 absolute right-[5%] bottom-[-20%] h-[25rem] w-[25rem] rounded-full blur-[70px]"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)", transformOrigin: "center" }} />
          </div>
          {/* Shimmer sweep on hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to try it?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Open the app and paste a repository URL.
            </p>
            <div className="mt-8">
              <Link
                to="/app"
                className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-white px-6 py-3 text-sm font-medium text-slate-900 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-white/20"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-100/60 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <Sparkles className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                Launch RepoChat
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
              <Github className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-slate-700">RepoChat</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="story-link">How it works</a>
            <a href="#try" className="story-link">Try it</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
