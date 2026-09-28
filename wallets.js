// ============================================
// WALLETS.JS - MULTI-WALLET SUPPORT
// Soporta: Phantom, Solflare, Coinbase Wallet, Trust Wallet
// ============================================

function getGlobalWalletProvider() {
    const candidates = [];

    if (window.phantom?.solana) candidates.push({ id: 'PHANTOM', provider: window.phantom.solana, name: 'Phantom', icon: '👻' });
    if (window.solflare) candidates.push({ id: 'SOLFLARE', provider: window.solflare, name: 'Solflare', icon: '🌟' });
    if (window.coinbaseWallet?.provider) candidates.push({ id: 'COINBASE', provider: window.coinbaseWallet.provider, name: 'Coinbase Wallet', icon: '🔵' });
    if (window.coinbaseWallet?.solana) candidates.push({ id: 'COINBASE', provider: window.coinbaseWallet.solana, name: 'Coinbase Wallet', icon: '🔵' });
    if (window.trustwallet?.solana) candidates.push({ id: 'TRUST_WALLET', provider: window.trustwallet.solana, name: 'Trust Wallet', icon: '🛡️' });
    if (window.solana && (window.solana.isPhantom || window.solana.isTrustWallet || window.solana.isCoinbaseWallet || window.solana.isSolflare)) {
        const name = window.solana.isPhantom ? 'Phantom' : window.solana.isTrustWallet ? 'Trust Wallet' : window.solana.isCoinbaseWallet ? 'Coinbase Wallet' : 'Solflare';
        const icon = window.solana.isPhantom ? '👻' : window.solana.isTrustWallet ? '🛡️' : window.solana.isCoinbaseWallet ? '🔵' : '🌟';
        candidates.push({ id: name.toUpperCase().replace(/\s+/g, '_'), provider: window.solana, name, icon });
    }

    const unique = [];
    const seen = new Set();
    candidates.forEach(candidate => {
        const key = `${candidate.id}:${candidate.name}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(candidate);
        }
    });

    return unique;
}

class WalletManager {
    constructor() {
        this.connected = false;
        this.publicKey = null;
        this.shortAddress = '';
        this.provider = null;
        this.providerName = null;
        this.listeners = [];
    }

    getAvailableWallets() {
        return getGlobalWalletProvider().map(wallet => ({
            id: wallet.id,
            name: wallet.name,
            icon: wallet.icon,
            provider: wallet.provider
        }));
    }

    async connect(walletId) {
        const wallets = this.getAvailableWallets();
        const matched = wallets.find(item => item.id === walletId);

        if (!matched || !matched.provider) {
            throw new Error('Wallet not detected');
        }

        const provider = matched.provider;

        try {
            let response = null;
            if (provider.connect) {
                response = await provider.connect();
            } else if (provider.request) {
                const result = await provider.request({ method: 'connect' });
                response = { publicKey: result?.publicKey || result?.publicKey?.toString ? new solanaWeb3.PublicKey(result.publicKey) : null };
            }

            const publicKey = response?.publicKey || provider.publicKey || provider._publicKey;
            if (!publicKey) {
                throw new Error('Wallet connected but no public key was returned.');
            }

            this.publicKey = publicKey;
            this.connected = true;
            this.provider = provider;
            this.providerName = matched.name;
            this.shortAddress = this.publicKey.toBase58().slice(0, 6) + '...' + this.publicKey.toBase58().slice(-4);
            this.notifyListeners('connected');
            return {
                publicKey: this.publicKey,
                shortAddress: this.shortAddress,
                provider: this.providerName
            };
        } catch (error) {
            this.connected = false;
            this.publicKey = null;
            this.provider = null;
            this.providerName = null;
            throw error;
        }
    }

    async disconnect() {
        if (this.provider && typeof this.provider.disconnect === 'function') {
            try {
                await this.provider.disconnect();
            } catch (error) {
                console.warn('Wallet disconnect warning:', error);
            }
        }

        this.connected = false;
        this.publicKey = null;
        this.shortAddress = '';
        this.provider = null;
        this.providerName = null;
        this.notifyListeners('disconnected');
    }

    async signTransaction(transaction) {
        if (!this.provider) throw new Error('No wallet connected');
        if (typeof this.provider.signTransaction === 'function') {
            return await this.provider.signTransaction(transaction);
        }
        if (typeof this.provider.signTransaction === 'function' && transaction) {
            return await this.provider.signTransaction(transaction);
        }
        throw new Error('This wallet does not support transaction signing.');
    }

    onConnectionChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(event) {
        this.listeners.forEach(callback => callback(event, this));
    }

    isConnected() {
        return this.connected && !!this.publicKey;
    }

    getPublicKey() {
        return this.publicKey;
    }

    getProviderName() {
        return this.providerName;
    }
}

const walletManager = new WalletManager();

