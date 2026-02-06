const db = require('./db');

const CAMISAS_DATA = [
    {
        name: 'Camisa Flamengo 2024',
        price: 145,
        category: 'times-brasileiros',
        description: 'Camisa oficial do Flamengo temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        team: 'Flamengo',
        stock: 50
    },
    {
        name: 'Camisa Palmeiras 2024',
        price: 142,
        category: 'times-brasileiros',
        description: 'Camisa oficial do Palmeiras temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        team: 'Palmeiras',
        stock: 45
    },
    {
        name: 'Camisa Corinthians 2024',
        price: 140,
        category: 'times-brasileiros',
        description: 'Camisa oficial do Corinthians temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        team: 'Corinthians',
        stock: 55
    },
    {
        name: 'Camisa São Paulo 2024',
        price: 138,
        category: 'times-brasileiros',
        description: 'Camisa oficial do São Paulo temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        team: 'São Paulo',
        stock: 48
    },
    {
        name: 'Camisa Brasil 2024',
        price: 155,
        category: 'selecoes',
        description: 'Camisa oficial da Seleção Brasileira 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        team: 'Brasil',
        stock: 100
    },
    {
        name: 'Camisa Argentina 2024',
        price: 150,
        category: 'selecoes',
        description: 'Camisa oficial da Seleção Argentina 2024',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
        team: 'Argentina',
        stock: 80
    },
    {
        name: 'Camisa Real Madrid 2024',
        price: 162,
        category: 'times-europeus',
        description: 'Camisa oficial do Real Madrid temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        team: 'Real Madrid',
        stock: 60
    },
    {
        name: 'Camisa Barcelona 2024',
        price: 158,
        category: 'times-europeus',
        description: 'Camisa oficial do Barcelona temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        team: 'Barcelona',
        stock: 55
    },
    {
        name: 'Camisa Manchester United 2024',
        price: 160,
        category: 'times-europeus',
        description: 'Camisa oficial do Manchester United temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        team: 'Manchester United',
        stock: 65
    },
    {
        name: 'Camisa Liverpool 2024',
        price: 155,
        category: 'times-europeus',
        description: 'Camisa oficial do Liverpool temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        team: 'Liverpool',
        stock: 58
    }
];

async function seed() {
    console.log('🌱 Iniciando seed do banco de dados...');

    try {
        // 1. Create Tables
        console.log('🔨 Criando tabelas...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price NUMERIC NOT NULL,
                description TEXT,
                image TEXT,
                category TEXT,
                team TEXT,
                stock INTEGER DEFAULT 0
            );
        `);

        // 2. Insert Products
        console.log('👕 Inserindo camisas...');
        for (const camisa of CAMISAS_DATA) {
            await db.query(
                `INSERT INTO products (name, price, description, image, category, team, stock) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [camisa.name, camisa.price, camisa.description, camisa.image, camisa.category, camisa.team, camisa.stock]
            );
        }

        console.log('✅ Banco de dados populado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}

seed();
