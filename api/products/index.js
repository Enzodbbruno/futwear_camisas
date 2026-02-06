const db = require('../db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { category, team } = req.query;
        // Parse Int safely
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;

        console.log('📦 Buscando produtos:', { category, team, limit, page });

        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (category && category !== 'all') {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (team) {
            query += ` AND team ILIKE $${paramIndex}`; // Case insensitive search
            params.push(`%${team}%`);
            paramIndex++;
        }

        // Pagination
        const offset = (page - 1) * limit;
        query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        console.log('📝 Executando Query:', query, params);

        const result = await db.query(query, params);

        console.log(`✅ ${result.rows.length} produtos encontrados.`);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('❌ Erro Fatal na API de Produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos. Consulte os logs do servidor.' });
    }
};
