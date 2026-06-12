import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RepoChat" },
      { name: "description", content: "AI-Powered GitHub Repository Q&A" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">RepoChat</span>
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Launch app
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-900">
          Chat with any GitHub repository
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Paste a repo URL, let RepoChat index the code, then ask anything.
        </p>
        <div className="mt-10">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
