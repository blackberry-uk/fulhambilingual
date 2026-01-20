import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { translateText, detectLanguage } from './services/gemini.ts';

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function translateMissingTestimonials() {
    await client.connect();
    try {
        // Get testimonials where content = content_translated (not translated)
        const result = await client.query(
            'SELECT id, person_name, content, language FROM testimonials WHERE content = content_translated ORDER BY created_at DESC'
        );

        console.log(`Found ${result.rows.length} testimonials needing translation\n`);

        for (const row of result.rows) {
            console.log(`Translating: ${row.person_name} (${row.language})`);

            try {
                // Detect actual language
                const detectedLang = await detectLanguage(row.content);
                const targetLang = detectedLang === 'EN' ? 'FR' : 'EN';

                // Translate
                const translated = await translateText(row.content, detectedLang, targetLang);

                // Update database
                await client.query(
                    'UPDATE testimonials SET content_translated = $1, language = $2 WHERE id = $3',
                    [translated, detectedLang, row.id]
                );

                console.log(`✅ Translated from ${detectedLang} to ${targetLang}`);
                console.log(`   Preview: ${translated.substring(0, 100)}...\n`);

                // Wait a bit to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error(`❌ Error translating ${row.person_name}:`, err.message);
            }
        }

        console.log('\n✅ Translation complete!');
    } finally {
        await client.end();
    }
}

translateMissingTestimonials();
