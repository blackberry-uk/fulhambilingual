import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('CUSTOM_SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const payload = await req.json()
        const { record } = payload

        if (!record || !record.person_id) {
            return new Response(JSON.stringify({ error: 'No record found' }), { status: 400 })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // Fetch the person's details
        const { data: person, error: personError } = await supabase
            .from('persons')
            .select('full_name, email_address, submission_language')
            .eq('id', record.person_id)
            .single()

        if (personError || !person) {
            console.error('Error fetching person:', personError)
            return new Response(JSON.stringify({ error: 'Person not found' }), { status: 404 })
        }

        const isFrench = person.submission_language === 'fr'

        // Create the email content
        const subject = isFrench
            ? "Merci d'avoir soutenu le Fulham Bilingual !"
            : "Thank you for supporting the Fulham Bilingual!"

        const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #d52b27; text-align: center;">${isFrench ? 'Merci !' : 'Thank You!'}</h2>
        <p>${isFrench ? 'Bonjour' : 'Hello'} ${person.full_name},</p>
        <p>
          ${isFrench
                ? "Merci d'avoir signé la pétition pour sauver le Fulham Bilingual. Votre voix compte énormément pour notre communauté."
                : "Thank you for signing the petition to save the Fulham Bilingual. Your voice matters immensely to our community."}
        </p>
        <p>
          ${isFrench
                ? "Nous vous tiendrons informé des prochaines étapes et des actions à venir."
                : "We will keep you informed about the next steps and upcoming actions."}
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          <b>FB COMMUNITY</b><br />
          Fulham Bilingual - London
        </p>
      </div>
    `

        // Send email via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Fulham Bilingual Community <info@fulhambilingual.org>',
                to: [person.email_address],
                subject: subject,
                html: htmlContent,
            }),
        })

        const result = await res.json()
        console.log('Resend Response:', result)

        return new Response(JSON.stringify(result), { status: 200 })
    } catch (error) {
        console.error('Error in function:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
