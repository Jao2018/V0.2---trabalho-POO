# Product Classification PWA

A Progressive Web App for product evaluation and classification with offline support.

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
   The database will automatically initialize with tables and seed data on first connection.

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

The `.env` file is included in the repository with local development defaults. No configuration needed!

- `DATABASE_URL`: Points to the local Docker PostgreSQL database
- `JWT_SECRET`: Used for authentication (change in production)
- `NEXT_PUBLIC_BASE44_API_URL`: Base44 API endpoint

### Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** trabalho_database
- **Username:** postgres
- **Password:** postgres

### Stopping the Database

\`\`\`bash
docker-compose down
\`\`\`

To remove the database volume as well:
\`\`\`bash
docker-compose down -v
\`\`\`

## Features

- Product evaluation and classification
- Offline support with service workers
- Role-based access control (operator, manager, admin)
- Category-based evaluation criteria
- Progressive Web App with installable interface
