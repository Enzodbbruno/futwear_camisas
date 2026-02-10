const db = require('./db');

module.exports = async (req, res) => {
    const { method } = req;
    const { id } = req.query;

    try {
        if (method === 'GET') {
            // List all orders (for admin)
            const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
            res.status(200).json(result.rows);
        } else if (method === 'POST') {
            // Create new order (checkout)
            const { user_data, products, total, payment_method } = req.body;

            const result = await db.query(
                `INSERT INTO orders (user_data, products, total, payment_method, status) 
                 VALUES ($1, $2, $3, $4, 'pending') 
                 RETURNING *`,
                [JSON.stringify(user_data), JSON.stringify(products), total, payment_method]
            );

            res.status(201).json(result.rows[0]);
        } else if (method === 'PUT') {
            // Update order status (admin)
            const { status } = req.body;
            if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

            const result = await db.query(
                'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
            res.status(200).json(result.rows[0]);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
