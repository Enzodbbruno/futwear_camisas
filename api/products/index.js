const db = require('../db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // --- GET: LIST PRODUCTS ---
        if (req.method === 'GET') {
            const { category, team } = req.query;
            const limit = parseInt(req.query.limit) || 50;
            const page = parseInt(req.query.page) || 1;

            let query = 'SELECT * FROM products WHERE 1=1';
            let params = [];
            let paramIndex = 1;

            if (category && category !== 'all') {
                query += ` AND category = $${paramIndex}`;
                params.push(category);
                paramIndex++;
            }

            if (team) {
                query += ` AND team ILIKE $${paramIndex}`;
                params.push(`%${team}%`);
                paramIndex++;
            }

            const offset = (page - 1) * limit;
            query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await db.query(query, params);
            return res.status(200).json(result.rows);
        }

        // --- POST: CREATE PRODUCT ---
        if (req.method === 'POST') {
            const { name, price, description, image, category, team, stock, league, type, discount, promoStart, promoEnd } = req.body;

            console.log('📦 Criando produto:', req.body);

            if (!name || price === undefined || price === null) {
                return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
            }

            // Sanitize Price
            let safePrice = 0;
            if (typeof price === 'number') {
                safePrice = price;
            } else {
                const priceStr = String(price).replace(',', '.');
                safePrice = parseFloat(priceStr);
            }

            if (isNaN(safePrice)) {
                return res.status(400).json({ error: 'Preço inválido' });
            }

            // Sanitize Discount
            let safeDiscount = 0;
            if (discount !== undefined && discount !== null) {
                if (typeof discount === 'number') {
                    safeDiscount = discount;
                } else {
                    const discStr = String(discount).replace(',', '.');
                    safeDiscount = parseFloat(discStr) || 0;
                }
            }

            const safeStock = parseInt(stock) || 0;

            const safePromoStart = promoStart && String(promoStart).trim() !== '' ? promoStart : null;
            const safePromoEnd = promoEnd && String(promoEnd).trim() !== '' ? promoEnd : null;

            const safeLeague = league || null;
            const safeType = type || null;
            const safeCategory = category || null;
            const safeTeam = team || null;

            const result = await db.query(
                `INSERT INTO products 
                (name, price, description, image, category, team, stock, league, type, discount, "promoStart", "promoEnd") 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                RETURNING *`,
                [name, safePrice, description, image, safeCategory, safeTeam, safeStock, safeLeague, safeType, safeDiscount, safePromoStart, safePromoEnd]
            );

            console.log('✅ Produto criado:', result.rows[0].id);
            return res.status(201).json(result.rows[0]);
        }

        // --- PUT: UPDATE PRODUCT ---
        if (req.method === 'PUT') {
            const { id, name, price, description, image, category, team, stock, league, type, discount, promoStart, promoEnd } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID do produto é obrigatório' });
            }

            console.log('📦 Atualizando produto:', id, req.body);

            // Sanitize numbers
            const safePrice = price !== undefined ? parseFloat(String(price).replace(',', '.')) : undefined;
            const safeDiscount = discount !== undefined ? parseFloat(String(discount).replace(',', '.')) : undefined;
            const safeStock = stock !== undefined ? parseInt(stock) : undefined;

            // Sanitize dates
            const safePromoStart = promoStart && String(promoStart).trim() !== '' ? promoStart : (promoStart === '' ? null : undefined);
            const safePromoEnd = promoEnd && String(promoEnd).trim() !== '' ? promoEnd : (promoEnd === '' ? null : undefined);

            // Build dynamic update query
            const fields = [];
            const values = [];
            let paramCount = 1;

            const addField = (col, val) => {
                if (val !== undefined && val !== null && !Number.isNaN(val)) {
                    fields.push(`${col} = $${paramCount++}`);
                    values.push(val);
                } else if (val === null) {
                    fields.push(`${col} = $${paramCount++}`); // Allow explicit nulls
                    values.push(null);
                }
            };

            // Note: Simplification for brevity, ensuring explicit undefined check
            if (name !== undefined) { fields.push(`name = $${paramCount++}`); values.push(name); }
            if (safePrice !== undefined && !Number.isNaN(safePrice)) { fields.push(`price = $${paramCount++}`); values.push(safePrice); }
            if (description !== undefined) { fields.push(`description = $${paramCount++}`); values.push(description); }
            if (image !== undefined) { fields.push(`image = $${paramCount++}`); values.push(image); }
            if (category !== undefined) { fields.push(`category = $${paramCount++}`); values.push(category); }
            if (team !== undefined) { fields.push(`team = $${paramCount++}`); values.push(team); }
            if (safeStock !== undefined && !Number.isNaN(safeStock)) { fields.push(`stock = $${paramCount++}`); values.push(safeStock); }
            if (league !== undefined) { fields.push(`league = $${paramCount++}`); values.push(league); }
            if (type !== undefined) { fields.push(`type = $${paramCount++}`); values.push(type); }
            if (safeDiscount !== undefined && !Number.isNaN(safeDiscount)) { fields.push(`discount = $${paramCount++}`); values.push(safeDiscount); }

            if (safePromoStart !== undefined) { fields.push(`"promoStart" = $${paramCount++}`); values.push(safePromoStart); }
            if (safePromoEnd !== undefined) { fields.push(`"promoEnd" = $${paramCount++}`); values.push(safePromoEnd); }

            if (fields.length === 0) {
                return res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }

            values.push(id);
            const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

            const result = await db.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            return res.status(200).json(result.rows[0]);
        }

        // --- DELETE: REMOVE PRODUCT ---
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'ID do produto é obrigatório' });
            }

            const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            return res.status(200).json({ message: 'Produto removido com sucesso', id });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('❌ Erro na API Products:', error);
        res.status(500).json({ error: 'Erro no servidor: ' + error.message });
    }
};
