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
        const { email, token, personUpdates, recordUpdates } = await req.json()

        if (!email || !token) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Verify token
        const { data: authToken, error: tokenError } = await supabase
            .from('auth_tokens')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .eq('token', token.trim())
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (tokenError || !authToken) {
            return new Response(JSON.stringify({ error: 'Session expired or invalid. Please request a new code.' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 2. Fetch Person to ensure ID safety
        const { data: person, error: personError } = await supabase
            .from('persons')
            .select('id')
            .eq('email_address', email.toLowerCase().trim())
            .single()

        if (personError || !person) {
            return new Response(JSON.stringify({ error: 'Person not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 3. Update Person
        const { error: pUpdateError } = await supabase
            .from('persons')
            .update({
                full_name: personUpdates.full_name,
                relationship_to_school: personUpdates.relationship_to_school,
                student_year_groups: personUpdates.student_year_groups,
            })
            .eq('id', person.id)

        if (pUpdateError) throw pUpdateError

        // 4. Update Petition Record
        const { error: rUpdateError } = await supabase
            .from('petition_records')
            .update({
                petition_support: recordUpdates.petition_support,
                supporting_comment: recordUpdates.supporting_comment,
                consent_public_use: recordUpdates.consent_public_use,
            })
            .eq('person_id', person.id)

        if (rUpdateError) throw rUpdateError

        // 5. Mark token as used
        await supabase
            .from('auth_tokens')
            .update({ used: true })
            .eq('id', authToken.id)

        return new Response(JSON.stringify({ success: true }), {
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
