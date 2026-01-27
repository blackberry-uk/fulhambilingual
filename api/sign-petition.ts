
import { createClient } from '@supabase/supabase-js'

export const config = {
    runtime: 'edge',
}

export default async function handler(req: Request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

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

        const supabaseUrl = process.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
                person_id: newPerson.id,
                submission_timestamp: new Date().toISOString()
            })

        if (recordError) throw recordError

        // 4. Create Testimonial if provided
        if (testimonial) {
            const { error: testimonialError } = await supabase
                .from('testimonials')
                .insert({
                    ...testimonial,
                    person_id: newPerson.id,
                    created_at: new Date().toISOString()
                })

            if (testimonialError) {
                console.error('Failed to create testimonial:', testimonialError)
            }
        }

        return new Response(JSON.stringify({ success: true, person: newPerson }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
}
