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

        console.log('📦 Atualizando produto:', id, req.body);

        // Sanitize numbers
        const safePrice = price !== undefined ? parseFloat(price.toString().replace(',', '.')) : undefined;
        const safeDiscount = discount !== undefined ? parseFloat(discount.toString().replace(',', '.')) : undefined;
        const safeStock = stock !== undefined ? parseInt(stock) : undefined;

        // Sanitize dates
        const safePromoStart = promoStart && promoStart.trim() !== '' ? promoStart : (promoStart === '' ? null : undefined);
        const safePromoEnd = promoEnd && promoEnd.trim() !== '' ? promoEnd : (promoEnd === '' ? null : undefined);

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
        addField('price', safePrice);
        addField('description', description);
        addField('image', image);
        addField('category', category);
        addField('team', team);
        addField('stock', safeStock);
        addField('league', league);
        addField('type', type);
        addField('discount', safeDiscount);

        // Handle mixed-case columns specifically
        if (safePromoStart !== undefined) {
            fields.push(`"promoStart" = $${paramCount++}`);
            values.push(safePromoStart);
        }
        if (safePromoEnd !== undefined) {
            fields.push(`"promoEnd" = $${paramCount++}`);
            values.push(safePromoEnd);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        values.push(id);
        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        console.log('📝 Query Update:', query, values);

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        console.log('✅ Produto atualizado');
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto: ' + error.message });
    }
};
