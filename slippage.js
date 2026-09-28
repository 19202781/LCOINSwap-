// ============================================
// MANEJO DE SLIPPAGE
// ============================================

class SlippageManager {
    constructor(defaultSlippage = 1.0) {
        this.slippage = defaultSlippage; // en porcentaje
        this.minSlippage = 0.1;
        this.maxSlippage = 50;
    }

    /**
     * Establece el slippage (en porcentaje)
     */
    setSlippage(value) {
        const slippage = parseFloat(value);
        if (isNaN(slippage)) {
            throw new Error('Invalid slippage value');
        }
        if (slippage < this.minSlippage || slippage > this.maxSlippage) {
            throw new Error(`Slippage must be between ${this.minSlippage}% and ${this.maxSlippage}%`);
        }
        this.slippage = slippage;
    }

    /**
     * Obtiene el slippage actual
     */
    getSlippage() {
        return this.slippage;
    }

    /**
     * Calcula la cantidad mínima aceptable basada en slippage
     */
    calculateMinimumOutput(quoteAmount) {
        const slippageAmount = (quoteAmount * this.slippage) / 100;
        return Math.floor(quoteAmount - slippageAmount);
    }

    /**
     * Calcula slippage en puntos básicos (bps) para Jupiter
     * 100 bps = 1%
     */
    getSlippageBps() {
        return Math.round(this.slippage * 100);
    }

    /**
     * Valida si el slippage está dentro de rangos seguros
     */
    isHighSlippage() {
        return this.slippage > 5; // >5% se considera alto
    }

    /**
     * Obtiene estado del slippage
     */
    getStatus() {
        return {
            current: this.slippage,
            bps: this.getSlippageBps(),
            isHigh: this.isHighSlippage(),
            min: this.minSlippage,
            max: this.maxSlippage
        };
    }
}

// Instancia global del gestor de slippage
const slippageManager = new SlippageManager(1.0); // 1% por defecto
