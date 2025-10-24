// Sistema híbrido Firebase + localStorage
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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
const auth = getAuth(app);

// Export firebaseConfig for use in other files
export { firebaseConfig, auth };

// Cache simples em memória e sessionStorage para melhorar performance
let __camisasCache = null;
let __camisasCacheTs = 0;
const CAMISAS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export async function buscarCamisas(force = false) {
  console.log('🌐 Sistema EXTERNO: Carregando camisas do banco de dados...');
  // Permite forçar atualização via ?force=1 na URL
  try {
    const urlForce = typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('force') === '1';
    if (urlForce) force = true;
  } catch {}
  
  try {
    // Importa o sistema de banco externo dinamicamente
    const { buscarCamisasExterno } = await import('./external-database.js');
    
    // Busca do banco externo (JSONBin)
    const data = await buscarCamisasExterno(force);
    
    if (data && data.length > 0) {
      console.log('✅ Camisas carregadas do banco externo:', data.length, 'produtos');
      
      // Atualiza cache em memória
      __camisasCache = data;
      __camisasCacheTs = Date.now();
      
      return data;
    }
    
    throw new Error('Nenhum dado retornado do banco externo');
    
  } catch (error) {
    console.error('❌ Erro ao carregar do banco externo:', error);
    
    // Fallback: tenta localStorage
    try {
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
    } catch (localError) {
      console.warn('⚠️ Erro ao carregar backup:', localError.message);
    }
    
    // Fallback final: dados hardcoded
    const defaultData = getDefaultProducts();
    console.log('🔄 Retornando dados hardcoded como fallback final');
    __camisasCache = defaultData;
    __camisasCacheTs = Date.now();
    return defaultData;
  }
}

// ==================== AVALIAÇÕES (REVIEWS) ====================
export async function addReview(productId, review) {
  const firestoreFunction = async (productId, review) => {
    const ref = await addDoc(collection(db, 'reviews'), {
      productId,
      rating: review.rating || 0,
      text: review.text || '',
      userId: review.userId || (auth.currentUser ? auth.currentUser.uid : null),
      userEmail: review.userEmail || (auth.currentUser ? auth.currentUser.email : null),
      approved: !!review.approved, // pode aprovar automaticamente ou não
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: ref.id };
  };

  const localStorageFunction = async (productId, review) => {
    const key = `reviews_${productId}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const item = {
      id: `rv_${Date.now()}`,
      productId,
      rating: review.rating || 0,
      text: review.text || '',
      userId: review.userId || null,
      userEmail: review.userEmail || null,
      approved: !!review.approved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    arr.push(item);
    localStorage.setItem(key, JSON.stringify(arr));
    return { success: true, id: item.id };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, productId, review);
}

export async function listReviews(productId, onlyApproved = true) {
  const firestoreFunction = async (productId, onlyApproved) => {
    let q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const qs = await getDocs(q);
    let items = qs.docs.map(d => ({ id: d.id, ...d.data() }));
    if (onlyApproved) items = items.filter(r => r.approved);
    items.sort((a,b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    return { success: true, data: items };
  };

  const localStorageFunction = async (productId, onlyApproved) => {
    const key = `reviews_${productId}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const items = onlyApproved ? arr.filter(r => r.approved) : arr;
    return { success: true, data: items };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, productId, onlyApproved);
}

export async function listAllReviews() {
  const firestoreFunction = async () => {
    const qs = await getDocs(collection(db, 'reviews'));
    const items = qs.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return { success: true, data: items };
  };

  const localStorageFunction = async () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reviews_')) {
        try {
          const arr = JSON.parse(localStorage.getItem(key) || '[]');
          arr.forEach(r => items.push(r));
        } catch {}
      }
    }
    items.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { success: true, data: items };
  };

  return tryFirestore(firestoreFunction, localStorageFunction);
}

export async function approveReview(reviewId, approved) {
  const firestoreFunction = async (reviewId, approved) => {
    const ref = doc(db, 'reviews', reviewId);
    await updateDoc(ref, { approved, updatedAt: serverTimestamp() });
    return { success: true };
  };

  const localStorageFunction = async (reviewId, approved) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reviews_')) {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = arr.findIndex(r => r.id === reviewId);
        if (idx !== -1) {
          arr[idx].approved = approved;
          arr[idx].updatedAt = new Date().toISOString();
          localStorage.setItem(key, JSON.stringify(arr));
          return { success: true };
        }
      }
    }
    return { success: false, error: 'Review não encontrada' };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, reviewId, approved);
}

export async function deleteReview(reviewId) {
  const firestoreFunction = async (reviewId) => {
    await deleteDoc(doc(db, 'reviews', reviewId));
    return { success: true };
  };

  const localStorageFunction = async (reviewId) => {
    let removed = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reviews_')) {
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = arr.filter(r => r.id !== reviewId);
        if (filtered.length !== arr.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          removed = true;
        }
      }
    }
    return removed ? { success: true } : { success: false, error: 'Review não encontrada' };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, reviewId);
}

function getDefaultProducts() {
  return [
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
}

// Invalida o cache de camisas (memória e sessão)
export function invalidateCamisasCache() {
  __camisasCache = null;
  __camisasCacheTs = 0;
  try { sessionStorage.removeItem('camisasCache'); } catch {}
}

// Funções utilitárias para carrinho
export function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}
export function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
export function addToCart(product) {
  console.log('🛒 Adicionando ao carrinho:', product);
  
  // Validar se o produto tem as propriedades necessárias
  if (!product || !product.id) {
    console.error('❌ Produto inválido:', product);
    alert('Erro: Produto inválido');
    return;
  }
  
  try {
    let cart = getCart();
    console.log('📦 Carrinho atual antes da adição:', cart);
    
    // Diferenciar por modelo + tamanho + personalização para não agrupar tamanhos diferentes
    const keySize = (product.size || '').toString();
    const keyPers = JSON.stringify(product.personalization || {});
    const found = cart.find(item => {
      const itemSize = (item.size || '').toString();
      const itemPers = JSON.stringify(item.personalization || {});
      return item.id === product.id && itemSize === keySize && itemPers === keyPers;
    });
    
    if (found) {
      found.quantity = (found.quantity || 1) + 1;
      console.log('✅ Quantidade atualizada para:', found.quantity);
    } else {
      const newItem = { 
        ...product, 
        quantity: 1,
        addedAt: new Date().toISOString()
      };
      cart.push(newItem);
      console.log('✅ Novo item adicionado:', newItem);
    }
    
    console.log('📦 Carrinho após adição:', cart);
    setCart(cart);
    
    // Verificar se foi salvo corretamente
    const savedCart = getCart();
    console.log('💾 Carrinho salvo no localStorage:', savedCart);
    
    // Atualiza o header imediatamente (mesma aba)
    try {
      const cartCountElement = document.getElementById('cart-count');
      const totalNow = savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      if (cartCountElement) {
        cartCountElement.textContent = totalNow;
        cartCountElement.style.display = totalNow > 0 ? 'flex' : 'none';
      }
    } catch {}
    atualizarIconeCarrinho();
    
    // Mostrar toast de sucesso
    showToast('Produto adicionado ao carrinho!', 'success');
    
    // Disparar evento customizado para sincronizar entre abas e componentes
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: savedCart } }));
    
  } catch (error) {
    console.error('❌ Erro ao adicionar ao carrinho:', error);
    alert('Erro ao adicionar produto ao carrinho');
  }
}

// Função para mostrar toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm shadow-lg`;
  toast.style.transition = 'all .3s';
  toast.style.transform = 'translateX(120%)';
  toast.textContent = message;
  
  if (type === 'success') toast.classList.add('bg-green-600');
  else if (type === 'error') toast.classList.add('bg-red-600');
  else toast.classList.add('bg-gray-800');
  
  document.body.appendChild(toast);
  requestAnimationFrame(() => { 
    toast.style.transform = 'translateX(0)'; 
  });
  
  setTimeout(() => { 
    toast.style.transform = 'translateX(120%)'; 
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300); 
  }, 2500);
}
export function atualizarIconeCarrinho() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
}

// Funções de frete
export function calculateShipping(cart) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems >= 3) {
    return { value: 0, text: 'GRÁTIS', class: 'text-green-600' };
  } else if (totalItems === 2) {
    return { value: 20, text: 'R$ 20,00', class: 'text-blue-600' };
  } else {
    return { value: 30, text: 'R$ 30,00', class: 'text-orange-600' };
  }
}

export function getShippingInfo() {
  return {
    one: { items: 1, price: 30, text: 'R$ 30,00', class: 'text-orange-600' },
    two: { items: 2, price: 20, text: 'R$ 20,00', class: 'text-blue-600' },
    three: { items: 3, price: 0, text: 'GRÁTIS', class: 'text-green-600' }
  };
}

// Funções de autenticação
export function getCurrentUser() {
  return auth.currentUser;
}

export function isUserLoggedIn() {
  return auth.currentUser !== null;
}

export function getUserEmail() {
  return auth.currentUser ? auth.currentUser.email : null;
}

export function isAdmin() {
  const user = getCurrentUser();
  const admins = ['admin@futwear.com', 'dreaeverning@gmail.com'];
  return user && admins.includes(user.email);
}

export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function requireAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Usuário não autenticado'));
      }
    });
  });
}

// ==================== BANCO DE DADOS HÍBRIDO ====================

// Função auxiliar para tentar Firestore primeiro, fallback para localStorage
async function tryFirestore(firestoreFunction, localStorageFunction, ...args) {
  try {
    return await firestoreFunction(...args);
  } catch (error) {
    console.warn('Firestore falhou, usando localStorage:', error.message);
    return localStorageFunction(...args);
  }
}

// ==================== USUÁRIOS ====================
export async function createUserProfile(userId, userData) {
  const firestoreFunction = async (userId, userData) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    await setDoc(userRef, userDoc);
    return { success: true, id: userId };
  };

  const localStorageFunction = async (userId, userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[userId] = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, id: userId };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, userId, userData);
}

export async function getUserProfile(userId) {
  const firestoreFunction = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  };

  const localStorageFunction = async (userId) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[userId]) {
      return { success: true, data: users[userId] };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  };

  return tryFirestore(firestoreFunction, localStorageFunction, userId);
}

export async function updateUserProfile(userId, updateData) {
  const firestoreFunction = async (userId, updateData) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  };

  const localStorageFunction = async (userId, updateData) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[userId]) {
      users[userId] = { ...users[userId], ...updateData, updatedAt: new Date().toISOString() };
      localStorage.setItem('users', JSON.stringify(users));
      return { success: true };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  };

  return tryFirestore(firestoreFunction, localStorageFunction, userId, updateData);
}

// ==================== PRODUTOS ====================
export async function getProducts(category = null, limitCount = null) {
  const firestoreFunction = async (category, limitCount) => {
    let q = collection(db, 'products');
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: products };
  };

  const localStorageFunction = async (category, limitCount) => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter(p => p.category === category);
    }
    
    if (limitCount) {
      filteredProducts = filteredProducts.slice(0, limitCount);
    }
    
    return { success: true, data: filteredProducts };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, category, limitCount);
}

export async function getProductById(productId) {
  const firestoreFunction = async (productId) => {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return { success: true, data: { id: productSnap.id, ...productSnap.data() } };
    } else {
      return { success: false, error: 'Produto não encontrado' };
    }
  };

  const localStorageFunction = async (productId) => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
      return { success: true, data: product };
    } else {
      return { success: false, error: 'Produto não encontrado' };
    }
  };

  return tryFirestore(firestoreFunction, localStorageFunction, productId);
}

export async function addProduct(productData) {
  const firestoreFunction = async (productData) => {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return { success: true, id: docRef.id };
  };

  const localStorageFunction = async (productData) => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const newProduct = {
      id: 'product_' + Date.now(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    return { success: true, id: newProduct.id };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, productData);
}

export async function updateProduct(productId, updateData) {
  const firestoreFunction = async (productId, updateData) => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  };

  const localStorageFunction = async (productId, updateData) => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData, updatedAt: new Date().toISOString() };
      localStorage.setItem('products', JSON.stringify(products));
      return { success: true };
    } else {
      return { success: false, error: 'Produto não encontrado' };
    }
  };

  return tryFirestore(firestoreFunction, localStorageFunction, productId, updateData);
}

// ==================== PEDIDOS ====================
export async function createOrder(orderData) {
  const firestoreFunction = async (orderData) => {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      paymentStatus: 'pending'
    });
    return { success: true, id: docRef.id };
  };

  const localStorageFunction = async (orderData) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: 'order_' + Date.now(),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      paymentStatus: 'pending'
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true, id: newOrder.id };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, orderData);
}

export async function getOrdersByUser(userId) {
  const firestoreFunction = async (userId) => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: orders };
  };

  const localStorageFunction = async (userId) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(o => o.userId === userId);
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data: userOrders };
  };

  return tryFirestore(firestoreFunction, localStorageFunction, userId);
}

export async function getAllOrders() {
  const firestoreFunction = async () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: orders };
  };

  const localStorageFunction = async () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data: orders };
  };

  return tryFirestore(firestoreFunction, localStorageFunction);
}

export async function updateOrderStatus(orderId, status, paymentStatus = null) {
  const firestoreFunction = async (orderId, status, paymentStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    await updateDoc(orderRef, updateData);
    return { success: true };
  };

  const localStorageFunction = async (orderId, status, paymentStatus) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      if (paymentStatus) {
        orders[index].paymentStatus = paymentStatus;
      }
      localStorage.setItem('orders', JSON.stringify(orders));
      return { success: true };
    } else {
      return { success: false, error: 'Pedido não encontrado' };
    }
  };

  return tryFirestore(firestoreFunction, localStorageFunction, orderId, status, paymentStatus);
}

// ==================== ESTATÍSTICAS ====================
export async function getOrderStats() {
  const firestoreFunction = async () => {
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    const orders = querySnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
      totalRevenue: orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.total || 0), 0),
      paidOrders: orders.filter(order => order.paymentStatus === 'paid').length,
      unpaidOrders: orders.filter(order => order.paymentStatus === 'pending').length
    };
    
    return { success: true, data: stats };
  };

  const localStorageFunction = async () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
      totalRevenue: orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.total || 0), 0),
      paidOrders: orders.filter(order => order.paymentStatus === 'paid').length,
      unpaidOrders: orders.filter(order => order.paymentStatus === 'pending').length
    };
    
    return { success: true, data: stats };
  };

  return tryFirestore(firestoreFunction, localStorageFunction);
}

// ==================== LISTENERS EM TEMPO REAL ====================
export function subscribeToOrders(callback) {
  const firestoreFunction = () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    });
  };

  const localStorageFunction = () => {
    // Simular listener com polling
    const interval = setInterval(() => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(orders);
    }, 5000);
    
    return () => clearInterval(interval);
  };

  try {
    return firestoreFunction();
  } catch (error) {
    console.warn('Firestore listener falhou, usando localStorage:', error.message);
    return localStorageFunction();
  }
}

export function subscribeToUserOrders(userId, callback) {
  const firestoreFunction = () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    });
  };

  const localStorageFunction = () => {
    // Simular listener com polling
    const interval = setInterval(() => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrders = orders.filter(o => o.userId === userId);
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(userOrders);
    }, 5000);
    
    return () => clearInterval(interval);
  };

  try {
    return firestoreFunction();
  } catch (error) {
    console.warn('Firestore listener falhou, usando localStorage:', error.message);
    return localStorageFunction();
  }
}
