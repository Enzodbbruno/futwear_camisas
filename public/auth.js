// Sistema de autenticação global
import { 
    getCurrentUser, 
    isUserLoggedIn, 
    getUserEmail, 
    isAdmin, 
    logout, 
    onAuthStateChange,
    requireAuth 
} from './firebase.js';

// Estado global de autenticação
let currentUser = null;
let isAuthenticated = false;
let isAdminUser = false;

// Callbacks para mudanças de estado
const authCallbacks = [];

// Inicializar sistema de autenticação
export function initAuth() {
    return new Promise((resolve) => {
        onAuthStateChange((user) => {
            currentUser = user;
            isAuthenticated = !!user;
            isAdminUser = user && user.email === 'admin@futwear.com';
            
            // Salvar estado no localStorage para persistência
            if (user) {
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('isAuthenticated', 'true');
                if (isAdminUser) {
                    localStorage.setItem('isAdmin', 'true');
                }
            } else {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('isAdmin');
            }
            
            // Notificar todos os callbacks
            authCallbacks.forEach(callback => {
                try {
                    callback(user, isAuthenticated, isAdminUser);
                } catch (error) {
                    console.error('Erro em callback de autenticação:', error);
                }
            });
            
            resolve(user);
        });
    });
}

// Adicionar callback para mudanças de estado
export function onAuthChange(callback) {
    authCallbacks.push(callback);
    
    // Se já temos um estado, chamar imediatamente
    if (currentUser !== undefined) {
        try {
            callback(currentUser, isAuthenticated, isAdminUser);
        } catch (error) {
            console.error('Erro em callback de autenticação:', error);
        }
    }
}

// Verificar se usuário está logado
export function checkAuth() {
    return isAuthenticated;
}

// Verificar sessão persistente
export function checkPersistentAuth() {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    return {
        isAuthenticated: isAuth,
        userEmail: userEmail,
        isAdmin: isAdmin
    };
}

// Verificar se é admin
export function checkAdmin() {
    return isAdminUser;
}

// Obter usuário atual
export function getAuthUser() {
    return currentUser;
}

// Obter email do usuário
export function getAuthEmail() {
    return getUserEmail();
}

// Fazer logout
export async function doLogout() {
    try {
        await logout();
        currentUser = null;
        isAuthenticated = false;
        isAdminUser = false;
        
        // Notificar todos os callbacks
        authCallbacks.forEach(callback => {
            try {
                callback(null, false, false);
            } catch (error) {
                console.error('Erro em callback de logout:', error);
            }
        });
        
        return true;
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        return false;
    }
}

// Proteger página (redirecionar se não logado)
export function protectPage(redirectTo = 'login.html') {
    if (!isAuthenticated) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Proteger página admin (redirecionar se não for admin)
export function protectAdminPage(redirectTo = 'index.html') {
    if (!isAuthenticated || !isAdminUser) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Atualizar interface baseada no estado de autenticação
export function updateAuthUI() {
    const user = getAuthUser();
    const isLoggedIn = checkAuth();
    const isAdminUser = checkAdmin();
    
    // Atualizar botões de login/logout
    const loginButtons = document.querySelectorAll('.login-btn');
    const logoutButtons = document.querySelectorAll('.logout-btn');
    const userInfo = document.querySelectorAll('.user-info');
    const adminLinks = document.querySelectorAll('.admin-link');
    
    if (isLoggedIn) {
        // Mostrar botões de logout e informações do usuário
        loginButtons.forEach(btn => btn.style.display = 'none');
        logoutButtons.forEach(btn => btn.style.display = 'block');
        userInfo.forEach(info => {
            info.style.display = 'block';
            const emailSpan = info.querySelector('.user-email');
            if (emailSpan) emailSpan.textContent = user.email;
        });
        
        // Mostrar links de admin se for admin
        if (isAdminUser) {
            adminLinks.forEach(link => link.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        // Mostrar botões de login
        loginButtons.forEach(btn => btn.style.display = 'block');
        logoutButtons.forEach(btn => btn.style.display = 'none');
        userInfo.forEach(info => info.style.display = 'none');
        adminLinks.forEach(link => link.style.display = 'none');
    }
}

// Inicializar automaticamente quando o módulo é carregado
initAuth().then(() => {
    // Atualizar UI após inicialização
    updateAuthUI();
});

// Exportar funções principais
export { 
    getCurrentUser, 
    isUserLoggedIn, 
    getUserEmail, 
    isAdmin, 
    logout, 
    onAuthStateChange,
    requireAuth 
};
