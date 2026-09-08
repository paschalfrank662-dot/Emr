# GLOBAL EMR v3.0 - Phase 2 Development Roadmap

**Current Status:** Phase 1 Infrastructure Complete ✅
**Target:** Build 6+ Core Department Dashboards

---

## Quick Start for Phase 2

### Option A: Direct Dashboard Development
Start building dashboards immediately:
```bash
# 1. Create a new dashboard directory
mkdir -p app/dashboard/reception

# 2. Create the page component
touch app/dashboard/reception/page.tsx

# 3. Add to navigation in dashboard/layout.tsx

# 4. Run pnpm dev and test
```

### Option B: Recommended - Data Utilities First
Build reusable data hooks before dashboards:

```typescript
// hooks/usePatients.ts
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

export function usePatients(hospitalId: string) {
  const { data, isLoading, error } = useSWR(
    [`patients-${hospitalId}`],
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('hospital_id', hospitalId)
      return data
    }
  )
  return { patients: data || [], isLoading, error }
}
```

---

## Dashboard Development Priority

### 1️⃣ RECEPTION Dashboard (START HERE)
**Core Features:**
- [ ] Patient registration form
- [ ] Patient search/lookup
- [ ] Triage system (Emergency/Outpatient/Inpatient)
- [ ] QR wristband generation
- [ ] Appointment scheduling
- [ ] Check-in/check-out system
- [ ] Waiting list display

**Database Operations:**
- INSERT into `patients`
- INSERT into `visits`
- SELECT from `patients`
- UPDATE `visits` status

**File Structure:**
```
app/dashboard/reception/
├── page.tsx              (Main dashboard)
├── components/
│   ├── registration-form.tsx
│   ├── patient-search.tsx
│   ├── triage-modal.tsx
│   └── qr-generator.tsx
└── hooks/
    └── useReceptionData.ts
```

### 2️⃣ GENERAL DOCTOR Dashboard
**Core Features:**
- [ ] Patient queue management
- [ ] Vitals dashboard (BP, Temp, HR)
- [ ] Drug catalog (A-Z search)
- [ ] Supply catalog search
- [ ] Lab catalog search
- [ ] E-prescription system
- [ ] Voice note recording
- [ ] Medical record creation

**File Structure:**
```
app/dashboard/doctor/
├── page.tsx
├── components/
│   ├── patient-queue.tsx
│   ├── vitals-chart.tsx
│   ├── drug-catalog.tsx
│   ├── e-prescription.tsx
│   └── voice-recorder.tsx
└── hooks/
    ├── useDoctorPatients.ts
    └── useCatalog.ts
```

### 3️⃣ LAB TECHNICIAN Dashboard
**Core Features:**
- [ ] Lab order queue
- [ ] Sample registration
- [ ] Test processing workflow
- [ ] Result entry system
- [ ] QC checks
- [ ] Report generation

### 4️⃣ PHARMACY Dashboard
**Core Features:**
- [ ] Prescription queue
- [ ] Drug dispensing workflow
- [ ] Inventory management
- [ ] Barcode scanning
- [ ] Stock alerts
- [ ] Expiry management

### 5️⃣ BILLING Dashboard
**Core Features:**
- [ ] Invoice generation
- [ ] Payment processing (Paystack/Stripe)
- [ ] Revenue reports
- [ ] Patient ledger
- [ ] Insurance claims
- [ ] Financial summaries

### 6️⃣ ADMIN Dashboard (Enhancements)
**Core Features:**
- [ ] Staff management
- [ ] Department configuration
- [ ] Hospital settings
- [ ] Analytics & reporting
- [ ] System logs & audit
- [ ] Backup management

---

## Reusable Component Library to Build

Before/alongside dashboards, create these components:

```typescript
// components/shared/

// Data Display
- PatientCard.tsx          // Patient info display
- VitalsDisplay.tsx        // Vital signs visualization
- OrdersList.tsx           // Orders/requests list
- InvoicePreview.tsx       // Billing preview

// Forms
- PatientForm.tsx          // Registration
- PrescriptionForm.tsx     // Drug ordering
- VitalsForm.tsx           // Vital signs entry
- TriageForm.tsx           // Triage assessment

// Modals
- ConfirmDialog.tsx        // Generic confirmation
- PatientDetailModal.tsx   // Full patient info
- SearchModal.tsx          // Modal search interface

// Tables
- DataTable.tsx            // Reusable table
- OrdersTable.tsx          // Specific orders view
- PatientTable.tsx         // Specific patient list

// Status Badges
- StatusBadge.tsx          // Order/visit status
- RoleBadge.tsx            // Staff role display
- TriageBadge.tsx          // Triage level

// Navigation
- DepartmentNav.tsx        // Department quick links
- BreadcrumbNav.tsx        // Navigation trail
```

---

## Database Seeding Script

Create `scripts/seed-data.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedData() {
  // Add drugs to drug_master
  const drugs = [
    { drug_name: 'Paracetamol', generic_name: 'Acetaminophen', country: 'Nigeria' },
    { drug_name: 'Amoxicillin', generic_name: 'Amoxicillin', country: 'Nigeria' },
    // ... more drugs
  ]
  
  // Add supplies
  const supplies = [
    { item_name: 'Urine Bag', category: 'Consumables', function: 'Urine Collection' },
    // ... more supplies
  ]
  
  // Add lab tests
  const tests = [
    { test_name: 'CBC', category: 'Hematology', price: 5000, turnaround_time: '2 Hours' },
    // ... more tests
  ]
  
  console.log('Seeding data...')
}

seedData()
```

Run with:
```bash
npx ts-node scripts/seed-data.ts
```

---

## API Route Examples (If Needed)

Optional backend routes for complex operations:

```typescript
// app/api/patients/[id]/vitals/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const vitals = await request.json()
  
  const supabase = createServerClient()
  const { error } = await supabase
    .from('visits')
    .update({ vital_signs: vitals })
    .eq('patient_id', params.id)
  
  return Response.json({ success: !error })
}
```

---

## Real-time Features to Add

Use Supabase Realtime for live updates:

```typescript
// hooks/useRealtimePatients.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimePatients(hospitalId: string) {
  const [patients, setPatients] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase
      .channel(`patients-${hospitalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `hospital_id=eq.${hospitalId}`,
        },
        (payload) => {
          // Update state with changes
          console.log('Patient data changed:', payload)
        }
      )
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [hospitalId])
  
  return patients
}
```

---

## Testing Checklist for Each Dashboard

- [ ] Data loads correctly
- [ ] Filters/search work
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Error handling displays
- [ ] Loading states show
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Keyboard navigation works
- [ ] RLS policies enforced (user can only see their hospital data)
- [ ] Audit log captures changes

---

## Integration Tasks (After Core Dashboards)

### SMS & Email Alerts
```typescript
// lib/notifications.ts
import twilio from 'twilio'
import sendgrid from '@sendgrid/mail'

export async function sendSMSAlert(phone: string, message: string) {
  // Implementation
}

export async function sendEmailAlert(email: string, subject: string, html: string) {
  // Implementation
}
```

### Voice Recording & Transcription
```typescript
// hooks/useVoiceRecorder.ts
export function useVoiceRecorder() {
  // Record audio
  // Send to Google Cloud Speech-to-Text API
  // Return transcribed text
}
```

### QR Code Generation & Scanning
```typescript
// lib/qr-helpers.ts
import QRCode from 'qrcode'
import { Html5QrcodeScanner } from 'html5-qrcode'

export async function generateWristbandQR(patientId: string) {
  const dataUrl = await QRCode.toDataURL(patientId)
  return dataUrl
}
```

### PDF Generation (Prescriptions)
```typescript
// lib/pdf-generator.ts
import { Document, Page, Text, View } from '@react-pdf/renderer'

export function generatePrescriptionPDF(prescription: Prescription) {
  // Create PDF document
  // Return blob or send to browser
}
```

---

## Performance Optimization Tips

1. **Pagination**: Load patients 20 at a time, not all
   ```typescript
   const { data, count } = await supabase
     .from('patients')
     .select('*', { count: 'exact' })
     .range(0, 19)
   ```

2. **Caching**: Use SWR's built-in cache
   ```typescript
   useSWR(key, fetcher, { revalidateOnFocus: false })
   ```

3. **Lazy Load Images**: Use Next.js Image component
   ```typescript
   import Image from 'next/image'
   ```

4. **Code Splitting**: Each dashboard route splits automatically
   ```typescript
   const DoctorDashboard = dynamic(() => import('@/components/DoctorDash'))
   ```

---

## Next Immediate Steps

1. **This Week:**
   - [ ] Set up Supabase on your machine
   - [ ] Verify database tables exist
   - [ ] Test authentication flow
   - [ ] Create reusable component library stub

2. **Next Week:**
   - [ ] Build Reception dashboard
   - [ ] Add patient registration form
   - [ ] Test database operations

3. **Following Week:**
   - [ ] Build Doctor dashboard
   - [ ] Add vitals tracking
   - [ ] Add drug catalog search

---

## Questions to Clarify Before Starting

1. Should staff members register themselves or admin adds them? (Currently: admin adds via dashboard)
2. Do you want single sign-on (SSO) or stick with email/password?
3. Should patients have their own login?
4. Multi-hospital staff possible (staff in multiple hospitals)?
5. Specific design/layout preferences?

---

**Ready to start Phase 2? Begin with the Reception dashboard! 🚀**
