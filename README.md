# RepoChat

AI-powered tool to chat with any GitHub repository. Paste a repo URL, let it index the source code, and ask questions - answers come back grounded in the actual codebase.

## Features

- Paste any public GitHub repository URL
- Automatic file indexing with smart filtering
- AI-powered Q&A grounded in actual source code
- Clean, responsive UI built with React + TailwindCSS

## Tech Stack

- **Framework**: TanStack Start (React + Vite)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **AI**: OpenRouter API
- **Language**: TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Set up your `.env` file:

```
GITHUB_TOKEN=your_github_token
OPENROUTER_API_KEY=your_openrouter_key
```

## How It Works

1. Enter a GitHub repository URL
2. The app fetches and indexes source files via the GitHub API
3. Ask any question about the codebase
4. Get AI-generated answers based on the actual code

## License

MIT
