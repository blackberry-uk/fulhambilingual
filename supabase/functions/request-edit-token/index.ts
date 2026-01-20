import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
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
        const { email, language } = await req.json()

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 1. Check if person exists
        const { data: person, error: personError } = await supabase
            .from('persons')
            .select('id, full_name')
            .eq('email_address', email.toLowerCase().trim())
            .single()

        if (personError || !person) {
            // We return 200 anyway for security/privacy, but message says "If email is registered..."
            return new Response(JSON.stringify({ message: 'If your email is registered, you will receive a code shortly.' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins

        // 3. Store OTP
        const { error: tokenError } = await supabase
            .from('auth_tokens')
            .insert({
                email: email.toLowerCase().trim(),
                token: otp,
                expires_at: expiresAt
            })

        if (tokenError) throw tokenError

        // 4. Send Email via Resend
        const subject = "Code d'accès / Access Code - Fulham Bilingual";

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #d52b27; margin: 0;">Code d'accès / Access Code</h2>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p>Bonjour ${person.full_name},</p>
                    <p>Voici votre code d’accès pour modifier votre signature ou vos préférences sur la pétition :</p>
                </div>

                <div style="background: #f4f4f4; padding: 30px; text-align: center; border-radius: 15px; margin: 20px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666;">
                    <p>Hello ${person.full_name},</p>
                    <p>Here is your access code to edit your signature or preferences for the petition:</p>
                </div>

                <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
                    Ce code est valable 15 minutes. / This code is valid for 15 minutes.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #bbb; text-align: center; text-transform: uppercase;">
                    FB COMMUNITY - Fulham Bilingual
                </p>
            </div>
        `

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Fulham Bilingual <noreply@fulhambilingual.org>',
                to: [email],
                subject: subject,
                html: html,
            }),
        })

        return new Response(JSON.stringify({ message: 'Code sent successfully' }), {
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
