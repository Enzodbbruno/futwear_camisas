// Configurações dos gateways
const PAYMENT_CONFIG = {
    backendUrl: 'http://localhost:3001/api', // ou sua URL de produção
    stripePublicKey: 'pk_test_SEU_PUBLIC_KEY_AQUI', // Substitua pela sua chave pública
    mercadoPagoPublicKey: 'TEST-SEU_PUBLIC_KEY_AQUI' // Substitua pela sua chave pública
};

// Inicializar Stripe
let stripe, elements, cardElement;

async function initializeStripe() {
    if (typeof Stripe !== 'undefined') {
        stripe = Stripe(PAYMENT_CONFIG.stripePublicKey);
        elements = stripe.elements();
        
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
            },
        });
        
        cardElement.mount('#card-element');
        
        cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }
}

// Processar PIX
async function processPixPayment(orderData) {
    try {
        console.log('🔄 Processando pagamento PIX...');
        
        const response = await fetch(`${PAYMENT_CONFIG.backendUrl}/payments/pix`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderData })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mostrar QR Code
            showPixModal(result.qrCode, result.qrCodeBase64);
            return result;
        } else {
            throw new Error(result.error || 'Erro ao criar pagamento PIX');
        }
    } catch (error) {
        console.error('❌ PIX Payment Error:', error);
        throw error;
    }
}

// Processar Cartão
async function processCardPayment(orderData) {
    try {
        console.log('🔄 Processando pagamento com cartão...');
        
        const response = await fetch(`${PAYMENT_CONFIG.backendUrl}/payments/card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderData })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Confirmar pagamento com Stripe
            const {error, paymentIntent} = await stripe.confirmCardPayment(result.clientSecret);
            
            if (error) {
                throw new Error(error.message);
            } else {
                console.log('✅ Pagamento com cartão aprovado:', paymentIntent);
                return { success: true, paymentIntent };
            }
        } else {
            throw new Error(result.error || 'Erro ao criar pagamento com cartão');
        }
    } catch (error) {
        console.error('❌ Card Payment Error:', error);
        throw error;
    }
}

// Processar BoaCompra
async function processBoaCompraPayment(orderData) {
    try {
        console.log('🔄 Processando pagamento BoaCompra...');
        
        const response = await fetch(`${PAYMENT_CONFIG.backendUrl}/payments/boacompra`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderData })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirecionar para BoaCompra
            window.location.href = result.checkoutUrl;
            return result;
        } else {
            throw new Error(result.error || 'Erro ao criar pagamento BoaCompra');
        }
    } catch (error) {
        console.error('❌ BoaCompra Payment Error:', error);
        throw error;
    }
}

// Mostrar modal PIX
function showPixModal(qrCode, qrCodeBase64) {
    const modal = document.getElementById('pixModal');
    const qrCodeElement = document.getElementById('pixQRCode');
    
    if (qrCodeBase64) {
        qrCodeElement.innerHTML = `<img src="data:image/png;base64,${qrCodeBase64}" alt="QR Code PIX" class="mx-auto">`;
    } else if (qrCode) {
        qrCodeElement.innerHTML = `<div class="text-center"><p class="text-sm text-gray-600 mb-2">Código PIX:</p><p class="font-mono text-xs break-all">${qrCode}</p></div>`;
    }
    
    modal.classList.remove('hidden');
    
    // Copiar código PIX
    window.copyPixCode = function() {
        if (qrCode) {
            navigator.clipboard.writeText(qrCode).then(() => {
                showToast('Código PIX copiado!', 'success');
            });
        }
    };
}

// Verificar status do pagamento
async function checkPaymentStatus(paymentId, method) {
    try {
        const response = await fetch(`${PAYMENT_CONFIG.backendUrl}/payments/status/${paymentId}?method=${method}`);
        const result = await response.json();
        
        return result;
    } catch (error) {
        console.error('❌ Payment Status Error:', error);
        return { success: false, error: error.message };
    }
}

// Função principal de pagamento
async function processPayment(orderData, paymentMethod) {
    try {
        let result;
        
        switch (paymentMethod) {
            case 'pix':
                result = await processPixPayment(orderData);
                break;
            case 'credit':
                result = await processCardPayment(orderData);
                break;
            case 'boacompra':
                result = await processBoaCompraPayment(orderData);
                break;
            default:
                throw new Error('Método de pagamento inválido');
        }
        
        return result;
    } catch (error) {
        console.error('❌ Payment Processing Error:', error);
        throw error;
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
});

// Exportar funções globais
window.processPayment = processPayment;
window.checkPaymentStatus = checkPaymentStatus;
window.copyPixCode = copyPixCode;
