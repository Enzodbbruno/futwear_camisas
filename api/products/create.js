const db = require('../db');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, price, description, image, category, team, stock, league, type, discount, promoStart, promoEnd } = req.body;

        console.log('📦 Criando produto:', req.body);

        // Strict check: price must be valid
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

        // Handle dates: Empty string or null should be NULL for Postgres
        const safePromoStart = promoStart && String(promoStart).trim() !== '' ? promoStart : null;
        const safePromoEnd = promoEnd && String(promoEnd).trim() !== '' ? promoEnd : null;

        // Ensure optional fields are null if undefined/empty
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
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto: ' + error.message });
    }
};
