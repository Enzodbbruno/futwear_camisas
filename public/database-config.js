// Configuração do banco de dados externo (JSONBin)
// JSONBin é gratuito, confiável e não requer autenticação para leitura

export const DATABASE_CONFIG = {
    // JSONBin - Banco de dados JSON gratuito
    jsonbin: {
        baseUrl: 'https://api.jsonbin.io/v3/b',
        binId: '65f8a8c5dc74654018b2c8a1', // ID do bin que criaremos
        apiKey: '$2a$10$7K8vQ9mN2pL1rT4uY6wX3e', // Chave de API (pública para leitura)
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': '$2a$10$7K8vQ9mN2pL1rT4uY6wX3e'
        }
    },
    
    // Fallback para outros serviços
    alternatives: {
        // JSONPlaceholder (para testes)
        jsonplaceholder: {
            baseUrl: 'https://jsonplaceholder.typicode.com'
        },
        
        // My JSON Server (GitHub-based)
        myjson: {
            baseUrl: 'https://my-json-server.typicode.com'
        }
    }
};

// Dados das camisas que serão enviados para o JSONBin
export const CAMISAS_DATA = [
    {
        id: 'flamengo-2024',
        name: 'Camisa Flamengo 2024',
        price: 145,
        category: 'times-brasileiros',
        description: 'Camisa oficial do Flamengo temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 50,
        team: 'Flamengo',
        league: 'Brasileirão',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'palmeiras-2024',
        name: 'Camisa Palmeiras 2024',
        price: 142,
        category: 'times-brasileiros',
        description: 'Camisa oficial do Palmeiras temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 45,
        team: 'Palmeiras',
        league: 'Brasileirão',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'corinthians-2024',
        name: 'Camisa Corinthians 2024',
        price: 140,
        category: 'times-brasileiros',
        description: 'Camisa oficial do Corinthians temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 55,
        team: 'Corinthians',
        league: 'Brasileirão',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'sao-paulo-2024',
        name: 'Camisa São Paulo 2024',
        price: 138,
        category: 'times-brasileiros',
        description: 'Camisa oficial do São Paulo temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 48,
        team: 'São Paulo',
        league: 'Brasileirão',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'brasil-2024',
        name: 'Camisa Brasil 2024',
        price: 155,
        category: 'selecoes',
        description: 'Camisa oficial da Seleção Brasileira 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 100,
        team: 'Brasil',
        league: 'Copa do Mundo',
        type: 'Seleção',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'argentina-2024',
        name: 'Camisa Argentina 2024',
        price: 150,
        category: 'selecoes',
        description: 'Camisa oficial da Seleção Argentina 2024',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 80,
        team: 'Argentina',
        league: 'Copa do Mundo',
        type: 'Seleção',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'real-madrid-2024',
        name: 'Camisa Real Madrid 2024',
        price: 162,
        category: 'times-europeus',
        description: 'Camisa oficial do Real Madrid temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 60,
        team: 'Real Madrid',
        league: 'La Liga',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'barcelona-2024',
        name: 'Camisa Barcelona 2024',
        price: 158,
        category: 'times-europeus',
        description: 'Camisa oficial do Barcelona temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 55,
        team: 'Barcelona',
        league: 'La Liga',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'manchester-united-2024',
        name: 'Camisa Manchester United 2024',
        price: 160,
        category: 'times-europeus',
        description: 'Camisa oficial do Manchester United temporada 2024',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 65,
        team: 'Manchester United',
        league: 'Premier League',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'liverpool-2024',
        name: 'Camisa Liverpool 2024',
        price: 155,
        category: 'times-europeus',
        description: 'Camisa oficial do Liverpool temporada 2024',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 58,
        team: 'Liverpool',
        league: 'Premier League',
        type: 'Time',
        available: true,
        discount: 0,
        createdAt: new Date().toISOString()
    }
];

console.log('🗄️ Configuração do banco de dados externo carregada');
