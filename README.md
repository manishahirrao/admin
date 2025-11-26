# Mandir Mitra Admin Dashboard

A comprehensive web-based administrative interface for managing the Mandir Mitra platform.

## Features

- 📊 Real-time dashboard with key metrics
- 👥 User management and journey tracking
- 📦 Order and delivery tracking
- 📝 Content management (banners, rituals, holy items)
- 🏛️ Temple partner and priest management
- 📈 Advanced analytics and reporting
- 🔐 Role-based access control (RBAC)
- 🔒 Two-factor authentication (2FA)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **State Management**: Zustand + React Query
- **Charts**: Recharts + D3.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Access to Mandir Mitra Supabase database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   └── api/             # API routes
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── tables/          # Data table components
│   ├── forms/           # Form components
│   └── shared/          # Shared components
├── lib/
│   ├── supabase/        # Supabase client utilities
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
└── types/               # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Environment Variables

See `.env.example` for required environment variables.

## Database Setup

The admin dashboard uses the same Supabase database as the Mandir Mitra mobile app. Additional tables for admin functionality will be created automatically on first run.

## Deployment

The dashboard is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## Security

- All routes require authentication
- Role-based access control (RBAC)
- Two-factor authentication for super admins
- Audit logging for all admin actions
- IP whitelisting for sensitive operations

## License

Proprietary - Mandir Mitra

## Support

For support, contact the development team.
