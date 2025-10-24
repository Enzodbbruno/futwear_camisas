// Sistema de banco de dados externo usando JSONBin
// Este sistema substitui o Firestore para armazenamento de camisas

import { DATABASE_CONFIG, CAMISAS_DATA } from './database-config.js';

// Cache local para melhorar performance
let __camisasCache = null;
let __camisasCacheTs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Resolve configuração dinâmica do bin (permite override por localStorage)
function getResolvedJsonBinConfig() {
    const cfg = { ...DATABASE_CONFIG.jsonbin };
    try {
        const override = localStorage.getItem('jsonbin_bin_override');
        if (override) {
            const parsed = JSON.parse(override);
            if (parsed && parsed.binId) cfg.binId = parsed.binId;
        }
        const mk = localStorage.getItem('jsonbin_master_key');
        if (mk && typeof mk === 'string' && mk.trim().length > 0) {
            cfg.apiKey = mk.trim();
        }
    } catch {}
    return cfg;
}

function setJsonBinOverride(binId) {
    try {
        localStorage.setItem('jsonbin_bin_override', JSON.stringify({ binId }));
    } catch {}
}

// Função principal para buscar camisas do banco externo
export async function buscarCamisasExterno(force = false) {
    console.log('🌐 Buscando camisas do banco de dados externo...');
    
    // Verifica cache primeiro
    if (!force && __camisasCache && (Date.now() - __camisasCacheTs) < CACHE_TTL_MS) {
        console.log('📦 Usando cache local:', __camisasCache.length, 'produtos');
        return __camisasCache;
    }
    
    try {
        // 0) Primeira tentativa: JSON local estático empacotado na aplicação
        const localJson = await buscarDoJsonLocal();
        if (localJson && localJson.length > 0) {
            console.log('✅ Camisas carregadas do JSON local:', localJson.length, 'produtos');
            __camisasCache = localJson;
            __camisasCacheTs = Date.now();
            localStorage.setItem('camisas_backup', JSON.stringify(localJson));
            return localJson;
        }
    } catch (e) {
        console.warn('⚠️ Erro ao carregar JSON local:', e.message);
    }

    try {
        // Tenta JSONBin primeiro
        const data = await buscarDoJsonBin();
        if (data && data.length > 0) {
            console.log('✅ Camisas carregadas do JSONBin:', data.length, 'produtos');
            
            // Atualiza cache
            __camisasCache = data;
            __camisasCacheTs = Date.now();
            
            // Salva no localStorage como backup
            localStorage.setItem('camisas_backup', JSON.stringify(data));
            
            return data;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao buscar do JSONBin:', error.message);
    }
    
    try {
        // Fallback: tenta localStorage
        const localData = localStorage.getItem('camisas_backup');
        if (localData) {
            const data = JSON.parse(localData);
            if (Array.isArray(data) && data.length > 0) {
                console.log('📦 Usando backup do localStorage:', data.length, 'produtos');
                __camisasCache = data;
                __camisasCacheTs = Date.now();
                return data;
            }
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar backup:', error.message);
    }
    
    // Fallback final: dados hardcoded
    console.log('🔄 Usando dados hardcoded como fallback final');
    __camisasCache = CAMISAS_DATA;
    __camisasCacheTs = Date.now();
    return CAMISAS_DATA;
}

// Busca dados do JSONBin
async function buscarDoJsonBin() {
    const config = getResolvedJsonBinConfig();
    const url = `${config.baseUrl}/${config.binId}/latest`;
    
    console.log('🔍 Fazendo requisição para JSONBin:', url);
    
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': config.apiKey
        }
    });
    
    // Se 401, tenta novamente sem Master Key (caso o bin seja público)
    if (response.status === 401) {
        console.warn('🔐 JSONBin retornou 401. Tentando sem Master Key (bin público)...');
        response = await fetch(url, { method: 'GET' });
    }
    
    if (!response.ok) {
        if (response.status === 401) {
            console.error('❌ Acesso negado ao JSONBin (401). Configure a Master Key com localStorage.setItem("jsonbin_master_key", "SUA_MASTER_KEY")');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📊 Resposta do JSONBin:', result);
    
    // JSONBin costuma retornar os dados em result.record
    const record = result?.record ?? result;
    
    // 1) Se for um array direto
    if (Array.isArray(record)) {
        return record;
    }
    // 2) Se for um objeto com alguma propriedade conhecida contendo o array
    if (Array.isArray(record?.items)) {
        return record.items;
    }
    if (Array.isArray(record?.data)) {
        return record.data;
    }
    if (Array.isArray(record?.camisas)) {
        return record.camisas;
    }
    
    // 3) Se for um objeto cujos valores são os itens
    if (record && typeof record === 'object') {
        const values = Object.values(record);
        if (values.length > 0 && values.every(v => typeof v === 'object')) {
            return values;
        }
    }
    
    throw new Error('Formato de dados inválido do JSONBin');
}

// Busca dados do JSON local empacotado
async function buscarDoJsonLocal() {
    const url = './data/camisas.json';
    console.log('📄 Tentando carregar JSON local:', url);
    const response = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 404) {
            console.log('ℹ️ JSON local não encontrado, pulando.');
            return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.camisas)) return data.camisas;
    if (data && typeof data === 'object') return Object.values(data);
    return [];
}

// Função para adicionar camisa ao banco externo
export async function adicionarCamisaExterno(camisa) {
    try {
        console.log('➕ Adicionando camisa ao banco externo:', camisa.name);
        
        // Busca dados atuais
        const camisas = await buscarCamisasExterno(true); // force = true para buscar dados frescos
        
        // Adiciona nova camisa
        const novaCamisa = {
            id: camisa.id || 'camisa_' + Date.now(),
            ...camisa,
            available: true,
            discount: 0,
            createdAt: new Date().toISOString()
        };
        
        camisas.push(novaCamisa);
        
        // Atualiza no JSONBin
        await atualizarJsonBin(camisas);
        
        // Limpa cache
        __camisasCache = null;
        
        console.log('✅ Camisa adicionada com sucesso:', novaCamisa.name);
        return { success: true, id: novaCamisa.id };
        
    } catch (error) {
        console.error('❌ Erro ao adicionar camisa:', error);
        return { success: false, error: error.message };
    }
}

// Função para atualizar camisa no banco externo
export async function atualizarCamisaExterno(id, dados) {
    try {
        console.log('✏️ Atualizando camisa no banco externo:', id);
        
        // Busca dados atuais
        const camisas = await buscarCamisasExterno(true);
        
        // Encontra e atualiza a camisa
        const index = camisas.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Camisa não encontrada');
        }
        
        camisas[index] = { 
            ...camisas[index], 
            ...dados, 
            updatedAt: new Date().toISOString() 
        };
        
        // Atualiza no JSONBin
        await atualizarJsonBin(camisas);
        
        // Limpa cache
        __camisasCache = null;
        
        console.log('✅ Camisa atualizada com sucesso:', id);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro ao atualizar camisa:', error);
        return { success: false, error: error.message };
    }
}

// Função para inserir/atualizar em massa (merge por id)
export async function upsertCamisasExterno(novasCamisas = [], replace = false) {
    try {
        console.log('📥 Upsert em massa de camisas:', novasCamisas.length);
        const existentes = replace ? [] : await buscarCamisasExterno(true);
        const mapa = new Map(existentes.map(c => [c.id, c]));

        novasCamisas.forEach(item => {
            const id = item.id || 'camisa_' + Date.now() + Math.random().toString(36).slice(2, 8);
            const registro = {
                id,
                available: true,
                discount: 0,
                updatedAt: new Date().toISOString(),
                ...item
            };
            if (!mapa.has(id)) {
                registro.createdAt = new Date().toISOString();
            }
            mapa.set(id, registro);
        });

        const resultado = Array.from(mapa.values());
        await atualizarJsonBin(resultado);
        __camisasCache = null;
        console.log('✅ Upsert concluído. Total de camisas:', resultado.length);
        return { success: true, total: resultado.length };
    } catch (error) {
        console.error('❌ Erro no upsert em massa:', error);
        // Se falhou por 404, tenta criar o bin e repetir
        if (String(error.message || '').includes('404')) {
            const resultado = await criarBinSeNecessarioENovamente(novasCamisas, replace);
            return resultado;
        }
        return { success: false, error: error.message };
    }
}

async function criarBinSeNecessarioENovamente(camisas, replace) {
    try {
        const novo = await criarJsonBin(camisas);
        if (novo && novo.id) {
            setJsonBinOverride(novo.id);
            console.log('🆕 Bin criado e salvo override:', novo.id);
            // Se replace=false, garantir merge com dados existentes (já enviados)
            const dados = replace ? camisas : camisas;
            __camisasCache = null;
            return { success: true, total: dados.length, binId: novo.id };
        }
        return { success: false, error: 'Falha ao criar bin' };
    } catch (e) {
        console.error('❌ Erro ao criar bin:', e);
        return { success: false, error: e.message };
    }
}

// Cria um novo bin no JSONBin com dados iniciais
async function criarJsonBin(initialData = []) {
    const cfg = getResolvedJsonBinConfig();
    const url = `${cfg.baseUrl}`;
    console.log('🆕 Criando novo bin no JSONBin');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': cfg.apiKey
        },
        body: JSON.stringify(initialData)
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    // Estrutura esperada: result.metadata.id
    const id = result?.metadata?.id || result?.id;
    return { id, result };
}

// Função para buscar camisa por ID
export async function buscarCamisaPorIdExterno(id) {
    try {
        const camisas = await buscarCamisasExterno();
        const camisa = camisas.find(c => c.id === id);
        
        if (camisa) {
            return { success: true, data: camisa };
        } else {
            return { success: false, error: 'Camisa não encontrada' };
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar camisa por ID:', error);
        return { success: false, error: error.message };
    }
}

// Função para filtrar camisas
export async function filtrarCamisasExterno(filtros = {}) {
    try {
        const camisas = await buscarCamisasExterno();
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
        console.error('❌ Erro ao filtrar camisas:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Função para atualizar dados no JSONBin
async function atualizarJsonBin(camisas) {
    const config = getResolvedJsonBinConfig();
    const url = `${config.baseUrl}/${config.binId}`;
    
    console.log('💾 Atualizando JSONBin:', url);
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': config.apiKey
        },
        body: JSON.stringify(camisas)
    });
    
    if (!response.ok) {
        // Se bin não existir, cria e tenta novamente
        if (response.status === 404) {
            console.warn('⚠️ Bin não encontrado. Criando novo bin...');
            const novo = await criarJsonBin(camisas);
            if (novo && novo.id) {
                setJsonBinOverride(novo.id);
                return novo;
            }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ JSONBin atualizado:', result);
    
    return result;
}

// Função para inicializar o banco com dados padrão
export async function inicializarBancoExterno() {
    try {
        console.log('🚀 Inicializando banco de dados externo...');
        
        // Verifica se já tem dados
        const camisas = await buscarCamisasExterno();
        if (camisas && camisas.length > 0) {
            console.log('📦 Banco já inicializado com', camisas.length, 'camisas');
            return { success: true, message: 'Banco já inicializado' };
        }
        
        // Inicializa com dados padrão
        await atualizarJsonBin(CAMISAS_DATA);
        
        console.log('✅ Banco inicializado com', CAMISAS_DATA.length, 'camisas');
        return { success: true, message: 'Banco inicializado com sucesso' };
        
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        return { success: false, error: error.message };
    }
}

// Função para limpar cache
export function limparCacheExterno() {
    __camisasCache = null;
    __camisasCacheTs = 0;
    console.log('🗑️ Cache externo limpo');
}

console.log('🌐 Sistema de banco de dados externo carregado');
