import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Files we care about (source / docs). Skip lockfiles, binaries, build output.
const ALLOWED_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|css|scss|html|py|rb|go|rs|java|kt|c|h|cpp|hpp|cs|php|swift|sh|yml|yaml|toml|sql)$/i;
const SKIP_DIRS = /(^|\/)(node_modules|dist|build|\.next|\.output|\.git|coverage|vendor)(\/|$)/;
const MAX_FILE_BYTES = 40_000; // per file
const MAX_TOTAL_BYTES = 180_000; // total context budget


function parseRepo(url: string) {
  const m = url.trim().match(/github\.com[/:]([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/?#]|$)/i);
  if (!m) throw new Error("Invalid GitHub URL");
  return { owner: m[1], repo: m[2] };
}

async function gh(path: string): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`https://api.github.com${path}`, { headers });
}

export const processRepo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    const { owner, repo } = parseRepo(data.url);

    // Get default branch
    const repoRes = await gh(`/repos/${owner}/${repo}`);
    if (!repoRes.ok) throw new Error(`Repo not found (${repoRes.status})`);
    const repoInfo = (await repoRes.json()) as { default_branch: string };

    // Fetch full tree
    const treeRes = await gh(
      `/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`,
    );
    if (!treeRes.ok) throw new Error(`Tree fetch failed (${treeRes.status})`);
    const tree = (await treeRes.json()) as {
      tree: { path: string; type: string; size?: number }[];
    };

    // Files we always want first if they exist
    const PRIORITY = /^(readme(\.[a-z]+)?|package\.json|pyproject\.toml|cargo\.toml|go\.mod|requirements\.txt|composer\.json|gemfile|index\.(html|tsx?|jsx?))$/i;

    const eligible = tree.tree.filter(
      (n) =>
        n.type === "blob" &&
        ALLOWED_EXT.test(n.path) &&
        !SKIP_DIRS.test(n.path) &&
        (n.size ?? 0) < MAX_FILE_BYTES,
    );

    const priority = eligible.filter((n) => PRIORITY.test(n.path.split("/").pop() ?? ""));
    const rest = eligible
      .filter((n) => !PRIORITY.test(n.path.split("/").pop() ?? ""))
      .sort((a, b) => (a.size ?? 0) - (b.size ?? 0));

    const candidates = [...priority, ...rest];

    // Fetch raw contents in parallel
    const base = `https://raw.githubusercontent.com/${owner}/${repo}/${repoInfo.default_branch}`;
    const files: { path: string; content: string }[] = [];
    let total = 0;

    const results = await Promise.all(
      candidates.map(async (c) => {
        const r = await fetch(`${base}/${c.path}`);
        if (!r.ok) return null;
        const text = await r.text();
        return { path: c.path, content: text.slice(0, MAX_FILE_BYTES) };
      }),
    );

    for (const f of results) {
      if (!f) continue;
      if (total + f.content.length > MAX_TOTAL_BYTES) break;
      files.push(f);
      total += f.content.length;
    }

    return { repo: `${owner}/${repo}`, files, chunks: files.length };
  });

// Strip common markdown syntax so the AI output looks like plain text.
function stripBold(s: string) {
  return s
    // Remove fenced code block markers ``` (keep the code inside)
    .replace(/```[a-zA-Z0-9]*\n?/g, "")
    .replace(/```/g, "")
    // Remove ATX headings: leading #, ##, ### ... at start of a line
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    // Remove blockquote markers
    .replace(/^\s{0,3}>\s?/gm, "")
    // Convert bullet markers (*, -, +) at line start to a clean "• "
    .replace(/^\s*[*\-+]\s+/gm, "• ")
    // Numbered list: keep the number but drop trailing markdown spacing oddities (no-op safe)
    // Bold / italic / underline markers
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1$2")
    .replace(/(^|[^_])_(?!\s)([^_\n]+?)_(?!_)/g, "$1$2")
    // Inline code `x` → x
    .replace(/`([^`\n]+)`/g, "$1")
    // Collapse 3+ blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const askQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      question: z.string().min(1),
      files: z.array(z.object({ path: z.string(), content: z.string() })).min(1),
    }),
  )
  .handler(async ({ data }) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY not configured");

    const context = data.files
      .map((f) => `--- FILE: ${f.path} ---\n${f.content}`)
      .join("\n\n");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/owl-alpha",
        messages: [
          {
            role: "system",
            content:
              "You are RepoChat, a helpful code assistant. Answer using only the provided repository files. Reply in plain text only — do NOT use any markdown syntax: no #, ##, ### headings, no **bold**, no *italics*, no backticks, no bullet asterisks. Use plain sentences and, if listing, start lines with '- '.",
          },
          {
            role: "user",
            content: `Repository files:\n\n${context}\n\nQuestion: ${data.question}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "No answer.";
    return { answer: stripBold(raw) };
  });
