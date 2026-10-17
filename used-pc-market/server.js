import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const KAKAOPAY_CID = process.env.KAKAOPAY_CID || 'TC0ONETIME';
const KAKAOPAY_SECRET_KEY = process.env.KAKAOPAY_SECRET_KEY || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const products = [
  {
    id: 'pc-001',
    title: '라이젠 5600 / RTX 3060 게이밍 PC',
    category: '완제품 PC',
    price: 550000,
    location: '경남 창원',
    condition: '중고 A급',
    specs: 'Ryzen 5 5600 · RTX 3060 12GB · RAM 16GB · NVMe 500GB',
    status: '판매중'
  },
  {
    id: 'gpu-001',
    title: 'RTX 3070 8GB 그래픽카드',
    category: '그래픽카드',
    price: 280000,
    location: '부산',
    condition: '중고 B+급',
    specs: 'RTX 3070 8GB · 정상작동 · 테스트 완료',
    status: '판매중'
  },
  {
    id: 'ssd-001',
    title: '삼성 NVMe SSD 1TB',
    category: 'SSD/HDD',
    price: 70000,
    location: '서울',
    condition: '중고 A급',
    specs: 'NVMe 1TB · SMART 정상 · 사용시간 확인 가능',
    status: '판매중'
  }
];

const payments = new Map();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'companda-used-pc-market' });
});

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { title, category, price, location, condition, specs } = req.body || {};
  if (!title || !category || !price) {
    return res.status(400).json({ message: '상품명, 분류, 가격은 필수입니다.' });
  }

  const product = {
    id: `item-${Date.now()}`,
    title: String(title),
    category: String(category),
    price: Number(price),
    location: location ? String(location) : '지역 미입력',
    condition: condition ? String(condition) : '중고',
    specs: specs ? String(specs) : '',
    status: '판매중'
  };
  products.unshift(product);
  res.status(201).json(product);
});

app.post('/api/payments/kakaopay/ready', async (req, res) => {
  try {
    if (!KAKAOPAY_SECRET_KEY) {
      return res.status(503).json({ message: 'KAKAOPAY_SECRET_KEY가 설정되지 않았습니다.' });
    }

    const { productId, userId = 'guest' } = req.body || {};
    const product = products.find((item) => item.id === productId);
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });

    const orderId = `ORDER-${Date.now()}`;
    const response = await fetch('https://open-api.kakaopay.com/online/v1/payment/ready', {
      method: 'POST',
      headers: {
        Authorization: `SECRET_KEY ${KAKAOPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cid: KAKAOPAY_CID,
        partner_order_id: orderId,
        partner_user_id: String(userId),
        item_name: product.title,
        quantity: 1,
        total_amount: product.price,
        tax_free_amount: 0,
        approval_url: `${BASE_URL}/payment-success.html?orderId=${encodeURIComponent(orderId)}`,
        cancel_url: `${BASE_URL}/?payment=cancel`,
        fail_url: `${BASE_URL}/?payment=fail`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: '카카오페이 결제 준비 실패', detail: data });
    }

    payments.set(orderId, {
      orderId,
      userId: String(userId),
      productId: product.id,
      tid: data.tid,
      amount: product.price,
      status: 'READY',
      createdAt: new Date().toISOString()
    });

    res.json({
      orderId,
      tid: data.tid,
      nextRedirectPcUrl: data.next_redirect_pc_url,
      nextRedirectMobileUrl: data.next_redirect_mobile_url,
      nextRedirectAppUrl: data.next_redirect_app_url
    });
  } catch (error) {
    res.status(500).json({ message: '결제 준비 중 서버 오류', detail: error.message });
  }
});

app.post('/api/payments/kakaopay/approve', async (req, res) => {
  try {
    if (!KAKAOPAY_SECRET_KEY) {
      return res.status(503).json({ message: 'KAKAOPAY_SECRET_KEY가 설정되지 않았습니다.' });
    }

    const { orderId, pgToken } = req.body || {};
    const payment = payments.get(orderId);
    if (!payment) return res.status(404).json({ message: '결제 주문 정보를 찾을 수 없습니다.' });
    if (!pgToken) return res.status(400).json({ message: 'pg_token이 필요합니다.' });

    const response = await fetch('https://open-api.kakaopay.com/online/v1/payment/approve', {
      method: 'POST',
      headers: {
        Authorization: `SECRET_KEY ${KAKAOPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cid: KAKAOPAY_CID,
        tid: payment.tid,
        partner_order_id: payment.orderId,
        partner_user_id: payment.userId,
        pg_token: pgToken
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: '카카오페이 결제 승인 실패', detail: data });
    }

    payment.status = 'PAID';
    payment.approvedAt = new Date().toISOString();
    payment.approvedResponse = data;
    payments.set(orderId, payment);

    res.json({ ok: true, payment: data });
  } catch (error) {
    res.status(500).json({ message: '결제 승인 중 서버 오류', detail: error.message });
  }
});

app.post('/api/payments/kakaopay/cancel', async (req, res) => {
  try {
    if (!KAKAOPAY_SECRET_KEY) {
      return res.status(503).json({ message: 'KAKAOPAY_SECRET_KEY가 설정되지 않았습니다.' });
    }

    const { orderId } = req.body || {};
    const payment = payments.get(orderId);
    if (!payment) return res.status(404).json({ message: '결제 주문 정보를 찾을 수 없습니다.' });

    const response = await fetch('https://open-api.kakaopay.com/online/v1/payment/cancel', {
      method: 'POST',
      headers: {
        Authorization: `SECRET_KEY ${KAKAOPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cid: KAKAOPAY_CID,
        tid: payment.tid,
        cancel_amount: payment.amount,
        cancel_tax_free_amount: 0
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: '카카오페이 결제 취소 실패', detail: data });
    }

    payment.status = 'CANCELLED';
    payment.cancelledAt = new Date().toISOString();
    payments.set(orderId, payment);

    res.json({ ok: true, cancellation: data });
  } catch (error) {
    res.status(500).json({ message: '결제 취소 중 서버 오류', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Companda Used PC Market: ${BASE_URL}`);
});
