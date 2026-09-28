// ============================================
// LCOINSWAP - LÓGICA PRINCIPAL CORREGIDA
// ============================================

console.log('=== LCOINSWAP iniciando ===');
console.log('1. Script cargado correctamente');

window.toggleFAQ = function(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    if (!answer) return;
    if (answer.style.display === 'none' || answer.style.display === '') {
        answer.style.display = 'block';
        if (icon) icon.textContent = '−';
    } else {
        answer.style.display = 'none';
        if (icon) icon.textContent = '+';
    }
};

window.showToast = function(type, message, duration = 5000) {
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
};

console.log('2. Funciones globales definidas');

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
    console.log('3. Fondo animado cargado');
})();

console.log('4. Verificando dependencias...');

if (typeof solanaWeb3 === 'undefined') {
    console.error('❌ solanaWeb3 NO está definida.');
} else {
    console.log('✅ solanaWeb3 cargada correctamente');
}

if (typeof JUPITER_API_KEY === 'undefined' || !JUPITER_API_KEY) {
    console.warn('⚠️ JUPITER_API_KEY NO está configurada.');
} else {
    console.log('✅ JUPITER_API_KEY disponible');
}

if (typeof walletManager === 'undefined') {
    console.warn('⚠️ walletManager no definido.');
} else {
    console.log('✅ walletManager disponible');
}

if (typeof slippageManager === 'undefined') {
    console.warn('⚠️ slippageManager no definido.');
} else {
    console.log('✅ slippageManager disponible');
}

if (typeof swapValidator === 'undefined') {
    console.warn('⚠️ swapValidator no definido.');
} else {
    console.log('✅ swapValidator disponible');
}

if (typeof solanaWeb3 === 'undefined') {
    console.error('5. No se puede continuar sin solanaWeb3.');
} else {
    try {
        const RPC_ENDPOINT = 'https://solana-rpc.publicnode.com';
        const SOL_MINT = 'So11111111111111111111111111111111111111112';
        const LCOIN_MINT = 'BFUu1ZkJRHLXw5QVSugjhegxEtnWJUMfkpS6rWX5pump';
        const SPREAD_PERCENT = 0.25;
        const DAILY_LIMIT_LCOIN = 5000000;

        const TICKER_TOKENS = [
            { symbol: 'LCOIN', mint: LCOIN_MINT },
            { symbol: 'SOL', mint: SOL_MINT },
            { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
            { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
            { symbol: 'PUMP', mint: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn' },
            { symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHA7hkeR8VUtAeFoSYbKedZNsDvCN' }
        ];

        const connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');
        const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

        const connectBtn = document.getElementById('connect-wallet-btn');
        const walletAddressSpan = document.getElementById('wallet-address');
        const swapBtn = document.getElementById('swap-btn');
        const swapNote = document.getElementById('swap-note');
        const tokenSelect = document.getElementById('token-select');
        const customMintGroup = document.getElementById('custom-mint-group');
        const amountIn = document.getElementById('amount-in');
        const lcoinOut = document.getElementById('lcoin-out');
        const feeSpread = document.getElementById('fee-spread');
        const walletModal = document.getElementById('wallet-modal');
        const walletOptionsContainer = document.getElementById('wallet-options');
        const walletModalClose = document.getElementById('wallet-modal-close');
        const slippageInput = document.getElementById('slippage-input');
        const slippageValue = document.getElementById('slippage-value');
        const slippageWarning = document.getElementById('slippage-warning');
        const swapErrorBox = document.getElementById('swap-error-box');
        const swapWarningBox = document.getElementById('swap-warning-box');

        function openWalletModal() {
            if (!walletModal) return;
            renderWalletModal();
            walletModal.classList.add('active');
            walletModal.setAttribute('aria-hidden', 'false');
        }

        function closeWalletModal() {
            if (!walletModal) return;
            walletModal.classList.remove('active');
            walletModal.setAttribute('aria-hidden', 'true');
        }

        function setValidationBox(type, title, messages) {
            const box = type === 'error' ? swapErrorBox : swapWarningBox;
            if (!box) return;
            const list = Array.isArray(messages) ? messages : [messages];
            box.classList.remove('hidden');
            box.innerHTML = `
                <div class="${type === 'error' ? 'error-title' : 'warning-title'}">${type === 'error' ? '⚠' : 'ℹ'} ${title}</div>
                ${list.map(msg => `<div class="${type === 'error' ? 'error-message' : 'warning-message'}">${msg}</div>`).join('')}
            `;
        }

        function clearValidationBoxes() {
            if (swapErrorBox) {
                swapErrorBox.classList.add('hidden');
                swapErrorBox.innerHTML = '';
            }
            if (swapWarningBox) {
                swapWarningBox.classList.add('hidden');
                swapWarningBox.innerHTML = '';
            }
        }

        function renderWalletModal() {
            if (!walletOptionsContainer) return;
            const wallets = walletManager.getAvailableWallets();
            walletOptionsContainer.innerHTML = '';

            if (!wallets || wallets.length === 0) {
                walletOptionsContainer.innerHTML = `
                    <div class="warning-box">
                        <div class="warning-title">⚠ No wallet detected</div>
                        Install Phantom, Solflare, Coinbase Wallet, or Trust Wallet and refresh the page.
                    </div>
                `;
                return;
            }

            wallets.forEach(({ id, name, icon }) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'wallet-option';
                button.innerHTML = `
                    <span class="wallet-icon">${icon}</span>
                    <span class="wallet-info">
                        <span class="wallet-name">${name}</span>
                        <span class="wallet-status">Available</span>
                    </span>
                `;
                button.addEventListener('click', async () => {
                    try {
                        const result = await walletManager.connect(id);
                        updateWalletUI();
                        closeWalletModal();
                        showToast('success', `${result.provider} connected.`);
                    } catch (error) {
                        console.error('Wallet connect error:', error);
                        showToast('error', error.message || 'Wallet connection failed.');
                    }
                });
                walletOptionsContainer.appendChild(button);
            });
        }

        function updateSlippageUI() {
            if (!slippageInput || !slippageValue || !slippageWarning) return;
            const current = slippageManager.getSlippage();
            slippageInput.value = current.toFixed(1);
            slippageValue.textContent = `${current.toFixed(1)}%`;
            slippageWarning.classList.toggle('high', slippageManager.isHighSlippage());
            slippageWarning.textContent = slippageManager.isHighSlippage()
                ? 'Warning: slippage above 5% can cause poor execution.'
                : 'Low slippage is recommended for LCOIN.';

            document.querySelectorAll('.slippage-preset').forEach(button => {
                button.classList.toggle('active', parseFloat(button.dataset.slippage) === current);
            });
        }

        function updateWalletUI() {
            if (!connectBtn || !walletAddressSpan || !swapBtn || !swapNote) return;

            if (walletManager.isConnected()) {
                walletAddressSpan.textContent = walletManager.shortAddress;
                connectBtn.textContent = `Connected · ${walletManager.getProviderName()}`;
                connectBtn.classList.add('connected');
                swapBtn.disabled = false;
                swapBtn.textContent = 'Swap to LCOIN';
                swapNote.style.display = 'none';
            } else {
                walletAddressSpan.textContent = '';
                connectBtn.textContent = 'Connect Wallet';
                connectBtn.classList.remove('connected');
                swapBtn.disabled = true;
                swapBtn.textContent = 'Connect Wallet to Swap';
                swapNote.style.display = 'block';
            }
        }

        async function disconnectWallet() {
            try {
                await walletManager.disconnect();
                updateWalletUI();
                showToast('info', 'Wallet disconnected.');
            } catch (error) {
                console.error('Wallet disconnect error:', error);
            }
        }

        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                if (walletManager.isConnected()) {
                    disconnectWallet();
                } else {
                    openWalletModal();
                }
            });
        }

        if (walletModalClose) {
            walletModalClose.addEventListener('click', closeWalletModal);
        }

        if (walletModal) {
            walletModal.addEventListener('click', (event) => {
                if (event.target === walletModal) closeWalletModal();
            });
        }

        if (slippageInput) {
            slippageInput.addEventListener('input', () => {
                try {
                    const value = parseFloat(slippageInput.value);
                    if (!isNaN(value)) {
                        slippageManager.setSlippage(value);
                        updateSlippageUI();
                        recalculate();
                    }
                } catch (error) {
                    showToast('error', error.message);
                }
            });
        }

        document.querySelectorAll('.slippage-preset').forEach(button => {
            button.addEventListener('click', () => {
                const value = parseFloat(button.dataset.slippage);
                if (!Number.isNaN(value)) {
                    slippageManager.setSlippage(value);
                    updateSlippageUI();
                    recalculate();
                }
            });
        });

        async function fetchTokenPrices(mints) {
            if (!JUPITER_API_KEY) return null;
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
            if (!JUPITER_API_KEY) return null;
            try {
                const inputDecimals = inputMint === SOL_MINT ? 9 : 6;
                const amountLamports = Math.floor(amount * Math.pow(10, inputDecimals));
                const slippageBps = slippageManager.getSlippageBps();
                const url = `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`;
                const res = await fetch(url, {
                    headers: { 'x-api-key': JUPITER_API_KEY }
                });
                if (!res.ok) return null;
                return await res.json();
            } catch (error) {
                console.error('Quote error:', error);
                return null;
            }
        }

        async function recalculate() {
            clearValidationBoxes();
            const amount = parseFloat(amountIn.value);
            if (!amount || amount <= 0) {
                lcoinOut.textContent = '—';
                feeSpread.textContent = '—';
                return;
            }

            const selectedToken = tokenSelect.value;
            const isCustom = selectedToken === 'OTHER';
            const inputMint = isCustom ? document.getElementById('custom-mint').value.trim() : selectedToken;
            if (!inputMint || inputMint.length < 32) {
                lcoinOut.textContent = '—';
                feeSpread.textContent = '—';
                return;
            }

            lcoinOut.textContent = 'Calculating...';
            feeSpread.textContent = '...';

            try {
                const quote = await getJupiterQuote(inputMint, amount, LCOIN_MINT);
                if (!quote || !quote.outAmount) {
                    lcoinOut.textContent = 'Not available';
                    feeSpread.textContent = '—';
                    return;
                }
                const outAmountRaw = parseInt(quote.outAmount, 10) || 0;
                const lcoinGross = outAmountRaw / Math.pow(10, 6);
                const slippagePct = slippageManager.getSlippage() / 100;
                const lcoinNet = lcoinGross * (1 - slippagePct);
                const fee = lcoinGross - lcoinNet;
                lcoinOut.textContent = lcoinNet.toLocaleString('en-US', { maximumFractionDigits: 2 });
                feeSpread.textContent = `${fee.toLocaleString('en-US', { maximumFractionDigits: 2 })} LCOIN`;
            } catch (error) {
                lcoinOut.textContent = 'Error';
                feeSpread.textContent = '—';
            }
        }

        function deserializeInstruction(ix) {
            if (!ix) return null;
            
            if (typeof ix === 'string') {
                try {
                    const decoded = Buffer.from(ix, 'base64').toString('utf8');
                    ix = JSON.parse(decoded);
                } catch (e) {
                    console.warn('Could not parse instruction string:', e);
                    return null;
                }
            }

            if (!ix.programId || !Array.isArray(ix.accounts)) {
                console.warn('Invalid instruction structure:', ix);
                return null;
            }

            try {
                return new solanaWeb3.TransactionInstruction({
                    programId: new solanaWeb3.PublicKey(ix.programId),
                    keys: ix.accounts.map(acc => ({
                        pubkey: new solanaWeb3.PublicKey(acc.pubkey),
                        isSigner: !!acc.isSigner,
                        isWritable: !!acc.isWritable
                    })),
                    data: Buffer.from(ix.data, 'base64')
                });
            } catch (error) {
                console.error('Error deserializing instruction:', error);
                return null;
            }
        }

        function getDailyPurchases(walletAddress) {
            const today = new Date().toDateString();
            const key = `lcoin_swaps_${walletAddress}_${today}`;
            return parseFloat(localStorage.getItem(key) || '0');
        }

        function addDailyPurchase(walletAddress, amount) {
            const today = new Date().toDateString();
            const key = `lcoin_swaps_${walletAddress}_${today}`;
            const current = getDailyPurchases(walletAddress);
            localStorage.setItem(key, (current + amount).toString());
        }

        if (swapBtn) {
            swapBtn.addEventListener('click', async () => {
                clearValidationBoxes();

                if (!walletManager.isConnected()) {
                    setValidationBox('error', 'Wallet required', ['Please connect your wallet before swapping.']);
                    showToast('error', 'Please connect your wallet first.');
                    return;
                }

                if (!JUPITER_API_KEY) {
                    setValidationBox('error', 'API not configured', ['Jupiter API key is missing or not loaded.']);
                    showToast('error', 'Jupiter API key not configured.');
                    return;
                }

                const amount = Number(amountIn.value);
                if (!swapValidator.validateAmount(amount, 0.0001)) {
                    setValidationBox('error', 'Invalid amount', swapValidator.getErrors().map(e => e.message));
                    showToast('error', swapValidator.getErrorMessage());
                    return;
                }

                const selectedToken = tokenSelect.value;
                const isCustom = selectedToken === 'OTHER';
                const inputMint = isCustom ? document.getElementById('custom-mint').value.trim() : selectedToken;
                
                if (!swapValidator.validateInputToken(inputMint)) {
                    setValidationBox('error', 'Invalid token', swapValidator.getErrors().map(e => e.message));
                    showToast('error', swapValidator.getErrorMessage());
                    return;
                }

                if (!swapValidator.validateSlippage(slippageManager.getSlippage())) {
                    setValidationBox('error', 'Invalid slippage', swapValidator.getErrors().map(e => e.message));
                    showToast('error', swapValidator.getErrorMessage());
                    return;
                }

                const loadingToast = showToast('loading', 'Getting quote...');
                try {
                    const quote = await getJupiterQuote(inputMint, amount, LCOIN_MINT);
                    
                    if (!quote || !quote.outAmount) {
                        loadingToast.remove();
                        setValidationBox('error', 'No quote', ['Could not get a price quote. Try again later.']);
                        showToast('error', 'No quote available.');
                        return;
                    }

                    const outputLcoin = Number(quote.outAmount) / 1e6;
                    const currentDaily = getDailyPurchases(walletManager.getPublicKey().toBase58());
                    
                    if (!swapValidator.validateDailyLimit(currentDaily, outputLcoin, DAILY_LIMIT_LCOIN)) {
                        loadingToast.remove();
                        setValidationBox('error', 'Daily limit', swapValidator.getErrors().map(e => e.message));
                        showToast('error', swapValidator.getErrorMessage());
                        return;
                    }

                    if (slippageManager.isHighSlippage()) {
                        setValidationBox('warning', 'High slippage', ['Execution may be poor. Consider lowering slippage before confirming.']);
                    }

                    loadingToast.innerHTML = '<span class="toast-icon">⏳</span>Building transaction...';
                    const swapRes = await fetch('https://api.jup.ag/swap/v1/swap-instructions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': JUPITER_API_KEY
                        },
                        body: JSON.stringify({
                            quoteResponse: quote,
                            userPublicKey: walletManager.getPublicKey().toBase58(),
                            wrapUnwrapSOL: true
                        })
                    });

                    if (!swapRes.ok) {
                        loadingToast.remove();
                        const errorText = await swapRes.text();
                        console.error('Jupiter error:', errorText);
                        setValidationBox('error', 'Build failed', ['Could not build swap instructions from Jupiter.']);
                        showToast('error', 'Failed to build swap transaction.');
                        return;
                    }

                    const swapData = await swapRes.json();
                    const instructions = [];

                    if (Array.isArray(swapData.setupInstructions)) {
                        for (const ix of swapData.setupInstructions) {
                            const decoded = deserializeInstruction(ix);
                            if (decoded) instructions.push(decoded);
                        }
                    }

                    const swapInstructions = Array.isArray(swapData.swapInstruction) 
                        ? swapData.swapInstruction 
                        : (swapData.swapInstruction ? [swapData.swapInstruction] : []);
                    
                    for (const ix of swapInstructions) {
                        const decoded = deserializeInstruction(ix);
                        if (decoded) instructions.push(decoded);
                    }

                    if (swapData.cleanupInstruction) {
                        const decoded = deserializeInstruction(swapData.cleanupInstruction);
                        if (decoded) instructions.push(decoded);
                    }

                    if (instructions.length === 0) {
                        loadingToast.remove();
                        setValidationBox('error', 'No instructions', ['Could not deserialize any swap instructions.']);
                        showToast('error', 'No valid instructions to execute.');
                        return;
                    }

                    const tx = new solanaWeb3.Transaction();
                    tx.add(...instructions);
                    tx.feePayer = walletManager.getPublicKey();
                    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

                    loadingToast.innerHTML = '<span class="toast-icon">⏳</span>Awaiting wallet signature...';
                    const signedTx = await walletManager.signTransaction(tx);
                    
                    loadingToast.innerHTML = '<span class="toast-icon">⏳</span>Sending transaction...';
                    const txId = await connection.sendRawTransaction(signedTx.serialize(), {
                        skipPreflight: false,
                        preflightCommitment: 'confirmed'
                    });

                    loadingToast.innerHTML = '<span class="toast-icon">⏳</span>Confirming transaction...';
                    await connection.confirmTransaction(txId, 'confirmed');

                    loadingToast.remove();
                    showToast('success', `Swap successful! TX: ${txId.slice(0, 20)}...`);
                    addDailyPurchase(walletManager.getPublicKey().toBase58(), outputLcoin);
                    recalculate();
                } catch (error) {
                    loadingToast.remove();
                    console.error('Swap execution error:', error);
                    const errorMsg = error.message || 'Unknown error';
                    setValidationBox('error', 'Swap failed', [errorMsg]);
                    showToast('error', `Swap failed: ${errorMsg}`);
                }
            });
        }

        updateWalletUI();
        updateSlippageUI();
        renderWalletModal();
        console.log('7. ✅ Módulo de Solana inicializado correctamente');
    } catch (error) {
        console.error('Error fatal en módulo de Solana:', error);
    }
}
