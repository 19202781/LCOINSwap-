## 🐢 LCOINSWAP - The Engine of LCOIN
**La tortuga no corre, camina 🐢**

Una plataforma de intercambio de tokens en Solana con soporte multi-wallet, validación previa al swap, control de deslizamiento y manejo robusto de errores.

---

## 📋 Características Principales

### 🔐 Multi-Wallet Support
La aplicación soporta **4 proveedores de wallet** principales:
- **Phantom** 👻 - La wallet más popular de Solana
- **Solflare** 🌟 - Alternativa rápida y segura
- **Coinbase Wallet** 🔵 - Integrada con el ecosistema Coinbase
- **Trust Wallet** 🛡️ - Soporte amplio de múltiples blockchains

**Cómo funciona:**
1. El usuario hace clic en "Connect Wallet"
2. Se abre un modal mostrando todas las wallets disponibles en el navegador
3. El usuario selecciona su wallet preferida
4. Se establece la conexión sin requerir seed phrases
5. La dirección se muestra abreviada en la cabecera

**Archivo:** `wallets.js`

### 📊 Control de Slippage
Los usuarios pueden establecer su tolerancia de deslizamiento antes de hacer el swap:
- **Rango:** 0.1% a 50%
- **Presets rápidos:** 0.5%, 1.0%, 2.0%, 5.0%
- **Validación en tiempo real:** Advierte si el slippage es muy alto (>5%)
- **Impacto en el cálculo:** Reduce el monto mínimo esperado

**Interfaz:**
```
Slippage tolerance: [input] %
[0.5%] [1.0%] [2.0%] [5.0%]
⚠ Low slippage is recommended for LCOIN.
```

**Archivo:** `slippage.js`

### ✅ Validación Previa al Swap
Antes de firmar en la wallet, se validan **10 puntos críticos:**

1. **Autenticación:** ¿Está la wallet conectada?
2. **API Key:** ¿Está configurada JUPITER_API_KEY?
3. **Monto válido:** ¿Es mayor que 0 y mayor que el mínimo?
4. **Token de entrada:** ¿Es una dirección mint válida?
5. **Token de salida:** ¿LCOIN mint es válido?
6. **Quote disponible:** ¿Devolvió Jupiter un precio?
7. **Slippage válido:** ¿Es menor que el máximo permitido?
8. **Límite diario:** ¿No se ha alcanzado el límite de 5M LCOIN/día?
9. **Output mínimo:** ¿La cantidad es aceptable según slippage?
10. **Balance suficiente:** Verificación indirecta por quote

**Errores mostrados antes de firmar:**
```
❌ Validation error
- Invalid amount
- Daily limit exceeded
- High slippage detected
- No quote available
```

**Archivo:** `validation.js`

### 🔴 Manejo de Errores Robusto

#### Antes del Swap:
- **Error Box:** Muestra en rojo todos los errores que previenen el swap
- **Warning Box:** Muestra en naranja advertencias que el usuario debe revisar
- **Toast notifications:** Mensajes temporales para acciones rápidas

#### Durante el Swap:
- **Estados de carga:** "Preparing swap..." → "Building transaction..." → "Awaiting wallet signature..." → "Sending transaction..."
- **Rollback automático:** Si falla en cualquier paso, se cancela
- **Mensajes claros:** Explica qué salió mal sin tecnicismos

#### Después del Swap:
- **Confirmación:** Toast verde con TX hash
- **Límite diario actualizado:** Se guarda en localStorage
- **Recalculación automática:** Se actualiza la cantidad esperada

---

## 🛠️ Arquitectura Técnica

### Archivos del Proyecto

```
index.html              # Estructura HTML con modales y controles
style.css              # Estilos de UI/UX con tema cyberpunk
script.js              # Lógica principal y orquestación
config.js              # Configuración de API keys
wallets.js             # Gestor de wallets multi-proveedor
slippage.js            # Cálculo y control de slippage
validation.js          # Validación previa al swap
```

### Flujo de Datos

```
Usuario abre app
    ��
[Fondo animado + Header + Guía de pasos]
    ↓
Usuario hace clic en "Connect Wallet"
    ↓
[Modal de selección de wallets]
    ↓
Usuario selecciona una wallet
    ↓
walletManager.connect(walletId)
    ↓
¿Wallet disponible? → SÍ → Conectar y actualizar UI
                   → NO  → Mostrar error
    ↓
Usuario selecciona token de entrada
    ↓
Usuario ingresa cantidad
    ↓
getJupiterQuote(inputMint, amount, LCOIN_MINT)
    ↓
Mostrar cantidad esperada de LCOIN
    ↓
Usuario ajusta slippage (opcional)
    ↓
Usuario hace clic en "Swap to LCOIN"
    ↓
swapValidator.validateFullSwap(config)
    ↓
¿Validación OK? → NO  → Mostrar errores en error-box
              → SÍ  → Continuar
    ↓
Obtener swap instructions de Jupiter
    ↓
Construir transacción Solana
    ↓
walletManager.signTransaction(tx)
    ↓
connection.sendRawTransaction(tx)
    ↓
connection.confirmTransaction(txId)
    ↓
✅ Mostrar éxito y actualizar límite diario
```

---

## 🔑 Configuración

### API Keys Requeridas

#### JUPITER_API_KEY
- **Dónde obtener:** [Jupiter Aggregator](https://jup.ag)
- **Uso:** Obtener quotes de precio y crear swap instructions
- **Almacenamiento seguro:**
  ```javascript
  // Opción 1: Variable de entorno
  window.__ENV_JUPITER_API_KEY = 'tu_key_aqui';
  
  // Opción 2: En config.js (desarrollo local)
  const JUPITER_API_KEY = 'tu_key_aqui';
  ```

### Configuración de Red

```javascript
// RPC Endpoint
const RPC_ENDPOINT = 'https://solana-rpc.publicnode.com';

// Token Constants
const LCOIN_MINT = 'BFUu1ZkJRHLXw5QVSugjhegxEtnWJUMfkpS6rWX5pump';
const TREASURY_WALLET = '5qqTJ4t82byrugsep67v728K6fYnEmun5SmWcTDaohji';

// Trading Parameters
const SPREAD_PERCENT = 0.25;        // Fee de LCOINSWAP
const DAILY_LIMIT_LCOIN = 5000000;  // Límite diario por wallet
```

---

## 💡 Casos de Uso

### Caso 1: Usuario nuevo sin wallet
1. Abre la app → Ve "Connect Wallet"
2. Hace clic → Ve modal vacío con instrucción de instalar wallet
3. Instala Phantom → Recarga
4. Hace clic → Ve opción de Phantom → Conecta

### Caso 2: Usuario con múltiples wallets
1. Conecta Phantom → Ve su dirección
2. Hace clic en "Connected · Phantom" → Se desconecta
3. Hace clic en "Connect Wallet" → Ve todas sus wallets
4. Selecciona Solflare → Cambia de wallet

### Caso 3: Slippage alto
1. Ingresa cantidad
2. Cambia slippage a 10%
3. Ve advertencia: "Warning: slippage above 5%..."
4. Intenta hacer swap
5. Ve warning-box: "High slippage - execution may be poor"
6. Puede continuar o reducir slippage

### Caso 4: Límite diario alcanzado
1. Ya hizo swap por 5M LCOIN hoy
2. Intenta hacer otro swap
3. Antes de firmar: "Daily limit of 5,000,000 LCOIN reached"
4. Debe esperar a mañana (otro día calendario)

### Caso 5: Token inválido
1. Selecciona "Other (paste mint address)"
2. Pega un string inválido
3. Intenta hacer swap
4. Muestra error: "Invalid token mint address format"

---

## 🧪 Testing Local

### Requisitos
- Navegador con soporte de una wallet (Phantom, Solflare, etc.)
- Devnet o Testnet SOL (opcional para pruebas sin riesgo)

### Pasos
1. Abre `index.html` en el navegador
2. Verifica que todos los scripts se cargan en la consola
3. Haz clic en "Connect Wallet"
4. Selecciona tu wallet preferida
5. Autoriza la conexión
6. Selecciona un token (ej: SOL)
7. Ingresa cantidad (ej: 0.1)
8. Verifica que se muestre la cantidad de LCOIN esperada
9. Ajusta slippage si lo deseas
10. Haz clic en "Swap to LCOIN" para ver validaciones

### Consola de Debugging
Abre DevTools (F12) y revisa la consola para logs:
```
✅ solanaWeb3 cargada correctamente
✅ JUPITER_API_KEY disponible
✅ walletManager disponible
✅ slippageManager disponible
✅ swapValidator disponible
✅ Módulo de Solana inicializado correctamente
```

---

## 🚀 Deployment

### Producción
1. Asegúrate de que `JUPITER_API_KEY` esté configurada como variable de entorno
2. No subas keys a GitHub (usar `.env` en .gitignore)
3. Deploy en GitHub Pages o servidor web
4. Verifica que la wallet connectivity funciona desde el dominio

### Seguridad
- ✅ Nunca solicita seed phrases
- ✅ Solo lee dirección pública
- ✅ Las claves privadas permanecen en la wallet
- ✅ Todas las transacciones se firman en la wallet, no en el servidor
- ✅ Slippage controla el riesgo de mala ejecución

---

## 📱 Responsive Design

La interfaz está optimizada para:
- **Desktop (1920px+):** Layout completo con todas las opciones
- **Tablet (768px-1024px):** Elementos apilados, modal centrado
- **Mobile (320px-767px):** Touch-friendly, slippage en vertical

```css
@media (max-width: 600px) {
    /* Elementos se adaptan para pantallas pequeñas */
    .swap-card { padding: 1.5rem 1rem; }
    #toast-container { left: 10px; right: 10px; }
}
```

---

## 🎨 Tema Visual

**Paleta de colores:**
- **Fondo:** #0A0F1A (azul marino oscuro)
- **Acentos:** #00F0FF (cian brillante), #1E90FF (azul dodger)
- **Texto:** #FFFFFF (blanco), #C0C0C0 (gris plateado)
- **Errores:** #FF4B4B (rojo), #FF6B6B (rojo más claro)
- **Advertencias:** #FFB84D (naranja), #FFD700 (oro)
- **Éxito:** #00FF88 (verde)

**Tipografía:**
- **Títulos:** Orbitron (fuente futurista)
- **Cuerpo:** Space Grotesk (moderno y legible)

---

## 🔗 APIs Externas

### Jupiter Aggregator
- **Endpoint:** `https://api.jup.ag/price/v3`
- **Endpoint:** `https://api.jup.ag/swap/v1/quote`
- **Endpoint:** `https://api.jup.ag/swap/v1/swap-instructions`

### Solana Web3
- **CDN:** `https://unpkg.com/@solana/web3.js@1.98.4/lib/index.iife.min.js`
- **RPC:** `https://solana-rpc.publicnode.com`

---

## 📊 Monitoreo

### Eventos Registrados
- Conexión/Desconexión de wallet
- Cambios de slippage
- Cálculos de quote
- Intentos de swap (éxito/error)
- Límite diario alcanzado

### LocalStorage
```javascript
// Límite diario por wallet
lcoin_swaps_[WALLET_ADDRESS]_[DATE] = AMOUNT_IN_LCOIN
```

---

## 🐛 Solución de Problemas

### "No wallet detected"
**Causa:** Ninguna wallet está instalada
**Solución:** Instala Phantom, Solflare, Coinbase Wallet o Trust Wallet

### "JUPITER_API_KEY no está configurada"
**Causa:** Falta config en config.js
**Solución:** Obtén una API key en Jupiter y configúrala

### "Quote not available"
**Causa:** El par token/LCOIN no tiene liquidez
**Solución:** Intenta con SOL, USDT, USDC, PUMP o JUP

### "Daily limit exceeded"
**Causa:** Ya se alcanzó 5M LCOIN hoy
**Solución:** Espera a mañana (cambio de día calendario)

### Modal no cierra
**Causa:** JavaScript bloqueado
**Solución:** Verifica DevTools (F12) para errores

---

## 📚 Referencias

- [Jupiter Documentation](https://docs.jup.ag)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js)
- [SPL Token Program](https://spl.solana.com/token)
- [Phantom Wallet](https://phantom.app)
- [Solflare Wallet](https://solflare.com)

---

## 📄 Licencia

Proyecto LCOIN - 2026

**La tortuga no corre, camina 🐢**
