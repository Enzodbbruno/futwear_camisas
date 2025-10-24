// Importa e inicializa o Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc, 
    addDoc, 
    setDoc,
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPvUv2sCOeomoHnE0WIPwGmdJ3NHWP2_4",
  authDomain: "futwear-d3c3c.firebaseapp.com",
  projectId: "futwear-d3c3c",
  storageBucket: "futwear-d3c3c.appspot.com",
  messagingSenderId: "696943900731",
  appId: "1:696943900731:web:2c1460cb26e040444d041e",
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
  // Retorna do cache em memória se válido
  if (!force && __camisasCache && (Date.now() - __camisasCacheTs) < CAMISAS_CACHE_TTL_MS) {
    return __camisasCache;
  }
  // Tenta sessionStorage
  if (!force) {
    try {
      const cached = sessionStorage.getItem('camisasCache');
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Array.isArray(data) && (Date.now() - ts) < CAMISAS_CACHE_TTL_MS) {
          __camisasCache = data;
          __camisasCacheTs = ts;
          return data;
        }
      }
    } catch {}
  }
  // Busca no Firestore
  const camisasCol = collection(db, 'camisas');
  const camisasSnapshot = await getDocs(camisasCol);
  const data = camisasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Atualiza caches
  __camisasCache = data;
  __camisasCacheTs = Date.now();
  try {
    sessionStorage.setItem('camisasCache', JSON.stringify({ ts: __camisasCacheTs, data }));
  } catch {}
  return data;
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
  let cart = getCart();
  const found = cart.find(item => item.id === product.id);
  if (found) {
    found.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  setCart(cart);
  atualizarIconeCarrinho();
}
export function atualizarIconeCarrinho() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
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
  return user && user.email === 'admin@futwear.com';
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

// ==================== BANCO DE DADOS FIRESTORE ====================

// ==================== USUÁRIOS ====================
export async function createUserProfile(userId, userData) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    await setDoc(userRef, userDoc);
    return { success: true, id: userId };
  } catch (error) {
    console.error('Erro ao criar perfil do usuário:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId, updateData) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    return { success: false, error: error.message };
  }
}

// ==================== PRODUTOS ====================
export async function getProducts(category = null, limitCount = null) {
  try {
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
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { success: false, error: error.message };
  }
}

export async function getProductById(productId) {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return { success: true, data: { id: productSnap.id, ...productSnap.data() } };
    } else {
      return { success: false, error: 'Produto não encontrado' };
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return { success: false, error: error.message };
  }
}

export async function addProduct(productData) {
  try {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(productId, updateData) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: error.message };
  }
}

// ==================== PEDIDOS ====================
export async function createOrder(orderData) {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return { success: false, error: error.message };
  }
}

export async function getOrdersByUser(userId) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: orders };
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllOrders() {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: orders };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId, status, paymentStatus = null) {
  try {
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
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return { success: false, error: error.message };
  }
}

// ==================== ESTATÍSTICAS ====================
export async function getOrderStats() {
  try {
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
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, error: error.message };
  }
}

// ==================== LISTENERS EM TEMPO REAL ====================
export function subscribeToOrders(callback) {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
}

export function subscribeToUserOrders(userId, callback) {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
} 