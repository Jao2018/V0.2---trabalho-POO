# productclassificationpwa11

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/joaoquiteteprestserv-1817s-projects/v0-productclassificationpwa11-hg)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/7mLdF7HfXnh)

## Quick Start for Developers

### Prerequisites
- Node.js 18+ installed
- Docker and Docker Compose installed

### Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd V0.2---trabalho-POO
   \`\`\`

2. **Start the local database**
   \`\`\`bash
   docker-compose up -d
   \`\`\`
   This will start a PostgreSQL database on `localhost:5432` with database name `trabalho_database`.

3. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

The `.env` file is included in the repository with local development defaults. No configuration needed!

- `DATABASE_URL`: Points to the local Docker PostgreSQL database
- `JWT_SECRET`: Used for authentication (change in production)
- `NEXT_PUBLIC_BASE44_API_URL`: Base44 API endpoint

### Stopping the Database

\`\`\`bash
docker-compose down
\`\`\`

To remove the database volume as well:
\`\`\`bash
docker-compose down -v
\`\`\`

## Deployment

Your project is live at:

**[https://vercel.com/joaoquiteteprestserv-1817s-projects/v0-productclassificationpwa11-hg](https://vercel.com/joaoquiteteprestserv-1817s-projects/v0-productclassificationpwa11-hg)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/7mLdF7HfXnh](https://v0.app/chat/7mLdF7HfXnh)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
\`\`\`

```gitignore file="" isHidden
