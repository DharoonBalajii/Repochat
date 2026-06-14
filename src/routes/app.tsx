import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Github,
  FolderGit2,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ArrowLeft,
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

  const isRateLimit = (msg: string) =>
    /\b429\b|too many requests|rate[- ]?limit|insufficient[_ ]?credits/i.test(msg);

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
      {/* Professional light backdrop — subtle slate grid + single soft blue accent */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20vh] left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 max-h-[44rem] max-w-[44rem] rounded-full bg-blue-500/[0.06] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:clamp(28px,6vw,56px)_clamp(28px,6vw,56px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-60" />
      </div>



      <header className="relative border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">RepoChat</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Chat with a repository</h1>
          <p className="mt-2 text-sm text-slate-600">Paste a GitHub URL, then ask anything about the code.</p>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">1. Load Repository</h2>
          </div>

          <form onSubmit={handleProcess} className="space-y-4">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <button
              type="submit"
              disabled={processing || !repoUrl.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
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
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Repository loaded.
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                {chunks} files loaded
              </span>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">2. Ask a Question</h2>
          </div>

          <form onSubmit={handleAsk} className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What does the readme file say?"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <button
              type="submit"
              disabled={asking || !question.trim() || !files}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {asking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking{thinkingDots}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Ask AI
                </>
              )}
            </button>
          </form>

          {!files && !asking && (
            <p className="mt-3 text-xs text-slate-500">Process a repository first to enable questions.</p>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {answer && !asking && (
            <div className="mt-5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {answer}
            </div>
          )}
        </section>
      </div>

      {limitHit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setLimitHit(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Sorry guys 😊
            </h2>
            <p className="text-slate-600 leading-relaxed">
              I'm currently using a free tier and the daily request limit has
              been reached. Please come back tomorrow to check it out.
            </p>
            <p className="text-slate-700 font-medium mt-3">Thank you!</p>
            <button
              onClick={() => setLimitHit(false)}
              className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>

  );
}
