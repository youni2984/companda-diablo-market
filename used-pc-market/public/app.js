const grid = document.querySelector('#productGrid');
const template = document.querySelector('#productTemplate');
const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');
const resultCount = document.querySelector('#resultCount');
const sellDialog = document.querySelector('#sellDialog');
const sellForm = document.querySelector('#sellForm');

let products = [];

const won = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 });

function render() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = products.filter((item) => {
    const haystack = `${item.title} ${item.specs} ${item.location}`.toLowerCase();
    return (!keyword || haystack.includes(keyword)) && (!category || item.category === category);
  });

  grid.innerHTML = '';
  resultCount.textContent = `${filtered.length}개 상품`;

  for (const item of filtered) {
    const node = template.content.cloneNode(true);
    node.querySelector('.thumb').textContent = item.category === '그래픽카드' ? 'GPU' : item.category === 'SSD/HDD' ? 'SSD' : 'PC';
    node.querySelector('.category').textContent = item.category;
    node.querySelector('.status').textContent = item.status;
    node.querySelector('.title').textContent = item.title;
    node.querySelector('.specs').textContent = item.specs || '상세 사양 미입력';
    node.querySelector('.meta').textContent = `${item.condition} · ${item.location}`;
    node.querySelector('.price').textContent = won.format(item.price);
    node.querySelector('.pay-btn').addEventListener('click', () => startKakaoPay(item));
    grid.append(node);
  }
}

async function loadProducts() {
  const response = await fetch('/api/products');
  products = await response.json();
  render();
}

async function startKakaoPay(item) {
  const buttonText = `카카오페이로 ${won.format(item.price)} 결제를 진행합니다.`;
  if (!window.confirm(buttonText)) return;

  try {
    const response = await fetch('/api/payments/kakaopay/ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: item.id, userId: 'guest-web' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || '결제 준비 실패');

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile ? data.nextRedirectMobileUrl : data.nextRedirectPcUrl;
    if (!url) throw new Error('결제 이동 URL을 받지 못했습니다.');
    window.location.href = url;
  } catch (error) {
    alert(error.message);
  }
}

searchInput.addEventListener('input', render);
categoryFilter.addEventListener('change', render);
document.querySelector('#sellOpenBtn').addEventListener('click', () => sellDialog.showModal());
document.querySelector('#sellCloseBtn').addEventListener('click', () => sellDialog.close());

sellForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(sellForm).entries());
  payload.price = Number(payload.price);

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || '상품 등록 실패');
    products.unshift(data);
    sellForm.reset();
    sellDialog.close();
    render();
  } catch (error) {
    alert(error.message);
  }
});

loadProducts().catch(() => {
  resultCount.textContent = '상품 목록을 불러오지 못했습니다.';
});
