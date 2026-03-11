const walletAddress = document.getElementById('wallet-address');
const totalBalance = document.getElementById('total-balance');
const portfolioChange = document.getElementById('portfolio-change');
const assetCount = document.getElementById('asset-count');
const dailyPnl = document.getElementById('daily-pnl');
const topAsset = document.getElementById('top-asset');
const topAssetChange = document.getElementById('top-asset-change');
const portfolioBody = document.getElementById('portfolio-body');
const allocationList = document.getElementById('allocation-list');
const watchlist = document.getElementById('watchlist');
const transactionList = document.getElementById('transaction-list');
const insights = document.getElementById('insights');
const refreshDataButton = document.getElementById('refresh-data');
const searchInput = document.getElementById('search-input');
const addWatchlistButton = document.getElementById('add-watchlist');

let state = createState();

function randomInRange(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function createState() {
  const assets = [
    { name: 'Bitcoin', symbol: 'BTC', amount: randomInRange(0.08, 0.25, 4), price: randomInRange(68000, 72000), change: randomInRange(-3.2, 5.6) },
    { name: 'Ethereum', symbol: 'ETH', amount: randomInRange(1.2, 4.8, 4), price: randomInRange(3200, 3900), change: randomInRange(-4.1, 6.3) },
    { name: 'Solana', symbol: 'SOL', amount: randomInRange(10, 45, 2), price: randomInRange(110, 180), change: randomInRange(-5.5, 8.2) },
    { name: 'Tether', symbol: 'USDT', amount: randomInRange(800, 2500, 2), price: 1, change: randomInRange(-0.1, 0.1) },
  ];

  const watch = [
    { symbol: 'ARB', price: randomInRange(1.1, 1.8), change: randomInRange(-6, 6) },
    { symbol: 'OP', price: randomInRange(2, 4.5), change: randomInRange(-5, 5) },
    { symbol: 'LINK', price: randomInRange(14, 22), change: randomInRange(-4, 7) },
  ];

  const actions = ['mua', 'ban', 'hoan-doi', 'nhan'];
  const transactions = Array.from({ length: 5 }, (_, index) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    return {
      id: crypto.randomUUID(),
      action,
      asset: asset.symbol,
      amount: randomInRange(0.05, 2.4, 4),
      value: randomInRange(120, 4200),
      time: new Date(Date.now() - index * 5400 * 1000).toLocaleString('vi-VN'),
    };
  });

  return {
    wallet: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 4)}fa${crypto.randomUUID().replace(/-/g, '').slice(0, 6)}3b7d`,
    assets,
    watch,
    transactions,
  };
}

function computeOverview() {
  const values = state.assets.map((asset) => asset.amount * asset.price);
  const total = values.reduce((sum, value) => sum + value, 0);
  const weightedChange = state.assets.reduce((sum, asset) => sum + asset.change * asset.amount * asset.price, 0) / total;
  const pnl = total * (weightedChange / 100);
  const top = [...state.assets].sort((a, b) => b.change - a.change)[0];

  return { total, weightedChange, pnl, top };
}

function renderOverview() {
  const { total, weightedChange, pnl, top } = computeOverview();
  walletAddress.textContent = `${state.wallet.slice(0, 6)}...${state.wallet.slice(-4)}`;
  totalBalance.textContent = formatMoney(total);
  portfolioChange.textContent = `${weightedChange >= 0 ? '+' : ''}${weightedChange.toFixed(2)}% trong 24 giờ`;
  portfolioChange.className = weightedChange >= 0 ? 'positive' : 'negative';
  assetCount.textContent = String(state.assets.length);
  dailyPnl.textContent = `${pnl >= 0 ? '+' : ''}${formatMoney(pnl)}`;
  dailyPnl.className = pnl >= 0 ? 'positive' : 'negative';
  topAsset.textContent = top.symbol;
  topAssetChange.textContent = `${top.change >= 0 ? '+' : ''}${top.change.toFixed(2)}% trong 24 giờ`;
  topAssetChange.className = top.change >= 0 ? 'positive' : 'negative';
}

function renderPortfolio() {
  portfolioBody.innerHTML = '';
  const { total } = computeOverview();

  state.assets.forEach((asset) => {
    const value = asset.amount * asset.price;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="asset-name">
          <strong>${asset.name}</strong>
          <span class="asset-symbol">${asset.symbol}</span>
        </div>
      </td>
      <td>${asset.amount}</td>
      <td>${formatMoney(asset.price)}</td>
      <td>${formatMoney(value)}</td>
      <td class="${asset.change >= 0 ? 'positive' : 'negative'}">${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%</td>
    `;
    portfolioBody.appendChild(row);

    const percent = (value / total) * 100;
    const allocation = document.createElement('div');
    allocation.className = 'allocation-row';
    allocation.innerHTML = `
      <strong>${asset.symbol} - ${percent.toFixed(1)}%</strong>
      <small>${formatMoney(value)}</small>
      <div class="bar"><div class="bar-fill" style="width:${percent.toFixed(1)}%"></div></div>
    `;
    allocationList.appendChild(allocation);
  });
}

function renderWatchlist() {
  watchlist.innerHTML = '';
  state.watch.forEach((coin) => {
    const item = document.createElement('li');
    item.className = 'watch-item';
    item.innerHTML = `
      <div>
        <strong>${coin.symbol}</strong>
        <span>Giá hiện tại: ${formatMoney(coin.price)}</span>
      </div>
      <strong class="${coin.change >= 0 ? 'positive' : 'negative'}">${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%</strong>
    `;
    watchlist.appendChild(item);
  });
}

function renderTransactions() {
  transactionList.innerHTML = '';
  state.transactions.forEach((tx) => {
    const item = document.createElement('li');
    item.className = 'transaction-item';
    item.innerHTML = `
      <div class="transaction-main">
        <strong>${tx.asset}</strong>
        <span>${tx.amount} ${tx.asset}</span>
        <div class="badge ${tx.action}">${tx.action}</div>
      </div>
      <div class="transaction-meta">
        <strong>${formatMoney(tx.value)}</strong>
        <span>${tx.time}</span>
      </div>
    `;
    transactionList.appendChild(item);
  });
}

function renderInsights() {
  insights.innerHTML = '';
  const { total, weightedChange, top } = computeOverview();
  const messages = [
    `Danh mục hiện có giá trị khoảng ${formatMoney(total)} và đang ${weightedChange >= 0 ? 'tăng' : 'giảm'} trong 24 giờ gần nhất.`,
    `${top.name} là tài sản nổi bật nhất hôm nay với mức biến động ${top.change >= 0 ? 'tăng' : 'giảm'} ${Math.abs(top.change).toFixed(2)}%.`,
    'Tỷ trọng stablecoin giúp danh mục bớt biến động mạnh so với các tài sản tăng trưởng.',
  ];

  messages.forEach((message) => {
    const item = document.createElement('div');
    item.className = 'insight-item';
    item.innerHTML = `<p>${message}</p>`;
    insights.appendChild(item);
  });
}

function renderApp() {
  allocationList.innerHTML = '';
  renderOverview();
  renderPortfolio();
  renderWatchlist();
  renderTransactions();
  renderInsights();
}

refreshDataButton.addEventListener('click', () => {
  state = createState();
  renderApp();
});

addWatchlistButton.addEventListener('click', () => {
  const value = searchInput.value.trim().toUpperCase();
  if (!value) return;

  const exists = state.watch.some((coin) => coin.symbol === value);
  if (!exists) {
    state.watch.unshift({
      symbol: value,
      price: randomInRange(0.5, 250),
      change: randomInRange(-8, 8),
    });
  }

  searchInput.value = '';
  renderWatchlist();
});

renderApp();
