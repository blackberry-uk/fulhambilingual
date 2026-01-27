import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders } from "../_shared/cors.ts"

const SUPABASE_URL = Deno.env.get('CUSTOM_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { person, record, testimonial } = await req.json()

        if (!person || !person.email_address) {
            return new Response(JSON.stringify({ error: 'Person data with email is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Check if email already exists
        const { data: existingPerson, error: fetchError } = await supabase
            .from('persons')
            .select('id')
            .eq('email_address', person.email_address.toLowerCase().trim())
            .maybeSingle()

        if (fetchError) throw fetchError

        if (existingPerson) {
            return new Response(JSON.stringify({
                error: 'This email address has already been used to sign the petition. Please click on "Manage my Signature" to update your information.',
                code: 'DUPLICATE_EMAIL'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 2. Create Person
        const { data: newPerson, error: personError } = await supabase
            .from('persons')
            .insert({
                full_name: person.full_name,
                email_address: person.email_address.toLowerCase().trim(),
                relationship_to_school: person.relationship_to_school,
                student_year_groups: person.student_year_groups,
                submission_language: person.submission_language
            })
            .select()
            .single()

        if (personError) throw personError

        // 3. Create Petition Record
        const { error: recordError } = await supabase
            .from('petition_records')
            .insert({
                ...record,
                person_id: newPerson.id
            })

        if (recordError) throw recordError

        // 4. Create Testimonial if provided
        if (testimonial) {
            const { error: testimonialError } = await supabase
                .from('testimonials')
                .insert({
                    ...testimonial,
                    person_id: newPerson.id
                })

            if (testimonialError) {
                console.error('Failed to create testimonial:', testimonialError)
                // We don't fail the whole request if testimonial fails
            }
        }

        return new Response(JSON.stringify({ success: true, person: newPerson }), {
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
