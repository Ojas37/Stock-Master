# StockMaster - Inventory Management System

A modern, responsive Inventory Management System (IMS) built with React, TypeScript, and Next.js 15.

## 🚀 Features

### Authentication
- Login, Sign Up, Forgot Password, Reset Password with mock backend

### Dashboard
- Real-time KPI cards, dynamic filtering, recent operations table

### Products Management
- Complete CRUD operations, search, filter, view stock by location

### Operations Module
- Receipts (incoming goods), Deliveries (outgoing), Transfers (between warehouses), Adjustments (inventory fixes)

### More
- Warehouse management, Stock ledger, Settings, Profile management

## 📋 Tech Stack
- Next.js 15.5.6 (App Router), TypeScript 5, Tailwind CSS 4, Lucide React

## 📁 Project Structure
```
app/          # Pages (login, dashboard, products, operations, etc.)
src/api/      # API layer with TODO comments for backend integration
src/components/ # Reusable components (DashboardLayout, StatusBadge, Modal)
src/types/    # TypeScript definitions
```

## 🔌 API Integration
All API calls are mocked. Each file in `src/api/` has TODO comments like:
```typescript
// TODO: connect to GET /products
// TODO: POST /receipts/{id}/confirm
```

Replace mock Promises with real fetch/axios calls to integrate with your backend.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
