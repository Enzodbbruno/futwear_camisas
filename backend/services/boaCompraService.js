const axios = require('axios');

class BoaCompraService {
    constructor() {
        this.baseURL = process.env.BOACOMPRA_ENVIRONMENT === 'production' 
            ? 'https://api.boacompra.com' 
            : 'https://api-sandbox.boacompra.com';
        
        this.merchantId = process.env.BOACOMPRA_MERCHANT_ID;
        this.apiKey = process.env.BOACOMPRA_API_KEY;
    }

    // Criar transação BoaCompra
    async createTransaction(orderData) {
        try {
            const transactionData = {
                merchant_id: this.merchantId,
                api_key: this.apiKey,
                amount: orderData.total,
                currency: 'BRL',
                reference: orderData.orderId,
                customer: {
                    name: orderData.customer.name,
                    email: orderData.customer.email,
                    phone: orderData.customer.phone,
                    address: {
                        street: orderData.customer.address.street,
                        number: orderData.customer.address.number,
                        complement: orderData.customer.address.complement,
                        neighborhood: orderData.customer.address.neighborhood,
                        city: orderData.customer.address.city,
                        state: orderData.customer.address.state,
                        zipcode: orderData.customer.address.cep
                    }
                },
                products: orderData.items.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    description: `Tamanho: ${item.size}`
                })),
                return_url: `${process.env.FRONTEND_URL}/checkout-success.html`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout-error.html`,
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/boacompra`
            };

            const response = await axios.post(`${this.baseURL}/v1/transactions`, transactionData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return {
                success: true,
                transactionId: response.data.transaction_id,
                checkoutUrl: response.data.checkout_url,
                status: response.data.status
            };
        } catch (error) {
            console.error('❌ BoaCompra Error:', error.response?.data || error.message);
            throw new Error('Erro ao criar transação BoaCompra');
        }
    }

    // Verificar status da transação
    async getTransactionStatus(transactionId) {
        try {
            const response = await axios.get(`${this.baseURL}/v1/transactions/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return {
                success: true,
                status: response.data.status,
                amount: response.data.amount,
                currency: response.data.currency
            };
        } catch (error) {
            console.error('❌ BoaCompra Status Error:', error.response?.data || error.message);
            throw new Error('Erro ao verificar status da transação');
        }
    }

    // Processar webhook
    async processWebhook(webhookData) {
        try {
            // Verificar assinatura do webhook (implementar conforme documentação BoaCompra)
            const isValid = this.verifyWebhookSignature(webhookData);
            
            if (!isValid) {
                throw new Error('Webhook inválido');
            }

            return {
                success: true,
                transactionId: webhookData.transaction_id,
                status: webhookData.status,
                amount: webhookData.amount
            };
        } catch (error) {
            console.error('❌ BoaCompra Webhook Error:', error);
            throw new Error('Erro ao processar webhook BoaCompra');
        }
    }

    // Verificar assinatura do webhook (implementar conforme documentação)
    verifyWebhookSignature(webhookData) {
        // Implementar verificação de assinatura conforme documentação BoaCompra
        // Por enquanto, retornar true para desenvolvimento
        return true;
    }
}

module.exports = new BoaCompraService();
