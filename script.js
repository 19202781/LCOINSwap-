// ============================================
// LCOINSWAP - LÓGICA PRINCIPAL
// ============================================

// ============================================
// 1. CONFIGURACIÓN
// ============================================
const RPC_ENDPOINT = 'https://solana-rpc.publicnode.com';
const LCOIN_MINT = 'BFUu1ZkJRHLXw5QVSugjhegxEtnWJUMfkpS6rWX5pump';
const TREASURY_WALLET = '5qqTJ4t82byrugsep67v728K6fYnEmun5SmWcTDaohji';
const SPREAD_PERCENT = 0.25;
const DAILY_LIMIT_LCOIN = 5000000;

const TICKER_TOKENS = [
    { symbol: 'LCOIN', mint: LCOIN_MINT },
    { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
    { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { symbol: 'PUMP', mint: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn' },
    { symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' }
];

// ============================================
// 2. FAQ ACORDEÓN (independiente de Solana)
// ============================================
function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    if (answer.style.display === 'none' || answer.style.display === '') {
        answer.style.display = 'block';
        icon.textContent = '−';
    } else {
        answer.style.display = 'none';
        icon.textContent = '+';
    }
}

// ============================================
// 3. SISTEMA DE TOASTS (independiente de Solana)
// ============================================
function showToast(type, message, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return null;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '⚠️', info: 'ℹ️', loading: '⏳' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span>${message}`;
    container.appendChild(toast);
    if (type !== 'loading') {
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    return toast;
}

// ============================================
// 4. FONDO DE UNIVERSO (ESTRELLAS Y COMETAS)
// ============================================
(function(){
    const canvas = document.getElementById('bubbles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    const STAR_COUNT = 100;
    const STAR_COLORS = ['#FFFFFF', '#C0C0C0', '#00F0FF', '#1E90FF'];
    let stars = [];

    function createStar() {
        const radius = Math.random() * 1.2 + 0.3;
        return {
            x: Math.random() * width, y: Math.random() * height,
            radius: radius,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() - 0.5) * 0.15 - 0.05,
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
            opacity: Math.random() * 0.4 + 0.1,
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2
        };
    }
    for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar());

    let activeComet = null, cometTimer = null;

    function spawnComet() {
        if (activeComet) return;
        const fromEdge = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        const speed = 1.5 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
        if (fromEdge === 0) { x = -10; y = Math.random() * height; }
        else if (fromEdge === 1) { x = width + 10; y = Math.random() * height; }
        else if (fromEdge === 2) { x = Math.random() * width; y = -10; }
        else { x = Math.random() * width; y = height + 10; }
        activeComet = { x, y, vx, vy, trail: [] };
    }

    function removeComet() {
        activeComet = null;
        const delay = 4000 + Math.random() * 4000;
        if (cometTimer) clearTimeout(cometTimer);
        cometTimer = setTimeout(spawnComet, delay);
    }
    spawnComet();

    function drawStars() {
        for (let s of stars) {
            s.x += s.speedX; s.y += s.speedY;
            if (s.x < -s.radius) s.x = width + s.radius;
            if (s.x > width + s.radius) s.x = -s.radius;
            if (s.y < -s.radius) s.y = height + s.radius;
            if (s.y > height + s.radius) s.y = -s.radius;
            const twinkle = Math.sin(Date.now() * 0.001 * s.twinkleSpeed + s.twinkleOffset) * 0.15;
            const currentOpacity = Math.min(1, Math.max(0, s.opacity + twinkle));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            const r = parseInt(s.color.slice(1,3),16);
            const g = parseInt(s.color.slice(3,5),16);
            const b = parseInt(s.color.slice(5,7),16);
            ctx.fillStyle = `rgba(${r},${g},${b},${currentOpacity})`;
            ctx.fill();
        }
    }

    function drawComets() {
        if (!activeComet) return;
        const c = activeComet;
        c.x += c.vx; c.y += c.vy;
        c.trail.push({ x: c.x, y: c.y, opacity: 0.8 });
        if (c.trail.length > 15) c.trail.shift();
        for (let j = 0; j < c.trail.length; j++) {
            const t = c.trail[j];
            const alpha = t.opacity * (j / c.trail.length) * 0.6;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI*2);
            ctx.fillStyle = `rgba(30,144,255,${alpha})`;
            ctx.fill();
        }
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(Math.atan2(c.vy, c.vx));
        ctx.beginPath(); ctx.moveTo(5,0); ctx.lineTo(-3,-2); ctx.lineTo(-3,2); ctx.closePath();
        ctx.fillStyle = '#1E90FF'; ctx.shadowColor = 'rgba(0,240,255,0.8)'; ctx.shadowBlur = 8;
        ctx.fill(); ctx.restore();
        if (c.x < -20 || c.x > width+20 || c.y < -20 || c.y > height+20) removeComet();
    }

    function animate() { ctx.clearRect(0, 0, width, height); drawStars(); drawComets(); requestAnimationFrame(animate); }
    animate();
})();

// ============================================
// 5. CÓDIGO DEPENDIENTE DE SOLANA
//    Envuelto en try/catch para que, si la librería falla,
//    el resto de la página siga funcionando.
// ============================================
try {
    // Verificar que la librería esté cargada
    if (typeof solanaWeb3 === 'undefined') {
        throw new Error('La librería @solana/web3.js no se cargó correctamente.');
    }

    // --- ESTADO GLOBAL ---
    const wallet = {
        connected: false,
        publicKey: null,
        shortAddress: '',
        provider: null
    };

    const connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');

    const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

    // --- REFERENCIAS DOM ---
    const connectBtn = document.getElementById('connect-wallet-btn');
    const walletAddressSpan = document.getElementById('wallet-address');
    const swapBtn = document.getElementById('swap-btn');
    const swapNote = document.getElementById('swap-note');
    const tokenSelect = document.getElementById('token-select');
    const customMintGroup = document.getElementById('custom-mint-group');
    const amountIn = document.getElementById('amount-in');
    const lcoinOut = document.getElementById('lcoin-out');
    const feeSpread = document.getElementById('fee-spread');

    // ============================================
    // CONEXIÓN DE WALLET
    // ============================================
    async function connectWallet() {
        const provider = window.phantom?.solana || window.solana || window.solflare;
        if (!provider) {
            showToast('error', 'No wallet detected. Please install Phantom or Solflare.');
            return;
        }
        try {
            const response = await provider.connect();
            wallet.publicKey = response.publicKey;
            wallet.connected = true;
            wallet.provider = provider;
            wallet.shortAddress = wallet.publicKey.toBase58().slice(0,6) + '...' + wallet.publicKey.toBase58().slice(-4);
            updateUI();
            showToast('success', 'Wallet connected.');
        } catch (err) {
            showToast('error', 'Connection cancelled.');
        }
    }

    async function disconnectWallet() {
        if (wallet.provider && wallet.provider.disconnect) {
            await wallet.provider.disconnect();
        }
        wallet.connected = false;
        wallet.publicKey = null;
        wallet.shortAddress = '';
        wallet.provider = null;
        updateUI();
        showToast('info', 'Wallet disconnected.');
    }

    function updateUI() {
        if (wallet.connected) {
            walletAddressSpan.textContent = wallet.shortAddress;
            connectBtn.textContent = 'Connected';
            connectBtn.classList.add('connected');
            swapBtn.disabled = false;
            swapBtn.textContent = 'Swap to LCOIN';
            swapNote.style.display = 'none';
        } else {
            walletAddressSpan.textContent = '';
            connectBtn.textContent = 'Connect Motor';
            connectBtn.classList.remove('connected');
            swapBtn.disabled = true;
            swapBtn.textContent = 'Connect Wallet to Swap';
            swapNote.style.display = 'block';
        }
    }

    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (wallet.connected) disconnectWallet();
            else connectWallet();
        });
    }

    // ============================================
    // CINTILLO DE COTIZACIONES
    // ============================================
    async function fetchTokenPrices(mints) {
        try {
            const ids = mints.join(',');
            const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, {
                headers: { 'x-api-key': JUPITER_API_KEY }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) { return null; }
    }

    async function updateTicker() {
        const track = document.getElementById('ticker-track');
        if (!track) return;
        const mints = TICKER_TOKENS.map(t => t.mint);
        const prices = await fetchTokenPrices(mints);
        let html = '';
        for (let repeat = 0; repeat < 2; repeat++) {
            for (const token of TICKER_TOKENS) {
                let price = '—';
                if (prices && prices[token.mint]) {
                    price = prices[token.mint].usdPrice || 0;
                }
                const priceFormatted = typeof price === 'number'
                    ? (price < 0.01 ? price.toFixed(8) : price.toFixed(2))
                    : price;
                html += `<span class="ticker-item"><span class="symbol">${token.symbol}</span><span class="price">$${priceFormatted}</span></span>`;
            }
        }
        track.innerHTML = html;
    }
    setInterval(updateTicker, 180000);
    updateTicker();

    // ============================================
    // CALCULADORA
    // ============================================
    if (tokenSelect) {
        tokenSelect.addEventListener('change', () => {
            if (tokenSelect.value === 'OTHER') customMintGroup.classList.remove('hidden');
            else customMintGroup.classList.add('hidden');
            recalculate();
        });
    }
    if (amountIn) {
        amountIn.addEventListener('input', recalculate);
    }

    async function getJupiterQuote(inputMint, amount, outputMint) {
        try {
            const inputDecimals = inputMint === 'So11111111111111111111111111111111111111112' ? 9 : 6;
            const amountLamports = Math.floor(amount * Math.pow(10, inputDecimals));
            const url = `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=100`;
            const res = await fetch(url, {
                headers: { 'x-api-key': JUPITER_API_KEY }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) { return null; }
    }

    async function recalculate() {
        const amount = parseFloat(amountIn.value);
        if (!amount || amount <= 0) {
            lcoinOut.textContent = '—';
            feeSpread.textContent = '—';
            return;
        }
        const selectedToken = tokenSelect.value;
        const isCustom = selectedToken === 'OTHER';
        const inputMint = isCustom ? document.getElementById('custom-mint').value.trim() : selectedToken;
        if (!inputMint || inputMint.length < 32) return;

        lcoinOut.textContent = 'Calculating...';
        feeSpread.textContent = '...';

        try {
            const quote = await getJupiterQuote(inputMint, amount, LCOIN_MINT);
            if (!quote) {
                lcoinOut.textContent = 'Not available';
                feeSpread.textContent = '—';
                return;
            }
            const outAmountRaw = parseInt(quote.outAmount);
            const lcoinBruto = outAmountRaw / Math.pow(10, 6);
            const lcoinNeto = lcoinBruto * (1 - SPREAD_PERCENT / 100);
            const spreadAmount = lcoinBruto - lcoinNeto;
            lcoinOut.textContent = lcoinNeto.toLocaleString('en-US', { maximumFractionDigits: 2 });
            feeSpread.textContent = spreadAmount.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' LCOIN';
        } catch (e) {
            lcoinOut.textContent = 'Error';
            feeSpread.textContent = '—';
        }
    }

    // ============================================
    // HELPERS SPL
    // ============================================
    function getAssociatedTokenAddress(mint, owner) {
        const [address] = solanaWeb3.PublicKey.findProgramAddressSync(
            [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        return address;
    }

    function createTransferInstruction(source, destination, authority, amount) {
        const data = Buffer.alloc(9);
        data.writeUInt8(3, 0);
        data.writeBigUInt64LE(BigInt(amount), 1);
        return new solanaWeb3.TransactionInstruction({
            programId: TOKEN_PROGRAM_ID,
            keys: [
                { pubkey: source, isSigner: false, isWritable: true },
                { pubkey: destination, isSigner: false, isWritable: true },
                { pubkey: authority, isSigner: true, isWritable: false }
            ],
            data
        });
    }

    function deserializeInstruction(ix) {
        return new solanaWeb3.TransactionInstruction({
            programId: new solanaWeb3.PublicKey(ix.programId),
            keys: ix.accounts.map(acc => ({
                pubkey: new solanaWeb3.PublicKey(acc.pubkey),
                isSigner: acc.isSigner,
                isWritable: acc.isWritable
            })),
            data: Buffer.from(ix.data, 'base64')
        });
    }

    // ============================================
    // LÍMITE DIARIO
    // ============================================
    function getDailyPurchases(walletAddress) {
        const today = new Date().toDateString();
        const key = `lcoin_swaps_${walletAddress}_${today}`;
        return parseFloat(localStorage.getItem(key) || '0');
    }

    function addDailyPurchase(walletAddress, amount) {
        const today = new Date().toDateString();
        const key = `lcoin_swaps_${walletAddress}_${today}`;
        localStorage.setItem(key, (getDailyPurchases(walletAddress) + amount).toString());
    }

    // ============================================
    // EJECUCIÓN DEL SWAP
    // ============================================
    if (swapBtn) {
        swapBtn.addEventListener('click', async () => {
            if (!wallet.connected) {
                showToast('error', 'Connect your wallet first.');
                return;
            }

            const amount = parseFloat(amountIn.value);
            if (!amount || amount <= 0) {
                showToast('error', 'Enter a valid amount.');
                return;
            }

            const selectedToken = tokenSelect.value;
            const isCustom = selectedToken === 'OTHER';
            const inputMint = isCustom ? document.getElementById('custom-mint').value.trim() : selectedToken;
            if (!inputMint || inputMint.length < 32) {
                showToast('error', 'Invalid token.');
                return;
            }

            const dailyLimit = getDailyPurchases(wallet.publicKey.toBase58());
            if (dailyLimit >= DAILY_LIMIT_LCOIN) {
                showToast('error', 'Daily limit of 5M LCOIN reached.');
                return;
            }

            const loadingToast = showToast('loading', 'Preparing swap...');

            try {
                // 1. Cotización
                const quote = await getJupiterQuote(inputMint, amount, LCOIN_MINT);
                if (!quote) {
                    loadingToast.remove();
                    showToast('error', 'Could not get a quote.');
                    return;
                }

                const outAmountRaw = parseInt(quote.outAmount);
                const spreadRaw = Math.floor(outAmountRaw * (SPREAD_PERCENT / 100));
                const totalLcoin = outAmountRaw / Math.pow(10, 6);

                if (dailyLimit + totalLcoin > DAILY_LIMIT_LCOIN) {
                    loadingToast.remove();
                    showToast('error', 'This swap would exceed the daily limit of 5M LCOIN.');
                    return;
                }

                // 2. Instrucciones de swap
                loadingToast.innerHTML = '<span class="toast-icon">⏳</span>Building transaction...';
                const swapRes = await fetch('https://api.jup.ag/swap/v1/swap-instructions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': JUPITER_API_KEY
                    },
                    body: JSON.stringify({
                        quoteResponse: quote,
                        userPublicKey: wallet.publicKey.toString(),
                        wrapAndUnwrapSol: true,
                        dynamicComputeUnitLimit: true,
                        prioritizationFeeLamports: 'auto'
                    })
                });

                if (!swapRes.ok) {
                    loadingToast.remove();
                    showToast('error', 'Could not build swap transaction.');
                    return;
                }

                const swapInstructions = await swapRes.json();
                const instructions = [];

                if (swapInstructions.computeBudgetInstructions) {
                    swapInstructions.computeBudgetInstructions.forEach(ix => instructions.push(deserializeInstruction(ix)));
                }
                if (swapInstructions.setupInstructions) {
                    swapInstructions.setupInstructions.forEach(ix => instructions.push(deserializeInstruction(ix)));
                }
                instructions.push(deserializeInstruction(swapInstructions.swapInstruction));

                // 3. Spread a tesorería
                if (spreadRaw > 0) {
                    const userLcoinAta = getAssociatedTokenAddress(new solanaWeb3.PublicKey(LCOIN_MINT), wallet.publicKey);
                    const treasuryLcoinAta = getAssociatedTokenAddress(new sol