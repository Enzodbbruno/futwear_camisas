
const db = require('./db');

async function testQuery() {
    try {
        console.log('🧪 Testando query da API...');

        // Simulating the query parameters from index.js
        const limit = 100;
        const page = 1;
        const category = undefined;
        const team = undefined;

        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (team) {
            query += ` AND team ILIKE $${paramIndex}`;
            params.push(`%${team}%`);
            paramIndex++;
        }

        // Pagination
        const offset = (page - 1) * limit;
        query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        console.log('📝 Query:', query);
        console.log('🔢 Params:', params);

        const result = await db.query(query, params);
        console.log('✅ Resultado:', result.rows.length, 'itens encontrados');

    } catch (error) {
        console.log('❌ ERRO CAPTURADO:', error);
    } finally {
        process.exit();
    }
}

testQuery();
