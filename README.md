# GLOBAL EMR v3.0
## World-Class Hospital Management System

A beautiful, secure, HIPAA/GDPR compliant Electronic Medical Record (EMR) system designed for hospitals worldwide. Built with modern web technologies and best practices for healthcare.

![Status](https://img.shields.io/badge/status-Phase%201%20Complete-brightgreen)
![License](https://img.shields.io/badge/license-Private-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)

---

## ✨ Features

### Phase 1: Foundation ✅
- **Multi-Tenant Architecture**: Complete hospital data isolation
- **Authentication**: Secure hospital registration and staff login
- **Database**: 13 optimized tables with RLS
- **UI Framework**: Modern, responsive design with dark mode
- **Security**: HIPAA & GDPR compliance built-in

### Phase 2: Department Dashboards (In Progress)
- Reception & Triage
- General Doctor & Vitals
- Lab Technician
- Pharmacy Management
- Billing & Finance
- Specialized Departments (Cardiology, Surgery, etc.)

### Future: Advanced Features
- Real-time Realtime synchronization
- Voice-to-text medical notes
- QR wristband system
- Payment integration
- Multi-language support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Supabase account (free tier)
- 5 minutes of setup time

### Installation

1. **Clone/Download Project**
   ```bash
   cd global-emr-v3
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Add your Supabase credentials
   # NEXT_PUBLIC_SUPABASE_URL=...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   # SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

5. **Access Application**
   ```
   Open http://localhost:3000
   ```

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Detailed setup instructions |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Complete feature overview |
| [PHASE_2_ROADMAP.md](./PHASE_2_ROADMAP.md) | Development roadmap |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Database structure (coming soon) |

---

## 🏗️ Architecture

### Frontend Stack
```
Next.js 16        - Server-side rendering & API routes
TypeScript        - Type safety
TailwindCSS       - Utility-first styling
shadcn/ui         - Component library
Zustand           - State management
SWR               - Data fetching & caching
```

### Backend Stack
```
Supabase          - PostgreSQL database
Row-Level Security- Multi-tenant data isolation
Auth              - Email/password authentication
Realtime          - Live data synchronization
```

### Database (13 Tables)
```
hospitals         - Hospital configuration
staff             - Staff members & roles
patients          - Patient demographics
visits            - Appointment tracking
medical_records   - Clinical notes & records
drug_master       - Drug catalog (global)
hospital_inventory- Drug inventory
hospital_supplies - Supply inventory
lab_catalog       - Available lab tests
orders            - Prescriptions & orders
billing           - Invoices & charges
payments          - Payment transactions
audit_log         - Compliance audit trail
```

---

## 👤 User Roles (18 Departments)

Each role has a specialized dashboard:

| Department | Features |
|-----------|----------|
| **Reception** | Patient registration, triage, appointments |
| **General Doctor** | Patient queue, vitals, prescriptions |
| **Cardiologist** | ECG, echo analysis, cardiac metrics |
| **Surgeon** | OR scheduling, consent forms, photos |
| **Pediatrician** | Growth charts, vaccines, milestones |
| **Nurse** | Vital signs, observations, ward management |
| **Lab Technician** | Test orders, processing, results |
| **Pharmacy** | Prescriptions, inventory, dispensing |
| **Billing** | Invoices, payments, reports |
| **Radiologist** | Image viewer, reports |
| **Pathologist** | Lab specimens, pathology reports |
| **Anesthesiologist** | Anesthesia planning, monitoring |
| **Nutritionist** | Diet plans, nutrition tracking |
| **Physiotherapist** | Therapy sessions, exercises |
| **Counselor** | Patient counseling records |
| **Admin** | Staff management, settings |
| **Warehouse** | Inventory management |
| **ICU Manager** | ICU-specific workflows |

---

## 🔐 Security Features

✅ **Data Protection**
- End-to-end encryption
- Row-Level Security (RLS) on all tables
- Hospital-level data isolation
- Automatic audit logging

✅ **Compliance**
- HIPAA compliant
- GDPR compliant
- Healthcare data standards
- Secure password hashing

✅ **Authentication**
- Email verification
- Session management
- Role-based access control
- Protected API routes

---

## 📊 Database Diagram

```
hospitals (1) ──────┬──────── staff (many)
                    │
                    ├──────── patients (many)
                    │         │
                    │         ├─ visits (many)
                    │         │  ├─ medical_records
                    │         │  └─ billing
                    │         │
                    │         └─ payments
                    │
                    ├─ hospital_inventory (many)
                    │  └─ drug_master (shared)
                    │
                    ├─ hospital_supplies (many)
                    │
                    ├─ lab_catalog (many)
                    │
                    └─ audit_log (many)
```

---

## 🎯 Use Cases

### Hospital Registration
1. Hospital admin registers at signup page
2. Email verification sent
3. Dashboard access granted
4. Staff added by admin

### Patient Workflow
1. Reception registers patient
2. Triage assigns priority
3. Doctor reviews vitals & history
4. Treatment & prescriptions
5. Billing & payment
6. Discharge with records

### Multi-Hospital Support
- Global drug catalog (shared)
- Isolated patient/staff data per hospital
- Hospital-specific inventory
- Country-specific currencies

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Or use Vercel CLI:
vercel deploy
```

### Environment Variables
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📱 Responsive Design

- **Mobile First**: Optimized for phones
- **Tablet**: Perfect at 768px+
- **Desktop**: Full features at 1024px+
- **Dark Mode**: Automatic theme detection
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🔄 Real-Time Features (Phase 2)

- Patient queue updates
- Vital signs monitoring
- Inventory alerts
- Lab result notifications
- Multi-user awareness

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Build check
pnpm build
```

---

## 📈 Performance

- Optimized database queries
- Efficient component rendering
- Image optimization
- Code splitting by route
- CDN delivery via Vercel

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create pull request
5. Code review & merge

---

## 📞 Support

### Documentation
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for setup issues
- See [PHASE_2_ROADMAP.md](./PHASE_2_ROADMAP.md) for development
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for features

### Troubleshooting
1. Check Supabase project status
2. Verify environment variables
3. Review browser console logs
4. Check terminal for dev server errors

---

## 📄 License

Private Project - All Rights Reserved

---

## 🌍 Supported Countries

- 🇳🇬 Nigeria (NGN - Naira)
- 🇺🇸 United States (USD - Dollar)
- 🇬🇧 United Kingdom (GBP - Pound)
- 🇮🇳 India (INR - Rupee)

Additional countries can be easily added to the database.

---

## 🎉 Status

| Phase | Status | Completion |
|-------|--------|-----------|
| Phase 1: Foundation | ✅ Complete | 100% |
| Phase 2: Dashboards | 🔄 In Progress | 0% |
| Phase 3: Integrations | ⏳ Planned | 0% |
| Phase 4: Polish | ⏳ Planned | 0% |

---

## 🔮 Roadmap

**Q1 2024**: Foundation setup ✅
- Database schema
- Authentication
- Basic UI

**Q2 2024**: Core dashboards (current)
- Reception
- Doctor
- Lab
- Pharmacy

**Q3 2024**: Advanced features
- Real-time updates
- Voice transcription
- QR wristbands
- Payment processing

**Q4 2024**: Polish & optimization
- Performance tuning
- Security audit
- Mobile app
- Multi-language

---

## 🙏 Acknowledgments

Built with modern healthcare best practices and cutting-edge web technologies.

---

## 📧 Contact

For inquiries or feedback: [email protected]

---

<div align="center">

**GLOBAL EMR v3.0** 
Building healthcare technology that matters. 🏥

*Last Updated: 2024*
*Made with ❤️ for healthcare providers worldwide*

</div>
