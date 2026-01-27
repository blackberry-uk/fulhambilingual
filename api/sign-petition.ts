
import pkg from 'pg';
const { Client } = pkg;

export const config = {
    runtime: 'nodejs', // Use Node.js runtime for pg compatibility
}

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { person, record, testimonial } = req.body;

        if (!person || !person.email_address) {
            return res.status(400).json({ error: 'Person data with email is required' });
        }

        // Use DATABASE_URL from environment
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            return res.status(500).json({
                error: 'Database connection string is missing in Vercel environment. Please add DATABASE_URL to your Vercel project settings.'
            });
        }

        const client = new Client({ connectionString });
        await client.connect();

        try {
            // 1. Check if email already exists
            const checkRes = await client.query(
                'SELECT id FROM persons WHERE LOWER(email_address) = LOWER($1)',
                [person.email_address.trim()]
            );

            if (checkRes.rows.length > 0) {
                return res.status(400).json({
                    error: 'This email address has already been used to sign the petition.',
                    code: 'DUPLICATE_EMAIL'
                });
            }

            // 2. Start Transaction
            await client.query('BEGIN');

            // 3. Insert Person
            const personRes = await client.query(
                `INSERT INTO persons (full_name, email_address, relationship_to_school, student_year_groups, submission_language)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
                [
                    person.full_name,
                    person.email_address.toLowerCase().trim(),
                    person.relationship_to_school,
                    person.student_year_groups,
                    person.submission_language
                ]
            );
            const personId = personRes.rows[0].id;

            // 4. Insert Petition Record
            await client.query(
                `INSERT INTO petition_records (person_id, petition_support, supporting_comment, consent_public_use, comment_en, comment_fr, submission_timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [
                    personId,
                    record.petition_support,
                    record.supporting_comment,
                    record.consent_public_use,
                    record.comment_en,
                    record.comment_fr
                ]
            );

            // 5. Insert Testimonial if provided
            if (testimonial) {
                await client.query(
                    `INSERT INTO testimonials (person_id, person_name, content, content_translated, is_moderated, language, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                    [
                        personId,
                        testimonial.person_name,
                        testimonial.content,
                        testimonial.content_translated,
                        testimonial.is_moderated,
                        testimonial.language
                    ]
                );
            }

            await client.query('COMMIT');

            return res.status(200).json({ success: true, person: { id: personId } });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            await client.end();
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
