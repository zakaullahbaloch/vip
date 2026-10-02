'use strict';

const fs = require('node:fs');

// Keep the current list in memory, but refresh it whenever addprem rewrites this file.
const initialPremiumUsers = ["7297849559"];
let cachedSource;
let cachedUsers;

function parsePremiumUsers(source) {
  const match = source.match(/(?:const|let|var)\s+(?:premiumUsers|initialPremiumUsers)\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!match) return null;

  const users = [];
  const entryPattern = /(['\"])([^'\"]*)\1|(?<![\w$])(\d{5,20})(?![\w$])/g;
  for (const entry of match[1].matchAll(entryPattern)) {
    const id = entry[2] ?? entry[3];
    if (/^\d{5,20}$/.test(id)) users.push(id);
  }
  return [...new Set(users)];
}

function getPremiumUsers() {
  let source;
  try {
    source = fs.readFileSync(__filename, 'utf8');
  } catch {
    return cachedUsers || initialPremiumUsers.slice();
  }

  if (source !== cachedSource || !cachedUsers) {
    cachedUsers = parsePremiumUsers(source) ?? initialPremiumUsers.slice();
    cachedSource = source;
  }
  return cachedUsers;
}

const premiumUsers = new Proxy([], {
  get(_target, property) {
    const users = getPremiumUsers();
    const value = Reflect.get(users, property, users);
    return typeof value === 'function' ? value.bind(users) : value;
  },
  set(_target, property, value) {
    const users = getPremiumUsers();
    return Reflect.set(users, property, value, users);
  }
});

module.exports = premiumUsers;
