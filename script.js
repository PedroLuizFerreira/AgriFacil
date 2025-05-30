let dashboardInterval = null;
let dashboardLoading = false;
let dashboardError = null;
let dashboardData = null;
let dashboardLastUpdate = null;

const landingPage = document.getElementById('landing-page');
const dashboardPage = document.getElementById('dashboard-page');
const goDashboardBtn = document.getElementById('go-dashboard');
const goDashboardCtaBtn = document.getElementById('go-dashboard-cta');
const backLandingBtn = document.getElementById('back-landing');
const dashboardLoader = document.getElementById('dashboard-loader');
const dashboardContent = document.getElementById('dashboard-content');
const dashboardDate = document.getElementById('dashboard-date');
const dashboardUpdateInfo = document.getElementById('dashboard-update-info');
const dashboardRefreshBtn = document.getElementById('dashboard-refresh');
const dashboardRefreshSpin = document.getElementById('dashboard-refresh-spin');
const dashboardAlert = document.getElementById('dashboard-alert');
const dashboardAlertMsg = document.getElementById('dashboard-alert-msg');
const dashboardDollar = document.getElementById('dashboard-dollar');
const dashboardCommodities = document.getElementById('dashboard-commodities');

function generateRandomData() {
  const dollarVariation = (Math.random() - 0.5) * 2;
  const dollarRate = 5.6656 + (Math.random() - 0.5) * 0.2;
  const commoditiesBase = [
    { id: 'boi_gordo', name: 'Boi Gordo', unit: '@', basePrice: 305.60, icon: '🐄' },
    { id: 'soja', name: 'Soja', unit: 'sc', basePrice: 128.01, icon: '🌱' },
    { id: 'trigo', name: 'Trigo', unit: 't', basePrice: 1537.32, icon: '🌾' },
    { id: 'cafe', name: 'Café Arábica', unit: 'sc', basePrice: 2423.72, icon: '☕' },
    { id: 'milho', name: 'Milho', unit: 'sc', basePrice: 70.82, icon: '🌽' },
    { id: 'leite', name: 'Leite', unit: 'litro', basePrice: 2.8241, icon: '🥛' }
  ];
  const commodities = commoditiesBase.map(commodity => {
    const variation = (Math.random() - 0.5) * 6;
    const priceMultiplier = 1 + (variation / 100);
    const price = commodity.basePrice * priceMultiplier;
    return {
      ...commodity,
      price: price,
      variation: variation,
      trend: variation >= 0 ? 'up' : 'down'
    };
  });
  return {
    dollar: {
      rate: dollarRate,
      variation: dollarVariation,
      trend: dollarVariation >= 0 ? 'up' : 'down'
    },
    commodities: commodities,
    lastUpdate: new Date()
  };
}

function renderDashboard() {
  const now = new Date();
  dashboardDate.textContent = now.toLocaleDateString('pt-BR');
  dashboardUpdateInfo.textContent = 'Atualização: ' + (dashboardLastUpdate ? dashboardLastUpdate.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '--:--');
  if (dashboardError) {
    dashboardAlert.classList.remove('hidden');
    dashboardAlertMsg.textContent = dashboardError;
  } else {
    dashboardAlert.classList.add('hidden');
  }
  if (dashboardData && dashboardData.dollar) {
    const d = dashboardData.dollar;
    dashboardDollar.innerHTML = `
      <div class="dashboard-dollar">
        <div class="dashboard-dollar-icon">💲</div>
        <div>
          <div class="dashboard-dollar-title">Dólar Comercial</div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="dashboard-dollar-value">R$ ${d.rate.toFixed(4)}</span>
            <span class="trend-badge ${d.trend === 'up' ? 'trend-up' : 'trend-down'}">
              ${d.trend === 'up' ? '▲' : '▼'} ${(d.variation >= 0 ? '+' : '') + d.variation.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    `;
  } else {
    dashboardDollar.innerHTML = '';
  }
  if (dashboardData && dashboardData.commodities) {
    dashboardCommodities.innerHTML = `
      <div class="dashboard-commodities">
        <div class="dashboard-commodities-header">
          <div class="dashboard-commodities-icon">☕</div>
          <div class="dashboard-commodities-title">Commodities Agrícolas</div>
        </div>
        <div class="commodities-grid">
          ${dashboardData.commodities.map(commodity => `
            <div class="commodity-card">
              <div class="commodity-header">
                <span class="commodity-icon">${commodity.icon}</span>
                <div>
                  <div class="commodity-name">${commodity.name}</div>
                  <div class="commodity-unit">(${commodity.unit})</div>
                </div>
              </div>
              <div class="commodity-footer">
                <span class="commodity-price">${formatPrice(commodity.price, commodity.unit)}</span>
                <span class="trend-badge ${commodity.trend === 'up' ? 'trend-up' : 'trend-down'}">
                  ${commodity.trend === 'up' ? '▲' : '▼'} ${(commodity.variation >= 0 ? '+' : '') + commodity.variation.toFixed(2)}%
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    dashboardCommodities.innerHTML = '';
  }
}

function formatPrice(price, unit) {
  if (unit === 'litro') {
    return `R$ ${price.toFixed(4)}`;
  }
  return `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function showDashboard() {
  landingPage.classList.add('hidden');
  dashboardPage.classList.remove('hidden');
  dashboardLoader.style.display = 'flex';
  dashboardContent.style.display = 'none';
  dashboardError = null;
  fetchDashboardData();
  dashboardInterval = setInterval(fetchDashboardData, 5000);
}

function hideDashboard() {
  landingPage.classList.remove('hidden');
  dashboardPage.classList.add('hidden');
  clearInterval(dashboardInterval);
}

function fetchDashboardData(force = false) {
  if (dashboardLoading && !force) return;
  dashboardLoading = true;
  dashboardRefreshBtn.disabled = true;
  dashboardRefreshSpin.style.animation = 'spin 1s linear infinite';
  dashboardLoader.style.display = dashboardData ? 'none' : 'flex';
  dashboardContent.style.display = dashboardData ? 'block' : 'none';
  dashboardError = null;
  setTimeout(() => {
    if (Math.random() < 0.1) {
      dashboardError = 'Erro ao carregar cotações. Tentando novamente...';
      dashboardData = generateRandomData();
    } else {
      dashboardData = generateRandomData();
      dashboardError = null;
    }
    dashboardLastUpdate = new Date();
    dashboardLoading = false;
    dashboardRefreshBtn.disabled = false;
    dashboardRefreshSpin.style.animation = '';
    dashboardLoader.style.display = 'none';
    dashboardContent.style.display = 'block';
    renderDashboard();
  }, 800 + Math.random() * 1200);
}

goDashboardBtn.onclick = showDashboard;
goDashboardCtaBtn.onclick = showDashboard;
backLandingBtn.onclick = hideDashboard;
dashboardRefreshBtn.onclick = () => fetchDashboardData(true);

renderDashboard();
