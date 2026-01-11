# Merchant Portal - Quick Start Guide

**Status:** 🚧 Not Yet Implemented (Foundation Ready)  
**Estimated Time:** 3-4 days development

---

## 📋 Overview

This guide outlines how to create the merchant web portal that allows businesses to:
- Register as merchants
- Create and manage advertising campaigns
- Monitor campaign performance
- Manage budget and spending

---

## 🏗️ Tech Stack Recommendation

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Auth:** Supabase Auth
- **Forms:** React Hook Form + Zod
- **File Upload:** Supabase Storage

### Why Next.js?
- Server-side rendering for SEO
- API routes for server logic
- Easy deployment on Vercel
- Great TypeScript support
- Shares Supabase backend with mobile app

---

## 📁 Project Structure

```
merchant-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard home (overview)
│   │   ├── campaigns/
│   │   │   ├── page.tsx         # Campaigns list
│   │   │   ├── new/page.tsx     # Create campaign
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Campaign details & stats
│   │   │       └── edit/page.tsx # Edit campaign
│   │   ├── analytics/page.tsx   # Analytics dashboard
│   │   └── settings/page.tsx    # Merchant settings
│   ├── api/
│   │   └── campaigns/
│   │       └── route.ts         # Campaign API endpoints
│   └── layout.tsx
├── components/
│   ├── campaigns/
│   │   ├── CampaignForm.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── CampaignStats.tsx
│   │   └── FileUpload.tsx
│   ├── ui/                      # shadcn/ui components
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── validations/
│       └── campaign.ts          # Zod schemas
├── package.json
└── .env.local
```

---

## 🚀 Setup Steps

### 1. Create Next.js Project

```bash
npx create-next-app@latest merchant-portal --typescript --tailwind --app
cd merchant-portal
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install react-hook-form @hookform/resolvers zod
npm install date-fns recharts
npm install lucide-react class-variance-authority clsx tailwind-merge

# shadcn/ui (optional but recommended)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input form select table
```

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Setup Supabase Client

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './types';

export const supabase = createClientComponentClient<Database>();
```

---

## 📝 Core Features to Implement

### Feature 1: Merchant Registration

**File:** `app/(auth)/register/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const companyName = formData.get('companyName') as string;
    const phone = formData.get('phone') as string;

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Create merchant profile
      const { error: merchantError } = await supabase
        .from('merchants')
        .insert({
          user_id: authData.user!.id,
          company_name: companyName,
          business_email: email,
          phone,
          status: 'pending', // Requires admin approval
        });

      if (merchantError) throw merchantError;

      alert('Registration successful! Awaiting approval.');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input name="companyName" placeholder="Firmenname" required />
      <input name="email" type="email" placeholder="E-Mail" required />
      <input name="password" type="password" placeholder="Passwort" required />
      <input name="phone" placeholder="Telefon" />
      <button type="submit" disabled={loading}>
        {loading ? 'Wird registriert...' : 'Registrieren'}
      </button>
    </form>
  );
}
```

### Feature 2: Campaign Creation Form

**File:** `app/(dashboard)/campaigns/new/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function NewCampaignPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      // 1. Upload file to Supabase Storage
      const formData = new FormData(e.currentTarget);
      const fileExtension = file!.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-assets')
        .upload(fileName, file!);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(fileName);

      // 3. Get merchant ID
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      // 4. Create campaign
      const { error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          merchant_id: merchant!.id,
          name: formData.get('name') as string,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          content_type: formData.get('contentType') as string,
          content_url: urlData.publicUrl,
          target_interests: (formData.get('interests') as string).split(','),
          duration_seconds: parseInt(formData.get('duration') as string),
          reward_per_view: parseFloat(formData.get('reward') as string),
          total_budget: parseFloat(formData.get('budget') as string),
          status: 'draft',
        });

      if (campaignError) throw campaignError;

      alert('Kampagne erfolgreich erstellt!');
      router.push('/campaigns');
    } catch (error) {
      console.error('Campaign creation error:', error);
      alert('Fehler beim Erstellen der Kampagne');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Kampagnenname" required />
      <input name="title" placeholder="Anzeigentitel" required />
      <textarea name="description" placeholder="Beschreibung" />
      
      <select name="contentType" required>
        <option value="image">Bild</option>
        <option value="video">Video</option>
      </select>
      
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />
      
      <input
        name="reward"
        type="number"
        step="0.01"
        min="0.05"
        placeholder="Belohnung pro View (€)"
        required
      />
      
      <input
        name="budget"
        type="number"
        step="1"
        min="10"
        placeholder="Gesamtbudget (€)"
        required
      />
      
      <input
        name="interests"
        placeholder="Zielgruppen (kommagetrennt): tech,gaming,sports"
      />
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Wird erstellt...' : 'Kampagne erstellen'}
      </button>
    </form>
  );
}
```

### Feature 3: Campaign Dashboard

**File:** `app/(dashboard)/campaigns/page.tsx`

```typescript
import { supabase } from '@/lib/supabase/client';

export default async function CampaignsPage() {
  // Get merchant's campaigns
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      *,
      campaign_stats (
        views_count,
        completed_views_count,
        rewards_paid
      )
    `)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1>Meine Kampagnen</h1>
      
      <div className="grid gap-4">
        {campaigns?.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 UI Components Needed

### 1. Campaign Card
- Campaign name & status badge
- Budget progress bar
- View count & conversion rate
- Actions: Edit, Pause, View Stats

### 2. Campaign Stats Chart
- Daily views (line chart)
- Conversion rate (percentage)
- Budget consumption (progress bar)
- Geographic distribution (if available)

### 3. File Upload Component
- Drag & drop support
- Image/video preview
- Progress indicator
- File size/type validation

---

## 🔒 Security Considerations

### RLS Policies
Already implemented:
- Merchants can only see their own campaigns
- Merchants can only edit their own campaigns
- Users can view active campaigns

### Additional Checks
- Validate file uploads (type, size)
- Sanitize user inputs
- Rate limit API endpoints
- Verify merchant approval status

---

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total campaigns
- Active campaigns
- Total budget spent
- Total ad views
- Average conversion rate
- Revenue generated (future)

### Campaign-Level Metrics
- Views per day
- Completion rate
- Cost per view
- Budget remaining
- Estimated end date

---

## 💳 Payment Integration (Future)

### Stripe Integration
```bash
npm install @stripe/stripe-js stripe
```

**Features:**
- Add funds to merchant account
- Automatic budget deduction
- Invoice generation
- Payment history

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Domain Setup
- Register domain: `merchants.spotx.com` or `business.spotx.com`
- Configure DNS to point to Vercel
- Setup SSL (automatic with Vercel)

---

## ✅ Implementation Checklist

### Phase 1: Authentication & Setup (1 day)
- [ ] Setup Next.js project
- [ ] Configure Supabase client
- [ ] Implement registration page
- [ ] Implement login page
- [ ] Setup protected routes middleware

### Phase 2: Campaign Management (2 days)
- [ ] Campaign list page
- [ ] Campaign creation form
- [ ] File upload to Supabase Storage
- [ ] Campaign edit page
- [ ] Campaign details page

### Phase 3: Dashboard & Analytics (1 day)
- [ ] Dashboard overview
- [ ] Campaign statistics
- [ ] Charts and visualizations
- [ ] Budget tracking

### Phase 4: Polish & Deploy (0.5 days)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Deploy to Vercel

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Recharts for Analytics](https://recharts.org)

---

## 🎯 Success Criteria

A successful merchant portal should allow:
1. ✅ Merchants to register and get approved
2. ✅ Create campaigns with images/videos
3. ✅ Set targeting and budget
4. ✅ Monitor campaign performance
5. ✅ Pause/resume campaigns
6. ✅ View detailed analytics

---

## 📞 Next Steps

1. **Review this guide** with the team
2. **Setup development environment** for Next.js
3. **Create Supabase Storage bucket** for campaign assets
4. **Start with authentication** (Phase 1)
5. **Implement campaign creation** (Phase 2)
6. **Add analytics dashboard** (Phase 3)
7. **Deploy and test** (Phase 4)

**Estimated Total Time:** 3-4 days for MVP  
**Status:** Ready to start implementation

---

🚀 **The foundation is ready. Let's build the merchant portal!**
