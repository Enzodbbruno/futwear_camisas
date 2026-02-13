const db = require('./db');

async function createSchema() {
    try {
        console.log('🚧 Iniciando criação das tabelas...');

        // Create Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabela "users" verificada.');

        // Create Products Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price NUMERIC NOT NULL,
                description TEXT,
                image TEXT,
                category TEXT,
                team TEXT,
                league TEXT,
                stock INTEGER DEFAULT 0,
                type TEXT,
                discount NUMERIC DEFAULT 0,
                promoStart TIMESTAMP,
                promoEnd TIMESTAMP,
                createdAt TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabela "products" criada/verificada.');

        console.log('🏁 Schema atualizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar schema:', error);
    } finally {
        process.exit();
    }
}

createSchema();
