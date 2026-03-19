# 🚀 Supabase Setup Guide for ClothingCtrl

This guide will walk you through setting up Supabase for your ClothingCtrl e-commerce store.

---

## 📋 Prerequisites

- A [Supabase account](https://supabase.com) (free tier works great!)
- A [Vercel account](https://vercel.com) for deployment

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `clothingctrl` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your customers (e.g., `Europe West` or `Africa South`)
   - **Pricing**: Free tier is fine to start

4. Click **"Create new project"** and wait ~2 minutes for setup

---

## Step 2: Get Your Database Credentials

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Find the **Connection string** section
3. Select **"URI"** format
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Two Connection Strings You Need:

| Purpose | Connection Type | Port |
|---------|----------------|------|
| **DATABASE_URL** | Pooled (pgbouncer) | 6543 |
| **DIRECT_DATABASE_URL** | Direct | 5432 |

**Example:**
```bash
# For serverless/Vercel (pooled)
DATABASE_URL="postgresql://postgres.abc123:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"

# For migrations (direct)
DIRECT_DATABASE_URL="postgresql://postgres.abc123:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

---

## Step 3: Configure Environment Variables

### For Local Development:

1. Create `.env` file in your project root:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
# Supabase Database
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Admin
ADMIN_EMAIL="your-email@example.com"
```

### For Vercel Deployment:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your pooled connection string |
| `DIRECT_DATABASE_URL` | Your direct connection string |
| `NEXTAUTH_SECRET` | Generated secret (see below) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Your admin email |

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Or: npx auth secret
```

---

## Step 4: Initialize the Database

### Option A: Using Prisma (Recommended)

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Seed demo data
curl -X POST http://localhost:3000/api/seed
```

### Option B: Using Migrations (Production)

```bash
# Create initial migration
bunx prisma migrate dev --name init

# Apply migrations
bunx prisma migrate deploy
```

---

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

After deployment, seed the database:
```bash
curl -X POST https://your-app.vercel.app/api/seed
```

---

## 🔧 Database Management

### View Your Data

1. Go to Supabase Dashboard
2. Click **"Table Editor"** on the left sidebar
3. View and edit your data directly

### Run SQL Queries

1. Go to **SQL Editor** in Supabase dashboard
2. Run any PostgreSQL queries

### Backups

- Supabase automatically backs up your database daily (Pro plan)
- Free tier: Manual backups via `pg_dump`

---

## 📊 Database Schema Overview

The ClothingCtrl database includes:

| Table | Description |
|-------|-------------|
| `Product` | Products with variants |
| `Category` | Product categories |
| `Customer` | Customer accounts |
| `Order` | Customer orders |
| `CartItem` | Shopping cart |
| `Discount` | Coupon codes |
| `Review` | Product reviews |
| `StoreSettings` | Store configuration |
| `AdminUser` | Admin accounts |

---

## 🔐 Security Best Practices

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **Use Row Level Security (RLS)** in Supabase for sensitive data
3. **Rotate passwords** periodically
4. **Use service role key** only on server-side

---

## 🆓 Free Tier Limits

Supabase Free Tier includes:
- 500 MB database storage
- 5 GB bandwidth/month
- 50,000 monthly active users
- 1 GB file storage

This is sufficient for a small to medium e-commerce store!

---

## 🆘 Troubleshooting

### Connection Issues
```
Error: P1001 - Can't reach database server
```
**Solution:** Check your connection string and ensure your IP is whitelisted (Supabase allows all by default)

### Migration Issues
```
Error: P3009 - migrate found failed migrations
```
**Solution:** Reset migrations with `bunx prisma migrate reset`

### Prisma Client Issues
```
Error: Prisma Client could not be generated
```
**Solution:** Run `bun run db:generate`

---

## 📚 Useful Commands

```bash
# Open Prisma Studio (GUI for database)
bunx prisma studio

# Reset database (WARNING: deletes all data)
bunx prisma migrate reset

# Create a new migration
bunx prisma migrate dev --name description

# Generate Prisma client
bun run db:generate

# Push schema without migrations
bun run db:push
```

---

## 🎉 You're All Set!

Your ClothingCtrl store is now connected to Supabase! 

Next steps:
1. Seed demo data: `curl -X POST http://localhost:3000/api/seed`
2. Access admin panel: `/admin`
3. Start adding products!
