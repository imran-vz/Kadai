# Cocoa Comaa - Complete Feature Documentation

This document provides comprehensive feature documentation for the Cocoa Comaa e-commerce platform. Use this as a blueprint to implement similar features in other projects with minor modifications.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Database Architecture](#database-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [E-Commerce Features](#e-commerce-features)
5. [Payment Integration](#payment-integration)
6. [Email System](#email-system)
7. [Admin Dashboard](#admin-dashboard)
8. [Manager Dashboard](#manager-dashboard)
9. [User Features](#user-features)
10. [API Routes](#api-routes)
11. [Security Features](#security-features)
12. [File Upload System](#file-upload-system)
13. [Analytics & Monitoring](#analytics--monitoring)

---

## Tech Stack

### Core Framework
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Package Manager**: pnpm (v10.7.0) / bun (v1.3.4)
- **Node Version**: >=22

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (v0.44.7)
- **Migration Tool**: drizzle-kit (v0.31.8)
- **ID Generation**: @paralleldrive/cuid2 for unique IDs

### Authentication
- **Library**: better-auth (v1.4.9)
- **Strategy**: JWT sessions with cookie caching
- **Providers**: Email/Password + Google OAuth
- **Password Hashing**: bcrypt with 10 rounds
- **Session Duration**: 7 days
- **Session Update**: Every 24 hours
- **Cookie Cache**: 5 minutes

### UI Framework
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn UI (Radix UI primitives)
- **Icons**: lucide-react
- **Animations**: framer-motion
- **Theme**: next-themes for dark/light mode
- **Toasts**: sonner
- **Confetti**: canvas-confetti

### Forms & Validation
- **Form Library**: @tanstack/react-form (v1.27.6)
- **Validation**: Zod (v4.2.1) with @tanstack/zod-form-adapter
- **Date Handling**: date-fns (v4.1.0) + @date-fns/tz

### State Management
- **Server State**: @tanstack/react-query (v5.90.12)
- **Data Tables**: @tanstack/react-table (v8.21.3)

### Payment Gateway
- **Provider**: Razorpay
- **Library**: razorpay (v2.9.6)
- **Processing Fee**: 2.6% (configurable)

### Email Service
- **Provider**: Resend
- **Library**: resend (v4.8.0)
- **Templates**: @react-email/components + @react-email/render
- **Dev Server**: react-email

### File Storage
- **Provider**: Vercel Blob
- **Library**: @vercel/blob

### Security & Rate Limiting
- **Rate Limiting**: @upstash/ratelimit + @upstash/redis
- **CSRF Protection**: Custom implementation
- **Phone Validation**: google-libphonenumber

### Monitoring & Analytics
- **Error Tracking**: @sentry/nextjs
- **Analytics**: @vercel/analytics

### Code Quality
- **Linter/Formatter**: Biome (v2.0.0)
- **Git Hooks**: husky (v9.1.7)
- **Dead Code Detection**: knip (v5.77.1)
- **Style**: Tab indentation, double quotes

### Export/PDF Generation
- **PDF**: jspdf + jspdf-autotable
- **CSV**: Built-in functionality

---

## Database Architecture

### Core Entities

#### 1. Users Table
```typescript
users: {
  id: text (CUID2)
  name: text
  email: text (unique)
  phone: text
  phoneVerified: boolean (default: false)
  password: text (hashed with bcrypt)
  emailVerified: boolean (default: false)
  image: text
  role: enum ["customer", "admin", "manager"] (default: "customer")
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Relations**:
- Has many orders
- Has many addresses
- Has many workshop orders
- Has many accounts (OAuth)
- Has many sessions

#### 2. Desserts Table
```typescript
desserts: {
  id: integer (auto-increment)
  name: varchar(255)
  description: text
  price: varchar(10)
  imageUrl: text
  status: enum ["available", "unavailable"] (default: "available")
  category: enum ["cake", "dessert", "special"] (default: "dessert")
  containsEgg: boolean (default: true)
  leadTimeDays: integer (default: 3)
  createdAt: timestamp
  updatedAt: timestamp
  isDeleted: boolean (default: false)
}
```

**Relations**:
- Has many order items

#### 3. Orders Table
```typescript
orders: {
  id: text (CUID2)
  userId: text (FK to users)
  createdAt: timestamp
  updatedAt: timestamp
  total: numeric(10,2)
  deliveryCost: numeric(10,2) (default: 0)
  status: enum [
    "pending", "payment_pending", "paid", "confirmed",
    "preparing", "ready", "dispatched", "completed", "cancelled"
  ] (default: "pending")
  isDeleted: boolean (default: false)
  pickupDateTime: timestamp

  // Razorpay fields
  razorpayOrderId: varchar(255)
  razorpayPaymentId: varchar(255)
  razorpaySignature: varchar(255)
  paymentStatus: enum [
    "pending", "created", "authorized", "captured", "refunded", "failed"
  ] (default: "pending")

  notes: text
  orderType: enum ["cake-orders", "postal-brownies", "specials"] (default: "cake-orders")
  addressId: integer (FK to addresses, for postal orders)
}
```

**Relations**:
- Belongs to user
- Has many order items
- Belongs to address (optional, for postal orders)

#### 4. Order Items Table
```typescript
orderItems: {
  id: integer (auto-increment)
  orderId: text (FK to orders)
  itemType: enum ["dessert", "postal-combo"]
  dessertId: integer (FK to desserts, optional)
  postalComboId: integer (FK to postal_combos, optional)
  quantity: integer
  price: numeric(10,2)
  itemName: varchar(255) // Stored for historical purposes
}
```

**Relations**:
- Belongs to order
- Belongs to dessert (optional)
- Belongs to postal combo (optional)

#### 5. Postal Combos Table
```typescript
postalCombos: {
  id: integer (auto-increment)
  name: varchar(255)
  description: text
  price: numeric(10,2)
  imageUrl: text
  items: jsonb (array of included item names)
  status: enum ["available", "unavailable"] (default: "available")
  containsEgg: boolean (default: false)
  isDeleted: boolean (default: false)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Relations**:
- Has many order items

#### 6. Addresses Table
```typescript
addresses: {
  id: integer (auto-increment)
  userId: text (FK to users)
  addressLine1: varchar(255)
  addressLine2: varchar(255)
  city: varchar(100)
  state: varchar(100)
  zip: varchar(20)
  isDeleted: boolean (default: false)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Relations**:
- Belongs to user

#### 7. Workshops Table
```typescript
workshops: {
  id: integer (auto-increment)
  title: varchar(255)
  description: text
  amount: numeric(10,2)
  type: enum ["online", "offline"]
  maxBookings: integer (default: 10)
  imageUrl: text
  status: enum ["active", "inactive", "completed"] (default: "active")
  isDeleted: boolean (default: false)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Relations**:
- Has many workshop orders

#### 8. Workshop Orders Table
```typescript
workshopOrders: {
  id: text (CUID2)
  userId: text (FK to users)
  workshopId: integer (FK to workshops)
  slots: integer (default: 1, max: 2)
  createdAt: timestamp
  updatedAt: timestamp
  amount: numeric(10,2)
  gatewayCost: numeric(10,2) (default: 0)
  status: enum ["pending", "payment_pending", "paid", "confirmed", "cancelled"] (default: "pending")
  isDeleted: boolean (default: false)

  // Razorpay fields
  razorpayOrderId: varchar(255)
  razorpayPaymentId: varchar(255)
  razorpaySignature: varchar(255)
  paymentStatus: enum [
    "pending", "created", "authorized", "captured", "refunded", "failed"
  ] (default: "pending")

  notes: text
  orderType: enum ["workshop"] (default: "workshop")
}
```

**Relations**:
- Belongs to user
- Belongs to workshop

#### 9. Settings Tables

**Cake Order Settings**:
```typescript
cakeOrderSettings: {
  id: integer (auto-increment)
  allowedDays: jsonb (array of day numbers 0-6, where 0=Sunday)
  isActive: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Postal Order Settings**:
```typescript
postalOrderSettings: {
  id: integer (auto-increment)
  name: varchar(100) // e.g., "Early Month", "Mid Month"
  month: varchar(7) // Format: "YYYY-MM"
  orderStartDate: date
  orderEndDate: date
  dispatchStartDate: date
  dispatchEndDate: date
  isActive: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Specials Settings**:
```typescript
specialsSettings: {
  id: integer (auto-increment)
  isActive: boolean (default: true)
  pickupStartDate: date
  pickupEndDate: date
  pickupStartTime: varchar(5) (default: "10:00", format: "HH:MM")
  pickupEndTime: varchar(5) (default: "18:00", format: "HH:MM")
  description: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 10. Auth Tables (Better Auth)

**Accounts**:
```typescript
accounts: {
  id: text (CUID2)
  userId: text (FK to users, cascade delete)
  accountId: text
  providerId: text
  accessToken: text
  refreshToken: text
  accessTokenExpiresAt: timestamp
  refreshTokenExpiresAt: timestamp
  scope: text
  idToken: text
  password: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Sessions**:
```typescript
sessions: {
  id: text (CUID2)
  token: text (unique)
  userId: text (FK to users, cascade delete)
  expiresAt: timestamp
  ipAddress: text
  userAgent: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Verification**:
```typescript
verification: {
  id: text (CUID2)
  identifier: text
  value: text
  expiresAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Authentication & Authorization

### Better Auth Configuration

Location: `src/lib/auth.ts`

#### Features Implemented:

1. **Email/Password Authentication**
   - Email verification required
   - Password hashing with bcrypt (10 rounds)
   - Password reset flow with email
   - Verification email sent on signup

2. **Google OAuth**
   - Google One Tap integration
   - Account linking enabled (link Google to existing email/password account)

3. **Session Management**
   - JWT-based sessions
   - 7-day expiration
   - Session updates every 24 hours
   - 5-minute cookie cache
   - IP address and user agent tracking

4. **User Fields**
   - Custom `role` field (customer/admin/manager)
   - Custom `phone` field
   - Custom `phoneVerified` field
   - Role cannot be set via API (security)

5. **Email Integration**
   - Custom email verification template
   - Custom password reset template
   - Sent via Resend

#### Auth Utilities

Location: `src/lib/auth-utils.ts`

Helper functions:
- `requireAuth(session, allowedRoles?)` - Throws if unauthorized
- `requireSessionId(session)` - Returns user ID or throws
- `isAdmin(session)` - Check admin role
- `isManager(session)` - Check manager role
- `hasRole(session, role)` - Check specific role
- `createUnauthorizedResponse()` - 401 response
- `createForbiddenResponse()` - 403 response

### Role-Based Access Control

**Roles**:
1. **Customer** (default)
   - Access own orders
   - Place orders
   - Manage own profile
   - Book workshops

2. **Manager**
   - Read-only access to all orders
   - Cannot modify orders
   - Cannot access other admin features

3. **Admin**
   - Full access to all features
   - Manage desserts, postal combos, workshops
   - Manage orders (CRUD + status updates)
   - Manage users and managers
   - Configure settings
   - Export data

### Protected Routes

**Admin Routes**: `/admin/**`
- Require `role: "admin"`

**Manager Routes**: `/manager/**`
- Require `role: "manager"`

**User Routes**: `/order/**`, `/checkout/**`, `/my-orders/**`, `/my-workshops/**`
- Require authenticated user

**Public Routes**: `/`, `/login`, `/signup`, `/forgot-password`, `/postal-brownies`, `/specials`, `/workshops`, `/about`, `/contact-us`, `/terms-*`, `/data-protection`

### API Authentication Pattern

```typescript
// In API routes
import { auth } from "@/lib/auth";
import { requireAuth, requireSessionId } from "@/lib/auth-utils";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  requireAuth(session); // Throws if not authenticated
  const userId = requireSessionId(session); // Get user ID

  // For admin-only endpoints
  requireAuth(session, ["admin"]);

  // For admin or manager
  requireAuth(session, ["admin", "manager"]);
}
```

### CSRF Protection

Location: `src/lib/csrf.ts`

- Custom CSRF token validation
- Used on sensitive mutations
- Token validated against session

---

## E-Commerce Features

### Product Types

#### 1. Regular Desserts (Cakes)
- **Category**: cake, dessert, special
- **Lead Time**: Configurable per product (default 3 days)
- **Pickup**: Customer selects pickup date/time
- **Allowed Pickup Days**: Configured in admin settings
- **Pricing**: Per item
- **Egg Info**: containsEgg flag

#### 2. Postal Combos (Brownies)
- **Delivery**: Shipped to customer address
- **Items**: JSONB array of included items
- **Dispatch Windows**: Configured in admin (order window + dispatch window)
- **Delivery Cost**: Calculated based on location
  - Bengaluru: Lower cost
  - Other areas: Higher cost
- **Lead Time**: Based on dispatch window settings

#### 3. Specials
- **Purpose**: Limited-time offerings
- **Pickup**: Date range and time range configured in admin
- **Status**: Can be enabled/disabled globally
- **Pricing**: Per item

### Shopping Cart

**Implementation**: Client-side state (localStorage or React state)

**Features**:
- Add/remove items
- Update quantities
- Calculate subtotal
- Show lead time per item
- Prevent ordering on non-allowed days

### Checkout Flow

**Route**: `/checkout`

**Steps**:
1. Review cart items
2. Select order type (cake-orders, postal-brownies, specials)
3. For cake-orders/specials: Select pickup date/time
4. For postal-brownies: Select/add delivery address
5. Add order notes (optional)
6. Review pricing:
   - Subtotal
   - Delivery cost (for postal orders)
   - Gateway processing fee (2.6%)
   - Total
7. Create order (status: "pending")
8. Initiate payment

### Order Lifecycle

**Status Flow**:
1. **pending** → Order created, awaiting payment
2. **payment_pending** → Payment initiated (Razorpay order created)
3. **paid** → Payment captured successfully
4. **confirmed** → Admin confirmed order
5. **preparing** → Order being prepared
6. **ready** → Ready for pickup/dispatch
7. **dispatched** → Shipped (postal orders)
8. **completed** → Order fulfilled
9. **cancelled** → Order cancelled

**Status Emails**: Sent automatically on status change

### Lead Time Calculation

**Logic**:
- Each dessert has `leadTimeDays` (default: 3)
- Pickup date must be at least `leadTimeDays` from now
- Only allowed days (configured in settings) can be selected
- Prevents same-day orders

### Delivery Cost Calculation

**Logic**:
- Check if city is "Bengaluru" (case-insensitive)
- Bengaluru: Lower delivery cost
- Other cities: Higher delivery cost
- Configurable per implementation

---

## Payment Integration

### Razorpay Setup

**Environment Variables**:
```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### Payment Flow

#### 1. Create Order (API Route)
**Route**: `POST /api/payment/order`

**Steps**:
1. Verify user authentication
2. Validate CSRF token
3. Fetch order from database
4. Verify order ownership
5. Create Razorpay order with amount in paise
6. Update order status and payment info
7. Return order details to frontend

#### 2. Frontend Payment (Checkout)
**Library**: Razorpay Checkout.js

Opens Razorpay modal with order details

#### 3. Verify Payment (Frontend Callback)
**Route**: `POST /api/orders/verify`

Verifies signature and updates order status

#### 4. Webhook Handler (Server-Side)
**Route**: `POST /api/webhooks/razorpay`

**Events Handled**:
- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `order.paid`: Order marked as paid

**Actions**:
- Update order/workshop order status
- Send confirmation email (for captured payments)
- Log failures

### Processing Fee
- **Rate**: 2.6% (configurable)
- **Display**: Shown in checkout summary

### Workshop Payments
- Same flow as orders
- Uses `workshopOrders` table
- Supports multiple slots (max 2)
- Gateway cost calculated and stored

---

## Email System

### Resend Configuration

**Environment Variable**: `RESEND_API_KEY`

**From Addresses**:
- Orders: `orders@cocoacomaa.com`
- Auth: `noreply@cocoacomaa.com`

### Email Templates

Location: `src/components/emails/*.tsx`

#### 1. Order Confirmation
**Triggered**: After payment captured

**Content**:
- Order ID, items, total
- Order type specific info
- Pickup location/delivery address
- Care instructions (postal)
- Contact information

#### 2. Order Status Update
**Triggered**: When admin updates order status

**Content**:
- Order ID, status change
- Order summary
- Status-specific messaging

#### 3. Email Verification
**Triggered**: On signup

**Content**:
- Verification link (expires 24h)

#### 4. Password Reset
**Triggered**: On forgot password

**Content**:
- Reset link (expires 1h)

### Email Development

**Command**: `pnpm email:dev`

**Testing Scripts**:
- `pnpm test:email`
- `pnpm test:status-email`

---

## Admin Dashboard

Location: `/admin/**`

### Features

#### Orders Management
- List all orders with filters
- Update order status (triggers email)
- View order details
- Export to CSV
- Soft delete orders

#### Desserts Management
- CRUD operations
- Image upload
- Category, status, lead time config
- Soft delete

#### Postal Combos Management
- CRUD operations
- JSONB items array
- Image upload
- Soft delete

#### Specials Management
- Same as desserts for special category

#### Workshops Management
- CRUD operations
- Type (online/offline)
- Max bookings tracking
- Duplicate workshop
- Mark complete
- Soft delete

#### Workshop Orders Management
- List all bookings
- View details
- Export to CSV

#### Users Management
- List all users
- View details
- Cannot delete (referential integrity)

#### Customers Management
- List customers
- Verify phone manually
- Order history

#### Managers Management
- Create managers
- Reset passwords
- Delete managers

#### Settings
- Cake order days (allowed pickup days)
- Postal order windows (order/dispatch dates)
- Specials settings (pickup range, times)

---

## Manager Dashboard

Location: `/manager/**`

### Features

- **Read-only** access to orders
- View order details
- Export to CSV
- No edit/update permissions

---

## User Features

### Shopping
- Browse desserts, postal combos, specials
- Add to cart
- Checkout with payment

### Orders
- View order history
- Track order status
- Download receipts

### Workshops
- Browse active workshops
- Book slots (1-2 per booking)
- View booking history

### Profile
- Update name, phone
- Change password
- Manage addresses
- View linked accounts (OAuth)

---

## API Routes

All routes follow REST conventions with proper auth checks

### Key Patterns
- `/api/orders/**` - Order operations
- `/api/desserts/**` - Dessert operations
- `/api/postal-combos/**` - Postal combo operations
- `/api/workshops/**` - Workshop operations
- `/api/workshop-orders/**` - Workshop bookings
- `/api/admin/**` - Admin-only operations
- `/api/payment/**` - Payment operations
- `/api/webhooks/**` - External webhooks
- `/api/auth/**` - Authentication (Better Auth)

---

## Security Features

1. **CSRF Protection** - Custom token validation
2. **Rate Limiting** - IP-based with Upstash Redis
3. **Input Validation** - Zod schemas
4. **SQL Injection Prevention** - Drizzle ORM parameterized queries
5. **XSS Prevention** - React auto-escaping
6. **Authentication Security** - bcrypt, HTTPOnly cookies, secure sessions
7. **API Route Protection** - Role-based auth checks
8. **Webhook Signature Verification** - HMAC-SHA256
9. **Environment Variables** - Never committed
10. **Soft Deletes** - Preserve referential integrity

---

## File Upload System

### Vercel Blob

**Environment**: `BLOB_READ_WRITE_TOKEN`

**Route**: `POST /api/upload`

**Usage**: Product images, workshop images

**Storage**: Public access by default

---

## Analytics & Monitoring

### Sentry Error Tracking
- Automatic error capture
- Source maps
- Custom tunnel: `/monitoring`
- User context

### Vercel Analytics
- Page views
- User sessions
- Web vitals

---

## Development Workflow

### Setup
1. Clone repo
2. `pnpm install`
3. Copy `.env.example` to `.env.local`
4. Configure env vars
5. `pnpm db:push`
6. `pnpm db:seed`
7. `pnpm create-admin`
8. `pnpm dev`

### Commands
- `pnpm dev` - Dev server
- `pnpm build` - Production build
- `pnpm lint` - Check code
- `pnpm lint:fix` - Auto-fix
- `pnpm db:push` - Push schema
- `pnpm db:studio` - DB GUI
- `pnpm email:dev` - Email dev server

---

## Deployment Checklist

1. Set all env vars
2. Push schema to production DB
3. Seed database
4. Create admin user
5. Configure webhooks (Razorpay)
6. Configure OAuth redirects (Google)
7. Verify domain (Resend)
8. Test critical flows

---

## Key Architectural Decisions

1. **Server Components by Default** - Minimize JS bundle
2. **API Routes for Mutations** - Security, validation
3. **Soft Deletes Everywhere** - Referential integrity
4. **CUID2 for Order IDs** - URL-safe, sortable
5. **Single Orders Table** - Flexible order types
6. **Role-Based Access** - Simple 3-role system
7. **Settings in Database** - Runtime configuration
8. **Email-First Communication** - Reliable notifications
9. **Razorpay Integration** - Indian payment gateway
10. **Vercel Ecosystem** - Integrated tooling

---

## Unresolved Questions

When implementing in another project:

1. Payment gateway choice?
2. Delivery cost logic?
3. Processing fee structure?
4. Lead time strategy?
5. Order cancellation policy?
6. Refund handling?
7. Inventory tracking?
8. Multi-currency support?
9. Tax calculation?
10. Shipping integration?
11. Notification preferences?
12. Discount/coupon system?
13. Loyalty program?
14. Multiple images per product?
15. Product variants (sizes, flavors)?
16. Minimum order value?
17. Order modification after placement?
18. Guest checkout?
19. B2B orders?
20. Multi-language support?

---

**End of Documentation**
