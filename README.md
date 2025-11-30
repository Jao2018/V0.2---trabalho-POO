# Product Classification PWA

A Progressive Web App for product evaluation and classification with offline support.

## Quick Start for Developers

### Prerequisites
- Node.js 18+ installed
- Docker and Docker Compose installed
- **Eclipse IDE** (opcional - veja instruções abaixo)

### Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd product-classification-pwa
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

### Configuração no Eclipse IDE

Este projeto pode ser importado e executado no Eclipse IDE:

#### Instalando Plugins Necessários

1. Abra o Eclipse
2. Vá em **Help** > **Eclipse Marketplace**
3. Instale os seguintes plugins:
   - **Wild Web Developer** (suporte para JavaScript, TypeScript, HTML, CSS)
   - **Docker Tooling** (opcional, para gerenciar containers do Eclipse)

#### Importando o Projeto

1. No Eclipse, vá em **File** > **Import**
2. Selecione **General** > **Existing Projects into Workspace**
3. Clique em **Next**
4. Em **Select root directory**, navegue até a pasta do projeto
5. Marque o projeto na lista e clique em **Finish**

#### Executando o Projeto no Eclipse

**Opção 1: Usando External Tools (Recomendado)**

1. Vá em **Run** > **External Tools** > **External Tools Configurations...**
2. Clique com botão direito em **Program** e selecione **New Configuration**
3. Configure:
   - **Name:** `npm run dev`
   - **Location:** `/usr/local/bin/npm` (Linux/Mac) ou `C:\Program Files\nodejs\npm.cmd` (Windows)
   - **Working Directory:** `${project_loc}`
   - **Arguments:** `run dev`
4. Clique em **Apply** e depois **Run**

Repita o processo para criar configurações para:
- `docker-compose up` (para iniciar o banco de dados)
- `docker-compose down` (para parar o banco de dados)

**Opção 2: Usando Terminal Integrado**

1. Vá em **Window** > **Show View** > **Terminal**
2. Clique no ícone de novo terminal
3. Execute os comandos normalmente:
   \`\`\`bash
   docker-compose up -d
   npm install
   npm run dev
   \`\`\`

#### Dicas para Eclipse

- Use **Ctrl+Shift+R** para busca rápida de arquivos
- Use **Ctrl+H** para buscar no projeto
- Configure formatadores automáticos em **Preferences** > **JavaScript** > **Code Style**
- O arquivo `.project` está incluído no repositório para facilitar a importação

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
