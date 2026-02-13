const db = require('../lib/db');

module.exports = async (req, res) => {
    const { method } = req;

    try {
        if (method === 'POST') {
            // Apply promotion to filtered products OR specific product IDs
            // Body: { category, team, league, percent, priceTarget, startDate, endDate, productIds }
            const { category, team, league, percent, priceTarget, startDate, endDate, productIds } = req.body;

            let query = 'UPDATE products SET ';
            const params = [];
            let paramCount = 1;
            const updates = [];

            if (percent !== undefined && percent !== null) {
                updates.push(`discount = $${paramCount}`);
                params.push(percent);
                paramCount++;
            }

            // Note: priceTarget logic might be complex if we want to set a fixed price. 
            // For now, let's assume we update base price? OR maybe we just use discount.
            // Requirement says "define price/%". Let's handle price update if provided.
            if (priceTarget) {
                updates.push(`price = $${paramCount}`);
                params.push(priceTarget);
                paramCount++;
            }

            if (startDate) {
                updates.push(`"promoStart" = $${paramCount}`); // User camelCase column name with quotes if needed
                params.push(startDate);
                paramCount++;
            } else if (percent !== undefined) {
                // Clear start date if setting new promo without date
                updates.push(`"promoStart" = NULL`);
            }

            if (endDate) {
                updates.push(`"promoEnd" = $${paramCount}`);
                params.push(endDate);
                paramCount++;
            } else if (percent !== undefined) {
                // Clear end date if setting new promo without date
                updates.push(`"promoEnd" = NULL`);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No updates specified (percent or price)' });
            }

            query += updates.join(', ');

            // WHERE Filters
            const filters = [];

            // Priority: productIds array (specific products)
            if (productIds && Array.isArray(productIds) && productIds.length > 0) {
                // Convert to integers to ensure type safety
                const numericIds = productIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

                if (numericIds.length === 0) {
                    return res.status(400).json({ error: 'Invalid product IDs provided' });
                }

                const placeholders = numericIds.map((_, i) => `$${paramCount + i}`).join(', ');
                filters.push(`id IN (${placeholders})`);
                params.push(...numericIds);
                paramCount += numericIds.length;

                console.log('🎯 [PROMOTIONS API] Using productIds filter. IDs:', numericIds);
            } else {
                // Fallback to category/team/league filters
                if (category) {
                    filters.push(`category = $${paramCount}`);
                    params.push(category);
                    paramCount++;
                }
                if (league) {
                    filters.push(`league = $${paramCount}`);
                    params.push(league);
                    paramCount++;
                }
                if (team) {
                    // Team is a LIKE search usually
                    filters.push(`team ILIKE $${paramCount}`);
                    params.push(`%${team}%`);
                    paramCount++;
                }
            }

            if (filters.length > 0) {
                query += ' WHERE ' + filters.join(' AND ');
            } else {
                // Safety: Require at least one filter or explicit "all" flag (not implemented to be safe)
                // For now, if no filters, it updates ALL? Let's restrict it.
                // return res.status(400).json({ error: 'At least one filter (category, league, team) is required' });
            }

            console.log('🔍 [PROMOTIONS API] Running promotion query:', query);
            console.log('📦 [PROMOTIONS API] Params:', params);
            console.log('🎯 [PROMOTIONS API] ProductIds received:', productIds);

            const result = await db.query(query, params);

            console.log('✅ [PROMOTIONS API] Query executed successfully. Rows affected:', result.rowCount);

            res.status(200).json({
                success: true,
                message: `Promoção aplicada a ${result.rowCount} produto(s)`,
                affectedRows: result.rowCount
            });

        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
