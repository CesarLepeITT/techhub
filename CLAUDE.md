# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install              # Install dependencies
npm run dev            # Start dev server on http://localhost:2006
npm run build          # Build for production
npm run start          # Run production build
npm run lint           # Run ESLint
npm run rag:eval       # Evaluate RAG (search/recommendations)
```

## Architecture Overview

**TechHub** is a Next.js 16 e-commerce platform for electronics and maker components, with:
- **Frontend:** React 19, App Router, Tailwind CSS 4.2.0, shadcn/ui components
- **Backend:** Next.js API routes (serverless functions)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** localStorage-based session management (no Supabase Auth)
- **AI:** Groq API for product recommendations and chat
- **Image delivery:** Unsplash + Supabase Storage (lazy-loaded)

### Key Technical Decisions

1. **No Supabase Auth** — Uses direct database login with localStorage. User object stored as JSON in localStorage + dispatches `"session-update"` event for real-time sync.
2. **SessionProvider Context** — Single source of truth for `user`, `isAuthenticated`, `isLoading`. Syncs across tabs via `storage` and `session-update` events.
3. **Direct DB Queries** — All database operations go through `lib/supabase-queries.ts` functions (loginUser, registerUser, getCart, etc.), not Supabase client methods.
4. **Simplified Chat Search** — `/api/chat` uses first 2 tokens from user query, searches product name field with ILIKE, wraps in try-catch.
5. **Conditional Product Display** — Chat assistant shows **only** product cards when products found, **only** text when no products.

## File Structure

### Core Routes (`/app`)
- **`page.tsx`** — Homepage with hero section + integrated chat assistant
- **`layout.tsx`** — Root layout, metadata, SessionProvider wrapper
- **`globals.css`** — Global styles, Tailwind setup
- **`iniciar-sesion/page.tsx`** — Login form, calls `loginUser()`, saves to localStorage
- **`registro/page.tsx`** — Sign-up form, calls `registerUser()`, redirects to login
- **`productos/page.tsx`** — Product listing/search, filters by category/seller
- **`productos/[id]/page.tsx`** — Product detail page with reviews and recommendations
- **`carrito/page.tsx`** — Shopping cart (requires auth), displays cart items
- **`perfil/page.tsx`** — User profile, cart/wishlist management (requires auth)
- **`asistente/page.tsx`** — Full-page chat assistant with product recommendations
- **`api/chat/route.ts`** — POST endpoint for chat queries, returns AI explanation + product list

### Components (`/components`)
- **`SessionProvider.tsx`** — Context provider for user session, handles localStorage sync + cross-tab events
- **`layout/header.tsx`** — Navigation bar, shows "Iniciar sesión" or "Mi perfil" based on `user`
- **`layout/footer.tsx`** — Footer with links and branding
- **`home/hero-section.tsx`** — Homepage chat widget (same component as `/asistente` page)
- **`asistente/product-recommendation-card.tsx`** — Card component for products in chat
- **`products/product-card.tsx`** — Card component for products in grid/list view
- **`ui/*.tsx`** — shadcn/ui base components (Button, Input, Dialog, etc.)

### Utilities (`/lib`)
- **`supabase.ts`** — Supabase client initialization
- **`supabase-queries.ts`** — All database queries:
  - `loginUser(email, password)` — Returns user object or null
  - `registerUser(email, password)` — Creates new user, generates username
  - `getCart(userId)`, `updateCartQuantity()`, `removeFromCart()`
  - `getWishlist(userId)`, `addToWishlist()`, `removeFromWishlist()`
  - `getProduct(id)`, `searchProducts(query)`, `getProductsByCategory()`
  - `getReviews(productId)`, `addReview()`, etc.
- **`utils.ts`** — Helpers (formatting, validation, etc.)

### Hooks (`/hooks`)
- **`useSession.ts`** — React hook to access SessionProvider context (`{ user, isAuthenticated, isLoading, logout }`)

## Session Management (localStorage-based)

### How It Works

1. **Login:** User enters email/password → `loginUser()` queries DB → returns user object → saved to `localStorage.techhub_user`
2. **Session Sync:** SessionProvider listens to:
   - `window.addEventListener("storage", ...)` — detects localStorage changes in other tabs
   - `window.addEventListener("session-update", ...)` — custom event for same-tab updates
3. **Logout:** `logout()` clears localStorage and dispatches `"session-update"` event
4. **Persistence:** On page reload, SessionProvider reads `localStorage.techhub_user` and sets user state

### Key Code Pattern

```tsx
// In SessionProvider.tsx
useEffect(() => {
  const stored = localStorage.getItem("techhub_user")
  if (stored) {
    setUser(JSON.parse(stored))
    setIsAuthenticated(true)
  }
  setIsLoading(false)

  const handleStorage = () => {
    const updated = localStorage.getItem("techhub_user")
    setUser(updated ? JSON.parse(updated) : null)
  }
  window.addEventListener("storage", handleStorage)
  return () => window.removeEventListener("storage", handleStorage)
}, [])
```

### In Login Page

```tsx
// app/iniciar-sesion/page.tsx
const user = await loginUser(email, password)
if (user) {
  localStorage.setItem("techhub_user", JSON.stringify(user))
  window.dispatchEvent(new Event("session-update"))
  router.push("/")
}
```

## Chat Assistant (`/api/chat`)

### Flow

1. User sends message → POST to `/api/chat` with `{ message: string }`
2. Backend:
   - Detects intent (project_build, budget, component_search, general_shopping)
   - Searches products using first 2 tokens from query
   - Sends products + user query to Groq AI
   - AI generates recommendation text
   - Strips UUID patterns: `/\s*\([a-f0-9\-]{36}\)\s*/gi`
   - Logs query to `assistant_queries` table (for analytics)
3. Returns: `{ intent, response, products }` where `products` is array of product cards

### Search Implementation

```tsx
// Simplified search: split query, take first 2 tokens, search name field
const tokens = cleanQuery.toLowerCase().split(/\s+/).slice(0, 2)
const filters = tokens.map(t => `name.ilike.%${encodeURIComponent(t)}%`)
const orFilters = filters.join(",")
const path = `products?select=...&or=(${orFilters})&limit=5&is_active=eq.true`
```

### Why This Works

- Complex PostgREST queries with special characters fail with PGRST100 error
- Limiting to 2 tokens avoids filter explosion and parse errors
- Single field (name) search is faster than full-text
- Try-catch returns empty array on failure, graceful degradation

## UI Components & Patterns

### useSession Hook Usage

```tsx
"use client"
import { useSession } from "@/hooks/useSession"

export function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useSession()
  
  if (isLoading) return <Skeleton />
  return (
    <>
      {isAuthenticated && <p>Welcome, {user?.email}</p>}
      {!isAuthenticated && <Link href="/iniciar-sesion">Login</Link>}
    </>
  )
}
```

### Protected Pages

For pages requiring authentication (carrito, perfil):

```tsx
"use client"
import { useSession } from "@/hooks/useSession"

export default function ProtectedPage() {
  const { user, isLoading } = useSession()
  
  if (isLoading) return <Skeleton />
  if (!user) return <div>No estás autenticado. <Link href="/iniciar-sesion">Inicia sesión</Link></div>
  
  // Render protected content
}
```

### Message Bubbles in Chat

Always check if products exist before rendering:

```tsx
function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return <div>...user message...</div>
  }
  
  // Assistant message: show ONLY products OR ONLY text, never both
  return (
    <div className="flex gap-3">
      {message.products?.length > 0 ? (
        <div className="grid gap-2">{message.products.map(p => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <div>...text response...</div>
      )}
    </div>
  )
}
```

## Database Patterns

### RLS (Row Level Security)

- All tables use RLS policies
- Users can only see/edit their own data (cart, wishlist, reviews)
- `is_active` flag filters inactive/deleted products

### Data Normalization

- **products** — main product table with retail_price, wholesale_price, stock
- **cart_items** — user's shopping cart (user_id, product_id, quantity)
- **product_favorites** — user's wishlist (user_id, product_id)
- **product_reviews** — user reviews (user_id, product_id, rating, text)
- **sellers** — store info (store_name, is_verified, rating)
- **categories** — product categories (name, slug)
- **users** — authentication table (email, password_hash, username, etc.)
- **assistant_queries** — logs for chat analytics

### Common Query Pattern

```tsx
// In supabase-queries.ts
async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, retail_price, stock,
      main_image_url, short_description,
      sellers (id, store_name, is_verified),
      categories (id, name, slug)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()
  
  if (error) return null
  return normalizeProduct(data)
}
```

## Environment Setup

**Required environment variables** (in `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://zmpndelllyisgsvsjkio.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
GROQ_API_KEY=gsk_...
```

**Optional:**
- `SUPABASE_SERVICE_ROLE_KEY` — for server-side Supabase admin operations (not currently used)

## Next.js Configuration

**Key settings in `next.config.mjs`:**

```js
output: 'standalone'        // Optimized for Docker/Raspberry Pi deployments
compress: true              // Enable gzip compression
unoptimized: true           // Use external image URLs (Unsplash, Supabase)
experimental.optimizeCss: true  // Tree-shake unused Tailwind
reactStrictMode: true       // Strict mode for development
```

## Common Development Tasks

### Adding a New Page

1. Create `app/[slug]/page.tsx` with `"use client"` at top
2. If auth required, use `useSession()` hook at start
3. Import components and layout as needed
4. Add route to header navigation if applicable

### Adding a Database Query

1. Define types (if new table)
2. Add function to `lib/supabase-queries.ts`
3. Handle errors with try-catch, return null on failure
4. Use `normalizeProduct()` for product rows to ensure consistent shape
5. Call from components/pages via React hook or direct async call

### Integrating with Chat Assistant

1. Add sample products to database with `is_active=true`
2. Test by typing in `/asistente` page
3. If search doesn't find products, check:
   - Product name contains query tokens
   - `is_active` is true
   - Run `/api/chat` directly with test query
4. Add UUID stripping regex if AI output includes IDs

### Debugging Session Issues

1. Open DevTools → Application → Local Storage → check `techhub_user`
2. Verify user object is valid JSON
3. Check SessionProvider renders at top level in `layout.tsx`
4. Open DevTools → Console, type `window.addEventListener("session-update", () => console.log("event!"))` and log in from another tab

### Building for Production

```bash
npm run build              # Creates .next/standalone
npm start                  # Runs production server
# On Raspberry Pi: npm start (port 3000 by default)
```

## Known Limitations

1. **No real email verification** — Registration doesn't send confirmation emails
2. **No password reset** — Would need email service integration
3. **Image optimization disabled** — Using `unoptimized: true` for simplicity
4. **TypeScript errors ignored** — `ignoreBuildErrors: true` in next.config (acceptable for rapid dev, should be fixed before production)

## Useful Links

- **Supabase docs:** https://supabase.com/docs
- **Next.js docs:** https://nextjs.org/docs
- **Groq API:** https://console.groq.com
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com

## Team Context

- **Primary developer:** Vakyro
- **User locale:** Spanish (es-MX) — all UI text is in Spanish
- **Target platform:** Works on Raspberry Pi with ngrok tunneling
- **Main user base:** Electronics/maker community in Tijuana
