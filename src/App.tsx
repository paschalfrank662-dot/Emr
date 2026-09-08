import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Country, State } from 'country-state-city'
import { supabase } from './lib/supabaseClient'
import './styles.css'

type Hospital = { id: string; name: string; hospital_id_code: string; country: string; state: string; city: string }
type SessionUser = { id: string; email?: string }

type FormState = { hospitalName: string; hospitalCode: string; country: string; state: string; city: string; adminName: string; email: string; password: string; confirm: string; phone: string }

const initialForm: FormState = { hospitalName: '', hospitalCode: '', country: 'Nigeria', state: '', city: '', adminName: '', email: '', password: '', confirm: '', phone: '' }
const countries = Country.getAllCountries()
const nigeriaStates = State.getStatesOfCountry('NG').map((state) => state.name)

function ErrorMessage({ error }: { error: string }) { return error ? <div className="error" role="alert">{error}</div> : null }

function Registration() {
  const navigate = useNavigate(); const [form, setForm] = useState(initialForm); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const email = form.email.trim().toLowerCase()
    const hospitalCode = form.hospitalCode.trim().toUpperCase()
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    if (!/^[A-Z0-9-]{3,12}$/.test(hospitalCode)) return setError('Hospital ID Code must be 3–12 letters, numbers, or hyphens')
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 30000)
      let registration: Response
      try {
        registration = await fetch(`${window.location.origin}/api/register-hospital`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
          body: JSON.stringify({ ...form, email, hospitalCode }),
        })
      } finally {
        window.clearTimeout(timeout)
      }
      const result = await registration.json().catch(() => ({}))
      if (!registration.ok) throw new Error(result.error || `Registration service returned HTTP ${registration.status}.`)

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: form.password })
      if (loginError) throw new Error('Hospital was created, but automatic sign-in failed. Use the login page with the same credentials.')
      toast.success('Hospital account created and signed in')
      navigate('/dashboard')
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to create hospital account.'
      const normalized = message.toLowerCase()
      setError(normalized.includes('abort')
        ? 'Registration timed out. Check your connection and try again.'
        : normalized.includes('fetch')
          ? 'The registration service could not be reached. Please refresh the page and try again.'
          : normalized.includes('rate limit') || normalized.includes('email send')
            ? 'Registration does not send a confirmation email. If this email already exists, use Sign in.'
            : message)
    } finally { setLoading(false) }
  }
  return <main className="auth-shell"><form className="card" onSubmit={submit}><h1 className="brand">VITARA EMR</h1><p className="muted">Create your hospital workspace</p><ErrorMessage error={error} /><div className="form-grid">
    <Field label="Hospital Name" value={form.hospitalName} onChange={(v) => update('hospitalName', v)} required /><Field label="Hospital ID Code" hint="Used for patient numbers, e.g. CHB-0001" value={form.hospitalCode} onChange={(v) => update('hospitalCode', v.toUpperCase())} required />
    <SelectField label="Country" value={form.country} options={countries.map((country) => country.name)} onChange={(v) => update('country', v)} /><SelectField label="State / Region" value={form.state} options={(countries.find((country) => country.name === form.country)?.isoCode === 'NG' ? nigeriaStates : State.getStatesOfCountry(countries.find((country) => country.name === form.country)?.isoCode ?? '').map((state) => state.name))} onChange={(v) => update('state', v)} required />
    <Field label="City" value={form.city} onChange={(v) => update('city', v)} required /><Field label="Hospital Phone" value={form.phone} onChange={(v) => update('phone', v)} />
    <Field label="Admin Full Name" value={form.adminName} onChange={(v) => update('adminName', v)} required /><Field label="Admin Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
    <Field label="Password" type="password" value={form.password} onChange={(v) => update('password', v)} required /><Field label="Confirm Password" type="password" value={form.confirm} onChange={(v) => update('confirm', v)} required />
  </div><button className="primary" disabled={loading}>{loading ? 'Creating hospital…' : 'Create Hospital Account'}</button><p className="muted">Already registered? <Link to="/login">Sign in</Link></p></form></main>
}

function Login() { const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }); setLoading(false); if (authError) { setError(authError.message.toLowerCase().includes('invalid') ? 'Invalid email or password' : authError.message); return } toast.success('Signed in'); navigate('/dashboard') }
  return <main className="auth-shell"><form className="card" onSubmit={submit}><h1 className="brand">VITARA EMR</h1><p className="muted">Secure hospital access</p><ErrorMessage error={error} /><Field label="Email" type="email" value={email} onChange={setEmail} required /><Field label="Password" type="password" value={password} onChange={setPassword} required /><button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button><p className="muted">New hospital? <Link to="/register-hospital">Register here</Link></p></form></main>
}

function Field({ label, value, onChange, type = 'text', required = false, hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; hint?: string }) { return <div className="field"><label>{label}{required ? ' *' : ''}</label><input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />{hint && <small className="muted">{hint}</small>}</div> }
function SelectField({ label, value, options, onChange, required = false }: { label: string; value: string; options: string[]; onChange: (value: string) => void; required?: boolean }) { return <div className="field"><label>{label}{required ? ' *' : ''}</label><select value={value} required={required} onChange={(event) => onChange(event.target.value)}><option value="">Select {label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div> }

function Dashboard({ user, hospital }: { user: SessionUser; hospital: Hospital | null }) { const navigate = useNavigate(); return <div className="dashboard"><aside className="sidebar"><h1 className="brand">VITARA EMR</h1><nav><Link className="active" to="/dashboard">Dashboard</Link><Link to="/patients/new">New patient</Link><Link to="/doctor/queue">Doctor queue</Link><Link to="/admin/staff">Staff</Link></nav><button className="primary" onClick={async () => { await supabase.auth.signOut(); navigate('/login') }}>Sign out</button></aside><main className="content"><h2>Welcome back</h2><p className="muted">{user.email} · {hospital?.name ?? 'Hospital workspace'}</p><div className="card"><h3>Workspace ready</h3><p>Manage patients, queues, staff, and hospital operations from one secure workspace.</p><p className="muted">Hospital ID: {hospital?.hospital_id_code ?? 'Not linked'}</p></div></main></div> }
function Protected({ user, children }: { user: SessionUser | null; children: React.ReactNode }) { return user ? <>{children}</> : <Navigate to="/login" replace /> }

export default function App() { const [user, setUser] = useState<SessionUser | null>(null); const [hospital, setHospital] = useState<Hospital | null>(null); const [ready, setReady] = useState(false); const location = useLocation()
  useEffect(() => { let mounted = true; supabase.auth.getSession().then(async ({ data }) => { if (!mounted) return; const current = data.session?.user ?? null; setUser(current); if (current) { const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', current.id).maybeSingle(); if (profile?.hospital_id) { const { data: record } = await supabase.from('hospitals').select('id,name,hospital_id_code,country,state,city').eq('id', profile.hospital_id).maybeSingle(); setHospital(record) } } setReady(true) }); const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)); return () => { mounted = false; listener.subscription.unsubscribe() } }, [])
  const isPublic = useMemo(() => ['/login', '/register-hospital'].includes(location.pathname), [location.pathname]); if (!ready) return <main className="auth-shell"><div className="card"><h1 className="brand">VITARA EMR</h1><p className="muted">Connecting securely…</p></div></main>
  return <Routes><Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/register-hospital" replace />} /><Route path="/register-hospital" element={user ? <Navigate to="/dashboard" replace /> : <Registration />} /><Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} /><Route path="/dashboard" element={<Protected user={user}><Dashboard user={user!} hospital={hospital} /></Protected>} /><Route path="*" element={<Navigate to={isPublic ? location.pathname : '/dashboard'} replace />} /></Routes>
}
