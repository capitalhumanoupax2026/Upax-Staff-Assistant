# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the UPAX Capital Humano HR Chatbot application.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, Lucide React)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── upax-hr-chatbot/    # React/Vite HR Chatbot frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## UPAX HR Chatbot Features

- Futuristic dark-mode login page with Grupo UPAX branding
- Multi-brand dynamic identity: changes logo & accent color per business unit (UDN)
- Welcome modal from HRBP after login
- HR Chatbot with knowledge base: vacaciones, nómina, beneficios, permisos, constancias, seguros, reglamento
- Quick action buttons for common HR queries
- Internal vs External (consultora) badge indicator
- Session-based authentication with express-session

## Business Units & HRBPs

| UDN | HRBP | Accent | Consultora |
|-----|------|--------|------------|
| UiX | Damián Sánchez | #7C3AED | - |
| Marketing United | Jesús Hernández | #84CC16 | Satoritech |
| Researchland | Abraham | #7C3AED | - |
| Trade Marketing | Jesús Hernández | #F97316 | Nach |
| Promo Espacio | Alma | #EA580C | Master Talent |
| Mexa Creativa | Jesús Octavio | #EC4899 | - |
| House of Films | Lourdes Pamela | #1C1C1C | - |
| Nera Code | Fernanda Messmacher | #F87171 | - |
| Más Salud | Fernanda Messmacher | #EC4899 | - |
| Zeus | Sergio Buendía | #8B5CF6 | Satoritech |
| Staff areas | Various | #374151 | - |

## Test Credentials

| Empleado | UDN | Password |
|---------|-----|----------|
| UIX001 | UiX | upax2024 |
| MKT001 | Marketing United | upax2024 |
| MEX001 | Mexa Creativa | upax2024 |
| HOF001 | House of Films | upax2024 |
| CH001 | Capital Humano | upax2024 |
| DG001 | Dirección General | upax2024 |

## Database Schema

- `employees` table: employee data, UDN, HRBP, consultora, accent color, logo
- `chat_messages` table: conversation history per employee

## API Endpoints

- POST /api/auth/login
- GET /api/auth/me  
- POST /api/auth/logout
- POST /api/chat/message
- GET /api/chat/history
