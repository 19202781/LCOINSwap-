// ============================================
// VALIDACIÓN Y CONTROL DE ERRORES
// Pre-swap validation, slippage management, error detection
// ============================================

class SwapValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Valida si el usuario está autenticado
     */
    validateAuthentication(walletManager) {
        if (!walletManager.isConnected()) {
            this.addError('WALLET_NOT_CONNECTED', 'Please connect your wallet first.');
            return false;
        }
        return true;
    }

    /**
     * Valida la cantidad a cambiar
     */
    validateAmount(amount, minAmount = 0.0001) {
        this.clearErrors();
        
        if (!amount || isNaN(amount)) {
            this.addError('INVALID_AMOUNT', 'Please enter a valid amount.');
            return false;
        }

        if (amount <= 0) {
            this.addError('ZERO_AMOUNT', 'Amount must be greater than 0.');
            return false;
        }

        if (amount < minAmount) {
            this.addError('AMOUNT_TOO_SMALL', `Minimum amount is ${minAmount}.`);
            return false;
        }

        return true;
    }

    /**
     * Valida el token de entrada
     */
    validateInputToken(mint) {
        if (!mint || typeof mint !== 'string') {
            this.addError('INVALID_TOKEN', 'Please select a valid token.');
            return false;
        }

        if (mint.length < 32 || mint.length > 44) {
            this.addError('INVALID_MINT', 'Invalid token mint address format.');
            return false;
        }

        return true;
    }

    /**
     * Valida slippage
     */
    validateSlippage(slippage) {
        if (slippage < 0) {
            this.addError('INVALID_SLIPPAGE', 'Slippage cannot be negative.');
            return false;
        }

        if (slippage > 50) {
            this.addWarning('HIGH_SLIPPAGE', 'Slippage is very high (>50%). This may result in poor rates.');
            return true;
        }

        return true;
    }

    /**
     * Valida la cotización de Jupiter
     */
    validateQuote(quote, minOutputAmount) {
        if (!quote) {
            this.addError('NO_QUOTE', 'Could not get a price quote. Please try again.');
            return false;
        }

        if (!quote.outAmount || parseInt(quote.outAmount) === 0) {
            this.addError('ZERO_OUTPUT', 'This trade would result in zero tokens. Try a larger amount.');
            return false;
        }

        if (minOutputAmount && parseInt(quote.outAmount) < minOutputAmount) {
            this.addError('SLIPPAGE_EXCEEDED', 'Quote price exceeds acceptable slippage. Adjust and try again.');
            return false;
        }

        return true;
    }

    /**
     * Valida límites diarios
     */
    validateDailyLimit(currentDaily, totalLcoin, dailyLimit) {
        if (currentDaily >= dailyLimit) {
            this.addError('DAILY_LIMIT_EXCEEDED', `Daily limit of ${dailyLimit.toLocaleString()} LCOIN reached.`);
            return false;
        }

        if (currentDaily + totalLcoin > dailyLimit) {
            const remaining = dailyLimit - currentDaily;
            this.addError('DAILY_LIMIT_WOULD_EXCEED', 
                `Only ${remaining.toLocaleString()} LCOIN remaining today. Your quote would exceed this.`);
            return false;
        }

        return true;
    }

    /**
     * Valida la API key de Jupiter
     */
    validateJupiterAPI(apiKey) {
        if (!apiKey) {
            this.addError('API_NOT_CONFIGURED', 'Jupiter API key is not configured. Swaps unavailable.');
            return false;
        }
        return true;
    }

    /**
     * Valida saldo suficiente (si se puede verificar)
     */
    validateBalanceEstimate(estimatedBalance, requiredAmount) {
        if (estimatedBalance && estimatedBalance < requiredAmount) {
            this.addError('INSUFFICIENT_BALANCE', 
                `Insufficient balance. Required: ${requiredAmount}, Available: ${estimatedBalance}`);
            return false;
        }
        return true;
    }

    /**
     * Validación completa pre-swap
     */
    async validateFullSwap(config) {
        this.clearAll();

        // 1. Validar autenticación
        if (!this.validateAuthentication(config.walletManager)) return false;

        // 2. Validar API
        if (!this.validateJupiterAPI(config.jupiterApiKey)) return false;

        // 3. Validar cantidad
        if (!this.validateAmount(config.amount, config.minAmount)) return false;

        // 4. Validar token de entrada
        if (!this.validateInputToken(config.inputMint)) return false;

        // 5. Validar token de salida
        if (!this.validateInputToken(config.outputMint)) return false;

        // 6. Validar slippage
        if (!this.validateSlippage(config.slippage)) return false;

        // 7. Validar límite diario
        if (!this.validateDailyLimit(config.dailyPurchased, config.expectedOutput, config.dailyLimit)) {
            return false;
        }

        // 8. Validar quote
        if (!this.validateQuote(config.quote, config.minOutput)) return false;

        return this.errors.length === 0;
    }

    addError(code, message) {
        this.errors.push({ code, message });
    }

    addWarning(code, message) {
        this.warnings.push({ code, message });
    }

    clearErrors() {
        this.errors = [];
    }

    clearWarnings() {
        this.warnings = [];
    }

    clearAll() {
        this.errors = [];
        this.warnings = [];
    }

    getErrors() {
        return this.errors;
    }

    getWarnings() {
        return this.warnings;
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    hasWarnings() {
        return this.warnings.length > 0;
    }

    getErrorMessage() {
        return this.errors.map(e => e.message).join('\n');
    }

    getWarningMessage() {
        return this.warnings.map(w => w.message).join('\n');
    }
}

// Instancia global del validador
const swapValidator = new SwapValidator();
