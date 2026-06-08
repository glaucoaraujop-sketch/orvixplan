import { createClient } from '@supabase/supabase-js'

// URL e anon key são credenciais PÚBLICAS do Supabase — correto usar no frontend
// Apenas a service_role key é secret e nunca deve ir para o frontend
const SUPABASE_URL      = 'https://mxccbtwlolwwppvsbrlw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2NidHdsb2x3d3BwdnNicmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzI4NzcsImV4cCI6MjA5MTk0ODg3N30.wQtgD8tOZQ-6aC491lvfcBW1tAM0x4bCyR_Ka4MPkec'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'orvixplan' },
})
