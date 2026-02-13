const db = require('../lib/db');

module.exports = async (req, res) => {
    const { method } = req;
    const { id, product_id } = req.query;

    try {
        if (method === 'GET') {
            if (product_id) {
                // Get approved reviews for specific product (public)
                const result = await db.query(
                    "SELECT * FROM reviews WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC",
                    [product_id]
                );
                res.status(200).json(result.rows);
            } else {
                // Get all reviews (admin) - possibly filter by status via query param
                const result = await db.query("SELECT * FROM reviews ORDER BY created_at DESC");
                res.status(200).json(result.rows);
            }
        } else if (method === 'POST') {
            // Create new review
            const { product_id, user_name, rating, comment } = req.body;

            const result = await db.query(
                `INSERT INTO reviews (product_id, user_name, rating, comment, status) 
                 VALUES ($1, $2, $3, $4, 'pending') 
                 RETURNING *`,
                [product_id, user_name, rating, comment]
            );

            res.status(201).json(result.rows[0]);
        } else if (method === 'PUT') {
            // Approve review (admin)
            const { status } = req.body; // e.g., 'approved', 'rejected'
            if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

            const result = await db.query(
                'UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );

            res.status(200).json(result.rows[0]);
        } else if (method === 'DELETE') {
            // Delete review (admin)
            if (!id) return res.status(400).json({ error: 'Missing id' });

            await db.query('DELETE FROM reviews WHERE id = $1', [id]);
            res.status(200).json({ success: true });
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
