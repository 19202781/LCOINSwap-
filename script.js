// ========================
// CONFIGURACIÓN SOLANA
// ========================

const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';
const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
const CURRENT_NETWORK = 'devnet'; // Cambiar a 'mainnet' después de pruebas
const RPC_ENDPOINT = CURRENT_NETWORK === 'devnet' ? SOLANA_DEVNET_RPC : SOLANA_MAINNET_RPC;

const JUPITER_API = 'https://quote-api.jup.ag/v6';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const SOLSCAN_API = 'https://public-api.solscan.io';

// Direcciones de tokens - IDs de CoinGecko
const TOKEN_IDS = {
    SOL: 'solana',
    USDC: 'usd-coin',
    USDT: 'tether',
    JUP: 'jupiter',
    BONK: 'bonk',
    WIF: 'dogwifcoin',
    LCOIN: 'BFUu1ZkJRHLXw5QVSugjhegxEtnWJUMfkpS6rWX5pump'
};

// Direcciones de mints en Solana
const TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5Au17yNArtfycYoYhxKV7UmXUg9x1tMHRLjX',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcaMoxPH',
    JUP: 'JupitaGe24S7f8wKcqadg54K5LBL4quwJyKsPQwhitney',
    BONK: 'DezXAZ8z7MSV2yr4dH4daZ5mWfqNvSyAqEL8yi7wsnb',
    WIF: 'EKpQBwAC67xn5TNb9Per6DmlG6KaqklvbToqfYE8sEJw',
    LCOIN: 'BFUu1ZkJRHLXw5QVSugjhegxEtnWJUMfkpS6rWX5pump'
};

const PUMP_FUN_PROGRAM = '6EF8rQNwhQf477CS540TKDFfeHQpEK9efFdNJR2rZQo';

// ========================
// VARIABLES GLOBALES
// ========================

let walletConnected = false;
let publicKey = null;
let connection = null;
let selectedToken = 'SOL';
let recentSwaps = [];
let tokenPrices = {};
let userTokenBalances = {};

// ========================
// INICIALIZACIÓN
// ========================

document.addEventListener('DOMContentLoaded', async () => {
    console.log(`LCOINSWAP iniciando en red: ${CURRENT_NETWORK}`);
    
    initializeCanvas();
    setupEventListeners();
    
    // Inicializar conexión Solana
    connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');
    console.log('Conexión Solana establecida');
    
    // Cargar precios reales
    await updateTickerPrices();
    setInterval(updateTickerPrices, 60000); // Actualizar cada minuto
    
    loadRecentSwaps();
    await updateTransparencyPanel();
    setInterval(updateTransparencyPanel, 60000);
});

// ========================
// CANVAS - FONDO ANIMADO
// ========================

function initializeCanvas() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function drawStars() {
        ctx.fillStyle = 'rgba(10, 15, 26, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.fillStyle = `rgba(0, 240, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        });
    }
    
    function animate() {
        drawStars();
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================
// EVENT LISTENERS
// ========================

function setupEventListeners() {
    document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
    
    document.getElementById('token-select').addEventListener('change', (e) => {
        selectedToken = e.target.value;
        if (selectedToken === 'custom') {
            document.getElementById('custom-mint-group').style.display = 'block';
        } else {
            document.getElementById('custom-mint-group').style.display = 'none';
        }
        calculateSwap();
    });
    
    document.getElementById('amount-input').addEventListener('input', calculateSwap);
    document.getElementById('swap-button').addEventListener('click', executeSwap);
}

// ========================
// CONEXIÓN DE BILLETERA
// ========================

async function connectWallet() {
    try {
        const { solana } = window;
        
        if (!solana) {
            alert('Por favor instala Phantom Wallet o una billetera compatible\nDescarga en: https://phantom.app');
            return;
        }
        
        const response = await solana.connect();
        publicKey = response.publicKey;
        walletConnected = true;
        
        console.log('Billetera conectada:', publicKey.toString());
        
        const btn = document.getElementById('connect-wallet-btn');
        btn.textContent = `✓ ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
        btn.classList.add('connected');
        
        document.getElementById('swap-button').disabled = false;
        document.getElementById('swap-button').textContent = 'Swap to LCOIN';
        document.querySelector('.swap-note').textContent = 'Conectado. Listo para hacer swap.';
        
        // Cargar saldos de usuario
        await loadUserTokenBalances();
        
    } catch (err) {
        console.error('Error conectando billetera:', err);
        alert(`Error: ${err.message}`);
    }
}

// ========================
// PRECIOS EN VIVO - COINGECKO
// ========================

async function updateTickerPrices() {
    try {
        // Obtener precios de CoinGecko (gratuito, sin API key)
        const ids = 'solana,usd-coin,tether,jupiter,bonk,dogwifcoin';
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true`
        );
        
        if (!response.ok) throw new Error('Error obteniendo precios');
        
        const data = await response.json();
        
        // Mapear precios
        tokenPrices = {
            SOL: data.solana?.usd || 0,
            USDC: data['usd-coin']?.usd || 1,
            USDT: data.tether?.usd || 1,
            JUP: data.jupiter?.usd || 0,
            BONK: data.bonk?.usd || 0,
            WIF: data.dogwifcoin?.usd || 0
        };
        
        // Simular precio LCOIN basado en SOL (ajustar según necesidad)
        tokenPrices.LCOIN = tokenPrices.SOL * 0.1; // Ejemplo: 10% del precio SOL
        
        // Actualizar UI
        document.getElementById('price-lcoin').textContent = `$${tokenPrices.LCOIN.toFixed(6)}`;
        document.getElementById('price-sol').textContent = `$${tokenPrices.SOL.toFixed(2)}`;
        document.getElementById('price-usdc').textContent = `$${tokenPrices.USDC.toFixed(4)}`;
        document.getElementById('price-usdt').textContent = `$${tokenPrices.USDT.toFixed(4)}`;
        document.getElementById('price-jup').textContent = `$${tokenPrices.JUP.toFixed(4)}`;
        document.getElementById('price-bonk').textContent = `$${tokenPrices.BONK.toFixed(6)}`;
        document.getElementById('price-wif').textContent = `$${tokenPrices.WIF.toFixed(4)}`;
        
        console.log('Precios actualizados:', tokenPrices);
        
    } catch (err) {
        console.error('Error actualizando precios:', err);
        document.getElementById('price-sol').textContent = 'Error';
    }
}

// ========================
// CARGAR SALDOS DE USUARIO
// ========================

async function loadUserTokenBalances() {
    if (!publicKey || !connection) return;
    
    try {
        // Obtener saldo SOL nativo
        const solBalance = await connection.getBalance(publicKey);
        userTokenBalances.SOL = solBalance / 1e9; // Convertir de lamports a SOL
        
        console.log(`Saldo SOL: ${userTokenBalances.SOL}`);
        
        // Aquí se pueden agregar consultas para otros tokens SPL
        // usando getTokenAccountsByOwner
        
    } catch (err) {
        console.error('Error cargando saldos:', err);
    }
}

// ========================
// CALCULADORA DE SWAP
// ========================

async function calculateSwap() {
    if (!walletConnected) return;
    
    const amountInput = document.getElementById('amount-input').value;
    if (!amountInput || amountInput <= 0) {
        document.getElementById('lcoin-amount').textContent = '0.00';
        return;
    }
    
    try {
        const amount = parseFloat(amountInput);
        
        // Fees reales de Solana
        const gasFee = 0.00005; // ~5,000 lamports
        const priorityFee = 0.000001; // ~100 lamports
        let rentFee = 0;
        
        // Costo de creación de cuenta (primera compra de un SPL token)
        const isFirstPurchase = true; // Asumir que es primera compra
        if (isFirstPurchase) {
            rentFee = 0.00203928; // Costo exacto de crear Associated Token Account
            document.getElementById('rent-fee-item').style.display = 'flex';
        } else {
            document.getElementById('rent-fee-item').style.display = 'none';
        }
        
        // Actualizar fees en UI
        document.getElementById('gas-fee').textContent = `${gasFee.toFixed(8)} SOL`;
        document.getElementById('priority-fee').textContent = `${priorityFee.toFixed(8)} SOL`;
        document.getElementById('rent-fee').textContent = `${rentFee.toFixed(8)} SOL`;
        
        const totalFees = gasFee + priorityFee + rentFee;
        document.getElementById('total-cost').textContent = `${totalFees.toFixed(8)} SOL`;
        
        // Usar Jupiter API para obtener cotización real
        if (selectedToken !== 'SOL') {
            const quoteResponse = await getJupiterQuote(amount, selectedToken);
            if (quoteResponse) {
                // Convertir a LCOIN basado en precio
                const solAmount = quoteResponse.outAmount / 1e9;
                const lcoinAmount = solAmount / (tokenPrices.LCOIN || 0.001);
                document.getElementById('lcoin-amount').textContent = lcoinAmount.toFixed(2);
            }
        } else {
            // Si es SOL directo
            const lcoinAmount = amount / (tokenPrices.LCOIN || 0.001);
            document.getElementById('lcoin-amount').textContent = lcoinAmount.toFixed(2);
        }
        
    } catch (err) {
        console.error('Error en calculadora:', err);
    }
}

// ========================
// JUPITER QUOTE API
// ========================

async function getJupiterQuote(amount, fromToken) {
    try {
        const fromMint = TOKENS[fromToken];
        const toMint = TOKENS.SOL;
        
        const response = await fetch(
            `${JUPITER_API}/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${Math.floor(amount * 1e6)}&slippageBps=50`
        );
        
        if (!response.ok) throw new Error('Error obteniendo cotización');
        
        const data = await response.json();
        console.log('Cotización Jupiter:', data);
        
        return data;
        
    } catch (err) {
        console.error('Error en Jupiter Quote:', err);
        return null;
    }
}

// ========================
// EJECUTAR SWAP
// ========================

async function executeSwap() {
    if (!walletConnected) {
        alert('Por favor conecta tu billetera primero');
        return;
    }
    
    const amount = document.getElementById('amount-input').value;
    if (!amount || amount <= 0) {
        alert('Por favor ingresa una cantidad válida');
        return;
    }
    
    try {
        const btn = document.getElementById('swap-button');
        btn.disabled = true;
        btn.textContent = 'Procesando Transacción...';
        
        console.log(`Iniciando swap: ${amount} ${selectedToken} → LCOIN`);
        
        // En producción, aquí iría la lógica real de swap:
        // 1. Si no es SOL, usar Jupiter para convertir a SOL
        // 2. Usar SOL para comprar LCOIN en Pump.fun
        // 3. Esperar confirmación
        
        // Para DevNet: simulación
        const swapData = {
            timestamp: new Date(),
            user: publicKey.toString(),
            token: selectedToken,
            amount: parseFloat(amount),
            lcoinReceived: parseFloat(document.getElementById('lcoin-amount').textContent),
            txHash: 'https://solscan.io/tx/test',
            status: 'completed',
            network: CURRENT_NETWORK
        };
        
        recentSwaps.unshift(swapData);
        if (recentSwaps.length > 10) recentSwaps.pop();
        localStorage.setItem('recentSwaps', JSON.stringify(recentSwaps));
        
        updateRecentSwapsTable();
        
        document.getElementById('amount-input').value = '';
        calculateSwap();
        
        alert(`✓ Swap simulado exitosamente en ${CURRENT_NETWORK}!\n\nEn producción, revisarías la transacción en Solscan.`);
        
        btn.disabled = false;
        btn.textContent = 'Swap to LCOIN';
        
    } catch (err) {
        console.error('Error en swap:', err);
        alert(`Error: ${err.message}`);
        document.getElementById('swap-button').disabled = false;
        document.getElementById('swap-button').textContent = 'Swap to LCOIN';
    }
}

// ========================
// HISTORIAL DE SWAPS
// ========================

function loadRecentSwaps() {
    const stored = localStorage.getItem('recentSwaps');
    if (stored) {
        recentSwaps = JSON.parse(stored);
        updateRecentSwapsTable();
    }
}

function updateRecentSwapsTable() {
    const tbody = document.getElementById('swaps-tbody');
    
    if (recentSwaps.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No hay swaps registrados aún. ¡Sé el primero!</td></tr>';
        return;
    }
    
    tbody.innerHTML = recentSwaps.map(swap => `
        <tr>
            <td>${new Date(swap.timestamp).toLocaleTimeString('es-ES')}</td>
            <td>${swap.user.slice(0, 4)}...${swap.user.slice(-4)}</td>
            <td>${swap.token}</td>
            <td>${swap.amount.toFixed(4)}</td>
            <td>${swap.lcoinReceived.toFixed(2)} LCN</td>
            <td>
                <a href="${swap.txHash}" target="_blank" rel="noopener noreferrer">
                    ${swap.network === 'devnet' ? 'Simulado' : 'Ver'}
                </a>
            </td>
        </tr>
    `).join('');
}

// ========================
// PANEL DE TRANSPARENCIA
// ========================

async function updateTransparencyPanel() {
    try {
        // Datos simulados (en producción, obtener de Solscan API)
        const curveProgress = 35 + Math.random() * 20;
        const totalHolders = 2500 + Math.floor(Math.random() * 1000);
        const creatorHoldings = 5 + Math.random() * 3;
        
        document.getElementById('curve-progress').style.width = curveProgress + '%';
        document.getElementById('curve-progress-text').textContent = 
            `${curveProgress.toFixed(1)}% completado`;
        
        document.getElementById('total-holders').textContent = 
            totalHolders.toLocaleString();
        document.getElementById('creator-holdings').textContent = 
            creatorHoldings.toFixed(2) + '%';
        
        document.getElementById('last-buyer').textContent = generateTimeAgo();
        
        console.log('Panel de transparencia actualizado');
        
    } catch (err) {
        console.error('Error en panel de transparencia:', err);
    }
}

// ========================
// FUNCIONES UTILITARIAS
// ========================

function generateTimeAgo() {
    const times = [
        'Hace 2 minutos',
        'Hace 5 minutos',
        'Hace 10 minutos',
        'Hace 30 minutos',
        'Hace 1 hora'
    ];
    return times[Math.floor(Math.random() * times.length)];
}

function isValidSolanaAddress(address) {
    try {
        if (typeof bs58 !== 'undefined') {
            const decoded = bs58.decode(address);
            return decoded.length === 32;
        }
        return address.length === 44; // Base58 típico
    } catch {
        return false;
    }
}

// ========================
// LOGS Y DEBUGGING
// ========================

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║         LCOINSWAP dApp - DEVNET TESTING MODE          ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log(`║ Red: ${CURRENT_NETWORK.toUpperCase().padEnd(50)} ║`);
console.log(`║ RPC: ${RPC_ENDPOINT.slice(0, 45).padEnd(50)} ║`);
console.log(`║ LCOIN Mint: ${TOKENS.LCOIN.slice(0, 40).padEnd(50)} ║`);
console.log('║                                                        ║');
console.log('║ API Integradas:                                        ║');
console.log('║ ✓ CoinGecko (Precios en vivo)                         ║');
console.log('║ ✓ Jupiter (Cotizaciones de swaps)                     ║');
console.log('║ ✓ Solana Web3.js (Transacciones)                      ║');
console.log('║ ✓ Phantom Wallet (Conexión billetera)                 ║');
console.log('╚════════════════════════════════════════════════════════╝');

// ========================
// MANEJO DE ERRORES GLOBAL
// ========================

window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
});