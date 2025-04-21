# 📡 URL Analyzer Scheduler

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Worker-FF9955?style=flat&logo=Cloudflare)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript)
![PocketBase](https://img.shields.io/badge/PocketBase-000000?style=flat&logo=pocketbase)

A playful yet powerful Cloudflare Worker that wakes up every midnight, fetches unsummarized links from your PocketBase, sends them off to an AI summarizer, and stores the juicy summary back in your database. All the heavy lifting happens in the 🌓 of the night, so your mornings are a breeze!

---

## 🚀 Features

- **🕛 Scheduled Execution**: Runs at midnight every day via Cloudflare Workers Cron Triggers.
- **📚 PocketBase Integration**: Grabs links needing summaries from your `users` collection (no admin creds!).
- **🤖 AI Summarization**: Calls your favorite AI endpoint to generate concise summaries.
- **🔄 Automatic Update**: Saves the summaries right back to your PocketBase records.
- **🔧 TypeScript & Wrangler**: Fully typed, developer-friendly, and deployable with a single command.

---

## 📦 Getting Started

### Prerequisites

- Node.js **>= 16.x**
- A Cloudflare account with [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) configured
- A running PocketBase instance
- An AI summarization endpoint (e.g., OpenAI, Hugging Face)

### Installation

```bash
# Clone the repo
git clone https://github.com/3n3a/url-analyzer-scheduler.git
cd url-analyzer-scheduler

# Install dependencies
npm install
```

### Environment Variables

Create a `.dev.vars` file at the project root with the following:

```dotenv
AI_BASE_URL=https://api.your-ai.com/summarize
AI_API_KEY=your_ai_api_key_here
POCKETBASE_BASE_URL=https://db.example.com
POCKETBASE_USERNAME=non-admin-user
POCKETBASE_PASSWORD=superSecretPassword
```

> **Note:** The `POCKETBASE_USERNAME` & `POCKETBASE_PASSWORD` must belong to a user in the `users` collection, not an admin!

---

## 🛠️ Scripts

### Run in development mode

```sh
npm run dev
```

### Generate Types

```sh
npm run cf-typegen
```

### Deploy to Cloudflare

```sh
npm run deploy
```

### Test the scheduled job

```sh
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

---

## 🔍 How It Works

1. **Cron Trigger**: Cloudflare invokes the Worker at `0 0 * * *` (midnight UTC).
2. **PocketBase Fetch**: The Worker authenticates with your PocketBase user and queries for records missing a summary.
3. **AI Call**: For each link, it sends a request to `AI_BASE_URL` with the URL and receives a summary.
4. **Update Record**: The Worker writes the summary back to the original PocketBase record.

---

## 🤝 Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a pull request 🚀

---

## 🔒 License

[MIT](https://opensource.org/licenses/MIT) © 3n3a

---

> Built with ☕, TypeScript, and a sprinkle of midnight magic.