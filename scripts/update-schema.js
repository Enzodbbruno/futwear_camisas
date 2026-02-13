const db = require('./db');

async function updateSchema() {
    try {
        console.log('🔄 Atualizando esquema do banco de dados...');

        // Adicionar colunas se não existirem
        await db.query(`
            ALTER TABLE products ADD COLUMN IF NOT EXISTS league TEXT;
            ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT;
            ALTER TABLE products ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
            ALTER TABLE products ADD COLUMN IF NOT EXISTS "promoStart" TIMESTAMP;
            ALTER TABLE products ADD COLUMN IF NOT EXISTS "promoEnd" TIMESTAMP;
            ALTER TABLE products ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT NOW();
        `);

        console.log('✅ Esquema atualizado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao atualizar esquema:', error);
        process.exit(1);
    }
}

updateSchema();
