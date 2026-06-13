import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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
      setError(err instanceof Error ? err.message : "Failed to load repository");
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
      setError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {asking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
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
    </div>
  );
}
