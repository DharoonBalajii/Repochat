import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Github,
  FolderGit2,
  Send,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  X,
  Clock,
  Zap,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { processRepo, askQuestion } from "@/lib/repochat.functions";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "RepoChat — App" },
      {
        name: "description",
        content:
          "Paste a GitHub repository URL and ask questions about the codebase.",
      },
    ],
  }),
  component: AppPage,
});

/* ─── Types ─────────────────────────────────────────────────────────── */
type RepoFile = { path: string; content: string };
type ChatMessage = { role: "user" | "assistant"; content: string };

const RECENT_KEY = "repochat_recent";
const QUICK_ACTIONS = [
  "What does this repository do?",
  "List all API endpoints or routes",
  "Explain the main entry point",
  "Summarize the README",
  "What are the key dependencies?",
  "How is the project structured?",
];

/* ─── LocalStorage helpers ──────────────────────────────────────────── */
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
}
function saveRecent(url: string) {
  const prev = getRecent().filter((u) => u !== url);
  localStorage.setItem(RECENT_KEY, JSON.stringify([url, ...prev].slice(0, 5)));
}
function removeRecent(url: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((u) => u !== url)));
}
function repoLabel(url: string) {
  const m = url.match(/github\.com\/(.+?)(?:\.git)?(?:\/|$)/i);
  return m ? m[1] : url;
}

/* ─── Copy button for code blocks ───────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="absolute right-2 top-2 rounded-md bg-slate-700/60 p-1.5 text-slate-300 opacity-0 transition-all hover:bg-slate-600 hover:text-white group-hover/code:opacity-100"
      title="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/* ─── Markdown renderer ─────────────────────────────────────────────── */
function MarkdownMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <div className={streaming ? "streaming-cursor" : ""}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const language = /language-(\w+)/.exec(className ?? "")?.[1];
            const code = String(children).replace(/\n$/, "");
            if (!code.includes("\n") && !language) {
              return (
                <code className="rounded-sm bg-slate-200 px-1 py-0.5 font-mono text-[0.8em] text-slate-800">
                  {children}
                </code>
              );
            }
            return (
              <div className="group/code relative my-3 overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900">
                {language && (
                  <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/80 px-4 py-1.5">
                    <span className="font-mono text-xs text-slate-400">{language}</span>
                  </div>
                )}
                <CopyButton text={code} />
                <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                  <code className="font-mono text-slate-100">{children}</code>
                </pre>
              </div>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          strong({ children }) {
            return <strong className="font-semibold text-slate-900">{children}</strong>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-2 border-l-4 border-blue-300 pl-4 text-slate-600 italic">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="mb-2 mt-3 text-lg font-semibold text-slate-900">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="mb-1.5 mt-3 text-base font-semibold text-slate-900">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="mb-1 mt-2 text-sm font-semibold text-slate-900">{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ─── Particle background ───────────────────────────────────────────── */
function AppParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const particles: { x: number; y: number; vy: number; vx: number; r: number; alpha: number }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    const spawn = () => particles.push({
      x: Math.random() * canvas.width, y: canvas.height + 6,
      vy: -(0.25 + Math.random() * 0.5), vx: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 1.8, alpha: 0,
    });
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      if (frame % 22 === 0) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        const prog = 1 - p.y / canvas.height;
        p.alpha = prog < 0.15 ? prog / 0.15 : prog > 0.85 ? (1 - prog) / 0.15 : 1;
        if (p.y < -6) { particles.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6"; ctx.globalAlpha = p.alpha * 0.35; ctx.fill(); ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/* ─── Main page ─────────────────────────────────────────────────────── */
function AppPage() {
  const process = useServerFn(processRepo);
  const ask = useServerFn(askQuestion);

  const [repoUrl, setRepoUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [files, setFiles] = useState<RepoFile[] | null>(null);
  const [chunks, setChunks] = useState<number | null>(null);
  const [processError, setProcessError] = useState("");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);
  // Typewriter streaming state
  const [streamingIdx, setStreamingIdx] = useState<number | null>(null);
  const [displayedContent, setDisplayedContent] = useState("");
  const streamAbort = useRef(false);

  const [chatError, setChatError] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isRateLimit = (msg: string) =>
    /\b429\b|too many requests|rate[- ]?limit|insufficient[_ ]?credits/i.test(msg);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    setRecentRepos(getRecent());
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedContent]);

  /* ── Typewriter animation ── */
  const typewriterStream = (fullText: string, msgIndex: number) => {
    streamAbort.current = false;
    setStreamingIdx(msgIndex);
    setDisplayedContent("");
    let i = 0;
    // Adaptive speed: faster for longer responses
    const charsPerTick = fullText.length > 800 ? 6 : fullText.length > 300 ? 3 : 1;
    const interval = setInterval(() => {
      if (streamAbort.current) { clearInterval(interval); return; }
      i = Math.min(i + charsPerTick, fullText.length);
      setDisplayedContent(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setStreamingIdx(null);
        setDisplayedContent("");
        setMessages((prev) => {
          const updated = [...prev];
          updated[msgIndex] = { role: "assistant", content: fullText };
          return updated;
        });
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, 18);
  };

  /* ── Process repo ── */
  const handleProcess = async (e: React.FormEvent, overrideUrl?: string) => {
    e.preventDefault();
    const url = (overrideUrl ?? repoUrl).trim();
    if (!url) return;
    setProcessError(""); setChunks(null); setFiles(null);
    setMessages([]); setChatError(""); setShowRecent(false);
    if (overrideUrl) setRepoUrl(overrideUrl);
    setProcessing(true);
    try {
      const res = await process({ data: { url } });
      setFiles(res.files);
      setChunks(res.chunks);
      saveRecent(url);
      setRecentRepos(getRecent());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load repository";
      if (isRateLimit(msg)) setLimitHit(true);
      else setProcessError(msg);
    } finally {
      setProcessing(false);
    }
  };

  /* ── Ask with multi-turn history + typewriter streaming ── */
  const handleSend = async (overrideQuestion?: string) => {
    const q = (overrideQuestion ?? input).trim();
    if (!q || !files || asking || streamingIdx !== null) return;

    setChatError("");
    const userMsg: ChatMessage = { role: "user", content: q };
    const newHistory = [...messages, userMsg];
    // Add placeholder assistant message
    const assistantIdx = newHistory.length;
    setMessages([...newHistory, { role: "assistant", content: "" }]);
    setInput("");
    setAsking(true);

    try {
      const res = await ask({ data: { messages: newHistory, files } });
      // Start typewriter with full answer
      typewriterStream(res.answer, assistantIdx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      if (isRateLimit(msg)) {
        setLimitHit(true);
      } else if (msg.includes("Inactivity Timeout") || msg.includes("Timeout") || msg.includes("Too much time") || msg.includes("504") || msg.includes("502")) {
        setChatError("Having some high demand or traffic on today please excuse for the delay or somthing");
      } else {
        setChatError(msg);
      }
      // Remove placeholder
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => {
    streamAbort.current = true;
    setMessages([]); setChatError(""); setStreamingIdx(null); setDisplayedContent("");
  };

  const handleRemoveRecent = (url: string, e: React.MouseEvent) => {
    e.stopPropagation(); removeRecent(url); setRecentRepos(getRecent());
  };

  const isBusy = asking || streamingIdx !== null;

  /* ─────────────── RENDER ──────────────── */
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">

      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-aurora-1 absolute left-[-5%] top-[-10%] h-[50rem] w-[50rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", transformOrigin: "center" }} />
        <div className="animate-aurora-2 absolute right-[-10%] bottom-[10%] h-[40rem] w-[40rem] rounded-full blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", transformOrigin: "center" }} />
        <div className="animate-grid-fade absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:clamp(28px,6vw,56px)_clamp(28px,6vw,56px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-60" />
        <AppParticles />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all hover:text-slate-900 hover:-translate-x-0.5">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform hover:rotate-6">
              <Github className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">RepoChat</span>
          </div>
          {messages.length > 0 ? (
            <button onClick={clearChat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300">
              <RotateCcw className="h-3 w-3" />
              New chat
            </button>
          ) : <div className="w-20" />}
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 flex flex-col gap-4">

        {/* ── Load repo panel ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition-all hover:shadow-md"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s 0.1s cubic-bezier(0.22,1,0.36,1), transform 0.6s 0.1s cubic-bezier(0.22,1,0.36,1)" }}>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <FolderGit2 className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">1. Load Repository</h2>
              </div>
              {recentRepos.length > 0 && (
                <button onClick={() => setShowRecent((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50">
                  <Clock className="h-3 w-3" />
                  Recent {recentRepos.length > 0 && `(${recentRepos.length})`}
                </button>
              )}
            </div>

            {/* Recent repos */}
            {showRecent && (
              <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ animation: "slide-up 0.3s ease both" }}>
                {recentRepos.map((url) => (
                  <div key={url}
                    className="group flex cursor-pointer items-center justify-between border-b border-slate-100 px-3 py-2.5 transition-colors last:border-0 hover:bg-white"
                    onClick={(e) => handleProcess(e as unknown as React.FormEvent, url)}>
                    <div className="flex min-w-0 items-center gap-2">
                      <Github className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate font-mono text-xs text-slate-700">{repoLabel(url)}</span>
                    </div>
                    <button onClick={(e) => handleRemoveRecent(url, e)}
                      className="ml-2 shrink-0 rounded p-0.5 text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleProcess} className="flex gap-2">
              <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <button type="submit" disabled={processing || !repoUrl.trim()}
                className="group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {processing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…</> : "Process"}
              </button>
            </form>

            {processError && <p className="mt-2 text-xs text-red-600">{processError}</p>}

            {chunks !== null && !processing && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-200"
                style={{ animation: "slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Repository indexed &amp; ready to chat
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {chunks} files
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick actions ── */}
        {files && messages.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur"
            style={{ animation: "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="mb-3 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-slate-700">Quick questions to get started</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((q) => (
                <button key={q} onClick={() => handleSend(q)} disabled={isBusy}
                  className="group relative overflow-hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:-translate-y-0.5 disabled:opacity-50">
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/60 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Chat messages ── */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur"
            style={{ animation: "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
            {messages.map((msg, i) => {
              const isStreamingThis = streamingIdx === i;
              const content = isStreamingThis ? displayedContent : msg.content;

              return (
                <div key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: "slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${Math.min(i * 30, 150)}ms` }}>

                  {msg.role === "assistant" && (
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white ${asking && i === messages.length - 1 ? "animate-pulse" : ""}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-slate-900 text-slate-50"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}>
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : asking && content === "" ? (
                      // Loading dots while waiting for API response
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "120ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "240ms" }} />
                      </div>
                    ) : (
                      <MarkdownMessage content={content} streaming={isStreamingThis && content.length > 0} />
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <span className="text-xs font-semibold">Y</span>
                    </div>
                  )}
                </div>
              );
            })}

            {chatError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                style={{ animation: "slide-up 0.3s ease both" }}>
                {chatError}
              </div>
            )}

            {/* Quick actions re-appear in chat after first message */}
            {messages.length > 0 && !isBusy && (
              <div className="pt-1">
                <div className="mb-2 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className="text-[11px] font-medium text-slate-400">More questions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.slice(0, 3).map((q) => (
                    <button key={q} onClick={() => handleSend(q)}
                      className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Input bar ── */}
        {files && (
          <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/8 backdrop-blur"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.7s 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
            <div className="flex items-end gap-3 p-3">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} disabled={isBusy}
                placeholder="Ask anything about the code… (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="min-h-[40px] flex-1 resize-none overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                style={{ maxHeight: "160px" }}
                onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = `${Math.min(t.scrollHeight, 160)}px`; }}
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || isBusy}
                className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/25 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                {isBusy
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              </button>
            </div>
            <p className="border-t border-slate-100 px-4 py-1.5 text-center text-[11px] text-slate-400">
              Answers are grounded in the indexed repo · AI can make mistakes
            </p>
          </div>
        )}

        {/* Empty state */}
        {!files && !processing && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center backdrop-blur"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s 0.3s ease" }}>
            <div className="animate-float-y mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <Github className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Load a repository to start chatting</h3>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
              Paste any public GitHub URL above and ask questions about the code, architecture, dependencies, or anything else.
            </p>
          </div>
        )}
      </div>

      {/* Rate-limit modal */}
      {limitHit && (
        <div role="dialog" aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setLimitHit(false)} style={{ animation: "fade-in 0.25s ease both" }}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()} style={{ animation: "slide-up 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Sorry guys 😊</h2>
              <p className="text-slate-600 leading-relaxed">
                I'm currently using a free tier and the daily request limit has been reached. Please come back tomorrow to check it out.
              </p>
              <p className="text-slate-700 font-medium mt-3">Thank you!</p>
              <button onClick={() => setLimitHit(false)}
                className="group relative mt-5 w-full overflow-hidden rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg">
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
