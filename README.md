# StayLink — India-wide Home Rental Marketplace

> **"Find Your Perfect Home Anywhere in India. Direct from owners. Zero unnecessary middlemen. Transparent pricing."**

StayLink connects students, working professionals, families, and relocating tenants directly with verified homeowners across India without middleman brokers or hidden commissions.

---

## 🌟 Key Features

1. **100% Direct From Owner (Strict Zero Brokerage)**
   - Save 15 to 60 days of hard-earned rental commissions.
   - Comprehensive anti-broker screening with electricity bill and property tax verification.
2. **Transparent Fee Disclosure**
   - Monthly rent, refundable security deposits, society maintenance, and domestic utility terms are displayed transparently upfront.
3. **India-wide Discovery & Interactive Map**
   - Search across top employment and educational hubs: Bengaluru, Mumbai, Delhi-NCR (Gurgaon/Noida), Pune, Hyderabad, Chennai, Kolkata, and Ahmedabad.
   - Interactive cluster map with price pins and instant preview cards.
4. **Rich Multi-Filter Search**
   - Filter by city, locality/landmark, budget range, property type (PG/Co-Living, 1 RK, 1 BHK, 2 BHK, 3 BHK, Independent Villa), furnishing, tenant preferences, and amenities.
5. **Direct Owner Messaging & Visit Requests**
   - Send inquiries directly to the homeowner's inbox.
   - Schedule morning, afternoon, or evening physical visits with instant status tracking.
6. **Side-by-Side Property Comparison**
   - Compare up to 3 listings side-by-side on rent, deposit, super/carpet area, balconies, parking, and rules.
7. **Renter Dashboard**
   - Saved favourite listings, comparison drawer, active visit appointments, enquiry history, and profile preferences.
8. **Owner Portal & Multi-Step Listing Wizard**
   - Multi-step listing form (Basic specs -> Location -> Pricing & terms -> Amenities -> Photos -> Preview & Submit).
   - Listing pause/reactivation, enquiry response inbox, and visit request manager.
9. **Admin Trust & Moderation Console**
   - Listing review queue with mandatory rejection reasons, user complaint investigation, audit logs, and user directory.
10. **Enterprise Security & Validation**
    - Live password security indicators (8+ chars, upper, lower, number, special symbol).
    - Role-based access control (Renter, Owner, Admin).

---

## 🔑 Pre-Configured Demo Personas (1-Click Switcher)

For instant evaluation, you can switch personas with a single click in the top navigation bar or the authentication modal:

| Persona | Name | Email | Role | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Tenant** | Rahul Sharma | `rahul.sharma@example.in` | Renter | Saved properties, enquiries, scheduled visit tracking |
| **Landlord** | Priya Verma | `priya.verma@example.in` | Homeowner | Manage Bangalore/Delhi properties, respond to tenants, approve visits |
| **Moderator** | StayLink Admin | `admin@staylink.in` | Administrator | Review queue, complaints, audit logs, verify listings |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express REST API (`/api/v1/*`), Vite dev middleware.
- **Database & Storage**: Seeded transactional models (Users, Properties, Enquiries, Visits, Reports, Audit Logs). Compatible with PostgreSQL & Prisma.
- **Design Constitution**: Follows the Universal Frontend Design Constitution (anti-AI slop, zero-pill metadata discipline, 60-30-10 color balance, tabular figures).

---

## 🚀 Local Development Setup

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start the full-stack server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Type check & build for production**:
   ```bash
   npm run lint
   npm run build
   npm run start
   ```

---

## 📋 REST API Endpoints

- `GET /api/v1/health` — System status
- `POST /api/v1/auth/login` — Sign in
- `POST /api/v1/auth/register` — Create renter or homeowner account
- `GET /api/v1/properties` — Search and filter properties
- `GET /api/v1/properties/:id` — Property detail
- `POST /api/v1/properties` — Create new listing
- `PATCH /api/v1/properties/:id` — Update listing status
- `GET /api/v1/favourites` — Retrieve saved listings
- `POST /api/v1/favourites/:id` — Save listing
- `GET /api/v1/enquiries` — Direct messaging threads
- `POST /api/v1/enquiries` — Dispatch new inquiry
- `POST /api/v1/enquiries/:id/reply` — Send reply in conversation
- `GET /api/v1/visit-requests` — Scheduled property visits
- `POST /api/v1/visit-requests` — Book appointment slot
- `PATCH /api/v1/visit-requests/:id` — Confirm/reschedule visit
- `POST /api/v1/reports` — Report listing
- `GET /api/v1/admin/review-queue` — Moderation queue
- `PATCH /api/v1/admin/properties/:id/review` — Approve/reject listing
