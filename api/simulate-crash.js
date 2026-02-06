
const db = require('./db');

async function testCrash() {
    try {
        console.log('🧪 Testando inserção com undefined...');

        // Payload similar to what admin.js sends (missing type, discount, promoStart)
        const name = "Teste Crash";
        const price = 100;
        const description = "Desc";
        const image = "img.png";
        const category = "custom";
        const team = "Team";
        const stock = 10;
        const league = "League";

        // MISSING FIELDS - these will be undefined
        let type;
        let discount;
        let promoStart;
        let promoEnd;

        // Code from create.js (before fix)
        // Note: passing 'type' (undefined) to safe?

        console.log('Tentando inserir...');

        // This simulates the db.query call in create.js
        await db.query(
            `INSERT INTO products 
            (name, price, description, image, category, team, stock, league, type, discount, "promoStart", "promoEnd") 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *`,
            [name, price, description, image, category, team, stock, league, type, discount, promoStart, promoEnd]
        );

        console.log('✅ Sucesso (Inesperado?)');

    } catch (error) {
        console.log('✅ Crash Confirmado:', error.message);
    } finally {
        process.exit();
    }
}

testCrash();
