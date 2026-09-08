# GLOBAL EMR v3.0 - Setup Guide

## Prerequisites
- Node.js 18+ (pnpm 9+)
- Supabase account (free tier works for dev)
- Modern web browser
- Git

---

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project (select your region)
4. Wait for project initialization (~2 minutes)

### 1.2 Get Your Credentials
In your Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) key → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Run Database Migrations
The database schema has already been created via migrations. If you need to recreate:

1. Go to Supabase Dashboard → **SQL Editor**
2. Create new query with the SQL from `database/schema.sql`
3. Execute the schema creation
4. Execute the RLS policies migration

*(Note: The v0 development already applied these migrations)*

---

## Step 2: Local Environment Setup

### 2.1 Clone/Download Project
```bash
# Navigate to project directory
cd /vercel/share/v0-project
```

### 2.2 Install Dependencies
```bash
pnpm install
```

### 2.3 Environment Variables
Create `.env.local` in the root:
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Third-party API Keys (add as needed)
GOOGLE_CLOUD_SPEECH_API_KEY=your_key_here
PAYSTACK_SECRET_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
SENDGRID_API_KEY=your_key_here
```

---

## Step 3: Running the Application

### 3.1 Development Mode
```bash
pnpm dev
```

The app will be available at http://localhost:3000

### 3.2 Building for Production
```bash
pnpm build
pnpm start
```

---

## Step 4: Creating Test Data

### 4.1 Register Your First Hospital
1. Navigate to http://localhost:3000/auth/signup
2. Fill in hospital details:
   - Hospital Name: "Test Hospital"
   - Country: Select from dropdown
   - State: Select from dropdown
   - Email: test@hospital.com
   - Password: (min 8 chars)
3. Click "Create Hospital Account"
4. Check your email for verification link
5. Click the link to verify

### 4.2 Verify Email (Development)
Since email verification isn't set up in dev:
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find your user
4. Click the three dots → **Edit user**
5. Toggle **Email confirmed** to ON
6. Click **Update user**

### 4.3 Login
1. Navigate to http://localhost:3000/auth/login
2. Use credentials: test@hospital.com / your_password
3. You'll be routed to the dashboard

### 4.4 Add Staff Members (Optional)
Currently you can add staff through the database directly:
```sql
-- In Supabase SQL Editor
INSERT INTO public.staff (
  hospital_id,
  email,
  full_name,
  role,
  department
)
VALUES (
  'your-hospital-id', -- Get from hospitals table
  'doctor@hospital.com',
  'Dr. John Doe',
  'GENERAL_DOCTOR',
  'General Medicine'
);
```

---

## Step 5: Database Verification

### Verify Tables Created
In Supabase Dashboard → **SQL Editor**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should return: hospitals, staff, patients, visits, medical_records, drug_master, hospital_inventory, hospital_supplies, lab_catalog, orders, billing, payments, audit_log

### Verify RLS Enabled
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename != 'ignored_tables'
LIMIT 1;

SELECT tablename 
FROM pg_tables pt
WHERE schemaname = 'public'
AND EXISTS (
  SELECT 1 FROM pg_policies pp 
  WHERE pp.tablename = pt.tablename
);
```

---

## Step 6: Deploying to Vercel

### 6.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: GLOBAL EMR v3.0"
git remote add origin https://github.com/yourusername/global-emr.git
git push -u origin main
```

### 6.2 Deploy to Vercel
1. Go to https://vercel.com
2. Click **New Project**
3. Select your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**

### 6.3 Configure Production Email
For production, set up Supabase email templates:
1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Configure confirmation email template
3. Add your domain's email settings

---

## Step 7: Troubleshooting

### Issue: "Supabase URL not found"
**Solution:** Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`

### Issue: "Auth users cannot insert into staff"
**Solution:** Check RLS policies. Admin role needed to insert staff. Alternatively:
1. Disable RLS temporarily for development:
   ```sql
   ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
   ```
2. Re-enable and test policies before production

### Issue: "Email verification links not working"
**Solution:** 
1. In development, manually confirm email (see Step 4.2)
2. For production, configure Supabase email settings:
   - Supabase Dashboard → **Authentication** → **Providers** → **Email**
   - Set redirect URL to your domain

### Issue: "Dark mode not working"
**Solution:** Add `dark` class to HTML element in browser dev tools to test

### Issue: "Database connection timeout"
**Solution:**
1. Check Supabase project is running
2. Verify API key is correct
3. Check firewall/network settings
4. Restart dev server: `pnpm dev`

---

## Step 8: Development Tips

### Hot Reload
Changes to files automatically reload in browser (HMR enabled)

### Database Inspection
Anytime, go to Supabase Dashboard → **Table Editor** to:
- View all data
- Edit records
- See RLS policies in action

### Debugging
Enable debug logs:
```bash
DEBUG=* pnpm dev
```

### Testing Auth Flow
1. Open DevTools (F12)
2. Go to **Application** → **Local Storage** → `http://localhost:3000`
3. Look for `sb-*-auth-token` to see session data

---

## Step 9: Next Steps

After setup, start building dashboards:
1. Create new files in `/app/dashboard/[department]/page.tsx`
2. Use the dashboard layout for consistent UI
3. Fetch data from Supabase using `createClient()`
4. Update navigation in dashboard layout
5. Follow the component patterns for consistency

---

## Useful Links
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)
- [Supabase React Examples](https://github.com/supabase/supabase/tree/master/examples)

---

## Support
For issues or questions:
1. Check Supabase logs: Dashboard → **Logs**
2. Check Next.js errors: Terminal output
3. Browser console for client errors
4. Supabase status page: https://status.supabase.com

---

**Happy coding! 🚀**
