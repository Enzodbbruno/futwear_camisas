const express = require('express');
const router = express.Router();

const mercadoPagoService = require('../services/mercadoPagoService');
const stripeService = require('../services/stripeService');
const boaCompraService = require('../services/boaCompraService');

// PIX Payment (Mercado Pago)
router.post('/pix', async (req, res) => {
    try {
        const { orderData } = req.body;
        
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ error: 'Dados do pedido inválidos' });
        }

        const result = await mercadoPagoService.createPixPayment(orderData);
        res.json(result);
    } catch (error) {
        console.error('❌ PIX Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Card Payment (Stripe)
router.post('/card', async (req, res) => {
    try {
        const { orderData } = req.body;
        
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ error: 'Dados do pedido inválidos' });
        }

        const result = await stripeService.createPaymentIntent(orderData);
        res.json(result);
    } catch (error) {
        console.error('❌ Card Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Confirm Card Payment
router.post('/card/confirm', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment Intent ID é obrigatório' });
        }

        const result = await stripeService.confirmPayment(paymentIntentId);
        res.json(result);
    } catch (error) {
        console.error('❌ Card Confirm Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// BoaCompra Payment
router.post('/boacompra', async (req, res) => {
    try {
        const { orderData } = req.body;
        
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ error: 'Dados do pedido inválidos' });
        }

        const result = await boaCompraService.createTransaction(orderData);
        res.json(result);
    } catch (error) {
        console.error('❌ BoaCompra Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Payment Status
router.get('/status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { method } = req.query;

        let result;
        switch (method) {
            case 'mercadopago':
                result = await mercadoPagoService.getPaymentStatus(paymentId);
                break;
            case 'stripe':
                result = await stripeService.confirmPayment(paymentId);
                break;
            case 'boacompra':
                result = await boaCompraService.getTransactionStatus(paymentId);
                break;
            default:
                return res.status(400).json({ error: 'Método de pagamento inválido' });
        }

        res.json(result);
    } catch (error) {
        console.error('❌ Payment Status Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
