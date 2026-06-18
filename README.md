# 🚀 RepoChat

> **Chat with any GitHub repository using AI.**
> Paste a public GitHub repository URL, let RepoChat index the codebase, and ask questions that are answered directly from the repository's source code.

---

## ✨ Features

* 🔗 Chat with **any public GitHub repository**
* 📂 Automatically indexes repository source files
* 🧠 AI-powered answers grounded in the actual codebase
* ⚡ Smart file filtering for faster indexing
* 🎨 Modern, responsive UI built with React & Tailwind CSS
* 🔍 Understand unfamiliar codebases in seconds
* 💻 Perfect for developers, contributors, and learners

---

## 📸 Preview

> *Add screenshots or a demo GIF here*

```
+---------------------------------------------------+
| Repository: github.com/vercel/next.js             |
+---------------------------------------------------+

❓ How does routing work?

🤖 RepoChat:
The routing system is implemented in...

(Source: packages/next/src/server/...)
```

---

## 🛠 Tech Stack

| Technology         | Purpose             |
| ------------------ | ------------------- |
| ⚛️ TanStack Start  | React Framework     |
| ⚡ Vite             | Build Tool          |
| 🎨 Tailwind CSS v4 | Styling             |
| 🧩 shadcn/ui       | UI Components       |
| 🤖 OpenRouter API  | AI Responses        |
| 📂 GitHub REST API | Repository Indexing |
| 📝 TypeScript      | Type Safety         |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DharoonBalajii/Repochat.git

cd Repochat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
GITHUB_TOKEN=your_github_personal_access_token
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Start the development server

```bash
npm run dev
```

Your app will now be running locally.

---

## 💡 How It Works

```text
GitHub Repository URL
          │
          ▼
Fetch Repository Files
          │
          ▼
Smart File Filtering
          │
          ▼
Create AI Context
          │
          ▼
Ask Questions
          │
          ▼
Grounded AI Answers
```

---

## 🎯 Example Questions

* How does authentication work?
* Explain the project architecture.
* Where is the database configured?
* What libraries are used?
* Summarize this repository.
* Show me where API routes are implemented.
* How do I contribute to this project?

---

## 🌟 Why RepoChat?

Reading thousands of lines of unfamiliar code can take hours.

RepoChat helps developers understand repositories within minutes by allowing them to ask natural language questions and receive responses grounded in the repository's actual source code.

Whether you're:

* 👨‍💻 Exploring an open-source project
* 🚀 Onboarding to a new codebase
* 📚 Learning from production repositories
* 🔍 Looking for a specific implementation

RepoChat makes navigating large codebases effortless.

---

## 📁 Project Structure

```text
src/
├── components/
├── routes/
├── services/
├── utils/
└── types/
```

---

## 🔮 Future Improvements

* Repository embeddings for faster search
* Multi-repository conversations
* Chat history
* Streaming AI responses
* Syntax-highlighted code citations
* Private repository support
* Repository summaries
* Team workspaces

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Dharoon Balajii**

If you found this project useful, consider giving it a ⭐ on GitHub!
