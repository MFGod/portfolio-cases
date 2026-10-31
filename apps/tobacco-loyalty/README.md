# Mosaic Club

A React reconstruction with fictional content and local artwork. Runtime dependencies are React, React DOM and the shared demo kit.

- `#/club`: member card with status and progress, game entry, the club task and point history.
- `#/game`: a 60-second match-three round on an 8×8 board in a separate iframe module: tap or swipe, arrow keys, falling and shattering pieces, a bonus for runs longer than three and a cascade multiplier. 300 points earn a 20-point reward.
- `#/offers`: category filters, balance checks, one-time redemption and saved codes.
- `#/tasks`: a three-question member survey with a one-time 15-point reward.

The account, board, reward receipts, redeemed codes and task state live in `kit.store`. Loading and mutations go through `kit.demo.request`, which answers after a short pause.

The iframe sends turns and reward requests through `postMessage`. The shell checks the origin, the iframe window, the session, the message schema and the round ID, resolves each turn itself with the same seeded engine the iframe animates, rejects turns after the time is up and pays a reward only for its own finished round. The receipt and the new balance are saved in one snapshot, so a repeated round or offer does not change the balance twice.

The demo runs on one device without messenger SDKs, external services or a trusted server. Balance edits from several tabs at once are not handled.

Run from the repository root:

```sh
npm run typecheck -w apps/tobacco-loyalty
node scripts/build.mjs tobacco-loyalty
npm run scan
```
