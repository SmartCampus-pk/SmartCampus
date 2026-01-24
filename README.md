# SmartCampus 🎓

Event management platform for campus organizations. Built with Next.js, Payload CMS, and MongoDB.

## About

**SmartCampus** is a web application that allows students to discover and join campus events organized by student organizations. Organizers can create and manage events, track participation, and engage with their community.

### Key Features

- 📅 **Event Management** - Create, list, and manage campus events
- 👥 **Participation Tracking** - Join/leave events, track participant numbers
- 🏛️ **Organizations** - Student organizations host events
- 🔐 **Role-based Access** - Students, organizers, admins with different permissions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Modern Stack** - Next.js 15, React 19, Payload CMS 3.x, MongoDB

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend/CMS** | Payload CMS 3.x, Express.js, Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **Testing** | Playwright (E2E), Vitest (Integration) |
| **Deployment** | Docker, Docker Compose |

## Prerequisites

- **Node.js** 18+ (recommended: 18 LTS)
- **pnpm** (or npm/yarn)
- **MongoDB** 4.0+ (local instance or cloud like Atlas)
- **Git**

## Quick Start

### Option 1: Local Development (without Docker)

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd SmartCampus
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URI=mongodb://127.0.0.1/smartcampus
   PAYLOAD_SECRET=your-secret-key-min-32-chars
   ```

4. **Ensure MongoDB is running**
   - **macOS/Linux**: `brew services start mongodb-community`
   - **Windows**: Start MongoDB service or use MongoDB Compass
   - **Cloud**: Use MongoDB Atlas connection string in DATABASE_URI

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - GraphQL: http://localhost:3000/api/graphql

7. **Create admin user**
   - Navigate to http://localhost:3000/admin
   - Follow on-screen instructions

### Option 2: Docker Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd SmartCampus
   cp .env.example .env
   ```

2. **Update DATABASE_URI in .env**
   ```env
   DATABASE_URI=mongodb://mongo/smartcampus
   PAYLOAD_SECRET=your-secret-key-min-32-chars
   ```

3. **Start containers**
   ```bash
   docker-compose up
   # Add -d to run in background: docker-compose up -d
   ```

4. **Access application**
   - Same as above (http://localhost:3000)

5. **Stop containers**
   ```bash
   docker-compose down
   ```

## Environment Variables

### Required
- **DATABASE_URI** - MongoDB connection string
  - Local: `mongodb://127.0.0.1/smartcampus`
  - Docker: `mongodb://mongo/smartcampus`
  - Cloud: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

- **PAYLOAD_SECRET** - JWT signing secret (min 32 characters)
  - Generate: `openssl rand -base64 32`

### Optional
- **NODE_OPTIONS** - Node.js options (default: `--no-deprecation`)
- **PORT** - Server port (default: 3000)

⚠️ **Important**: Never commit `.env` with real credentials!

## Project Structure

```
SmartCampus/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (frontend)/              # Public pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── events/              # Events listing & details
│   │   │   └── (auth)/              # Login, register
│   │   ├── (payload)/               # Payload admin panel
│   │   └── api/                     # Custom API endpoints
│   │       ├── auth/                # Auth endpoints
│   │       └── events/[id]/         # Event-specific endpoints
│   │
│   ├── collections/                 # Payload data models
│   │   ├── Users.ts                # Users + Auth
│   │   ├── Events.ts               # Campus events
│   │   ├── Organizations.ts        # Student organizations
│   │   ├── EventParticipations.ts  # Event attendance (M:N)
│   │   └── Media.ts                # File uploads
│   │
│   ├── components/                  # React components
│   │   ├── EventCard.tsx
│   │   ├── JoinEventButton.tsx
│   │   ├── Navigation.tsx
│   │   └── ...
│   │
│   ├── contexts/                    # React Context
│   │   └── AuthContext.tsx         # Auth state
│   │
│   ├── lib/                         # Utilities
│   │   ├── api.ts                  # API client
│   │   ├── slugify.ts              # URL slug generation
│   │   └── utils.ts                # General helpers
│   │
│   └── payload.config.ts           # Payload CMS config
│
├── tests/
│   ├── e2e/                        # End-to-end tests (Playwright)
│   └── int/                        # Integration tests (Vitest)
│
├── docker-compose.yml              # Docker setup
├── TECHNICAL_OVERVIEW.md           # Detailed architecture docs
└── package.json                    # Dependencies
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:int         # Integration tests only
pnpm test:e2e         # E2E tests only

# Maintenance
pnpm lint             # Run ESLint
pnpm generate:types   # Generate TypeScript types from Payload config
pnpm payload          # Payload CLI
```

## Collections (Data Models)

### Users
- User authentication and profiles
- Roles: student, org-admin, staff, super-admin
- Fields: email, firstName, lastName, organization, role

### Events
- Campus events created by organizations
- Fields: title, description, eventDate, location, organization, status
- Soft delete support (deletedAt field)

### Organizations
- Student organizations that host events
- Fields: name, description, type, status
- Member management via Users.organization

### EventParticipations
- Many-to-many relationship: Users ↔ Events
- Fields: event, user, status (going/interested/cancelled), createdAt
- Unique constraint on (event, user) pair

### Media
- File uploads (images, documents)
- Auto-generated resized versions
- Focal point selection

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Events
- `POST /api/events/:id/join` - Join event
- `POST /api/events/:id/leave` - Leave event
- `GET /api/events/:id/participants` - Get participants list

### Payload REST API
Automatically generated for all collections:
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (auth required)
- `PATCH /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (admin required)

Same pattern for: `/api/users`, `/api/organizations`, `/api/event-participations`

## Testing

### Run All Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:int
```

### E2E Tests
```bash
pnpm test:e2e
```

### Run Specific Test
```bash
pnpm test:int api.int.spec.ts
```

## Documentation

- **[TECHNICAL_OVERVIEW.md](./TECHNICAL_OVERVIEW.md)** - Architecture, detailed setup, data flow, troubleshooting
- **[Payload CMS Docs](https://payloadcms.com/docs)** - CMS configuration & API
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation
- **[MongoDB Docs](https://www.mongodb.com/docs/manual/)** - Database documentation

## Common Tasks

### Reset Database
```bash
# Drop all collections
docker-compose exec mongo mongosh smartcampus --eval "db.dropDatabase()"
# Or manually via MongoDB Compass / Atlas
```

### Generate TypeScript Types
After modifying collections, regenerate types:
```bash
pnpm generate:types
```

### Debug Mode
Add to `.env`:
```env
NODE_OPTIONS="--inspect"
```
Then open: `chrome://inspect`

### Change Port
```bash
PORT=3001 pnpm dev
```

## Troubleshooting

### MongoDB Connection Error
- Verify `DATABASE_URI` in `.env`
- Ensure MongoDB is running and accessible
- For Docker: use `mongodb://mongo/smartcampus`

### "Cannot find module" Error
```bash
pnpm install
pnpm generate:types
```

### Port 3000 Already in Use
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# Clear all volumes
docker-compose down -v
```

## Role-Based Access

| Action | Student | Org-Admin | Staff | Super-Admin |
|--------|---------|-----------|-------|------------|
| Create Event | ✅ | ✅ | ✅ | ✅ |
| Update Own Event | ✅ | ✅ | ✅ | ✅ |
| Update Org Events | ❌ | ✅ | ✅ | ✅ |
| Delete Event | ❌ | ❌ | ❌ | ✅ |
| Join Event | ✅ | ✅ | ✅ | ✅ |
| View Participants | ❌ | ✅* | ✅ | ✅ |
| Manage Organizations | ❌ | ✅* | ✅ | ✅ |
| Create Org | ❌ | ❌ | ✅ | ✅ |
| Admin Panel Access | ❌ | ✅* | ✅ | ✅ |

*Own organization only

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `pnpm test`
3. Commit: `git commit -m "feat: describe changes"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

## License

MIT

## Support

For issues, questions, or suggestions:
- Check [TECHNICAL_OVERVIEW.md](./TECHNICAL_OVERVIEW.md) for detailed docs
- Create a GitHub Issue
- Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Node**: 18+  
**Package Manager**: pnpm
