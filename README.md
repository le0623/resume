# Resume Generator

A modern resume generation application built with Next.js, PostgreSQL, Prisma, and Docker. Generate professional resumes using AI with customizable templates and profiles.

## Features

- **AI-Powered Resume Generation**: Uses OpenAI GPT to generate tailored resumes based on job descriptions
- **Profile Management**: Store and manage user profiles with personal information, skills, and experience
- **Template System**: Customizable HTML templates for different resume styles
- **Admin Portal**: Complete admin interface for managing profiles, templates, and viewing analytics
- **Analytics Dashboard**: Track resume generation with daily, weekly, and monthly charts
- **PDF Export**: Generate professional PDF resumes
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Database Integration**: PostgreSQL with Prisma ORM for data persistence

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4
- **PDF Generation**: Puppeteer with Chromium
- **Charts**: Recharts
- **UI Components**: Radix UI, Lucide React
- **Authentication**: WorkOS AuthKit
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, for easy commands)
- OpenAI API key
- WorkOS credentials (for authentication)

### Database Persistence

**Important**: The database data is now persisted between restarts! The PostgreSQL data is stored in a Docker volume that persists even when containers are stopped and restarted.

- **First time setup**: Run `make first-time` or `make quick-start`
- **Regular restarts**: Use `make up` or `make dev` - your data will be preserved
- **Reset database**: Only run `make db-setup` or `make db-reset` when you want to reset data

### 1. Clone and Setup

```bash
git clone <repository-url>
cd resume-gen
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resume_gen"

# OpenAI
OPENAI_API_KEY="your_openai_api_key_here"

# WorkOS (for authentication)
WORKOS_CLIENT_ID="your_workos_client_id"
WORKOS_CLIENT_SECRET="your_workos_client_secret"
WORKOS_REDIRECT_URI="http://localhost:25925/callback"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:25925"
```

### 3. Start with Make (Recommended)

```bash
# Quick start for new users (includes database setup)
make quick-start

# Or step by step:
make first-time  # Start services and setup database
# OR
make up          # Start all services only
make db-setup    # Setup database (only needed once or to reset)
```

### 4. Alternative: Direct Docker Commands

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec app npm run db:push

# Seed the database with initial data
docker-compose exec app npm run db:seed
```

### 5. Access the Application

- **Main App**: http://localhost:25925
- **Admin Portal**: http://localhost:25925/admin
- **Database**: localhost:5432 (postgres/postgres)

## Makefile Commands

The project includes a comprehensive Makefile for easy management:

### Essential Commands

```bash
make help          # Show all available commands
make quick-start   # Quick setup for new users
make up            # Start all services
make down          # Stop all services
make restart       # Restart all services
```

### Development Commands

```bash
make dev           # Start development environment
make dev-reset     # Reset development environment
make logs          # View logs from all services
make logs-app      # View app logs only
make logs-db       # View database logs only
```

### Database Commands

```bash
make db-setup      # Setup database (migrate and seed) - USE ONLY ONCE or to reset
make db-reset      # Reset database completely - DELETES ALL DATA
make db-migrate    # Run migrations only (safe to run multiple times)
make db-seed       # Seed database with sample data only
make db-check      # Check if database needs initial setup
make db-studio     # Open Prisma Studio
make db-backup     # Backup database
make db-restore    # Restore from backup (requires BACKUP_FILE=filename.sql)
```

### Maintenance Commands

```bash
make clean         # Clean up Docker resources
make clean-all     # Clean up all Docker resources
make status        # Show service status
make health        # Check service health
make monitor       # Monitor resource usage
```

### Production Commands

```bash
make build         # Build Docker images
make deploy        # Deploy to production
make security-scan # Run security scan
make update        # Update dependencies
```

## Development Setup

### Local Development

```bash
# Using Makefile (recommended)
make dev

# Or manually:
npm install
docker-compose up postgres -d
npm run db:push
npm run db:seed
npm run dev
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## Project Structure

```
resume-gen/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── generate-pdf/  # PDF generation
│   │   ├── generate-resume/ # Resume generation
│   │   ├── preview-template/ # Template preview
│   │   └── templates/     # Template management
│   ├── admin/             # Admin portal pages
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── admin/             # Admin portal components
│   ├── ui/                # Reusable UI components
│   └── resume-generator-v2.tsx # Main resume generator
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── public/                # Static assets
├── templates/             # HTML templates
├── docker-compose.yml     # Docker services
├── Dockerfile            # Application container
└── package.json          # Dependencies and scripts
```

## Database Schema

### Profiles Table
- `id`: UUID primary key
- `name`: User's full name
- `email`: Contact email
- `phone`: Phone number (optional)
- `address`: Physical address (optional)
- `summary`: Professional summary
- `skills`: Technical skills
- `experience`: Work experience
- `education`: Educational background
- `projects`: Project portfolio
- `certifications`: Professional certifications
- `createdAt`/`updatedAt`: Timestamps

### Templates Table
- `id`: UUID primary key
- `name`: Template name
- `description`: Template description
- `html`: HTML template content
- `isActive`: Template availability status
- `createdAt`/`updatedAt`: Timestamps

### Resumes Table
- `id`: UUID primary key
- `jobUrl`: Job posting URL (optional)
- `jobDescription`: Job description text
- `generatedResume`: AI-generated resume content
- `profileId`: Foreign key to profiles
- `templateId`: Foreign key to templates
- `createdAt`/`updatedAt`: Timestamps

## API Endpoints

### Public Endpoints
- `GET /api/templates` - Get available templates
- `POST /api/generate-resume` - Generate resume with AI
- `POST /api/preview-template` - Preview resume with template
- `POST /api/generate-pdf` - Generate PDF resume

### Admin Endpoints
- `GET /api/admin/profiles` - List all profiles
- `POST /api/admin/profiles` - Create new profile
- `GET /api/admin/profiles/[id]` - Get profile details
- `PUT /api/admin/profiles/[id]` - Update profile
- `DELETE /api/admin/profiles/[id]` - Delete profile
- `GET /api/admin/templates` - List all templates
- `POST /api/admin/templates` - Create new template
- `GET /api/admin/templates/[id]` - Get template details
- `PUT /api/admin/templates/[id]` - Update template
- `DELETE /api/admin/templates/[id]` - Delete template
- `GET /api/admin/resumes` - List all generated resumes
- `GET /api/admin/analytics` - Get analytics data

## Admin Portal Features

### Analytics Dashboard
- Resume generation statistics
- Daily, weekly, monthly charts
- Recent activity tracking
- Total counts for profiles, templates, and resumes

### Profile Management
- Create, edit, and delete user profiles
- Form-based profile editing
- Profile listing with resume counts

### Template Management
- Create, edit, and delete resume templates
- HTML template editor
- Template activation/deactivation
- Template usage statistics

### Resume Browser
- View all generated resumes
- Search and filter resumes
- Preview resume content
- Download PDF resumes

## Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL="postgresql://user:pass@host:5432/db"
   export OPENAI_API_KEY="your_production_key"
   # ... other production variables
   ```

2. **Docker Deployment**:
   ```bash
   # Build and start production containers
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Database Migration**:
   ```bash
   # Run migrations in production
   docker-compose exec app npm run db:push
   docker-compose exec app npm run db:seed
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for resume generation | Yes |
| `WORKOS_CLIENT_ID` | WorkOS client ID for authentication | Yes |
| `WORKOS_CLIENT_SECRET` | WorkOS client secret | Yes |
| `WORKOS_REDIRECT_URI` | WorkOS redirect URI | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.