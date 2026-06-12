import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|css|scss|html|py|rb|go|rs|java|kt|c|h|cpp|hpp|cs|php|swift|sh|yml|yaml|toml|sql)$/i;
const SKIP_DIRS = /(^|\/)(node_modules|dist|build|\.next|\.output|\.git|coverage|vendor)(\/|$)/;
const MAX_FILE_BYTES = 40_000;
const MAX_TOTAL_BYTES = 180_000;

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

    const repoRes = await gh(`/repos/${owner}/${repo}`);
    if (!repoRes.ok) throw new Error(`Repo not found (${repoRes.status})`);
    const repoInfo = (await repoRes.json()) as { default_branch: string };

    const treeRes = await gh(
      `/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`,
    );
    if (!treeRes.ok) throw new Error(`Tree fetch failed (${treeRes.status})`);
    const tree = (await treeRes.json()) as {
      tree: { path: string; type: string; size?: number }[];
    };

    const eligible = tree.tree.filter(
      (n) =>
          n.type === "blob" &&
          ALLOWED_EXT.test(n.path) &&
          !SKIP_DIRS.test(n.path) &&
          (n.size ?? 0) < MAX_FILE_BYTES,
    );

    const base = `https://raw.githubusercontent.com/${owner}/${repo}/${repoInfo.default_branch}`;
    const files: { path: string; content: string }[] = [];
    let total = 0;

    const results = await Promise.all(
      eligible.map(async (c) => {
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
            content: "You are RepoChat, a helpful code assistant. Answer using only the provided repository files.",
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
    return { answer: json.choices?.[0]?.message?.content ?? "No answer." };
  });
