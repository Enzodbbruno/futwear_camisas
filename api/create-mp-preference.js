const mercadopago = require('mercadopago');
const admin = require('firebase-admin');

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

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

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' });
    mercadopago.configure({ access_token: token });
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey && privateKey.includes('\\n')) privateKey = privateKey.replace(/\\n/g, '\n');
      admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
    }
    const db = admin.firestore();

    const body = await parseJSON(req);
    const { items = [], shipping = 0, discount = 0, metadata = {} } = body || {};

    const originProto = (req.headers['x-forwarded-proto'] || 'https').toString();
    const host = req.headers.host;
    const baseUrl = `${originProto}://${host}`;

    const mpItems = buildMpItems(items);
    const preference = {
      items: mpItems,
      back_urls: {
        success: `${baseUrl}/checkout-success.html`,
        pending: `${baseUrl}/checkout-pending.html`,
        failure: `${baseUrl}/checkout-error.html`,
      },
      auto_return: 'approved',
      binary_mode: false,
      statement_descriptor: 'FUTWEAR',
      external_reference: body.external_reference || `fw_${Date.now()}`,
      metadata,
    };

    const ship = Number(shipping || 0);
    if (ship > 0) preference.shipments = { cost: Number(ship.toFixed(2)), mode: 'not_specified' };

    const disc = Number(discount || 0);
    if (disc > 0) preference.items.push({ title: 'Desconto', quantity: 1, unit_price: Number((-disc).toFixed(2)), currency_id: 'BRL' });

    const result = await mercadopago.preferences.create(preference);
    const pref = result && result.body ? result.body : result;

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
        discount
      }, { merge: true });
    } catch { }

    return res.status(200).json({ init_point: pref.init_point || pref.sandbox_init_point, preference_id: pref.id });
  } catch (err) {
    console.error('create-mp-preference error:', err);
    return res.status(500).json({ error: 'Erro ao criar preferência' });
  }
};
