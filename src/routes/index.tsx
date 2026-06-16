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
  Code,
  Activity,
  Clock,
  CheckCircle2
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RepoChat — Chat with any GitHub repository" },
      {
        name: "description",
        content:
          "Paste a GitHub repository URL and ask questions about the codebase. RepoChat indexes the source and answers grounded in the code with full context.",
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
    "Show me the database schema.",
  ];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Typewriter loop for the hero section input
  useEffect(() => {
    const phrase = phrases[phraseIdx];
    let i = 0;
    setTyped("");
    const typing = setInterval(() => {
      i++;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(typing);
        setTimeout(() => setPhraseIdx((p) => (p + 1) % phrases.length), 2000);
      }
    }, 60);
    return () => clearInterval(typing);
  }, [phraseIdx]);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-all group-hover:rotate-6 group-hover:scale-110 shadow-md">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">RepoChat</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="story-link transition-colors hover:text-slate-900">Features</a>
            <a href="#how" className="story-link transition-colors hover:text-slate-900">How it works</a>
            <a href="#try" className="story-link transition-colors hover:text-slate-900">Try it</a>
          </nav>
          <Link
            to="/app"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:gap-2.5 hover:shadow-md hover:shadow-slate-900/20 hover:-translate-y-0.5"
          >
            Launch app
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 text-center">

          {/* Live badge */}
          <div
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm backdrop-blur transition-all hover:bg-blue-100/80"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
              transition: "opacity 0.5s 0.1s ease, transform 0.5s 0.1s ease",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Now with Multi-turn Chat &amp; Streaming
          </div>

          {/* Headline */}
          <h1
            className="mx-auto max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[4rem]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.6s 0.15s ease, transform 0.6s 0.15s ease",
            }}
          >
            Chat with any{" "}
            <span className="animate-shimmer-text bg-[linear-gradient(110deg,#0f172a,45%,#3b82f6,55%,#0f172a)] bg-[length:200%_100%] bg-clip-text text-transparent">GitHub repository</span>
          </h1>

          {/* Sub */}
          <p
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s 0.25s ease, transform 0.6s 0.25s ease",
            }}
          >
            Paste a repo URL, let RepoChat index the code, then ask anything.
            Experience a rich, multi-turn AI conversation grounded entirely in the actual source code.
          </p>

          {/* CTA buttons */}
          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s 0.35s ease, transform 0.6s 0.35s ease",
            }}
          >
            <Link
              to="/app"
              className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-8 font-medium text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-1 active:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
              Open the App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-8 font-medium text-slate-700 backdrop-blur transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-sm"
            >
              Explore features
            </a>
          </div>

          {/* Premium Mock App Preview */}
          <div
            className="mx-auto mt-20 max-w-4xl"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.8s 0.5s ease, transform 0.8s 0.5s ease",
            }}
          >
            <div className="animate-float-y overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur transition-shadow hover:shadow-slate-900/15">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-300 transition-colors hover:bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-slate-300 transition-colors hover:bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-slate-300 transition-colors hover:bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Github className="h-3 w-3" />
                  <span>github.com/facebook/react</span>
                </div>
                <div className="w-12" /> {/* spacer for balance */}
              </div>

              <div className="space-y-5 p-6 sm:p-8 text-left bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,0.5))]">
                {/* Chat History Item */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700 shadow-sm">
                    <p className="mb-3">I've indexed <strong>React</strong>. What would you like to know?</p>
                    <div className="flex gap-2">
                      <span className="inline-flex cursor-default items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100">
                        <Zap className="h-3 w-3 text-amber-500" />
                        Explain the architecture
                      </span>
                      <span className="inline-flex cursor-default items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                        List dependencies
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Input */}
                <div className="flex justify-end gap-4">
                  <div className="rounded-2xl rounded-tr-sm bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm">
                    {typed}
                    <span className="ml-1 inline-block h-4 w-1.5 -mb-0.5 animate-pulse bg-blue-400 align-middle" />
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-sm font-semibold text-xs">
                    YOU
                  </div>
                </div>
                
                {/* Fake Code Block Streamed Response */}
                <div className="flex gap-4 opacity-50 transition-opacity hover:opacity-100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="w-full max-w-[80%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-5 py-4 text-sm leading-relaxed text-slate-700 shadow-sm">
                     <p className="mb-3">Here is an example from the source code:</p>
                     <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                        <div className="flex items-center px-4 py-2 border-b border-slate-700/50 bg-slate-800/80">
                          <span className="text-xs font-mono text-slate-400">typescript</span>
                        </div>
                        <pre className="p-4 text-slate-300 font-mono text-xs">
                          <span className="text-pink-400">export function</span> <span className="text-blue-300">render</span>() {'{'}
                          <br />  <span className="text-slate-500">// ...</span>
                          <br />{'}'}
                        </pre>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative border-t border-slate-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Built for Developers
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A premium, intelligent interface to explore codebases.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: "Multi-turn Chat",
                desc: "Conversational context is maintained across multiple messages. Ask follow-up questions effortlessly without losing context."
              },
              {
                icon: Activity,
                title: "Streaming Responses",
                desc: "Answers stream word-by-word in real-time, delivering the premium UX you expect from modern AI chat applications."
              },
              {
                icon: Code,
                title: "Rich Markdown",
                desc: "Full markdown support with beautiful, dark-themed syntax highlighting and one-click copy functionality for code blocks."
              },
              {
                icon: FolderGit2,
                title: "Fast Indexing",
                desc: "Instantly load and chunk GitHub repositories into vectors for highly accurate, code-grounded semantic search."
              },
              {
                icon: Clock,
                title: "Recent Memory",
                desc: "Automatically saves your recently visited repositories so you can jump right back into the codebase in one click."
              },
              {
                icon: Zap,
                title: "Quick Actions",
                desc: "Not sure what to ask? Pre-built quick action prompts help you understand architecture, routing, and endpoints in seconds."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-t border-slate-100 bg-slate-50/60 py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-aurora-3 absolute right-[-10%] top-[-20%] h-[30rem] w-[30rem] rounded-full blur-[90px]"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", transformOrigin: "center" }} />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Three simple steps
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              No complex setup or API keys needed. Just drop a URL.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { icon: Github, step: "01", title: "Paste a repo URL", body: "Drop a link to any public GitHub repository directly into the app." },
              { icon: Cpu, step: "02", title: "Let it index", body: "The source code is quickly chunked and embedded for deep semantic search." },
              { icon: CheckCircle2, step: "03", title: "Ask anything", body: "Get rich, formatted answers grounded in the actual codebase." },
            ].map((s, i) => (
              <div
                key={s.step}
                className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-900/10 hover:ring-slate-300"
              >
                <div className="relative mb-6 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 ring-1 ring-slate-100 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-4xl font-bold text-slate-100 transition-colors group-hover:text-slate-200">{s.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="try" className="mx-auto max-w-6xl px-6 py-24">
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-20 text-center text-white shadow-2xl">
          {/* Live aurora inside CTA */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-aurora-1 absolute left-[10%] top-[-30%] h-[30rem] w-[30rem] rounded-full blur-[80px]"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)", transformOrigin: "center" }} />
            <div className="animate-aurora-2 absolute right-[5%] bottom-[-20%] h-[25rem] w-[25rem] rounded-full blur-[70px]"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)", transformOrigin: "center" }} />
          </div>
          
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))]" />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
              Ready to explore?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
              Open the app, paste a repository URL, and start chatting with the codebase in seconds.
            </p>
            <div className="mt-10">
              <Link
                to="/app"
                className="group/btn relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-xl bg-white px-8 font-semibold text-slate-900 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20 active:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-100/60 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <Sparkles className="h-5 w-5 text-blue-600 transition-transform group-hover/btn:rotate-12" />
                Launch RepoChat
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900 tracking-tight">RepoChat</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 font-medium">
            <a href="#features" className="transition-colors hover:text-slate-900">Features</a>
            <a href="#how" className="transition-colors hover:text-slate-900">How it works</a>
            <a href="#try" className="transition-colors hover:text-slate-900">Try it</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
