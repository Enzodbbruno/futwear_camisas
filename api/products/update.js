const db = require('../db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'PUT' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, name, price, description, image, category, team, stock, league, type, discount, promoStart, promoEnd } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID do produto é obrigatório' });
        }

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        const addField = (col, val) => {
            if (val !== undefined) {
                fields.push(`${col} = $${paramCount++}`);
                values.push(val);
            }
        };

        addField('name', name);
        addField('price', price);
        addField('description', description);
        addField('image', image);
        addField('category', category);
        addField('team', team);
        addField('stock', stock);
        addField('league', league);
        addField('type', type);
        addField('discount', discount);
        if (promoStart !== undefined) fields.push(`"promoStart" = $${paramCount++}`);
        if (promoStart !== undefined) values.push(promoStart);
        if (promoEnd !== undefined) fields.push(`"promoEnd" = $${paramCount++}`);
        if (promoEnd !== undefined) values.push(promoEnd);

        if (fields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        values.push(id);
        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
};
