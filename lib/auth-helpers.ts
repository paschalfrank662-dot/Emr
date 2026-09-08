import { createClient } from '@/lib/supabase/client'

export async function signUpHospital(
  email: string,
  password: string,
  hospitalName: string,
  country: string,
  state: string,
  adminFullName: string
) {
  const supabase = createClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        hospital_name: hospitalName,
        admin_full_name: adminFullName,
        role: 'ADMIN',
      },
    },
  })

  if (authError) throw authError

  if (!authData.user?.id) {
    throw new Error('Failed to create user account')
  }

  // Create hospital record
  const { data: hospitalData, error: hospitalError } = await supabase
    .from('hospitals')
    .insert({
      name: hospitalName,
      country,
      state,
      currency: getCurrencyByCountry(country),
    })
    .select()
    .single()

  if (hospitalError) throw hospitalError

  // Create staff record for hospital admin
  const { error: staffError } = await supabase.from('staff').insert({
    hospital_id: hospitalData.id,
    auth_user_id: authData.user.id,
    email,
    full_name: adminFullName,
    role: 'ADMIN',
    department: 'Administration',
  })

  if (staffError) throw staffError

  return { user: authData.user, hospital: hospitalData }
}

export async function signInStaff(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Get staff record to load hospital and role
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('*, hospitals!inner(id, name, country, currency)')
    .eq('auth_user_id', data.user.id)
    .single()

  if (staffError) throw staffError

  return {
    user: data.user,
    staff: staffData,
  }
}

export async function getCurrentUser() {
  // This function should be called from server components only
  // For client components, use the client directly
  return null
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export function getCurrencyByCountry(country: string): string {
  const currencyMap: Record<string, string> = {
    Nigeria: 'NGN',
    'United States': 'USD',
    'United Kingdom': 'GBP',
    India: 'INR',
  }
  return currencyMap[country] || 'USD'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
