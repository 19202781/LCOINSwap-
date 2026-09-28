// ============================================
// WALLETS.JS - MULTI-WALLET SUPPORT
// Soporta: Phantom, Solflare, Coinbase Wallet, Trust Wallet
// ============================================

const WALLET_PROVIDERS = {
    PHANTOM: {
        name: 'Phantom',
        icon: '👻',
        detect: () => window.phantom?.solana,
        getProvider: () => window.phantom?.solana
    },
    SOLFLARE: {
        name: 'Solflare',
        icon: '🌟',
        detect: () => window.solflare,
        getProvider: () => window.solflare
    },
    COINBASE: {
        name: 'Coinbase Wallet',
        icon: '🔵',
        detect: () => window.coinbaseWallet,
        getProvider: () => window.coinbaseWallet
    },
    TRUST_WALLET: {
        name: 'Trust Wallet',
        icon: '🛡️',
        detect: () => window.trustwallet?.solana || (window.solana?.isTrustWallet),
        getProvider: () => window.trustwallet?.solana || window.solana
    }
};

class WalletManager {
    constructor() {
        this.connected = false;
        this.publicKey = null;
        this.shortAddress = '';
        this.provider = null;
        this.providerName = null;
        this.listeners = [];
    }

    /**
     * Detecta wallets disponibles
     */
    getAvailableWallets() {
        const available = [];
        for (const [key, wallet] of Object.entries(WALLET_PROVIDERS)) {
            if (wallet.detect()) {
                available.push({
                    id: key,
                    name: wallet.name,
                    icon: wallet.icon
                });
            }
        }
        return available;
    }

    /**
     * Conecta a una wallet específica
     */
    async connect(walletId) {
        const wallet = WALLET_PROVIDERS[walletId];
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        const provider = wallet.getProvider();
        if (!provider) {
            throw new Error(`${wallet.name} not detected`);
        }

        try {
            const response = await provider.connect();
            this.publicKey = response.publicKey;
            this.connected = true;
            this.provider = provider;
            this.providerName = wallet.name;
            this.shortAddress = this.publicKey.toBase58().slice(0, 6) + '...' + this.publicKey.toBase58().slice(-4);
            
            this.notifyListeners('connected');
            return {
                publicKey: this.publicKey,
                shortAddress: this.shortAddress,
                provider: this.providerName
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Desconecta la wallet actual
     */
    async disconnect() {
        if (this.provider && this.provider.disconnect) {
            try {
                await this.provider.disconnect();
            } catch (e) {
                console.warn('Error desconectando:', e);
            }
        }
        this.connected = false;
        this.publicKey = null;
        this.shortAddress = '';
        this.provider = null;
        this.providerName = null;
        this.notifyListeners('disconnected');
    }

    /**
     * Firma una transacción
     */
    async signTransaction(transaction) {
        if (!this.provider) {
            throw new Error('No wallet connected');
        }
        return await this.provider.signTransaction(transaction);
    }

    /**
     * Firma múltiples transacciones
     */
    async signAllTransactions(transactions) {
        if (!this.provider) {
            throw new Error('No wallet connected');
        }
        if (typeof this.provider.signAllTransactions === 'function') {
            return await this.provider.signAllTransactions(transactions);
        }
        return await Promise.all(transactions.map(tx => this.signTransaction(tx)));
    }

    /**
     * Agrega listener para cambios de estado
     */
    onConnectionChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(event) {
        this.listeners.forEach(cb => cb(event, this));
    }

    /**
     * Verifica si está conectado
     */
    isConnected() {
        return this.connected && this.publicKey !== null;
    }

    /**
     * Obtiene la dirección pública
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Obtiene el nombre del proveedor
     */
    getProviderName() {
        return this.providerName;
    }
}

// Instancia global del gestor de wallets
const walletManager = new WalletManager();
