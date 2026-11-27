[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/vansouthrace/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/vansouthrace/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

# Gobble Dash — A Turkey's Great Escape

Gerald the turkey is on the Thanksgiving menu, and he is not having it. Outrun the farmer through the farmyard, the barn and the kitchen, jump the fences, dodge the glowing oven and the falling carving knife, grab corn for points, and duck into a haystack when the farmer stops to search. Reach 1,500 metres and Gerald escapes — get caught three times and dinner is served.

Built for the [turkey-run-game-01 bounty](https://make.fun/bounty/turkey-run-game-01) on make.fun.

## How to play

- **Space / ↑ / W / click** — jump
- **↓ / S** — hide in a haystack (only when standing next to one)
- **Enter** — start · **R** — restart after being caught or escaping
- **M** is not needed — sound starts on your first key press; close the tab to mute

Open `game/index.html` from any static server (or run `node serve.ts` and visit http://localhost:8080). No build step, no network requests, no external assets — every script, sound and picture is local. All art is drawn in code on canvas, and all sound is synthesized with WebAudio.

## The game

- **Three stages, rising danger:** Farmyard → Barn → Kitchen. Speed, spawn rate and knife frequency all climb as Gerald runs further.
- **The farmer chases, searches and lunges:** he trails behind you and closes in every time you stumble. Every few seconds he stops and searches — an alert meter climbs while you are out in the open, and a full meter makes him lunge. Hiding in hay drops the alert.
- **Dangers:** fences to jump, a hot oven to clear, carving knives that drop from above, and the farmer himself.
- **Score:** distance plus corn (+25), a clean hide (+15). Three lives, shown in the HUD alongside score, distance, stage and the farmer-danger bar.
- **Replay value:** random spawns, a best score kept across runs, and an escape distance that takes a clean run to reach.

## Files

- `game/index.html` — the page
- `game/style.css` — autumn page styling
- `game/src/config.js` — tuning, stages, speeds
- `game/src/world.js` — rules: turkey, farmer, obstacles, spawning, scoring
- `game/src/render.js` — all canvas art: turkey, farmer, farm, barn, kitchen, HUD
- `game/src/audio.js` — synthesized WebAudio sounds and banjo loop
- `game/src/input.js` — keyboard and mouse input
- `game/src/shots.js` — deterministic staged scenes for screenshots
- `game/src/main.js` — screens, game loop, event wiring
- `main.ts` — the make.fun hand-in program (copies `game/` + `screenshots/` to `/output`, writes `dossier.json`)

## License

MIT — see [LICENSE](LICENSE).
