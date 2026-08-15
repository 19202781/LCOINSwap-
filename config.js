// ========================
// CONFIGURACIÓN SEGURA
// ========================

// Cargar variables de entorno de forma segura
const CONFIG = {
    // APIs
    SOLSCAN_API_KEY: getEnvVar('VITE_SOLSCAN_API_KEY'),
    SOLANA_NETWORK: getEnvVar('VITE_SOLANA_NETWORK', 'devnet'),
    SOLANA_RPC_URL: getEnvVar('VITE_SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
    JUPITER_API: getEnvVar('VITE_JUPITER_API', 'https://quote-api.jup.ag/v6'),
    PUMP_FUN_API: getEnvVar('VITE_PUMP_FUN_API', 'https://pump.fun/api'),
    COINGECKO_API: getEnvVar('VITE_COINGECKO_API', 'https://api.coingecko.com/api/v3'),
    SOLSCAN_API_URL: getEnvVar('VITE_SOLSCAN_API', 'https://public-api.solscan.io'),
    
    // Seguridad
    ENABLE_CSP: getEnvVar('VITE_ENABLE_CSP', 'true') === 'true',
    ENABLE_CORS_CHECK: getEnvVar('VITE_ENABLE_CORS_CHECK', 'true') === 'true',
    MAX_TRANSACTION_AMOUNT: parseFloat(getEnvVar('VITE_MAX_TRANSACTION_AMOUNT', '1000')),
    SESSION_TIMEOUT: parseInt(getEnvVar('VITE_SESSION_TIMEOUT', '3600000')),
    
    // Tokens
    TOKENS: {
        SOL: 'So11111111111111111111111111111111111111112',
        USDC: 'EPjFWdd5Au17yNArtfycYoYhxKV7UmXUg9x1tMHRLjX',
        USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcaMoxPH',
        JUP: 'JupitaGe24S7f8wKcqadg54K5LBL4quwJyKsPQwhitney',
        BONK: 'DezXAZ8z7MSV2yr4dH4daZ5mWfqNvSyAqEL8yi7wsnb',
        WIF: 'EKpQBwAC67xn5TNb9Per6DmlG6KaqklvbToqfYE8sEJw',
        LCOIN: 'BFUu1ZkJRHLXw5QVSugjhegxEtnWJUMfkpS6rWX5pump'
    },
    
    PUMP_FUN_PROGRAM: '6EF8rQNwhQf477CS540TKDFfeHQpEK9efFdNJR2rZQo'
};

/**
 * Obtener variable de entorno de forma segura
 * @param {string} key - Nombre de la variable
 * @param {string} defaultValue - Valor por defecto
 * @returns {string} Valor de la variable o default
 */
function getEnvVar(key, defaultValue = '') {
    // En producción, esto vendría de import.meta.env
    if (typeof import !== 'undefined' && import.meta?.env) {
        return import.meta.env[key] || defaultValue;
    }
    
    // Fallback para desarrollo
    return defaultValue;
}

/**
 * Validar configuración al inicio
 */
function validateConfig() {
    const errors = [];
    
    if (!CONFIG.SOLSCAN_API_KEY) {
        console.warn('⚠️ ADVERTENCIA: VITE_SOLSCAN_API_KEY no está configurada');
    }
    
    if (!['devnet', 'mainnet'].includes(CONFIG.SOLANA_NETWORK)) {
        errors.push('Red Solana inválida. Debe ser devnet o mainnet');
    }
    
    if (CONFIG.MAX_TRANSACTION_AMOUNT <= 0) {
        errors.push('MAX_TRANSACTION_AMOUNT debe ser > 0');
    }
    
    if (errors.length > 0) {
        console.error('❌ Errores de configuración:', errors);
        throw new Error('Configuración inválida: ' + errors.join(', '));
    }
    
    console.log('✓ Configuración validada correctamente');
}

// Validar al cargar
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', validateConfig);
}

export default CONFIG;
export { validateConfig };
