import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

if (supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('⚠️ Supabase URL is default. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Test connection
export const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('gold_prices').select('*').limit(1)
        if (error) throw error
        console.log('✅ Supabase connected successfully')
        return true
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message)
        return false
    }
}
