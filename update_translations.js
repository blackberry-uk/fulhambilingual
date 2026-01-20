import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const translations = [
    {
        id: 'dcbaca02',
        lang: 'EN',
        translation: "Je ne suis pas d'accord avec la manière, le discours, les manières que le LFCG utilise. Ce n'est pas l'éducation que j'attends pour mon enfant."
    },
    {
        id: '12328a6a',
        lang: 'EN',
        translation: "En tant que famille britannique, mes enfants ont énormément bénéficié de l'apprentissage du français et de l'immersion dans la culture française dès leur plus jeune âge. Cette éducation bilingue les a aidés à devenir généreux, ouverts d'esprit et confiants dans leur engagement avec d'autres cultures."
    },
    {
        id: '776834dd',
        lang: 'EN',
        translation: "Veuillez considérer attentivement les ramifications - fermer FB détruira toute une communauté avec de nombreuses familles prêtes à quitter la région (y compris la nôtre). Laissez FB tel quel s'il vous plaît."
    },
    {
        id: 'c6ce2ed8',
        lang: 'EN',
        translation: "Idéalement, le partenariat se poursuivrait. Si ce n'est pas possible, nous aimerions une option bilingue publique sur le site existant de Clancarty Road. Réaffecter les enfants de Holy Cross à différentes écoles doit être exclu."
    },
    {
        id: '333ef2af',
        lang: 'EN',
        translation: "Je soutiens le maintien de l'école ouverte et la poursuite de l'éducation bilingue pour mon enfant."
    },
    {
        id: 'aba3fb87',
        lang: 'FR',
        translation: "my old school I loved it don't close it everyone loves this school"
    },
    {
        id: 'e17259ad',
        lang: 'EN',
        translation: "Une option serait de demander une contribution financière aux parents de Holy Cross de la section bilingue."
    },
    {
        id: '323b8701',
        lang: 'EN',
        translation: "Je ne comprends pas pourquoi cela se produit. Le partenariat Holy Cross/Lycée a constamment produit un programme académique de qualité exceptionnelle pour ses élèves."
    },
    {
        id: '92541f2a',
        lang: 'EN',
        translation: "Le partenariat entre le Lycée et les écoles locales a grandement bénéficié à notre fille et j'aimerais que ce bénéfice profite à d'autres."
    },
    {
        id: '88a4f3b6',
        lang: 'EN',
        translation: "Tellement injuste, aucune consultation, juste nous le balancer. Comme si nous n'avions pas d'importance. Seul le côté français compte."
    }
];

async function updateTranslations() {
    await client.connect();
    try {
        console.log('Updating translations...\n');

        for (const item of translations) {
            const result = await client.query(
                'UPDATE testimonials SET content_translated = $1, language = $2 WHERE id LIKE $3 RETURNING person_name',
                [item.translation, item.lang, item.id + '%']
            );

            if (result.rows.length > 0) {
                console.log(`✅ ${result.rows[0].person_name} (${item.lang})`);
            } else {
                console.log(`❌ No match for ID ${item.id}`);
            }
        }

        console.log('\n✅ All translations updated!');
    } finally {
        await client.end();
    }
}

updateTranslations();
