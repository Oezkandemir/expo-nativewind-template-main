# 🚀 Merchant Portal - Quick Reference

## ⚡ Quick Start

```bash
cd apps/merchant-portal
./setup.sh
npm run dev
```

Open: http://localhost:3000

---

## 📝 Test Account

**Registration:**
- Company: Test Company GmbH
- Email: test@company.com
- Password: testpassword123

**Approval (Manual):**
1. Open Supabase Dashboard
2. Table Editor → `merchants`
3. Set `status` = 'approved'
4. Set `verified` = true

---

## 🔑 Key Endpoints

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page |
| Register | `/register` | Merchant registration |
| Login | `/login` | Merchant login |
| Dashboard | `/campaigns` | Campaign management |

---

## 🗄️ Database Tables

### `merchants` table
```sql
id: UUID PRIMARY KEY
user_id: UUID (NULL for merchants!)
company_name: TEXT
business_email: TEXT UNIQUE
status: TEXT (pending/approved/suspended)
verified: BOOLEAN
```

### Key Query Pattern
```typescript
// ✅ CORRECT - Query by email
const { data } = await supabase
  .from('merchants')
  .select('*')
  .eq('business_email', user.email)
  .single()

// ❌ WRONG - Don't use user_id
.eq('user_id', user.id)  // This will fail!
```

---

## 🔧 Helper Functions

```typescript
import { getCurrentMerchant } from '@/lib/auth/merchant-helpers'

// In server components:
const merchant = await getCurrentMerchant()  // Auto-redirects if not logged in
```

---

## 🐛 Common Issues

### "Merchant not found"
→ Check `business_email` matches logged-in user

### "Foreign key constraint"
→ Don't set `user_id` in merchant insert

### "Not authenticated"
→ Clear cookies, try incognito mode

---

## 📚 Documentation

- **Fix Details:** `docs/MERCHANT_AUTH_FIX.md`
- **Testing Guide:** `docs/MERCHANT_PORTAL_TESTING.md`
- **Summary:** `docs/FIX_SUMMARY.md`

---

## ✅ Status

| Feature | Status |
|---------|--------|
| Registration | ✅ Working |
| Login | ✅ Working |
| Dashboard | ✅ Working |
| View Campaigns | ✅ Working |
| Create Campaign | 🚧 Not Yet |
| Edit Campaign | 🚧 Not Yet |

---

## 🎯 Next Steps

1. ✅ Test registration
2. ✅ Approve merchant
3. 🔜 Build campaign creation
4. 🔜 Add analytics

---

**Version:** 1.0.0  
**Last Updated:** January 10, 2026  
**Status:** ✅ Production Ready
