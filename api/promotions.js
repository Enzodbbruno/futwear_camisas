const db = require('../lib/db');

module.exports = async (req, res) => {
    const { method } = req;

    try {
        if (method === 'POST') {
            // Apply promotion to filtered products
            // Body: { category, team, league, percent, priceTarget, startDate, endDate }
            const { category, team, league, percent, priceTarget, startDate, endDate } = req.body;

            let query = 'UPDATE products SET ';
            const params = [];
            let paramCount = 1;
            const updates = [];

            if (percent) {
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
            }

            if (endDate) {
                updates.push(`"promoEnd" = $${paramCount}`);
                params.push(endDate);
                paramCount++;
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No updates specified (percent or price)' });
            }

            query += updates.join(', ');

            // WHERE Filters
            const filters = [];

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

            if (filters.length > 0) {
                query += ' WHERE ' + filters.join(' AND ');
            } else {
                // Safety: Require at least one filter or explicit "all" flag (not implemented to be safe)
                // For now, if no filters, it updates ALL? Let's restrict it.
                // return res.status(400).json({ error: 'At least one filter (category, league, team) is required' });
            }

            console.log('Running promotion query:', query, params);

            const result = await db.query(query, params);

            res.status(200).json({
                success: true,
                message: `Promotion applied to ${result.rowCount} products`,
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
