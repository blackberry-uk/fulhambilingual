import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('CUSTOM_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    console.log('--- Incoming Webhook Request ---')
    try {
        const payload = await req.json()
        console.log('Payload Received:', JSON.stringify(payload, null, 2))

        const { record } = payload

        if (!record || !record.person_id) {
            console.error('Missing record or person_id in payload')
            return new Response(JSON.stringify({ error: 'No record found or missing person_id' }), { status: 400 })
        }

        console.log('Initializing Supabase client...')
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // Fetch the person's details
        console.log(`Fetching person details for ID: ${record.person_id}`)
        const { data: person, error: personError } = await supabase
            .from('persons')
            .select('full_name, email_address, submission_language')
            .eq('id', record.person_id)
            .single()

        if (personError || !person) {
            console.error('Error fetching person from DB:', personError)
            return new Response(JSON.stringify({ error: 'Person not found in database', details: personError }), { status: 404 })
        }

        console.log(`Person found: ${person.full_name} (${person.email_address}) [Lang: ${person.submission_language}]`)

        // FIX: Handle both lowercase and uppercase language strings
        const isFrench = person.submission_language?.toUpperCase() === 'FR'

        // Bilingual Subject
        const subject = "Merci / Thank you - Save the Fulham Bilingual";

        console.log(`Preparing email with subject: "${subject}"`)

        const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #d52b27; margin: 0;">Merci / Thank You!</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <p>Bonjour ${person.full_name},</p>
          <p>
            Merci d'avoir signé la pétition pour sauver le Fulham Bilingual. Votre voix compte énormément pour notre communauté. 
            Nous vous tiendrons informé des prochaines étapes et des actions à venir.
          </p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666;">
          <p>Hello ${person.full_name},</p>
          <p>
            Thank you for signing the petition to save the Fulham Bilingual. Your voice matters immensely to our community. 
            We will keep you informed about the next steps and upcoming actions.
          </p>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
          <b>FB COMMUNITY</b><br />
          Fulham Bilingual - London
        </p>
      </div>
    `

        // Send email via Resend
        console.log('Calling Resend API...')
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Fulham Bilingual <noreply@fulhambilingual.org>',
                to: [person.email_address],
                subject: subject,
                html: htmlContent,
            }),
        })

        const result = await res.json()
        console.log('Resend Response STATUS:', res.status)
        console.log('Resend Response BODY:', JSON.stringify(result, null, 2))

        if (!res.ok) {
            console.error('Resend API Error:', result)
            return new Response(JSON.stringify({ error: 'Resend API Error', details: result }), { status: res.status })
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Critical Error in Edge Function:', error)
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
})
