// Sistema OFFLINE-FIRST para camisas - Funciona 100% sem internet
// Este arquivo garante que as camisas sempre funcionem

// Dados das camisas hardcoded (sempre funcionam)
const CAMISAS_DATA = [
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
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
        discount: 0
    }
];

// Função principal que SEMPRE funciona
export async function buscarCamisasOffline() {
    console.log('🚀 Sistema OFFLINE-FIRST: Carregando camisas...');
    
    try {
        // 1. Tenta carregar do localStorage primeiro
        const localData = localStorage.getItem('camisas_offline');
        if (localData) {
            const data = JSON.parse(localData);
            if (Array.isArray(data) && data.length > 0) {
                console.log('✅ Camisas carregadas do localStorage:', data.length, 'produtos');
                return data;
            }
        }
        
        // 2. Se não tem no localStorage, usa dados hardcoded
        console.log('📦 Usando dados hardcoded:', CAMISAS_DATA.length, 'produtos');
        
        // 3. Salva no localStorage para próxima vez
        localStorage.setItem('camisas_offline', JSON.stringify(CAMISAS_DATA));
        console.log('💾 Dados salvos no localStorage');
        
        return CAMISAS_DATA;
        
    } catch (error) {
        console.error('❌ Erro no sistema offline:', error);
        console.log('🔄 Retornando dados hardcoded como fallback');
        return CAMISAS_DATA;
    }
}

// Função para adicionar camisa (sempre funciona)
export function adicionarCamisaOffline(camisa) {
    try {
        const camisas = JSON.parse(localStorage.getItem('camisas_offline') || '[]');
        const novaCamisa = {
            id: camisa.id || 'camisa_' + Date.now(),
            ...camisa,
            available: true,
            discount: 0
        };
        
        camisas.push(novaCamisa);
        localStorage.setItem('camisas_offline', JSON.stringify(camisas));
        
        console.log('✅ Camisa adicionada offline:', novaCamisa.name);
        return { success: true, id: novaCamisa.id };
        
    } catch (error) {
        console.error('❌ Erro ao adicionar camisa offline:', error);
        return { success: false, error: error.message };
    }
}

// Função para atualizar camisa (sempre funciona)
export function atualizarCamisaOffline(id, dados) {
    try {
        const camisas = JSON.parse(localStorage.getItem('camisas_offline') || '[]');
        const index = camisas.findIndex(c => c.id === id);
        
        if (index !== -1) {
            camisas[index] = { ...camisas[index], ...dados };
            localStorage.setItem('camisas_offline', JSON.stringify(camisas));
            console.log('✅ Camisa atualizada offline:', id);
            return { success: true };
        } else {
            return { success: false, error: 'Camisa não encontrada' };
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar camisa offline:', error);
        return { success: false, error: error.message };
    }
}

// Função para buscar camisa por ID (sempre funciona)
export function buscarCamisaPorIdOffline(id) {
    try {
        const camisas = JSON.parse(localStorage.getItem('camisas_offline') || '[]');
        const camisa = camisas.find(c => c.id === id);
        
        if (camisa) {
            return { success: true, data: camisa };
        } else {
            return { success: false, error: 'Camisa não encontrada' };
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar camisa offline:', error);
        return { success: false, error: error.message };
    }
}

// Função para filtrar camisas (sempre funciona)
export function filtrarCamisasOffline(filtros = {}) {
    try {
        const camisas = JSON.parse(localStorage.getItem('camisas_offline') || '[]');
        let filtradas = [...camisas];
        
        // Filtro por categoria
        if (filtros.category) {
            filtradas = filtradas.filter(c => c.category === filtros.category);
        }
        
        // Filtro por preço
        if (filtros.priceRange) {
            const [min, max] = filtros.priceRange;
            filtradas = filtradas.filter(c => c.price >= min && c.price <= max);
        }
        
        // Filtro por busca
        if (filtros.search) {
            const search = filtros.search.toLowerCase();
            filtradas = filtradas.filter(c => 
                c.name.toLowerCase().includes(search) ||
                c.team?.toLowerCase().includes(search) ||
                c.league?.toLowerCase().includes(search)
            );
        }
        
        // Ordenação
        if (filtros.sort) {
            switch (filtros.sort) {
                case 'price-low':
                    filtradas.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filtradas.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    filtradas.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }
        
        return { success: true, data: filtradas };
        
    } catch (error) {
        console.error('❌ Erro ao filtrar camisas offline:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Função para resetar dados (sempre funciona)
export function resetarCamisasOffline() {
    try {
        localStorage.setItem('camisas_offline', JSON.stringify(CAMISAS_DATA));
        console.log('🔄 Dados resetados para padrão');
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao resetar dados:', error);
        return { success: false, error: error.message };
    }
}

// Função para sincronizar com Firestore (opcional)
export async function sincronizarComFirestore() {
    try {
        console.log('🔄 Tentando sincronizar com Firestore...');
        
        // Importa Firebase dinamicamente
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js");
        const { getFirestore, collection, addDoc, getDocs } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
        
        const firebaseConfig = {
            apiKey: "AIzaSyBPvUv2sCOeomoHnE0WIPwGmdJ3NHWP2_4",
            authDomain: "futwear-3eae2.firebaseapp.com",
            projectId: "futwear-3eae2",
            storageBucket: "futwear-3eae2.appspot.com",
            messagingSenderId: "555630014709",
            appId: "1:555630014709:web:2c1460cb26e040444d041e",
            measurementId: "G-L6S9FH3PSX"
        };
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Verifica se já tem dados no Firestore
        const camisasCol = collection(db, 'camisas');
        const snapshot = await getDocs(camisasCol);
        
        if (snapshot.docs.length === 0) {
            // Se não tem dados, adiciona os dados offline
            const camisas = JSON.parse(localStorage.getItem('camisas_offline') || '[]');
            
            for (const camisa of camisas) {
                await addDoc(camisasCol, camisa);
            }
            
            console.log('✅ Dados sincronizados com Firestore');
        } else {
            console.log('📦 Firestore já tem dados, não sincronizando');
        }
        
        return { success: true };
        
    } catch (error) {
        console.warn('⚠️ Erro ao sincronizar com Firestore:', error.message);
        return { success: false, error: error.message };
    }
}

console.log('🚀 Sistema OFFLINE-FIRST carregado - Camisas sempre funcionarão!');
