// Configuração do banco de dados (opcional)
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (process.env.DATABASE_URL) {
            await mongoose.connect(process.env.DATABASE_URL);
            console.log('📦 Database connected');
        } else {
            console.log('⚠️ No database configured - using localStorage fallback');
        }
    } catch (error) {
        console.error('❌ Database connection error:', error);
    }
};

module.exports = connectDB;
