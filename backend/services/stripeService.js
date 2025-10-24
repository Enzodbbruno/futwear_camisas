const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
    // Criar Payment Intent para cartão
    async createPaymentIntent(orderData) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(orderData.total * 100), // Stripe usa centavos
                currency: 'brl',
                metadata: {
                    orderId: orderData.orderId,
                    customerEmail: orderData.customer.email
                },
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return {
                success: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            console.error('❌ Stripe Error:', error);
            throw new Error('Erro ao criar pagamento Stripe');
        }
    }

    // Confirmar pagamento
    async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            return {
                success: true,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100, // Converter de centavos
                currency: paymentIntent.currency
            };
        } catch (error) {
            console.error('❌ Stripe Confirm Error:', error);
            throw new Error('Erro ao confirmar pagamento Stripe');
        }
    }

    // Criar Payment Method
    async createPaymentMethod(cardData) {
        try {
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    number: cardData.number,
                    exp_month: cardData.expMonth,
                    exp_year: cardData.expYear,
                    cvc: cardData.cvc
                },
                billing_details: {
                    name: cardData.name,
                    email: cardData.email
                }
            });

            return {
                success: true,
                paymentMethodId: paymentMethod.id
            };
        } catch (error) {
            console.error('❌ Stripe Payment Method Error:', error);
            throw new Error('Erro ao criar método de pagamento');
        }
    }

    // Verificar webhook
    verifyWebhook(payload, signature) {
        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
            return event;
        } catch (error) {
            console.error('❌ Stripe Webhook Error:', error);
            throw new Error('Webhook inválido');
        }
    }
}

module.exports = new StripeService();
