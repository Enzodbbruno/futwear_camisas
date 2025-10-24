/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const Stripe = require('stripe');
const crypto = require('crypto');
const mercadopago = require('mercadopago');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Initialize Stripe
let cfg = {};
try { cfg = require('firebase-functions').config ? require('firebase-functions').config() : {}; } catch { cfg = {}; }
const STRIPE_SECRET = process.env.STRIPE_SECRET || (cfg.stripe && cfg.stripe.secret);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || (cfg.stripe && cfg.stripe.webhook_secret);
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20' }) : null;
// Mercado Pago config
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || (cfg.mercadopago && cfg.mercadopago.access_token);
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || (cfg.mercadopago && cfg.mercadopago.webhook_secret);
if (MP_ACCESS_TOKEN) {
  try { mercadopago.configure({ access_token: MP_ACCESS_TOKEN }); } catch {}
}

// Helper to build line items including personalization fee
function buildLineItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const qty = Number(it.quantity || 1);
    const base = Number(it.price || 0);
    const fee = it.personalization && it.personalization.enabled ? Number(it.personalization.fee || 0) : 0;
    const unit = Math.round((base + fee) * 100); // cents
    return {
      price_data: {
        currency: 'brl',
        product_data: { name: it.name || it.id || 'Item' },
        unit_amount: unit,
      },
      quantity: qty,
    };
  });
}

exports.createCheckoutSession = onRequest({ region: 'us-central1' }, async (req, res) => {
  // CORS simples
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe não configurado. Defina STRIPE_SECRET.' });

    const { items = [], shipping = 0, discount = 0, method = 'auto', metadata = {}, successUrl, cancelUrl } = req.body || {};
    const line_items = buildLineItems(items);

    // Shipping e desconto como ajustes
    const shippingAmount = Math.max(0, Math.round(Number(shipping || 0) * 100));
    const discountAmount = Math.max(0, Math.round(Number(discount || 0) * 100));

    const pmTypes = method === 'pix' ? ['pix'] : method === 'card' ? ['card'] : ['card', 'pix'];

    const projectId = 'futwear-3eae2';
    const defaultSuccess = successUrl || `https://${projectId}.web.app/checkout-success.html`;
    const defaultCancel = cancelUrl || `https://${projectId}.web.app/checkout-error.html`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'brl',
      payment_method_types: pmTypes,
      line_items,
      success_url: `${defaultSuccess}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: defaultCancel,
      locale: 'pt-BR',
      metadata: metadata || {},
      discounts: discountAmount > 0 ? [{ coupon: await (async () => {
        // Cria um cupom de valor fixo ad-hoc se houver desconto
        const c = await stripe.coupons.create({ amount_off: discountAmount, currency: 'brl', duration: 'once' });
        return c.id;
      })() }] : undefined,
      shipping_options: shippingAmount > 0 ? [{ shipping_rate_data: { display_name: 'Frete', type: 'fixed_amount', fixed_amount: { amount: shippingAmount, currency: 'brl' } } }] : undefined,
    });

    // Gravar pedido preliminar
    try {
      await db.collection('orders').doc(session.id).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        paymentStatus: 'pending',
        sessionId: session.id,
        url: session.url,
        items,
        shipping,
        discount,
        method,
      });
    } catch (e) {}

    return res.status(200).json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    return res.status(500).json({ error: 'Erro ao criar sessão de checkout' });
  }
});

// ===================== MERCADO PAGO (Checkout Pro) =====================
function buildMpItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const qty = Number(it.quantity || 1);
    const base = Number(it.price || 0);
    const fee = it.personalization && it.personalization.enabled ? Number(it.personalization.fee || 0) : 0;
    const unit = Number((base + fee).toFixed(2));
    return {
      title: it.name || it.id || 'Item',
      quantity: qty,
      unit_price: unit,
      currency_id: 'BRL',
    };
  });
}

exports.createMpPreference = onRequest({ region: 'us-central1' }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!MP_ACCESS_TOKEN) return res.status(500).json({ error: 'Mercado Pago não configurado. Defina MP_ACCESS_TOKEN.' });

    const { items = [], shipping = 0, discount = 0, metadata = {} } = req.body || {};
    const projectId = 'futwear-3eae2';
    const success = `https://${projectId}.web.app/checkout-success.html`;
    const failure = `https://${projectId}.web.app/checkout-error.html`;
    const pending = `https://${projectId}.web.app/checkout-pending.html`;

    const mpItems = buildMpItems(items);
    const preference = {
      items: mpItems,
      back_urls: { success, failure, pending },
      auto_return: 'approved',
      binary_mode: false,
      statement_descriptor: 'FUTWEAR',
      external_reference: `fw_${Date.now()}`,
      metadata,
    };
    // Ajustes de frete e desconto via charges/shipments quando aplicável
    const ship = Number(shipping || 0);
    if (ship > 0) {
      preference.shipments = { cost: Number(ship.toFixed(2)), mode: 'not_specified' };
    }
    const disc = Number(discount || 0);
    if (disc > 0) {
      // Mercado Pago não tem desconto simples via API, podemos adicionar item negativo como crédito
      preference.items.push({ title: 'Desconto', quantity: 1, unit_price: Number((-disc).toFixed(2)), currency_id: 'BRL' });
    }

    const result = await mercadopago.preferences.create(preference);
    const pref = result && result.body ? result.body : result;

    // Salvar ordem preliminar
    try {
      await db.collection('orders').doc(pref.id).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        paymentStatus: 'pending',
        provider: 'mercadopago',
        preferenceId: pref.id,
        init_point: pref.init_point,
        sandbox_init_point: pref.sandbox_init_point,
        items,
        shipping,
        discount,
      });
    } catch {}

    return res.status(200).json({ init_point: pref.init_point || pref.sandbox_init_point, preference_id: pref.id });
  } catch (err) {
    console.error('createMpPreference error:', err);
    return res.status(500).json({ error: 'Erro ao criar preferência no Mercado Pago' });
  }
});

exports.mpWebhook = onRequest({ region: 'us-central1' }, async (req, res) => {
  // Verificação básica do X-Signature (ts e v1=hmacSha256(`${id}:${ts}`, secret))
  try {
    if (!MP_WEBHOOK_SECRET) {
      console.warn('MP webhook secret ausente');
    } else {
      const sig = req.headers['x-signature'];
      if (sig) {
        const parts = sig.split(',').reduce((acc, p) => { const [k, v] = p.split('='); acc[k.trim()] = (v || '').trim(); return acc; }, {});
        const ts = parts.ts;
        const v1 = parts.v1;
        const id = (req.body && req.body.data && req.body.data.id) || req.query.id || '';
        const text = `${id}:${ts}`;
        const hmac = crypto.createHmac('sha256', MP_WEBHOOK_SECRET).update(text).digest('hex');
        if (v1 && hmac !== v1) {
          console.warn('Assinatura MP inválida');
          // continue but mark as unverified
        }
      }
    }

    const topic = req.query.type || req.query.topic || (req.body && req.body.type) || (req.body && req.body.action);
    const dataId = (req.body && req.body.data && req.body.data.id) || req.query['data.id'] || req.query.id;

    if (!topic || !dataId) {
      return res.status(200).send('ok');
    }

    if (!MP_ACCESS_TOKEN) return res.status(500).send('no token');

    // Buscar pagamento/merchant_order para confirmar
    if (String(topic).includes('payment')) {
      try {
        const payment = await mercadopago.payment.findById(dataId);
        const p = payment && payment.body ? payment.body : payment;
        if (p && p.status === 'approved') {
          const prefId = p.additional_info && p.additional_info.items && p.additional_info.items.length ? p.order ? p.order.id : p.metadata && p.metadata.preference_id : p.metadata && p.metadata.preference_id;
          const docId = prefId || p.metadata && p.metadata.order_id || p.id;
          await db.collection('orders').doc(docId).set({
            status: 'completed',
            paymentStatus: 'paid',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            payment: { id: p.id, status: p.status, status_detail: p.status_detail }
          }, { merge: true });
        }
      } catch (e) {
        console.error('Erro ao consultar pagamento MP:', e);
      }
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('mpWebhook error:', err);
    return res.status(500).send('internal');
  }
});

exports.stripeWebhook = onRequest({ region: 'us-central1' }, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET ausente');
    return res.status(400).send('Missing webhook secret');
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await db.collection('orders').doc(session.id).set({
        status: 'completed',
        paymentStatus: 'paid',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    return res.status(200).send('ok');
  } catch (err) {
    console.error('stripeWebhook handler error:', err);
    return res.status(500).send('internal');
  }
});
