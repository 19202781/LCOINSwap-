// ========================
// CONFIGURACIÓN SOLANA
// ========================

const SOLANA_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';
const JUPITER_API = 'https://quote-api.jup.ag/v6';
const SOLSCAN_API = 'https://public-api.solscan.io';

// Direcciones de tokens
const TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5Au17yNArtfycYoYhxKV7UmXUg9x1tMHRLjX',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BcaMoxPH',
    JUP: 'JupitaGe24S7f8wKcqadg54K5LBL4quwJyKsPQwhitney',
    BONK: 'DezXAZ8z7MSV2yr4dH4daZ5mWfqNvSyAqEL8yi7wsnb',
    WIF: 'EKpQBwAC67xn5TNb9Per6DmlG6KaqklvbToqfYE8sEJw'
};

const LCOIN_MINT = 'LCNFcz2qr1E8kqGWnQhxNjt9LCZQ4EZrNhPgaBnrwRL'; // Dirección ficticia, reemplazar
const PUMP_FUN_PROGRAM = '6EF8rQNwhQf477CS540TKDFfeHQpEK9efFdNJR2rZQo'; // Programa de Pump.fun

// ========================
// VARIABLES GLOBALES
// ========================

let walletConnected = false;
let publicKey = null;
let connection = null;
let selectedToken = 'SOL';
let recentSwaps = [];

// ========================
// INICIALIZACIÓN
// ========================

document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    setupEventListeners();
    updateTickerPrices();
    setInterval(updateTickerPrices, 180000); // Actualizar cada 3 minutos
    loadRecentSwaps();
    updateTransparencyPanel();
    setInterval(updateTransparencyPanel, 60000); // Actualizar cada minuto
});

// ========================
// CANVAS - FONDO ANIMADO
// ========================

function initializeCanvas() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    // Crear partículas
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
        
        // Dibujar partículas
        particles.forEach(particle => {
            ctx.fillStyle = `rgba(0, 240, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Mover partícula
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Rebote en bordes
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            // Mantener dentro del canvas
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        });
    }
    
    function animate() {
        drawStars();
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Redimensionar canvas al cambiar ventana
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================
// EVENT LISTENERS
// ========================

function setupEventListeners() {
    // Botón conectar billetera
    document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
    
    // Selector de token
    document.getElementById('token-select').addEventListener('change', (e) => {
        selectedToken = e.target.value;
        if (selectedToken === 'custom') {
            document.getElementById('custom-mint-group').style.display = 'block';
        } else {
            document.getElementById('custom-mint-group').style.display = 'none';
        }
        calculateSwap();
    });
    
    // Input de cantidad
    document.getElementById('amount-input').addEventListener('input', calculateSwap);
    
    // Botón swap
    document.getElementById('swap-button').addEventListener('click', executeSwap);
}

// ========================
// CONEXIÓN DE BILLETERA
// ========================

async function connectWallet() {
    try {
        const { solana } = window;
        
        if (!solana) {
            alert('Por favor instala Phantom Wallet o una billetera compatible');
            return;
        }
        
        const response = await solana.connect();
        publicKey = response.publicKey;
        walletConnected = true;
        
        // Actualizar UI
        const btn = document.getElementById('connect-wallet-btn');
        btn.textContent = `Conectado: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
        btn.classList.add('connected');
        
        // Habilitar botón de swap
        document.getElementById('swap-button').disabled = false;
        document.getElementById('swap-button').textContent = 'Swap to LCOIN';
        document.querySelector('.swap-note').textContent = 'Conectado. Listo para hacer swap.';
        
        // Conectar con Solana
        connection = new solanaWeb3.Connection(SOLANA_MAINNET_RPC, 'confirmed');
        
    } catch (err) {
        console.error('Error conectando billetera:', err);
        alert('Error al conectar la billetera');
    }
}

// ========================
// TICKER DE PRECIOS
// ========================

async function updateTickerPrices() {
    try {
        // Precios simulados (reemplazar con API real como CoinGecko)
        const prices = {
            LCOIN: (Math.random() * 0.5 + 0.5).toFixed(4),
            SOL: (Math.random() * 50 + 150).toFixed(2),
            USDC: (Math.random() * 0.01 + 0.99).toFixed(4),
            USDT: (Math.random() * 0.01 + 0.99).toFixed(4),
            JUP: (Math.random() * 1 + 0.8).toFixed(4),
            BONK: (Math.random() * 0.00005 + 0.00003).toFixed(6),
            WIF: (Math.random() * 2 + 2.5).toFixed(4)
        };
        
        document.getElementById('price-lcoin').textContent = `$${prices.LCOIN}`;
        document.getElementById('price-sol').textContent = `$${prices.SOL}`;
        document.getElementById('price-usdc').textContent = `$${prices.USDC}`;
        document.getElementById('price-usdt').textContent = `$${prices.USDT}`;
        document.getElementById('price-jup').textContent = `$${prices.JUP}`;
        document.getElementById('price-bonk').textContent = `$${prices.BONK}`;
        document.getElementById('price-wif').textContent = `$${prices.WIF}`;
        
    } catch (err) {
        console.error('Error actualizando precios:', err);
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
        
        // Gas fees estimados
        const gasFee = 0.00005;
        const priorityFee = 0.00001;
        let rentFee = 0;
        
        // Simular costo de creación de cuenta (primera compra)
        const isFirstPurchase = Math.random() > 0.7; // 30% de probabilidad
        if (isFirstPurchase) {
            rentFee = 0.002;
            document.getElementById('rent-fee-item').style.display = 'flex';
        } else {
            document.getElementById('rent-fee-item').style.display = 'none';
        }
        
        // Actualizar fees
        document.getElementById('gas-fee').textContent = `${gasFee} SOL`;
        document.getElementById('priority-fee').textContent = `${priorityFee} SOL`;
        document.getElementById('rent-fee').textContent = `${rentFee} SOL`;
        
        const totalFees = gasFee + priorityFee + rentFee;
        document.getElementById('total-cost').textContent = `${totalFees.toFixed(6)} SOL`;
        
        // Calcular LCOIN a recibir (simulado)
        // En la práctica, usar Jupiter API para conversión a SOL, luego Pump.fun para compra
        const solAmount = selectedToken === 'SOL' ? amount : amount * (0.5 + Math.random()); // Precio simulado
        const lcoinAmount = solAmount * (Math.random() * 1000 + 500); // Precio LCOIN simulado
        
        document.getElementById('lcoin-amount').textContent = lcoinAmount.toFixed(2);
        
    } catch (err) {
        console.error('Error en calculadora:', err);
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
        btn.textContent = 'Procesando...';
        
        // Simular proceso de swap
        // 1. Si el token no es SOL, convertir a SOL usando Jupiter
        // 2. Usar el SOL para comprar LCOIN en Pump.fun
        
        const swapData = {
            timestamp: new Date(),
            user: publicKey.toString(),
            token: selectedToken,
            amount: parseFloat(amount),
            lcoinReceived: parseFloat(document.getElementById('lcoin-amount').textContent),
            txHash: generateMockTxHash(),
            status: 'completed'
        };
        
        // Guardar en historial
        recentSwaps.unshift(swapData);
        if (recentSwaps.length > 10) recentSwaps.pop();
        localStorage.setItem('recentSwaps', JSON.stringify(recentSwaps));
        
        // Actualizar tabla
        updateRecentSwapsTable();
        
        // Reset form
        document.getElementById('amount-input').value = '';
        calculateSwap();
        
        alert('¡Swap completado exitosamente! Revisa tu billetera para confirmar.');
        
        btn.disabled = false;
        btn.textContent = 'Swap to LCOIN';
        
    } catch (err) {
        console.error('Error en swap:', err);
        alert('Error al ejecutar el swap');
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
            <td>${new Date(swap.timestamp).toLocaleTimeString()}</td>
            <td>${swap.user.slice(0, 4)}...${swap.user.slice(-4)}</td>
            <td>${swap.token}</td>
            <td>${swap.amount.toFixed(4)}</td>
            <td>${swap.lcoinReceived.toFixed(2)} LCN</td>
            <td><a href="https://solscan.io/tx/${swap.txHash}" target="_blank" rel="noopener noreferrer">Ver en Solscan</a></td>
        </tr>
    `).join('');
}

// ========================
// PANEL DE TRANSPARENCIA
// ========================

async function updateTransparencyPanel() {
    try {
        // Simular datos on-chain
        const curveProgress = Math.random() * 100;
        const totalHolders = Math.floor(Math.random() * 5000 + 1000);
        const creatorHoldings = Math.random() * 20 + 5;
        
        // Actualizar UI
        document.getElementById('curve-progress').style.width = curveProgress + '%';
        document.getElementById('curve-progress-text').textContent = `${curveProgress.toFixed(1)}% completado`;
        
        document.getElementById('total-holders').textContent = totalHolders.toLocaleString();
        document.getElementById('creator-holdings').textContent = creatorHoldings.toFixed(2) + '%';
        
        const lastBuyerTime = generateTimeAgo();
        document.getElementById('last-buyer').textContent = lastBuyerTime;
        
    } catch (err) {
        console.error('Error actualizando panel de transparencia:', err);
    }
}

// ========================
// FUNCIONES UTILITARIAS
// ========================

function generateMockTxHash() {
    return Array.from({length: 88}, () => 
        Math.random().toString(36).charAt(2)
    ).join('').slice(0, 88);
}

function generateTimeAgo() {
    const times = [
        'Hace 2 minutos',
        'Hace 5 minutos',
        'Hace 10 minutos',
        'Hace 30 minutos',
        'Hace 1 hora',
        'Hace 2 horas'
    ];
    return times[Math.floor(Math.random() * times.length)];
}

// ========================
// VALIDACIÓN DE DIRECCIONES
// ========================

function isValidSolanaAddress(address) {
    try {
        const decoded = bs58.decode(address);
        return decoded.length === 32;
    } catch {
        return false;
    }
}

// ========================
// MANEJO DE ERRORES Y SEGURIDAD
// ========================

window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    // No mostrar detalles de error al usuario en producción
});

// Prevenir acciones no autorizadas
document.addEventListener('contextmenu', (e) => {
    // Permitir clic derecho, solo log para seguridad
});

// ========================
// INFORMACIÓN PARA DESARROLLO
// ========================

console.log('LCOINSWAP dApp cargado correctamente');
console.log('Tokens soportados:', Object.keys(TOKENS));
console.log('Red: Solana Mainnet');
