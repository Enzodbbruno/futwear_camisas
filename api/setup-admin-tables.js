const db = require('./db');

async function setupAdminTables() {
    try {
        console.log('🚧 Setting up Admin Tables (Orders & Reviews)...');

        // Create Orders Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_data JSONB NOT NULL,
                products JSONB NOT NULL,
                total NUMERIC NOT NULL,
                status TEXT DEFAULT 'pending',
                payment_method TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Table "orders" verified.');

        // Create Reviews Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                user_name TEXT,
                rating INTEGER NOT NULL,
                comment TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Table "reviews" verified.');

        console.log('🏁 Admin Tables Setup Complete!');
    } catch (error) {
        console.error('❌ Error setting up tables:', error);
    } finally {
        process.exit();
    }
}

setupAdminTables();
