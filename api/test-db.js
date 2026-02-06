
const db = require('./db');

async function testConnection() {
    try {
        console.log('🔌 Testando conexão com PostgreSQL...');
        const res = await db.query('SELECT NOW()');
        console.log('✅ Conexão bem sucedida:', res.rows[0]);

        console.log('🔍 Verificando tabela "products"...');
        const tableCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'products'
        `);

        if (tableCheck.rows.length > 0) {
            console.log('✅ Tabela "products" existe.');

            // Check count
            const count = await db.query('SELECT COUNT(*) FROM products');
            console.log('📊 Quantidade de produtos:', count.rows[0].count);
        } else {
            console.error('❌ Tabela "products" NÃO encontrada!');
        }

    } catch (error) {
        console.error('❌ Erro Fatal no Banco de Dados:', error);
    } finally {
        process.exit();
    }
}

testConnection();
