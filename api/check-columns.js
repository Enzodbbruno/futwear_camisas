
const db = require('./db');

async function checkColumns() {
    try {
        console.log('🔍 Verificando colunas da tabela "products"...');
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products';
        `);

        console.table(res.rows);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        process.exit();
    }
}

checkColumns();
