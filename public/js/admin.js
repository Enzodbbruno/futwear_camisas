import { onAuthStateChange, getCurrentUser, isAdmin, getAllOrders, updateOrderStatus, getOrderStats, listAllReviews, approveReview, deleteReview } from '../firebase-hybrid.js';
import { buscarCamisasExterno as buscarCamisas, adicionarCamisaExterno as addProduct, atualizarCamisaExterno as updateProduct } from '../external-database.js';

// Categorias do site (compatível com filtros existentes)
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
  { value: 'Premier League', label: 'Inglaterra - Premier League' },
  { value: 'EFL Championship', label: 'Inglaterra - EFL Championship' },
  { value: 'La Liga', label: 'Espanha - La Liga' },
  { value: 'LaLiga 2', label: 'Espanha - LaLiga 2' },
  { value: 'Serie A', label: 'Itália - Serie A' },
  { value: 'Serie B', label: 'Itália - Serie B' },
  { value: 'Bundesliga', label: 'Alemanha - Bundesliga' },
  { value: '2. Bundesliga', label: 'Alemanha - 2. Bundesliga' },
  { value: 'Ligue 1', label: 'França - Ligue 1' },
  { value: 'Ligue 2', label: 'França - Ligue 2' },
  { value: 'Brasileirão Série A', label: 'Brasil - Brasileirão Série A' },
  { value: 'Brasileirão Série B', label: 'Brasil - Brasileirão Série B' },
  { value: 'Liga Portugal', label: 'Portugal - Liga Portugal' },
  { value: 'Eredivisie', label: 'Holanda - Eredivisie' },
  { value: 'Jupiler Pro League', label: 'Bélgica - Jupiler Pro League' },
  { value: 'Primera División (ARG)', label: 'Argentina - Primera División' },
  { value: 'Süper Lig', label: 'Turquia - Süper Lig' },
  { value: 'Czech First League', label: 'Chéquia - Czech First League' },
  { value: 'Super League Greece', label: 'Grécia - Super League' },
  { value: 'Eliteserien', label: 'Noruega - Eliteserien' },
  { value: 'Ekstraklasa', label: 'Polônia - Ekstraklasa' },
  { value: 'Danish Superliga', label: 'Dinamarca - Danish Superliga' },
  { value: 'Austrian Bundesliga', label: 'Áustria - Austrian Bundesliga' },
  { value: 'Swiss Super League', label: 'Suíça - Swiss Super League' },
  { value: 'Cyprus League', label: 'Chipre - Cyprus League' },
  { value: 'Scottish Premiership', label: 'Escócia - Scottish Premiership' },
  { value: 'Allsvenskan', label: 'Suécia - Allsvenskan' },
  { value: 'Israeli Premier League', label: 'Israel - Israeli Premier League' },
  { value: 'HNL', label: 'Croácia - HNL' },
  { value: 'Romanian Super Liga', label: 'Romênia - Romanian Super Liga' },
  { value: 'NB I (Hungria)', label: 'Hungria - Fizz Liga' },
  { value: 'Mozzart Bet Superliga', label: 'Sérvia - Mozzart Bet Superliga' },
  { value: 'Ukrainian Premier League', label: 'Ucrânia - Ukrainian Premier League' },
  { value: 'MLS', label: 'Estados Unidos - MLS' },
  { value: 'Saudi Pro League', label: 'Arábia Saudita - Saudi Pro League' },
  { value: 'J1 League', label: 'Japão - J1 League' },
  { value: 'K League 1', label: 'Coreia do Sul - K League 1' },
  { value: 'Liga MX', label: 'México - Liga MX' },
  { value: 'Egyptian Premier League', label: 'Egito - Egyptian Premier League' },
  { value: 'Categoría Primera A', label: 'Colômbia - Categoría Primera A' },
  { value: 'Primera División (PAR)', label: 'Paraguai - Primera División' },
  { value: 'Seleções', label: 'Seleções - Internacionais' },
];

const TEAMS_BY_LEAGUE = {
  'Brasileirão Série A': ['Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos', 'Vasco da Gama', 'Botafogo', 'Fluminense', 'Grêmio', 'Internacional', 'Atlético Mineiro', 'Cruzeiro', 'Bahia', 'Athletico Paranaense', 'Fortaleza'],
  'Premier League': ['Manchester United', 'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham', 'Newcastle United', 'Aston Villa', 'West Ham', 'Everton'],
  'La Liga': ['Real Madrid', 'Barcelona', 'Atlético de Madrid', 'Sevilla', 'Valencia', 'Real Sociedad', 'Villarreal', 'Athletic Club'],
  'Serie A': ['Juventus', 'Inter', 'Milan', 'Napoli', 'Roma', 'Lazio', 'Fiorentina', 'Atalanta'],
  'Bundesliga': ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Schalke 04', 'Borussia Mönchengladbach'],
  'Ligue 1': ['Paris Saint-Germain', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Nice'],
  'Liga Portugal': ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitória SC'],
  'Eredivisie': ['Ajax', 'PSV', 'Feyenoord', 'AZ Alkmaar', 'Twente'],
  'Jupiler Pro League': ['Club Brugge', 'Anderlecht', 'Genk', 'Gent', 'Antwerp'],
  'Primera División (ARG)': ['Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo'],
  'MLS': ['LA Galaxy', 'LAFC', 'Inter Miami', 'Seattle Sounders', 'Atlanta United'],
  'Seleções': ['Brasil', 'Argentina', 'França', 'Alemanha', 'Espanha', 'Inglaterra', 'Itália', 'Portugal']
};

let leagueData = null; // carregado do JSON

async function loadLeagueData() {
  try {
    const cacheRaw = localStorage.getItem('leagueTeamsData');
    if (cacheRaw) {
      const cache = JSON.parse(cacheRaw);
      // cache válido por 30 dias
      if (cache && cache.ts && (Date.now() - cache.ts) < 1000 * 60 * 60 * 24 * 30) {
        leagueData = cache.data;
      }
    }
  } catch { }

  if (!leagueData) {
    try {
      const res = await fetch('./data/teams-by-league.json', { cache: 'no-cache' });
      if (res.ok) {
        leagueData = await res.json();
        localStorage.setItem('leagueTeamsData', JSON.stringify({ ts: Date.now(), data: leagueData }));
      }
    } catch { }
  }

  // fallback estático se ainda não obtido
  if (!leagueData) {
    leagueData = {};
    LEAGUES.forEach(l => { leagueData[l.value] = TEAMS_BY_LEAGUE[l.value] || []; });
  }
  return leagueData;
}

// Promoções
async function loadPromotions() {
  const tbody = document.getElementById('promotionsTable');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="5">Carregando...</td></tr>`;
  try {
    const produtos = await buscarCamisas();
    window.__PROMO_ALL_PRODUCTS__ = produtos || [];
    if (!Array.isArray(produtos) || produtos.length === 0) {
      tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="5">Nenhum produto encontrado</td></tr>`;
      return;
    }
    // preencher filtro de categoria
    const catSel = document.getElementById('promoCategoryFilter');
    if (catSel && catSel.options.length === 0) {
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = 'Todas as categorias';
      catSel.appendChild(ph);
      const cats = Array.from(new Set(produtos.map(p => p.category || p.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });
      catSel.onchange = () => renderPromoRows();
    }
    const search = document.getElementById('promoSearch');
    if (search && !search.__bound) {
      search.__bound = true;
      search.addEventListener('input', () => renderPromoRows());
    }

    function filtered() {
      const q = (document.getElementById('promoSearch')?.value || '').toLowerCase();
      const c = document.getElementById('promoCategoryFilter')?.value || '';
      return window.__PROMO_ALL_PRODUCTS__.filter(p => {
        const inCat = !c || (p.category || p.categoria) === c;
        if (!inCat) return false;
        if (!q) return true;
        const hay = `${p.name} ${p.id}`.toLowerCase();
        return hay.includes(q);
      });
    }

    function toRow(p) {
      const price = Number(p.price || 0);
      const discount = Number(p.discount || 0);
      const start = p.promoStart || '';
      const end = p.promoEnd || '';
      const discounted = discount > 0 ? price * (1 - discount / 100) : price;
      return `
        <tr class="border-t">
          <td class="p-2"><input type="checkbox" data-promo-select="${p.id}" /></td>
          <td class="p-2">
            <div class="flex items-center gap-3">
              <img src="${p.image}" class="w-10 h-10 object-cover rounded" alt="${p.name}">
              <div>
                <div class="font-semibold">${p.name}</div>
                <div class="text-xs text-gray-500">${p.id}</div>
              </div>
            </div>
          </td>
          <td class="p-2">R$ ${price.toFixed(2).replace('.', ',')}</td>
          <td class="p-2"><input type="number" min="0" step="0.01" value="${discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : ''}" data-target="${p.id}" class="w-24 border rounded p-1" placeholder="R$" /></td>
          <td class="p-2"><input type="number" min="0" max="90" step="1" value="${discount}" data-discount="${p.id}" class="w-20 border rounded p-1"></td>
          <td class="p-2">
            <div class="flex gap-1">
              <input type="datetime-local" value="${start}" data-start="${p.id}" class="border rounded p-1" />
              <input type="datetime-local" value="${end}" data-end="${p.id}" class="border rounded p-1" />
            </div>
          </td>
          <td class="p-2">R$ ${discounted.toFixed(2).replace('.', ',')}</td>
          <td class="p-2">
            <button data-save-discount="${p.id}" class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Salvar</button>
            ${discount > 0 ? `<button data-clear-discount="${p.id}" class="ml-2 px-3 py-1 text-sm border rounded hover:bg-gray-50">Remover</button>` : ''}
          </td>
        </tr>
      `;
    }

    function renderPromoRows() {
      const rows = filtered().map(toRow).join('');
      tbody.innerHTML = rows || `<tr><td class="p-3 text-gray-500" colspan="8">Nenhum item</td></tr>`;

      // header select all
      const selectAll = document.getElementById('promoSelectAll');
      if (selectAll && !selectAll.__bound) {
        selectAll.__bound = true;
        selectAll.addEventListener('change', () => {
          tbody.querySelectorAll('[data-promo-select]').forEach(chk => chk.checked = selectAll.checked);
        });
      }

      // listeners por linha
      tbody.querySelectorAll('[data-target]').forEach(inp => {
        inp.addEventListener('input', () => {
          const id = inp.getAttribute('data-target');
          const p = window.__PROMO_ALL_PRODUCTS__.find(x => x.id === id);
          if (!p) return;
          const price = Number(p.price || 0);
          const tgt = Number(inp.value || 0);
          const perc = price > 0 ? Math.max(0, Math.min(90, Math.round((1 - (tgt / price)) * 100))) : 0;
          const percInput = tbody.querySelector(`[data-discount="${id}"]`);
          if (percInput) percInput.value = perc;
        });
      });

      // save handler por linha
      tbody.querySelectorAll('[data-save-discount]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-save-discount');
          const perc = Math.max(0, Math.min(90, Number(tbody.querySelector(`[data-discount="${id}"]`)?.value || 0)));
          const start = tbody.querySelector(`[data-start="${id}"]`)?.value || '';
          const end = tbody.querySelector(`[data-end="${id}"]`)?.value || '';
          try {
            await updateProduct(id, { discount: perc, promoStart: start, promoEnd: end });
            await loadPromotions();
          } catch (e) { alert('Erro ao salvar desconto'); }
        });
      });

      tbody.querySelectorAll('[data-clear-discount]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-clear-discount');
          try {
            await updateProduct(id, { discount: 0, promoStart: '', promoEnd: '' });
            await loadPromotions();
          } catch (e) {
            alert('Erro ao remover desconto');
          }
        });
      });
    }
    renderPromoRows();

    // ações em massa
    const applyFiltered = document.getElementById('promoApplyFiltered');
    if (applyFiltered && !applyFiltered.__bound) {
      applyFiltered.__bound = true;
      applyFiltered.addEventListener('click', async () => {
        const items = filtered();
        const perc = Number(document.getElementById('promoPercent')?.value || 0);
        const tgt = Number(document.getElementById('promoTargetPrice')?.value || 0);
        const start = document.getElementById('promoStart')?.value || '';
        const end = document.getElementById('promoEnd')?.value || '';
        for (const p of items) {
          const price = Number(p.price || 0);
          const computedPerc = tgt > 0 && price > 0 ? Math.max(0, Math.min(90, Math.round((1 - (tgt / price)) * 100))) : Math.max(0, Math.min(90, perc));
          await updateProduct(p.id, { discount: computedPerc, promoStart: start, promoEnd: end });
        }
        await loadPromotions();
      });
    }

    const applySelected = document.getElementById('promoApplySelected');
    if (applySelected && !applySelected.__bound) {
      applySelected.__bound = true;
      applySelected.addEventListener('click', async () => {
        const selectedIds = Array.from(tbody.querySelectorAll('[data-promo-select]:checked')).map(chk => chk.getAttribute('data-promo-select'));
        const perc = Number(document.getElementById('promoPercent')?.value || 0);
        const tgt = Number(document.getElementById('promoTargetPrice')?.value || 0);
        const start = document.getElementById('promoStart')?.value || '';
        const end = document.getElementById('promoEnd')?.value || '';
        for (const id of selectedIds) {
          const p = window.__PROMO_ALL_PRODUCTS__.find(x => x.id === id);
          if (!p) continue;
          const price = Number(p.price || 0);
          const computedPerc = tgt > 0 && price > 0 ? Math.max(0, Math.min(90, Math.round((1 - (tgt / price)) * 100))) : Math.max(0, Math.min(90, perc));
          await updateProduct(id, { discount: computedPerc, promoStart: start, promoEnd: end });
        }
        await loadPromotions();
      });
    }

    const clearSelected = document.getElementById('promoClearSelected');
    if (clearSelected && !clearSelected.__bound) {
      clearSelected.__bound = true;
      clearSelected.addEventListener('click', async () => {
        const selectedIds = Array.from(tbody.querySelectorAll('[data-promo-select]:checked')).map(chk => chk.getAttribute('data-promo-select'));
        for (const id of selectedIds) {
          await updateProduct(id, { discount: 0, promoStart: '', promoEnd: '' });
        }
        await loadPromotions();
      });
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td class=\"p-3 text-red-600\" colspan=\"5\">Erro ao carregar promoções</td></tr>`;
  }
}

// Reviews moderation
async function loadReviews() {
  const tbody = document.getElementById('reviewsTable');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="6">Carregando...</td></tr>`;
  try {
    const res = await listAllReviews();
    const items = res && res.success ? res.data : [];
    const q = (document.getElementById('reviewsSearch')?.value || '').toLowerCase();
    const status = document.getElementById('reviewsStatus')?.value || 'all';
    const filtered = items.filter(r => {
      const matchesQ = !q || `${r.productId || ''} ${r.userEmail || ''} ${r.text || ''}`.toLowerCase().includes(q);
      const matchesS = status === 'all' || (status === 'approved' ? !!r.approved : !r.approved);
      return matchesQ && matchesS;
    });
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="6">Sem avaliações</td></tr>`;
      return;
    }
    tbody.innerHTML = filtered.map(r => `
      <tr class="border-t align-top">
        <td class="p-2 text-xs">${r.productId || '-'}</td>
        <td class="p-2 text-xs">${r.userEmail || r.userId || '-'}</td>
        <td class="p-2">${r.rating || 0}★</td>
        <td class="p-2 whitespace-pre-wrap">${(r.text || '').slice(0, 280)}</td>
        <td class="p-2">${r.approved ? '<span class="text-green-700 bg-green-100 px-2 py-1 rounded text-xs">Aprovado</span>' : '<span class="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">Pendente</span>'}</td>
        <td class="p-2 space-x-1">
          ${r.approved ? `<button data-unapprove="${r.id}" class="px-2 py-1 text-xs border rounded hover:bg-gray-50">Reprovar</button>` : `<button data-approve="${r.id}" class="px-2 py-1 text-xs border rounded hover:bg-gray-50">Aprovar</button>`}
          <button data-delete-review="${r.id}" class="px-2 py-1 text-xs border rounded hover:bg-gray-50 text-red-600">Excluir</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-approve]').forEach(btn => btn.addEventListener('click', async () => {
      await approveReview(btn.getAttribute('data-approve'), true);
      await loadReviews();
    }));
    tbody.querySelectorAll('[data-unapprove]').forEach(btn => btn.addEventListener('click', async () => {
      await approveReview(btn.getAttribute('data-unapprove'), false);
      await loadReviews();
    }));
    tbody.querySelectorAll('[data-delete-review]').forEach(btn => btn.addEventListener('click', async () => {
      if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
      await deleteReview(btn.getAttribute('data-delete-review'));
      await loadReviews();
    }));

    const srch = document.getElementById('reviewsSearch');
    const sel = document.getElementById('reviewsStatus');
    const ref = document.getElementById('reviewsRefresh');
    if (srch && !srch.__bound) { srch.__bound = true; srch.addEventListener('input', () => loadReviews()); }
    if (sel && !sel.__bound) { sel.__bound = true; sel.addEventListener('change', () => loadReviews()); }
    if (ref && !ref.__bound) { ref.__bound = true; ref.addEventListener('click', () => loadReviews()); }
  } catch (e) {
    tbody.innerHTML = `<tr><td class=\"p-3 text-red-600\" colspan=\"6\">Erro ao carregar avaliações</td></tr>`;
  }
}

function populateCategorySelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  const ph = document.createElement('option');
  ph.value = '';
  ph.textContent = 'Selecione uma categoria';
  ph.disabled = true;
  ph.selected = true;
  selectEl.appendChild(ph);
  CATEGORIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.value;
    opt.textContent = c.label;
    selectEl.appendChild(opt);
  });
}

async function populateLeagueSelect(selectEl) {
  if (!selectEl) return;
  // limpar e inserir placeholder
  selectEl.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecione uma liga';
  placeholder.disabled = true;
  placeholder.selected = true;
  selectEl.appendChild(placeholder);

  const data = await loadLeagueData();
  const leagueNames = Object.keys(data || {});
  // ordenar por nome, preservando principais no topo se existirem
  const priority = new Set(LEAGUES.map(l => l.value));
  const prioritized = leagueNames.filter(n => priority.has(n));
  const others = leagueNames.filter(n => !priority.has(n)).sort((a, b) => a.localeCompare(b));
  const ordered = [...prioritized, ...others];

  ordered.forEach(name => {
    const opt = document.createElement('option');
    const label = (LEAGUES.find(l => l.value === name)?.label) || name;
    opt.value = name;
    opt.textContent = label;
    selectEl.appendChild(opt);
  });
}

function updateTeamSuggestions(leagueValue) {
  const list = document.getElementById('teamsList');
  if (!list) return;
  list.innerHTML = '';
  const teams = (leagueData && leagueData[leagueValue]) || TEAMS_BY_LEAGUE[leagueValue] || [];
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    list.appendChild(opt);
  });
}

// Tabs
function setupTabs() {
  const buttons = document.querySelectorAll('aside nav [data-tab]');
  const sections = {
    dashboard: document.getElementById('tab-dashboard'),
    products: document.getElementById('tab-products'),
    promotions: document.getElementById('tab-promotions'),
    reviews: document.getElementById('tab-reviews'),
    orders: document.getElementById('tab-orders'),
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('bg-green-50', 'text-green-700'));
      btn.classList.add('bg-green-50', 'text-green-700');
      const tab = btn.getAttribute('data-tab');
      Object.keys(sections).forEach(k => sections[k].classList.add('hidden'));
      sections[tab]?.classList.remove('hidden');
      if (tab === 'dashboard') loadKpis();
      if (tab === 'products') loadProducts();
      if (tab === 'promotions') loadPromotions();
      if (tab === 'orders') loadOrders();
      if (tab === 'reviews') loadReviews();
    });
  });
}

// Guard
function showGuard(message) {
  const guard = document.getElementById('guardMessage');
  guard.textContent = message;
  guard.classList.remove('hidden');
}

function hideGuard() {
  const guard = document.getElementById('guardMessage');
  guard.classList.add('hidden');
}

async function requireAdmin() {
  return new Promise(resolve => {
    onAuthStateChange(async () => {
      const user = getCurrentUser();
      const admin = isAdmin();
      const info = document.getElementById('adminUserInfo');
      if (info) info.textContent = user ? `Logado como: ${user.email}${admin ? ' (admin)' : ''}` : 'Não logado';

      if (!user) {
        showGuard('Você precisa estar logado para acessar o painel. Redirecionando para login...');
        setTimeout(() => (window.location.href = 'login.html'), 1200);
        return resolve(false);
      }
      if (!admin) {
        showGuard('Acesso restrito: apenas administradores. Redirecionando...');
        setTimeout(() => (window.location.href = 'index.html'), 1200);
        return resolve(false);
      }
      hideGuard();
      resolve(true);
    });
  });
}

// KPIs
async function loadKpis() {
  try {
    const res = await getOrderStats();
    if (res && res.success) {
      const s = res.data;
      document.getElementById('kpiOrders').textContent = s.totalOrders;
      document.getElementById('kpiPaid').textContent = s.paidOrders;
      document.getElementById('kpiPending').textContent = s.unpaidOrders;
      document.getElementById('kpiRevenue').textContent = `R$ ${s.totalRevenue.toFixed(2).replace('.', ',')}`;
      return;
    }
  } catch { }

  // Fallback simples
  document.getElementById('kpiOrders').textContent = '-';
  document.getElementById('kpiPaid').textContent = '-';
  document.getElementById('kpiPending').textContent = '-';
  document.getElementById('kpiRevenue').textContent = 'R$ -';
}

// Produtos
async function loadProducts() {
  const tbody = document.getElementById('productsTable');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="5">Carregando...</td></tr>`;
  try {
    const produtos = await buscarCamisas();
    if (!Array.isArray(produtos) || produtos.length === 0) {
      tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="5">Nenhum produto encontrado</td></tr>`;
      return;
    }
    tbody.innerHTML = produtos.map(p => `
      <tr class="border-t">
        <td class="p-2">
          <div class="flex items-center gap-3">
            <img src="${p.image}" class="w-10 h-10 object-cover rounded" alt="${p.name}">
            <div>
              <div class="font-semibold">${p.name}</div>
              <div class="text-xs text-gray-500">${p.id}</div>
            </div>
          </div>
        </td>
        <td class="p-2">R$ ${Number(p.price || 0).toFixed(2).replace('.', ',')}</td>
        <td class="p-2">${p.category || p.categoria || '-'}</td>
        <td class="p-2">${p.stock ?? '-'}</td>
        <td class="p-2">
          <button data-edit="${p.id}" class="px-2 py-1 text-sm border rounded hover:bg-gray-50">Editar</button>
        </td>
      </tr>
    `).join('');

    // Edit handler (abre modal preenchido)
    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit');
        const prod = produtos.find(x => x.id === id);
        if (!prod) return;
        openNewProductModal(prod);
      });
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td class="p-3 text-red-600" colspan="5">Erro ao carregar produtos</td></tr>`;
  }
}

async function openNewProductModal(product = null) {
  const modal = document.getElementById('newProductModal');
  const form = document.getElementById('newProductForm');
  if (!modal || !form) return;

  modal.classList.remove('hidden');

  // Preencher se for edição
  form.name.value = product?.name || '';
  form.price.value = product?.price != null ? Number(product.price) : '';
  const categorySelect = document.getElementById('categorySelect');
  const categoryCustomWrap = document.getElementById('categoryCustomWrap');
  const categoryCustom = document.getElementById('categoryCustom');
  populateCategorySelect(categorySelect);
  const existingCat = (product?.category || product?.categoria || '').trim();
  if (existingCat && !CATEGORIES.some(c => c.value === existingCat)) {
    categorySelect.value = 'custom';
    categoryCustomWrap.classList.remove('hidden');
    categoryCustom.value = existingCat;
  } else {
    categorySelect.value = existingCat || '';
    categoryCustomWrap.classList.add('hidden');
    categoryCustom.value = '';
  }
  const leagueSelect = document.getElementById('leagueSelect');
  const teamInput = document.getElementById('teamInput');
  await populateLeagueSelect(leagueSelect);
  leagueSelect.value = product?.league || '';
  updateTeamSuggestions(leagueSelect.value);
  teamInput.value = product?.team || '';
  form.image.value = product?.image || '';
  form.stock.value = product?.stock != null ? Number(product.stock) : '';
  form.dataset.editingId = product?.id || '';

  function close() {
    modal.classList.add('hidden');
    form.reset();
    form.dataset.editingId = '';
  }

  modal.querySelectorAll('[data-close]').forEach(el => el.onclick = close);
  const leagueSelect2 = document.getElementById('leagueSelect');
  if (leagueSelect2) {
    leagueSelect2.onchange = () => {
      updateTeamSuggestions(leagueSelect2.value);
      const ti = document.getElementById('teamInput');
      if (ti) ti.value = '';
    };
  }
  if (categorySelect) {
    categorySelect.onchange = () => {
      if (categorySelect.value === 'custom') {
        categoryCustomWrap.classList.remove('hidden');
        categoryCustom.focus();
      } else {
        categoryCustomWrap.classList.add('hidden');
        categoryCustom.value = '';
      }
    };
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // categoria final
    let finalCategory = data.category;
    if (finalCategory === 'custom') {
      finalCategory = (document.getElementById('categoryCustom')?.value || '').trim();
    }
    const payload = {
      name: data.name,
      price: Number(data.price),
      category: finalCategory || null,
      team: data.team || null,
      league: data.league || null,
      image: data.image || null,
      stock: data.stock ? Number(data.stock) : 0,
    };

    try {
      const editingId = form.dataset.editingId;
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }
      close();
      await loadProducts();
    } catch (err) {
      alert('Erro ao salvar produto');
      console.error(err);
    }
  };
}

// Pedidos
async function loadOrders() {
  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="7">Carregando...</td></tr>`;
  try {
    const res = await getAllOrders();
    const orders = res && res.success ? res.data : [];
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td class="p-3 text-gray-500" colspan="7">Nenhum pedido encontrado</td></tr>`;
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr class="border-t align-top">
        <td class="p-2 text-xs">${o.id || '-'}</td>
        <td class="p-2 text-xs">${o.userEmail || o.userId || '-'}</td>
        <td class="p-2 text-xs">${Array.isArray(o.items) ? o.items.map(i => `${i.name} (${i.size || '-'}) x${i.quantity || 1}`).join('<br>') : '-'}</td>
        <td class="p-2">R$ ${(o.total || 0).toFixed(2).replace('.', ',')}</td>
        <td class="p-2">
          <span class="inline-block text-xs px-2 py-1 rounded ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${o.paymentStatus || 'pending'}</span>
        </td>
        <td class="p-2">
          <span class="inline-block text-xs px-2 py-1 rounded ${o.status === 'completed' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">${o.status || 'pending'}</span>
        </td>
        <td class="p-2 space-x-1">
          <button data-pay="${o.id}" class="px-2 py-1 text-xs border rounded hover:bg-gray-50">Marcar pago</button>
          <button data-complete="${o.id}" class="px-2 py-1 text-xs border rounded hover:bg-gray-50">Concluir</button>
          <button data-cancel="${o.id}" class="px-2 py-1 text-xs border rounded hover:bg-gray-50">Cancelar</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-pay]').forEach(btn => btn.addEventListener('click', async () => {
      await updateOrderStatus(btn.getAttribute('data-pay'), 'pending', 'paid');
      await loadOrders();
      await loadKpis();
    }));
    tbody.querySelectorAll('[data-complete]').forEach(btn => btn.addEventListener('click', async () => {
      await updateOrderStatus(btn.getAttribute('data-complete'), 'completed');
      await loadOrders();
      await loadKpis();
    }));
    tbody.querySelectorAll('[data-cancel]').forEach(btn => btn.addEventListener('click', async () => {
      await updateOrderStatus(btn.getAttribute('data-cancel'), 'cancelled');
      await loadOrders();
      await loadKpis();
    }));
  } catch (e) {
    tbody.innerHTML = `<tr><td class=\"p-3 text-red-600\" colspan=\"7\">Erro ao carregar pedidos</td></tr>`;
  }
}

function setupProductButtons() {
  const btn = document.getElementById('btnOpenNewProduct');
  if (btn) btn.addEventListener('click', () => openNewProductModal());
}

// Init
(async function init() {
  setupTabs();
  setupProductButtons();
  const ok = await requireAdmin();
  if (!ok) return;
  // Default tab
  document.querySelector('aside nav [data-tab="dashboard"]').click();
})();
