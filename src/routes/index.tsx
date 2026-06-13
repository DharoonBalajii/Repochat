import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Github,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Cpu,
  MessageSquare,
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

function Landing() {
  const [typed, setTyped] = useState("");
  const phrases = [
    "What does this repo do?",
    "Explain the auth flow.",
    "Where is routing handled?",
    "Summarize the README.",
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Typewriter loop in the mock chat
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
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform hover:rotate-6">
              <Github className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">RepoChat</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#how" className="story-link">How it works</a>
            <a href="#try" className="story-link">Try it</a>
          </nav>
          <Link
            to="/app"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:gap-2.5"
          >
            Launch app
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* Single soft blue accent for a unified, professional feel */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-3xl" />
        </div>

        {/* Subtle slate grid */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] opacity-70" />


        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
          <div className="mx-auto mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live now
          </div>

          <h1
            className="mx-auto max-w-3xl animate-fade-in text-5xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl"
            style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
          >
            Chat with any{" "}
            <span className="text-blue-600">GitHub repository</span>
          </h1>


          <p
            className="mx-auto mt-6 max-w-2xl animate-fade-in text-lg leading-relaxed text-slate-600"
            style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
          >
            Paste a repo URL, let RepoChat index the code, then ask anything.
            Answers come back grounded in the actual source.
          </p>

          <div
            className="mt-10 flex animate-fade-in flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
          >
            <Link
              to="/app"
              className="group inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Open the app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:-translate-y-0.5"
            >
              See how it works
            </a>
          </div>

          {/* Mock app preview with live typing */}
          <div
            className="mx-auto mt-16 max-w-3xl animate-fade-in"
            style={{ animationDelay: "450ms", animationFillMode: "backwards" }}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-transform hover:-translate-y-1 hover:shadow-slate-900/15">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-3 font-mono text-xs text-slate-400">repochat</span>
              </div>
              <div className="space-y-4 p-6 text-left">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Github className="h-4 w-4 text-slate-500" />
                  <span className="font-mono text-sm text-slate-600">github.com/your/repo</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Indexed
                  </span>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-sm bg-slate-900 px-4 py-3 text-sm text-slate-100">
                    {typed}
                    <span className="ml-0.5 inline-block h-4 w-0.5 -mb-0.5 animate-pulse bg-slate-100 align-middle" />
                  </div>
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-slate-100 bg-slate-50/60 py-24">
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
              { icon: FolderGit2, step: "01", title: "Paste a repo URL", body: "Drop a link to any public GitHub repository." },
              { icon: Cpu, step: "02", title: "Let it index", body: "Source is chunked and embedded for semantic search." },
              { icon: MessageSquare, step: "03", title: "Ask anything", body: "Get answers grounded in the actual code." },
            ].map((s, i) => (
              <div
                key={s.step}
                className="group relative animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <s.icon className="h-5 w-5" />
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

      {/* CTA */}
      <section id="try" className="mx-auto max-w-6xl px-6 py-24">
        <div className="group relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center text-white shadow-xl">
          {/* Animated shine */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to try it?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Open the app and paste a repository URL.
          </p>
          <div className="mt-8">
            <Link
              to="/app"
              className="group/btn inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/20"
            >
              Launch RepoChat
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
