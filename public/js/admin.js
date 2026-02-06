import { supabase } from './supabase-client.js';

// Categorias do site
const CATEGORIES = [
  { value: 'brasileiro', label: 'Times Brasileiros' },
  { value: 'selecao', label: 'Seleções' },
  { value: 'europeu', label: 'Times Europeus' },
  { value: 'retro', label: 'Edições Retrô' },
  { value: 'especial', label: 'Edições Especiais' },
  { value: 'infantil', label: 'Linha Infantil' },
  { value: 'feminino', label: 'Linha Feminina' },
  { value: 'treino', label: 'Linha de Treino' },
  { value: 'goleiro', label: 'Camisas de Goleiro' },
  { value: 'custom', label: 'Outra (personalizada)' },
];

const LEAGUES = [
  { value: 'Brasileirão Série A', label: 'Brasil - Brasileirão Série A' },
  { value: 'Premier League', label: 'Inglaterra - Premier League' },
  { value: 'La Liga', label: 'Espanha - La Liga' },
  { value: 'Serie A', label: 'Itália - Serie A' },
  { value: 'Bundesliga', label: 'Alemanha - Bundesliga' },
  { value: 'Ligue 1', label: 'França - Ligue 1' },
];

// ------ Auth Helper ------
function checkAuth() {
  // For development/admin access, we can relax this or rely on a "token" stored on login
  // If you have a specific token key:
  const token = localStorage.getItem('token');

  // If no token, maybe redirect or just show as guest for now?
  // Since login.html sets 'token', we should check it.
  if (!token) {
    // Optional: Redirect to login
    // window.location.href = 'login.html'; 
    return null;
  }

  try {
    // Decode simple JWT payload if possible
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return { email: 'Admin User' };
  }
}

// ------ API Functions ------

async function fetchProducts() {
  try {
    const res = await fetch('/api/products?limit=1000&t=' + Date.now());
    if (!res.ok) throw new Error('Falha ao buscar produtos');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

async function createProductAPI(productData) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao criar produto');
  }
  return await res.json();
}

async function updateProductAPI(productData) {
  const res = await fetch('/api/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao atualizar produto');
  }
  return await res.json();
}

async function deleteProductAPI(id) {
  const res = await fetch(`/api/products?id=${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao deletar produto');
  }
  return await res.json();
}

// ------ Supabase Image Upload ------

async function uploadImageToSupabase(file) {
  try {
    // Create unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('📤 Enviando para Supabase Storage (Bucket: products):', filePath);

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Upload Error:', error);
      throw error;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    console.log('🔗 URL pública gerada:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('❌ Erro no upload para Supabase:', error);
    throw new Error('Falha no upload da imagem (Verifique se o Bucket "products" é público). Detalhes: ' + error.message);
  }
}

// ------ UI Logic ------
let currentProducts = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Auth Check
  currentUser = checkAuth();
  if (currentUser) initAdmin();
  // Else... maybe show login button or redirect?

  // Tab Navigation
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      showTab(tab);
    });
  });

  // New Product Modal
  document.getElementById('btnOpenNewProduct')?.addEventListener('click', () => {
    openProductModal();
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', closeProductModal);
  });

  // Close modal on cancel (specific button)
  document.querySelector('#newProductModal button[data-close]')?.addEventListener('click', () => {
    closeProductModal();
  });

  // Form Submit
  document.getElementById('newProductForm')?.addEventListener('submit', handleProductSubmit);
});

function showTab(tabName) {
  document.querySelectorAll('[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
    b.classList.toggle('bg-green-50', b.dataset.tab === tabName);
    b.classList.toggle('text-green-700', b.dataset.tab === tabName);
  });

  document.querySelectorAll('section[id^="tab-"]').forEach(s => s.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`)?.classList.remove('hidden');

  if (tabName === 'products') loadProductsTable();
}

function initAdmin() {
  const info = document.getElementById('adminUserInfo');
  if (info && currentUser) info.textContent = `Logado como: ${currentUser.email || 'Admin'}`;
  loadProductsTable();
}

// ------ Products Table ------

async function loadProductsTable() {
  const tbody = document.getElementById('productsTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Carregando...</td></tr>';

  currentProducts = await fetchProducts();

  if (currentProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Nenhum produto cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = currentProducts.map(p => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3">
                <div class="flex items-center gap-3">
                    <img src="${p.image || 'img/placeholder.png'}" class="w-10 h-10 object-cover rounded" onerror="this.src='https://via.placeholder.com/40'">
                    <div class="font-medium text-gray-800">${p.name}</div>
                </div>
            </td>
            <td class="p-3">R$ ${parseFloat(p.price).toFixed(2)}</td>
            <td class="p-3"><span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${p.category || '-'}</span></td>
            <td class="p-3">${p.stock || 0}</td>
            <td class="p-3">
                <button onclick="window.editProduct('${p.id}')" class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                <button onclick="window.deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ------ Modal & Form ------

let editingId = null;

function openProductModal(product = null) {
  const modal = document.getElementById('newProductModal');
  const form = document.getElementById('newProductForm');
  const title = modal.querySelector('h3');

  // Reset form
  form.reset();
  editingId = null;
  title.textContent = 'Novo Produto';

  // Populate Categories
  const catSelect = document.getElementById('categorySelect');
  catSelect.innerHTML = '<option value="">Selecione...</option>' + CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('');

  const leagueSelect = document.getElementById('leagueSelect');
  leagueSelect.innerHTML = '<option value="">Selecione...</option>' + LEAGUES.map(l => `<option value="${l.value}">${l.label}</option>`).join('');

  if (product) {
    editingId = product.id;
    title.textContent = 'Editar Produto';
    form.name.value = product.name;
    form.price.value = product.price;
    if (form.description) form.description.value = product.description || '';
    form.stock.value = product.stock || 0;
    form.category.value = product.category || '';
    if (form.league) form.league.value = product.league || '';
    form.team.value = product.team || '';
    // Store current image URL in dataset
    form.dataset.currentImage = product.image || '';
  } else {
    delete form.dataset.currentImage;
  }

  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('newProductModal').classList.add('hidden');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[type="file"]');

    let imageUrl = form.dataset.currentImage || '';

    // Handle Image Upload with Supabase
    if (fileInput && fileInput.files.length > 0) {
      console.log('📸 Iniciando upload para Supabase...');
      imageUrl = await uploadImageToSupabase(fileInput.files[0]);
    } else if (formData.get('image_url_manual')) {
      imageUrl = formData.get('image_url_manual');
    }

    const productData = {
      id: editingId,
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      description: formData.get('description'),
      category: formData.get('category'),
      league: formData.get('league'),
      team: formData.get('team'),
      stock: parseInt(formData.get('stock')) || 0,
      image: imageUrl
    };

    if (editingId) {
      await updateProductAPI(productData);
      alert('Produto atualizado com sucesso!');
    } else {
      await createProductAPI(productData);
      alert('Produto criado com sucesso!');
    }

    closeProductModal();
    loadProductsTable();

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// Global scope for onclick handlers
window.editProduct = (id) => {
  // strict check might fail if id is int vs string, so loose check is safer for basic CRUD
  const product = currentProducts.find(p => p.id == id);
  if (product) openProductModal(product);
};

window.deleteProduct = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  try {
    await deleteProductAPI(id);
    alert('Produto removido!');
    loadProductsTable();
  } catch (error) {
    alert(error.message);
  }
};
