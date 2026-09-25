# VIP Bot

This repository contains the sanitized SHAHZU-VIP-BUG Telegram/WhatsApp bot source.

## Required Railway variables

Set `TELEGRAM_BOT_TOKEN` in Railway Variables before starting the bot. Never commit tokens or WhatsApp authentication files.

## Important

The `Love/auth/` directory is intentionally excluded from Git because it contains WhatsApp login/session credentials. Pair the WhatsApp number again on the deployed instance if required.

Start command:

```bash
npm start
```
