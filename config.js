// ============================================
// CONFIGURACIÓN — IMPORTANTE: NO SUBIR KEYS A GITHUB
// ============================================
// Las API keys deben configurarse como variables de entorno
// o en un archivo .env que NO se comita al repositorio

// Para desarrollo local, crea un archivo 'config.local.js' (en .gitignore)
// con el contenido:
//   const JUPITER_API_KEY = 'tu_key_aqui';
//   const SOLSCAN_API_KEY = 'tu_key_aqui';

// En producción, carga las keys desde variables de entorno:
const JUPITER_API_KEY = window.__ENV_JUPITER_API_KEY || '';
const SOLSCAN_API_KEY = window.__ENV_SOLSCAN_API_KEY || '';

if (!JUPITER_API_KEY) {
    console.warn('⚠️ JUPITER_API_KEY no está configurada. Algunas funciones no funcionarán.');
}
