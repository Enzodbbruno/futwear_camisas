const express = require('express');
const router = express.Router();

const mercadoPagoService = require('../services/mercadoPagoService');
const stripeService = require('../services/stripeService');
const boaCompraService = require('../services/boaCompraService');

// Webhook Mercado Pago
router.post('/mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log('🔔 Mercado Pago Webhook:', { type, data });

        if (type === 'payment') {
            const paymentId = data.id;
            const paymentStatus = await mercadoPagoService.getPaymentStatus(paymentId);
            
            // Atualizar status do pedido no banco de dados
            await updateOrderStatus(paymentStatus);
            
            console.log('✅ Payment status updated:', paymentStatus);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Mercado Pago Webhook Error:', error);
        res.status(500).send('Error');
    }
});

// Webhook Stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const event = stripeService.verifyWebhook(req.body, signature);
        
        console.log('🔔 Stripe Webhook:', event.type);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            
            // Atualizar status do pedido
            await updateOrderStatus({
                id: paymentIntent.id,
                status: 'approved',
                amount: paymentIntent.amount / 100
            });
            
            console.log('✅ Stripe payment succeeded:', paymentIntent.id);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Stripe Webhook Error:', error);
        res.status(400).send('Webhook Error');
    }
});

// Webhook BoaCompra
router.post('/boacompra', async (req, res) => {
    try {
        const webhookData = req.body;
        
        console.log('🔔 BoaCompra Webhook:', webhookData);

        const result = await boaCompraService.processWebhook(webhookData);
        
        if (result.success) {
            // Atualizar status do pedido
            await updateOrderStatus({
                id: result.transactionId,
                status: result.status,
                amount: result.amount
            });
            
            console.log('✅ BoaCompra payment processed:', result.transactionId);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ BoaCompra Webhook Error:', error);
        res.status(500).send('Error');
    }
});

// Função para atualizar status do pedido
async function updateOrderStatus(paymentData) {
    try {
        // Aqui você salvaria no banco de dados
        // Por enquanto, vamos apenas logar
        console.log('📝 Updating order status:', paymentData);
        
        // Exemplo de como salvar no banco:
        // const order = await Order.findOne({ orderId: paymentData.external_reference });
        // if (order) {
        //     order.payment.status = paymentData.status;
        //     order.payment.transactionId = paymentData.id;
        //     await order.save();
        // }
        
        return true;
    } catch (error) {
        console.error('❌ Update Order Status Error:', error);
        return false;
    }
}

module.exports = router;
