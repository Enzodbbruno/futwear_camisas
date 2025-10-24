const crypto = require('crypto');
const mercadopago = require('mercadopago');

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  // Mercado Pago pode enviar GET (ping) e POST (notificação)
  if (req.method === 'GET') return res.status(200).send('ok');
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    // Validação básica do X-Signature: v1 = HMAC_SHA256(`${id}:${ts}`, secret)
    const secret = process.env.MP_WEBHOOK_SECRET;
    const sig = req.headers['x-signature'];
    const body = await parseJSON(req);

    if (secret && sig) {
      try {
        const parts = sig.split(',').reduce((acc, p) => { const [k, v] = p.split('='); acc[k.trim()] = (v || '').trim(); return acc; }, {});
        const ts = parts.ts;
        const v1 = parts.v1;
        const id = (body && body.data && body.data.id) || req.query.id || '';
        const text = `${id}:${ts}`;
        const hmac = crypto.createHmac('sha256', secret).update(text).digest('hex');
        if (v1 && hmac !== v1) console.warn('MP assinatura inválida');
      } catch (e) {
        console.warn('Falha ao validar assinatura MP');
      }
    }

    // Se quiser consultar o pagamento para confirmar STATUS APPROVED:
    const token = process.env.MP_ACCESS_TOKEN;
    if (token) mercadopago.configure({ access_token: token });

    const topic = req.query.type || req.query.topic || (body && body.type) || (body && body.action);
    const dataId = (body && body.data && body.data.id) || req.query['data.id'] || req.query.id;

    if (token && dataId && String(topic).includes('payment')) {
      try {
        const payment = await mercadopago.payment.findById(dataId);
        const p = payment && payment.body ? payment.body : payment;
        console.log('MP payment status:', p && p.status, 'id:', dataId);
        // TODO: Se desejar, integrar com Firestore/DB aqui.
      } catch (e) {
        console.error('Erro consultando pagamento MP:', e.message);
      }
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('mp-webhook error:', err);
    return res.status(200).send('ok');
  }
};
