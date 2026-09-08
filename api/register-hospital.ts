import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null

// The Admin Auth namespace is available at runtime for service-role clients,
// while the current Supabase auth typings omit it from the inferred client type.
type AdminClient = NonNullable<typeof admin> & {
  auth: NonNullable<typeof admin>['auth'] & {
    admin: {
      createUser(input: { email: string; password: string; email_confirm: boolean; user_metadata: Record<string, string> }): Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>
      deleteUser(id: string): Promise<{ error: { message: string } | null }>
    }
  }
}

const privilegedAdmin = admin as AdminClient | null

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'GET') return response.status(200).json({ ok: true, service: 'hospital-registration', configured: Boolean(privilegedAdmin) })
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
  if (!privilegedAdmin) return response.status(503).json({ error: 'Hospital registration is not configured on this deployment.' })

  const body = request.body ?? {}
  const hospitalName = text(body.hospitalName)
  const hospitalCode = text(body.hospitalCode).toUpperCase()
  const country = text(body.country)
  const state = text(body.state)
  const city = text(body.city)
  const phone = text(body.phone)
  const adminName = text(body.adminName)
  const email = text(body.email).toLowerCase()
  const password = text(body.password)

  if (!hospitalName || !hospitalCode || !country || !state || !city || !adminName || !email || password.length < 8) {
    return response.status(400).json({ error: 'Complete all required fields and use a password of at least 8 characters.' })
  }
  if (!/^[A-Z0-9-]{3,12}$/.test(hospitalCode)) return response.status(400).json({ error: 'Hospital ID Code must be 3–12 letters, numbers, or hyphens.' })
  if (!/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ error: 'Enter a valid administrator email address.' })

  let userId: string | null = null
  let hospitalId: string | null = null
  try {
    const { data: userData, error: userError } = await privilegedAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: adminName, role: 'Head Admin' },
    })
    if (userError) {
      if (userError.message.toLowerCase().includes('already')) return response.status(409).json({ error: 'That administrator email is already registered.' })
      return response.status(400).json({ error: userError.message })
    }
    if (!userData.user?.id) {
      return response.status(500).json({ error: 'Supabase created no administrator account. Please try again.' })
    }
    userId = userData.user.id

    const primaryHospital = await privilegedAdmin.from('hospitals').insert({
      name: hospitalName, hospital_id_code: hospitalCode, country, state, city, phone, email,
    }).select('id').single()
    let hospital = primaryHospital.data
    let hospitalError = primaryHospital.error

    // Existing VITARA projects used both hospital_id and hospital_id_code.
    // Retry against the canonical migration column when the older schema is live.
    if (hospitalError?.code === '42703' || hospitalError?.message.includes('hospital_id_code')) {
      const fallback = await privilegedAdmin.from('hospitals').insert({
        name: hospitalName, hospital_id: hospitalCode, country, state, city, phone, email,
      }).select('id').single()
      hospital = fallback.data
      hospitalError = fallback.error
    }
    if (hospitalError) {
      if (hospitalError.code === '23505') return response.status(409).json({ error: 'That Hospital ID Code is already registered.' })
      throw hospitalError
    }
    if (!hospital?.id) throw new Error('Hospital was created without an id')
    hospitalId = hospital.id

    const primaryProfile = await privilegedAdmin.from('profiles').insert({
      id: userId, hospital_id: hospitalId, full_name: adminName, email, hospital_role: 'Head Admin', is_head_admin: true,
    })
    let profileError = primaryProfile.error
    if (profileError?.code === '42703' || profileError?.message.includes('hospital_role')) {
      const fallbackProfile = await privilegedAdmin.from('profiles').insert({
        id: userId, hospital_id: hospitalId, full_name: adminName, email, role: 'Head Admin', is_head_admin: true,
      })
      profileError = fallbackProfile.error
    }
    if (profileError) throw profileError

    return response.status(201).json({ ok: true })
  } catch (error) {
    if (hospitalId) await privilegedAdmin.from('hospitals').delete().eq('id', hospitalId)
    if (userId) await privilegedAdmin.auth.admin.deleteUser(userId)
    console.error('[vitara] registration failed', error)
    return response.status(500).json({ error: 'Hospital account could not be created. Please try again.' })
  }
}
