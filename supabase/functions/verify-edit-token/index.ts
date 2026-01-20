import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const SUPABASE_URL = Deno.env.get('CUSTOM_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    try {
        const { email, token } = await req.json()

        if (!email || !token) {
            return new Response(JSON.stringify({ error: 'Email and token are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Verify token
        const { data: authToken, error: tokenError } = await supabase
            .from('auth_tokens')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .eq('token', token.trim())
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (tokenError || !authToken) {
            return new Response(JSON.stringify({ error: 'Invalid or expired code' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 2. Fetch the data
        const { data: person, error: personError } = await supabase
            .from('persons')
            .select('*')
            .eq('email_address', email.toLowerCase().trim())
            .single()

        if (personError || !person) {
            return new Response(JSON.stringify({ error: 'Person not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const { data: petitionRecord, error: recordError } = await supabase
            .from('petition_records')
            .select('*')
            .eq('person_id', person.id)
            .single()

        // 3. Mark token as used? 
        // Actually, let's keep it usable for the duration of the edit session (e.g. 5 more minutes) 
        // or just return it so the update function can use it.
        // For now, let's NOT mark as used here, so it can be verified again during update.

        return new Response(JSON.stringify({
            person,
            petitionRecord
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
