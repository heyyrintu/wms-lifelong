# Warehouse Mapping System (WHMapping)

A production-ready warehouse inventory location mapping web application built with the latest technologies.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Turbopack)
- **UI Library:** React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database ORM:** Prisma 6
- **Database:** PostgreSQL
- **Validation:** Zod
- **Forms:** React Hook Form
- **Data Fetching:** TanStack React Query v5
- **Barcode Scanning:** @zxing/browser
- **Notifications:** Sonner
- **Icons:** Lucide React

## Prerequisites

- **Node.js:** v20.x or later (LTS recommended)
- **PostgreSQL:** v15 or later
- **pnpm/npm/yarn:** Latest version

## Quick Start

### 1. Clone and Install

```bash
cd whmapping
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/whmapping?schema=public"

# App Configuration
NEXT_PUBLIC_APP_NAME="Warehouse Mapping"
NEXT_PUBLIC_AUTO_CREATE_SKU=true
NEXT_PUBLIC_AUTO_CREATE_LOCATION=true

# Default user for audit logs
DEFAULT_USER="system"
```

### 3. Database Setup

Create the database and run migrations:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes (dev) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with sample data |

## Features

### 1. Putaway (`/putaway`)
- Scan or enter location code
- Auto-creates location if it doesn't exist
- Scan multiple SKUs with quantities
- Auto-creates SKUs on first scan
- Batch submit all items
- Continue at same location or start new

### 2. Lookup by Location (`/lookup/location`)
- Scan location to view all SKUs
- Shows SKU codes, names, and quantities
- Real-time refresh

### 3. Lookup by SKU (`/lookup/sku`)
- Scan SKU to find all locations
- Shows total quantity across locations
- Displays SKU name and barcode

### 4. Move Inventory (`/move`)
- Step-by-step guided flow
- Scan source location
- Scan SKU (validates availability)
- Enter quantity (with max validation)
- Scan destination location
- Atomic transaction (prevents partial moves)
- Prevents negative stock

### 5. Audit Log (`/logs`)
- View all inventory movements
- Filter by action type, SKU, or location
- Paginated results
- Shows timestamps, users, and notes

## Scanner Support

### Keyboard Wedge Scanners (Primary)
- Simply focus the input field
- Scan barcode - automatically enters text
- Press Enter to submit (scanner usually sends Enter)
- Works with any USB/Bluetooth barcode scanner

### Camera Scanner (Secondary)
- Click camera icon on any scan field
- Supports Code 128, Code 39, EAN-13, EAN-8, UPC-A, UPC-E, QR Code, Data Matrix
- Optimized for mobile devices

### Scanner Tips
- Ensure scanner is configured to send Enter after scan
- Use fast scan mode for rapid entry
- All codes are auto-uppercased

## Database Schema

### Location
- `id` (UUID, primary key)
- `code` (unique, e.g., "A1-R02-S03-B04")
- `createdAt`, `updatedAt`

### Sku
- `id` (UUID, primary key)
- `code` (unique)
- `name` (optional)
- `barcode` (optional)
- `createdAt`, `updatedAt`

### Inventory
- `id` (UUID, primary key)
- `locationId` (FK to Location)
- `skuId` (FK to Sku)
- `qty` (integer)
- `updatedAt`
- Unique constraint on (locationId, skuId)

### MovementLog
- `id` (UUID, primary key)
- `action` (enum: PUTAWAY, MOVE, ADJUST)
- `skuId` (FK to Sku)
- `fromLocationId` (FK to Location, nullable)
- `toLocationId` (FK to Location, nullable)
- `qty` (integer)
- `user` (string)
- `note` (optional)
- `createdAt`

## Project Structure

```
whmapping/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── src/
│   ├── actions/           # Server Actions
│   │   ├── putaway.ts
│   │   ├── move.ts
│   │   ├── lookup.ts
│   │   ├── adjust.ts
│   │   └── index.ts
│   ├── app/
│   │   ├── api/           # Route Handlers
│   │   │   ├── logs/
│   │   │   ├── locations/
│   │   │   ├── skus/
│   │   │   └── inventory/
│   │   ├── putaway/       # Putaway page
│   │   ├── lookup/
│   │   │   ├── location/  # Location lookup
│   │   │   └── sku/       # SKU lookup
│   │   ├── move/          # Move inventory
│   │   ├── logs/          # Audit logs
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/        # Navigation, PageLayout
│   │   ├── scanner/       # CameraScanner, ScannerField
│   │   ├── ui/            # Button, Card, Input, etc.
│   │   └── providers.tsx  # React Query, Toaster
│   └── lib/
│       ├── prisma.ts      # Prisma client
│       ├── utils.ts       # Utilities
│       └── validators.ts  # Zod schemas
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── .env.example
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | GET | Get movement logs with filters |
| `/api/locations` | GET | List locations |
| `/api/skus` | GET | List SKUs |
| `/api/inventory/location/[code]` | GET | Get inventory at location |
| `/api/inventory/sku/[code]` | GET | Get SKU locations |

## Configuration

### Auto-Create Behavior

Set in `.env`:
- `NEXT_PUBLIC_AUTO_CREATE_SKU=true` - Create SKU on first scan
- `NEXT_PUBLIC_AUTO_CREATE_LOCATION=true` - Create location on first scan

### Location Code Format

Recommended format: `ZONE-ROW-SHELF-BIN`
- Example: `A1-R02-S03-B04`
- Zone A1, Row 02, Shelf 03, Bin 04

## Production Deployment

### Build

```bash
npm run build
npm run start
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
NODE_ENV="production"
```

### Recommended Hosting

- **Vercel** - Zero-config Next.js hosting
- **Railway** - Easy PostgreSQL + Next.js
- **AWS/GCP** - Self-hosted with Docker

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL format
3. Verify user has CREATE privileges

### Scanner Not Working
1. Check scanner sends Enter key
2. Ensure input field is focused
3. Try manual entry to verify

### Camera Not Available
1. Ensure HTTPS (required for camera)
2. Grant camera permissions
3. Check browser compatibility

## License

MIT

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request
