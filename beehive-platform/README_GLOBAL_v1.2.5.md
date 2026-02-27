# 🐝 Bee Studio AI - Global Version

**Version**: v1.2.5  
**Last Updated**: 2025-02-27  
**Deployment Region**: Global (International)

---

## 📋 Version Information

- **Brand Name**: Bee Studio AI
- **Company**: YangYang Yunhe (Shenzhen) Technology Co., Ltd.
- **Domain**: beestudioai.com (Current: beehive-gules.vercel.app)
- **Language**: English Only
- **Payment**: Paddle (Under Review)
- **Deployment**: Vercel + GitHub Auto-Deploy
- **Database**: Supabase Global Instance

---

## ✨ Features

### Core Features
- ✅ User Registration & Login (Email/Password)
- ✅ Project Creation, Browsing, Editing, Search
- ✅ Project Following & Participation (Worker Bee Role)
- ✅ Task Publishing & Management
- ✅ Task Hall Browsing & Acceptance
- ✅ Balance Recharge System
- ✅ Project Log Publishing

### Payment Integration
- 🔄 Paddle Payment (Under Review)
- ✅ Mock Payment Mode (Current)
- ✅ Task Publishing Fee: $0.5 USD / task

### Compliance Pages
- ✅ Terms of Service (`/terms`)
- ✅ Recharge/Pricing Page (`/recharge`)
- ✅ Complete Footer Links
- ✅ Paddle Merchant of Record Statement
- ✅ Refund Policy

---

## 🚀 Deployment Configuration

### Environment Variables (`.env.global.local`)

```bash
# Region Configuration
NEXT_PUBLIC_REGION=global

# Supabase Configuration (Global Instance)
NEXT_PUBLIC_SUPABASE_URL=your_global_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_global_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_global_service_role_key

# Payment Configuration
USE_MOCK_PAYMENT=true  # Change to false after Paddle integration

# Paddle Configuration (After Approval)
# NEXT_PUBLIC_PADDLE_VENDOR_ID=your_vendor_id
# NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
# PADDLE_API_KEY=your_api_key
# PADDLE_PUBLIC_KEY=your_public_key
```

### Deployment Commands

```bash
# Install Dependencies
npm install

# Build Production Version
npm run build

# Start Production Server
npm start
```

### Vercel Auto-Deploy

```bash
# Push to GitHub (triggers Vercel auto-deploy)
git add .
git commit -m "your commit message"
git -c http.sslVerify=false push beehive main

# Vercel will automatically build and deploy
```

---

## 📊 Database Configuration

### Supabase Global Instance

- **Project Name**: beehive-global
- **Project Ref**: wsadzkdjmgebmwgpmjzm
- **Region**: Global Node
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

### Database Migration

```bash
# Execute migration script
cd supabase
# Run all_migrations_clean.sql in Supabase SQL Editor
```

---

## 💳 Paddle Payment Integration

### Current Status
- ✅ Merchant account application submitted
- ✅ Terms of Service page created
- ✅ Pricing page with clear $0.5 per task fee
- ✅ Paddle Merchant of Record statement added
- ✅ Refund policy documented
- 🔄 Waiting for Paddle approval

### Integration Steps (After Approval)

1. **Install Paddle SDK**
   ```bash
   npm install @paddle/paddle-js
   ```

2. **Configure Environment Variables**
   - Add Paddle credentials to Vercel environment variables

3. **Implement Frontend Integration**
   - Update `src/app/recharge/page.tsx`
   - Initialize Paddle checkout

4. **Implement Backend Webhook**
   - Create `src/app/api/paddle/webhook/route.ts`
   - Handle payment events

5. **Testing**
   - Test in Paddle Sandbox environment
   - Verify webhook reception
   - Validate balance updates

6. **Go Live**
   - Switch to production environment
   - Perform real payment test

For detailed integration guide, see [PADDLE_INTEGRATION_CHECKLIST.md](PADDLE_INTEGRATION_CHECKLIST.md)

---

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + Semantic UI React
- **i18n**: i18next (Locked to English)
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Payment**: Paddle (Under Review)

---

## 📝 Version History

### v1.2.5 (2025-02-27)
- ✅ Created Terms of Service page compliant with Paddle requirements
- ✅ Updated recharge page with clear pricing ($0.5 per task)
- ✅ Added Paddle Merchant of Record statement
- ✅ Documented refund policy
- ✅ Created Paddle integration checklist
- ✅ Submitted Paddle merchant account application

### v1.2.4 (2025-02-26)
- ✅ Rebranded from YangYang Cloud to Bee Studio AI
- ✅ Updated all English translations with new brand name
- ✅ Created comprehensive README for dual-version architecture
- ✅ Configured Vercel auto-deployment

### v1.2.0 - v1.2.3
- ✅ Multi-region version management system
- ✅ Unified payment interface
- ✅ Region configuration module
- ✅ Dynamic language locking
- ✅ Supabase global database migration
- ✅ Vercel deployment configuration

---

## 🌐 URLs

- **Website**: https://beehive-gules.vercel.app (Temporary)
- **Final Domain**: https://www.beestudioai.com (To be configured)
- **Terms of Service**: https://beehive-gules.vercel.app/terms
- **Pricing Page**: https://beehive-gules.vercel.app/recharge
- **GitHub Repo**: https://github.com/Colin0743/beehive

---

## 📞 Contact Information

**Company**: YangYang Yunhe (Shenzhen) Technology Co., Ltd., China  
**Email**: Colincao0734@Outlook.com  
**Website**: https://beehive-gules.vercel.app

---

## 📄 License

MIT License

---

**Note**: This document is for the Global Version (Bee Studio AI) configuration. For China version configuration, see `README_CN_v1.2.5.md`
