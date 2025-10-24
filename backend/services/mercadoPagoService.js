const mercadopago = require('mercadopago');

// Configurar Mercado Pago
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

class MercadoPagoService {
    // Criar preferência PIX
    async createPixPayment(orderData) {
        try {
            const preference = {
                items: orderData.items.map(item => ({
                    title: item.name,
                    quantity: item.quantity,
                    unit_price: item.price
                })),
                payment_methods: {
                    excluded_payment_methods: [
                        { id: 'credit_card' },
                        { id: 'debit_card' }
                    ],
                    excluded_payment_types: [],
                    installments: 1
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL}/checkout-success.html`,
                    failure: `${process.env.FRONTEND_URL}/checkout-error.html`,
                    pending: `${process.env.FRONTEND_URL}/checkout-pending.html`
                },
                auto_return: 'approved',
                external_reference: orderData.orderId,
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
            };

            const response = await mercadopago.preferences.create(preference);
            
            return {
                success: true,
                paymentId: response.body.id,
                qrCode: response.body.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: response.body.point_of_interaction?.transaction_data?.qr_code_base64,
                initPoint: response.body.init_point
            };
        } catch (error) {
            console.error('❌ Mercado Pago PIX Error:', error);
            throw new Error('Erro ao criar pagamento PIX');
        }
    }

    // Criar pagamento com cartão
    async createCardPayment(orderData, paymentMethodId) {
        try {
            const payment = {
                transaction_amount: orderData.total,
                token: paymentMethodId,
                description: `Pedido ${orderData.orderId}`,
                installments: 1,
                payment_method_id: 'visa', // ou 'mastercard', 'elo'
                issuer_id: 310,
                payer: {
                    email: orderData.customer.email,
                    identification: {
                        type: 'CPF',
                        number: orderData.customer.cpf
                    }
                }
            };

            const response = await mercadopago.payment.create(payment);
            
            return {
                success: true,
                paymentId: response.body.id,
                status: response.body.status,
                statusDetail: response.body.status_detail
            };
        } catch (error) {
            console.error('❌ Mercado Pago Card Error:', error);
            throw new Error('Erro ao processar pagamento com cartão');
        }
    }

    // Verificar status do pagamento
    async getPaymentStatus(paymentId) {
        try {
            const response = await mercadopago.payment.findById(paymentId);
            return {
                id: response.body.id,
                status: response.body.status,
                statusDetail: response.body.status_detail,
                amount: response.body.transaction_amount
            };
        } catch (error) {
            console.error('❌ Mercado Pago Status Error:', error);
            throw new Error('Erro ao verificar status do pagamento');
        }
    }
}

module.exports = new MercadoPagoService();
