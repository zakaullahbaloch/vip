'use strict';

const fs = require('node:fs');
const path = require('node:path');

const packageEntry = require.resolve('@whiskeysockets/baileys');
const socketPath = path.join(path.dirname(packageEntry), 'Socket', 'socket.js');

if (!fs.existsSync(socketPath)) {
  throw new Error(`Baileys socket source not found: ${socketPath}`);
}

const source = fs.readFileSync(socketPath, 'utf8');
const startMarker = 'const requestPairingCode = async (phoneNumber, customPairingCode) => {';
const endMarker = 'async function generatePairingKey()';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start < 0 || end < 0) {
  throw new Error('Unexpected Baileys source: could not locate requestPairingCode implementation.');
}

const fn = source.slice(start, end);
if (/const pairingCode\s*=\s*customPairingCode\s*\|\|/.test(fn)) {
  console.log('Baileys already uses the supplied custom pairing code.');
  process.exit(0);
}

const assignment = /const pairingCode\s*=\s*(['"])([A-Z0-9]{8})\1\s*;/g;
const matches = [...fn.matchAll(assignment)];
if (matches.length !== 1) {
  throw new Error(`Unexpected Baileys pairing-code assignment count: ${matches.length}`);
}

const defaultCode = matches[0][2];
const patchedFn = fn.replace(assignment, `const pairingCode = customPairingCode || '${defaultCode}';`);
const patchedSource = source.slice(0, start) + patchedFn + source.slice(end);
fs.writeFileSync(socketPath, patchedSource, 'utf8');
console.log('Patched Baileys to honor customPairingCode (with its original fallback).');
