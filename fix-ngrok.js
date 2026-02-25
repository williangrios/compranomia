/**
 * fix-ngrok.js - Correções para compatibilidade do @expo/ngrok com ngrok v3
 *
 * PROBLEMA:
 * O pacote @expo/ngrok@4.1.3 usado pelo Expo CLI inclui o binário do ngrok v2.3.41.
 * Em fev/2026, o ngrok.com passou a exigir versão mínima 3.20.0 para contas free,
 * rejeitando conexões de agentes antigos com ERR_NGROK_121.
 *
 * Além da versão do binário, a API do ngrok v3 mudou:
 * - Não aceita campos como authtoken, configPath, hostname, subdomain no POST /api/tunnels
 * - Hostnames customizados (ex: xxx.exp.direct) são exclusivos de planos pagos
 * - Tunnels com nomes duplicados são rejeitados (v2 permitia)
 *
 * O Expo CLI também tem um timeout hardcoded de 10s que é insuficiente.
 *
 * CORREÇÕES APLICADAS:
 * Fix 0: Substitui o binário ngrok v2 pelo v3 e configura o authtoken
 * Fix 1: Gera novo UUID a cada retry para evitar erro "tunnel already exists"
 * Fix 2: Remove campos incompatíveis com a API do ngrok v3
 * Fix 3: Aumenta o timeout de conexão de 10s para 60s
 *
 * Este script roda automaticamente via "postinstall" no package.json.
 */
const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')

const ngrokBinPath = 'node_modules/@expo/ngrok-bin-win32-x64/ngrok.exe'

// Fix 0: Baixar ngrok v3 se o binário for v2
try {
    const version = execSync(`"${ngrokBinPath}" version`, { encoding: 'utf8' }).trim()
    console.log('ngrok version:', version)
    if (!version.includes('3.')) {
        throw new Error('old version')
    }
} catch (e) {
    console.log('⬇️  Downloading ngrok v3...')
    try {
        execSync('powershell -Command "Invoke-WebRequest -Uri https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip -OutFile ngrok.zip"', { stdio: 'inherit' })
        execSync(`tar -xf ngrok.zip -C ${path.dirname(ngrokBinPath)}`, { stdio: 'inherit' })
        fs.unlinkSync('ngrok.zip')
        // Configurar authtoken
        execSync(`"${ngrokBinPath}" config add-authtoken 2mHrxQ5t0wFlWXSJExzKlTsdOsC_7bjZiV2LuDKKc4DXUneiU`, { stdio: 'inherit' })
        console.log('✅ ngrok v3 installed')
    } catch (err) {
        console.error('❌ Failed to download ngrok v3:', err.message)
    }
}

// Fix 1: index.js - UUID duplicado
const indexFile = 'node_modules/@expo/ngrok/index.js'
let index = fs.readFileSync(indexFile, 'utf8')
index = index.replace(
    'opts.name = String(opts.name || uuid.v4());',
    'opts.name = String(uuid.v4());'
)
fs.writeFileSync(indexFile, index)

// Fix 2: utils.js - campos incompatíveis com ngrok v3
const utilsFile = 'node_modules/@expo/ngrok/src/utils.js'
let utils = fs.readFileSync(utilsFile, 'utf8')
if (!utils.includes('delete opts.authtoken')) {
    utils = utils.replace(
        'if (opts.httpauth) opts.auth = opts.httpauth;\n  return opts;',
        'if (opts.httpauth) opts.auth = opts.httpauth;\n  delete opts.authtoken;\n  delete opts.configPath;\n  delete opts.onStatusChange;\n  delete opts.onLogEvent;\n  delete opts.port;\n  delete opts.host;\n  delete opts.hostname;\n  delete opts.subdomain;\n  return opts;'
    )
    fs.writeFileSync(utilsFile, utils)
}

// Fix 3: AsyncNgrok.js - timeout muito curto
const ngrokPaths = [
    'node_modules/@expo/cli/build/src/start/server/AsyncNgrok.js',
    'node_modules/expo/node_modules/@expo/cli/build/src/start/server/AsyncNgrok.js',
]

for (const ngrokFile of ngrokPaths) {
    try {
        let ngrok = fs.readFileSync(ngrokFile, 'utf8')
        ngrok = ngrok.replace(
            'const TUNNEL_TIMEOUT = 10 * 1000;',
            'const TUNNEL_TIMEOUT = 60 * 1000;'
        )
        fs.writeFileSync(ngrokFile, ngrok)
        console.log(`✅ AsyncNgrok timeout fix applied: ${ngrokFile}`)
    } catch (e) {
        // skip if not found
    }
}