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
  if (tabName === 'reviews') loadReviewsTable();
  if (tabName === 'orders') loadOrdersTable();
  if (tabName === 'dashboard') loadDashboardStats();
}

function initAdmin() {
  const info = document.getElementById('adminUserInfo');
  if (info && currentUser) info.textContent = `Logado como: ${currentUser.email || 'Admin'}`;

  // Load initial data
  loadDashboardStats();
  loadProductsTable();
  loadPromotionsTable();
  initPromotionFilters();
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
// ------ Dashboard Logic ------

async function loadDashboardStats() {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Falha ao carregar pedidos');
    const orders = await res.json();

    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const revenue = orders.reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);

    document.getElementById('kpiOrders').textContent = totalOrders;
    document.getElementById('kpiPaid').textContent = paidOrders;
    document.getElementById('kpiPending').textContent = pendingOrders;
    document.getElementById('kpiRevenue').textContent = `R$ ${revenue.toFixed(2).replace('.', ',')}`;

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// ------ Reviews Logic ------

async function loadReviewsTable() {
  const tbody = document.getElementById('reviewsTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">Carregando...</td></tr>';

  try {
    const res = await fetch('/api/reviews'); // Fetches all reviews
    if (!res.ok) throw new Error('Falha ao buscar avaliações');
    const reviews = await res.json();

    if (reviews.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">Nenhuma avaliação encontrada.</td></tr>';
      return;
    }

    tbody.innerHTML = reviews.map(r => `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-3 text-xs">${r.product_id}</td>
        <td class="p-3">${r.user_name || 'Anônimo'}</td>
        <td class="p-3">
          <div class="flex text-yellow-400 text-xs">
            ${'<i class="fas fa-star"></i>'.repeat(r.rating)}
          </div>
        </td>
        <td class="p-3 text-sm italic text-gray-600">"${r.comment || ''}"</td>
        <td class="p-3">
          <span class="px-2 py-1 rounded text-xs font-semibold ${r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
            ${r.status === 'approved' ? 'Aprovado' : 'Pendente'}
          </span>
        </td>
        <td class="p-3">
          ${r.status !== 'approved' ?
        `<button onclick="window.updateReviewStatus('${r.id}', 'approved')" class="text-green-600 hover:text-green-800 mr-2" title="Aprovar"><i class="fas fa-check"></i></button>` : ''
      }
          <button onclick="window.deleteReview('${r.id}')" class="text-red-500 hover:text-red-700" title="Excluir"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">Erro ao carregar dados.</td></tr>';
  }
}

window.updateReviewStatus = async (id, status) => {
  try {
    const res = await fetch('/api/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (!res.ok) throw new Error('Erro ao atualizar status');
    loadReviewsTable();
  } catch (error) {
    alert(error.message);
  }
};

window.deleteReview = async (id) => {
  if (!confirm('Excluir esta avaliação?')) return;
  try {
    const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir');
    loadReviewsTable();
  } catch (error) {
    alert(error.message);
  }
};

// ------ Orders Logic ------

async function loadOrdersTable() {
  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center">Carregando...</td></tr>';

  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Falha ao buscar pedidos');
    const orders = await res.json();

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center">Nenhum pedido encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const user = o.user_data || {}; // Handle JSONB
      const products = o.products || []; // Handle JSONB
      const itemsSummary = products.map(p => `${p.quantity}x ${p.name}`).join(', ');

      return `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-3 text-xs font-mono">#${o.id}</td>
        <td class="p-3">
          <div class="font-medium">${user.name || 'Cliente'}</div>
          <div class="text-xs text-gray-500">${user.email || ''}</div>
        </td>
        <td class="p-3 text-xs text-gray-600 max-w-xs truncate" title="${itemsSummary}">${itemsSummary}</td>
        <td class="p-3 font-semibold">R$ ${parseFloat(o.total).toFixed(2).replace('.', ',')}</td>
        <td class="p-3 text-xs uppercase">${o.payment_method || '-'}</td>
        <td class="p-3">
          <select onchange="window.updateOrderStatus('${o.id}', this.value)" class="border rounded p-1 text-xs">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pendente</option>
            <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Pago</option>
            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Enviado</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Entregue</option>
            <option value="canceled" ${o.status === 'canceled' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td class="p-3">
          <button class="text-blue-600 hover:text-blue-800" title="Ver Detalhes"><i class="fas fa-eye"></i></button>
        </td>
      </tr>
    `}).join('');

  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-red-500">Erro ao carregar pedidos.</td></tr>';
  }
}

window.updateOrderStatus = async (id, status) => {
  try {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (!res.ok) throw new Error('Erro ao atualizar status');
    // Optional: show toast
    loadDashboardStats(); // Refresh stats
  } catch (error) {
    alert('Erro ao atualizar status do pedido');
  }
};

// ------ Promotions Logic ------

let allPromotionProducts = [];
let filteredPromotionProducts = [];

function initPromotionFilters() {
  const catSelect = document.getElementById('promoCategoryFilter');
  if (catSelect) {
    catSelect.innerHTML = '<option value="">Todas as Categorias</option>' +
      CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
  }

  // Add event listeners for live filtering
  document.getElementById('promoCategoryFilter')?.addEventListener('change', filterPromotionProducts);
  document.getElementById('promoSearch')?.addEventListener('input', filterPromotionProducts);
}

async function loadPromotionsTable() {
  const tbody = document.getElementById('promotionsTable');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center">Carregando produtos...</td></tr>';

  try {
    const res = await fetch('/api/products?limit=1000');
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    const data = await res.json();
    allPromotionProducts = Array.isArray(data) ? data : (data.data || []);
    filteredPromotionProducts = [...allPromotionProducts];

    renderPromotionsTable();
  } catch (error) {
    console.error('Erro ao carregar produtos para promoções:', error);
    tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-red-500">Erro ao carregar produtos.</td></tr>';
  }
}

function filterPromotionProducts() {
  const category = document.getElementById('promoCategoryFilter')?.value || '';
  const search = document.getElementById('promoSearch')?.value.toLowerCase() || '';

  filteredPromotionProducts = allPromotionProducts.filter(p => {
    const matchCategory = !category || p.category === category;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search) ||
      (p.team && p.team.toLowerCase().includes(search)) ||
      (p.league && p.league.toLowerCase().includes(search)) ||
      String(p.id).includes(search);

    return matchCategory && matchSearch;
  });

  renderPromotionsTable();
}

function renderPromotionsTable() {
  const tbody = document.getElementById('promotionsTable');
  if (!tbody) return;

  if (filteredPromotionProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-500">Nenhum produto encontrado.</td></tr>';
    return;
  }

  tbody.innerHTML = filteredPromotionProducts.map(p => {
    const price = parseFloat(p.price) || 0;
    const discount = parseFloat(p.discount) || 0;
    const discountedPrice = discount > 0 ? (price * (1 - discount / 100)) : price;
    const hasPromo = discount > 0;
    const promoStart = p.promoStart ? new Date(p.promoStart).toLocaleDateString('pt-BR') : '-';
    const promoEnd = p.promoEnd ? new Date(p.promoEnd).toLocaleDateString('pt-BR') : '-';

    return `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-3"><input type="checkbox" class="promo-checkbox" data-product-id="${p.id}" /></td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <img src="${p.image}" alt="${p.name}" class="w-10 h-10 object-cover rounded">
            <div>
              <div class="text-sm font-medium">${p.name}</div>
              <div class="text-xs text-gray-500">${p.team || 'N/A'} • ${p.league || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td class="p-3 text-sm">R$ ${price.toFixed(2).replace('.', ',')}</td>
        <td class="p-3 text-sm">${hasPromo ? `R$ ${discountedPrice.toFixed(2).replace('.', ',')}` : '-'}</td>
        <td class="p-3 text-sm">${hasPromo ? `${discount}%` : '-'}</td>
        <td class="p-3 text-xs">${promoStart} até ${promoEnd}</td>
        <td class="p-3 text-sm">${hasPromo ? `R$ ${discountedPrice.toFixed(2).replace('.', ',')}` : '-'}</td>
        <td class="p-3">
          <button onclick="window.adminEditProductPromo(${p.id})" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar promoção">
            <i class="fas fa-edit"></i>
          </button>
          ${hasPromo ? `<button onclick="window.adminRemovePromo(${p.id})" class="text-red-600 hover:text-red-800" title="Remover promoção">
            <i class="fas fa-times"></i>
          </button>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  // Update select all checkbox
  updateSelectAllCheckbox();
}

function updateSelectAllCheckbox() {
  const selectAll = document.getElementById('promoSelectAll');
  const checkboxes = document.querySelectorAll('.promo-checkbox');
  if (selectAll && checkboxes.length > 0) {
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    selectAll.checked = allChecked;
  }
}

// Select all handler
document.getElementById('promoSelectAll')?.addEventListener('change', (e) => {
  const checkboxes = document.querySelectorAll('.promo-checkbox');
  checkboxes.forEach(cb => cb.checked = e.target.checked);
});

// Apply to selected products
document.getElementById('promoApplySelected')?.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.promo-checkbox:checked');
  const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.productId);

  if (selectedIds.length === 0) {
    alert('Selecione pelo menos um produto.');
    return;
  }

  const percent = document.getElementById('promoPercent').value;
  const price = document.getElementById('promoTargetPrice').value;
  const start = document.getElementById('promoStart').value;
  const end = document.getElementById('promoEnd').value;

  if (!percent && !price) {
    alert('Defina uma porcentagem de desconto ou um preço alvo.');
    return;
  }

  const payload = {
    productIds: selectedIds,
    percent: percent || null,
    priceTarget: price || null,
    startDate: start || null,
    endDate: end || null
  };

  try {
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao aplicar promoção');

    alert(data.message);
    loadPromotionsTable();
  } catch (error) {
    alert(error.message);
  }
});

// Clear selected promotions
document.getElementById('promoClearSelected')?.addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.promo-checkbox:checked');
  const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.productId);

  if (selectedIds.length === 0) {
    alert('Selecione pelo menos um produto.');
    return;
  }

  if (!confirm(`Remover promoções de ${selectedIds.length} produto(s)?`)) return;

  try {
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds: selectedIds,
        percent: 0,
        priceTarget: null,
        startDate: null,
        endDate: null
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao remover promoções');

    alert(data.message);
    loadPromotionsTable();
  } catch (error) {
    alert(error.message);
  }
});

window.adminEditProductPromo = function (id) {
  const product = allPromotionProducts.find(p => p.id === id);
  if (!product) return;

  // Pre-fill form with current values
  document.getElementById('promoPercent').value = product.discount || '';
  document.getElementById('promoStart').value = product.promoStart ? new Date(product.promoStart).toISOString().slice(0, 16) : '';
  document.getElementById('promoEnd').value = product.promoEnd ? new Date(product.promoEnd).toISOString().slice(0, 16) : '';

  // Select the product
  const checkbox = document.querySelector(`.promo-checkbox[data-product-id="${id}"]`);
  if (checkbox) {
    checkbox.checked = true;
    checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

window.adminRemovePromo = async function (id) {
  if (!confirm('Remover promoção deste produto?')) return;

  try {
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds: [String(id)],
        percent: 0,
        priceTarget: null,
        startDate: null,
        endDate: null
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao remover promoção');

    alert(data.message);
    loadPromotionsTable();
  } catch (error) {
    alert(error.message);
  }
};

document.getElementById('promoApplyFiltered')?.addEventListener('click', async () => {
  const category = document.getElementById('promoCategoryFilter').value;
  const search = document.getElementById('promoSearch').value;
  const start = document.getElementById('promoStart').value;
  const end = document.getElementById('promoEnd').value;
  const percent = document.getElementById('promoPercent').value;
  const price = document.getElementById('promoTargetPrice').value;

  if (!percent && !price) {
    alert('Defina uma porcentagem de desconto ou um preço alvo.');
    return;
  }

  if (!category && !search) {
    if (!confirm('Nenhum filtro selecionado. Isso aplicará a promoção em TODOS os produtos. Tem certeza?')) return;
  }

  const payload = {
    category,
    team: search,
    percent: percent || null,
    priceTarget: price || null,
    startDate: start || null,
    endDate: end || null
  };

  const btn = document.getElementById('promoApplyFiltered');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Aplicando...';

  try {
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao aplicar promoção');

    alert(data.message);
    loadProductsTable();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
