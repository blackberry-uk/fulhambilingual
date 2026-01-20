import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixProspectiveFamily() {
    await client.connect();
    try {
        // The correct format (most common one)
        const correctFormat = "Prospective Family – Famille prospective – Intéressée par une future inscription";

        // Find all persons with the incorrect format
        const persons = await client.query(`
      SELECT id, relationship_to_school
      FROM persons
      WHERE relationship_to_school::text LIKE '%Prospective Family%'
    `);

        console.log(`Found ${persons.rows.length} persons with Prospective Family relationship`);

        let updated = 0;
        for (const person of persons.rows) {
            let relationships = person.relationship_to_school;
            let needsUpdate = false;

            // Replace any variant with the correct format
            relationships = relationships.map(rel => {
                if (rel.includes('Prospective Family')) {
                    needsUpdate = true;
                    return correctFormat;
                }
                return rel;
            });

            if (needsUpdate) {
                await client.query(
                    'UPDATE persons SET relationship_to_school = $1 WHERE id = $2',
                    [relationships, person.id]
                );
                updated++;
            }
        }

        console.log(`✅ Updated ${updated} person records to use consistent Prospective Family format`);

    } finally {
        await client.end();
    }
}

fixProspectiveFamily();
