import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  Github,
  FolderGit2,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { processRepo, askQuestion } from "@/lib/repochat.functions";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "RepoChat — App" },
      { name: "description", content: "Paste a GitHub repository URL and ask questions about the codebase." },
    ],
  }),
  component: AppPage,
});

type RepoFile = { path: string; content: string };

/* ─── Mini particle canvas (subtler for app page) ─────────────────── */
function AppParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: { x: number; y: number; vy: number; vx: number; r: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const spawn = () =>
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 6,
        vy: -(0.25 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.8,
        alpha: 0,
      });

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame % 22 === 0) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        const prog = 1 - p.y / canvas.height;
        p.alpha = prog < 0.15 ? prog / 0.15 : prog > 0.85 ? (1 - prog) / 0.15 : 1;
        if (p.y < -6) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.globalAlpha = p.alpha * 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}

function AppPage() {
  const process = useServerFn(processRepo);
  const ask = useServerFn(askQuestion);

  const [repoUrl, setRepoUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [processing, setProcessing] = useState(false);
  const [asking, setAsking] = useState(false);
  const [files, setFiles] = useState<RepoFile[] | null>(null);
  const [chunks, setChunks] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [limitHit, setLimitHit] = useState(false);
  const [thinkingDots, setThinkingDots] = useState("");
  const [visible, setVisible] = useState(false);

  const isRateLimit = (msg: string) =>
    /\b429\b|too many requests|rate[- ]?limit|insufficient[_ ]?credits/i.test(msg);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!asking) return;
    setThinkingDots("");
    const t = setInterval(() => {
      setThinkingDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 350);
    return () => clearInterval(t);
  }, [asking]);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setError("");
    setChunks(null);
    setFiles(null);
    setAnswer("");
    setProcessing(true);
    try {
      const res = await process({ data: { url: repoUrl.trim() } });
      setFiles(res.files);
      setChunks(res.chunks);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load repository";
      if (isRateLimit(msg)) setLimitHit(true);
      else setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !files) return;
    setError("");
    setAnswer("");
    setAsking(true);
    try {
      const res = await ask({ data: { question: question.trim(), files } });
      setAnswer(res.answer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get answer";
      if (isRateLimit(msg)) setLimitHit(true);
      else setError(msg);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">

      {/* ── Animated background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Aurora orbs */}
        <div
          className="animate-aurora-1 absolute left-[-5%] top-[-10%] h-[50rem] w-[50rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", transformOrigin: "center" }}
        />
        <div
          className="animate-aurora-2 absolute right-[-10%] bottom-[10%] h-[40rem] w-[40rem] rounded-full blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", transformOrigin: "center" }}
        />
        {/* Grid */}
        <div className="animate-grid-fade absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:clamp(28px,6vw,56px)_clamp(28px,6vw,56px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-60" />
        {/* Particles */}
        <AppParticles />
      </div>

      {/* ── Header ── */}
      <header
        className="relative border-b border-slate-200/70 bg-white/70 backdrop-blur"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm text-slate-600 transition-all hover:text-slate-900 hover:-translate-x-0.5"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform hover:rotate-6">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">RepoChat</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* ── Title ── */}
        <div
          className="mb-10 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease",
          }}
        >
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3 w-3 animate-pulse" />
            AI-powered code Q&amp;A
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Chat with a repository</h1>
          <p className="mt-2 text-sm text-slate-600">Paste a GitHub URL, then ask anything about the code.</p>
        </div>

        {/* ── Step 1: Load Repo ── */}
        <section
          className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s 0.2s cubic-bezier(0.22,1,0.36,1), transform 0.7s 0.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform hover:scale-105">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">1. Load Repository</h2>
          </div>

          <form onSubmit={handleProcess} className="space-y-4">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-sm"
            />
            <button
              type="submit"
              disabled={processing || !repoUrl.trim()}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching files…
                </>
              ) : (
                "Process Repository"
              )}
            </button>
          </form>

          {chunks !== null && !processing && (
            <div
              className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm"
              style={{ animation: "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
            >
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4 animate-[scale_0.3s_ease]" />
                Repository loaded.
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                {chunks} files loaded
              </span>
            </div>
          )}
        </section>

        {/* ── Step 2: Ask ── */}
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur transition-all hover:shadow-md"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s 0.32s cubic-bezier(0.22,1,0.36,1), transform 0.7s 0.32s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform hover:scale-105">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">2. Ask a Question</h2>
          </div>

          <form onSubmit={handleAsk} className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What does the readme file say?"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-sm"
            />
            <button
              type="submit"
              disabled={asking || !question.trim() || !files}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {asking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking{thinkingDots}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  Ask AI
                </>
              )}
            </button>
          </form>

          {!files && !asking && (
            <p className="mt-3 text-xs text-slate-500">Process a repository first to enable questions.</p>
          )}

          {error && (
            <div
              className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              style={{ animation: "slide-up 0.4s ease both" }}
            >
              {error}
            </div>
          )}

          {answer && !asking && (
            <div
              className="mt-5 whitespace-pre-wrap rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-4 text-sm leading-relaxed text-slate-800 shadow-inner"
              style={{ animation: "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
            >
              {/* Answer "typed" feel — just show it, the animation provides the feel */}
              {answer}
            </div>
          )}
        </section>
      </div>

      {/* ── Rate-limit modal ── */}
      {limitHit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setLimitHit(false)}
          style={{ animation: "fade-in 0.25s ease both" }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slide-up 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Colorful top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Sorry guys 😊</h2>
              <p className="text-slate-600 leading-relaxed">
                I'm currently using a free tier and the daily request limit has been reached.
                Please come back tomorrow to check it out.
              </p>
              <p className="text-slate-700 font-medium mt-3">Thank you!</p>
              <button
                onClick={() => setLimitHit(false)}
                className="group relative mt-5 w-full overflow-hidden rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
