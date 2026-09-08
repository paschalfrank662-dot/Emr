import { createClient } from '@/lib/supabase/client'

export async function withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt))
    }
  }
  throw lastError
}

export async function selfHeal() {
  if (typeof window === 'undefined') return { hasHospital: true, online: true }
  if (!navigator.onLine) return { hasHospital: true, online: false }
  try {
    const supabase = createClient()
    const { count, error } = await withRetry(() => supabase.from('hospitals').select('id', { count: 'exact', head: true }))
    if (error) throw error
    return { hasHospital: (count ?? 0) > 0, online: true }
  } catch {
    return { hasHospital: true, online: false }
  }
}

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined))
  }
}

export function installOfflineGuard() {
  if (typeof window === 'undefined') return
  const update = () => document.documentElement.dataset.connection = navigator.onLine ? 'online' : 'offline'
  update()
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
}

export async function ensureHospitalExists() {
  const result = await selfHeal()
  if (!result.hasHospital && result.online && window.location.pathname !== '/register-hospital') {
    window.location.assign('/register-hospital')
  }
  return result
}

export function getSupabaseErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.toLowerCase().includes('fetch')) {
    return 'Unable to reach VITARA EMR services. Check your connection and try again.'
  }
  return 'We could not complete that request. Please try again.'
}

export async function getHospitalId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('staff').select('hospital_id').eq('auth_user_id', user.id).maybeSingle()
  return data?.hospital_id ?? null
}

export async function markEncounterSeen(encounterId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('encounters').update({ status: 'SEEN', seen_at: new Date().toISOString() }).eq('id', encounterId)
  if (error) throw error
}

export async function createPatientEncounter(input: { hospitalId: string; fullName: string; department: string; phone?: string }) {
  const supabase = createClient()
  const { data: patient, error: patientError } = await supabase.from('patients').insert({ hospital_id: input.hospitalId, full_name: input.fullName, phone: input.phone ?? null }).select('id').single()
  if (patientError) throw patientError
  const { data: last } = await supabase.from('encounters').select('queue_number').eq('hospital_id', input.hospitalId).eq('department', input.department).eq('status', 'WAITING').order('queue_number', { ascending: false }).limit(1).maybeSingle()
  const { error: encounterError } = await supabase.from('encounters').insert({ hospital_id: input.hospitalId, patient_id: patient.id, department: input.department, queue_number: (last?.queue_number ?? 0) + 1 })
  if (encounterError) throw encounterError
}
