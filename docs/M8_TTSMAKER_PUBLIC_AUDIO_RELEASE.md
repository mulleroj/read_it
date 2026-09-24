# READ IT! – M8.2 TTSMaker public audio release (design)

**Stav:** **DEPLOYED** (2026-09-24) – 26 MP3 na https://readit-stsul.netlify.app/  
**Veřejné audio v runtime:** **zapnuto** (`publicAudioEnabled: true`, `extendedReleaseEnabled: true`)  
**Piper / Alba:** **BLOCKED** – viz `docs/M6C_AUDIO_RELEASE_GATE.md`

---

## 1. Schválení výslovnosti (záznam)

| Položka | Hodnota |
|---------|---------|
| Schváleno | **26 / 26** výslovností (batch 1: 15, batch 2: 11) |
| Schvalovatel | Vlastník projektu |
| Zdroj schválení | Explicitní prohlášení vlastníka v ChatGPT (2026-09-24) |
| Datum schválení | **2026-09-24** |
| Služba / hlas | TTSMaker · voice **2402** · **Robert** · UK · male |
| Záznam | `content/meta/ttsmaker-audio-approval.json` + `content/meta/ttsmaker-audio-approval-batch2.json` |

**Poznámka:** `review.html` localStorage **nebyl** zdrojem schválení. Neexistuje export review JSON z prohlížeče.

---

## 2. Produkční umístění (26 MP3)

| Vrstva | Cesta | Účel |
|--------|-------|------|
| Intake (lokální, gitignored) | `tools/audio-prototype/ttsmaker-2402/{spelling}.mp3` | M8.1 prototyp + localhost preview |
| **Produkce (cíl)** | `assets/audio/{wordId}.mp3` | Statická redistribuce v app |
| Manifest | `content/meta/audio-manifest.json` | Allowlist cest, SHA-256, mapování |
| Schválení | `content/meta/ttsmaker-audio-approval.json` | Pedagogický gate |

**Nikdy** nekopírovat celý `tools/audio-prototype/` do `dist/`.

---

## 3. Mapování wordId → soubor

| wordId | Soubor (produkce) | Intake |
|--------|-------------------|--------|
| w-rain | `assets/audio/w-rain.mp3` | `rain.mp3` |
| w-day | `assets/audio/w-day.mp3` | `day.mp3` |
| w-car | `assets/audio/w-car.mp3` | `car.mp3` |
| w-bird | `assets/audio/w-bird.mp3` | `bird.mp3` |
| w-coin | `assets/audio/w-coin.mp3` | `coin.mp3` |
| w-cow | `assets/audio/w-cow.mp3` | `cow.mp3` |
| w-city | `assets/audio/w-city.mp3` | `city.mp3` |
| w-gym | `assets/audio/w-gym.mp3` | `gym.mp3` |
| w-happy | `assets/audio/w-happy.mp3` | `happy.mp3` |
| w-letter | `assets/audio/w-letter.mp3` | `letter.mp3` |
| w-tree | `assets/audio/w-tree.mp3` | `tree.mp3` |
| w-bell | `assets/audio/w-bell.mp3` | `bell.mp3` |
| w-clock | `assets/audio/w-clock.mp3` | `clock.mp3` |
| w-gift | `assets/audio/w-gift.mp3` | `gift.mp3` |
| w-boat | `assets/audio/w-boat.mp3` | `boat.mp3` |

Checksumy: viz `content/meta/audio-manifest.json` (M8.2 inventura intake).

---

## 4. Build a bezpečnost

### `scripts/public-surface.mjs`

- `.mp3` zůstává **blokováno** globálně **kromě** cest uvedených v `audio-manifest.json`.
- `tools/**`, `*.wav`, `*.onnx` – stále **blokováno**.
- `assets/audio/README.md` – povoleno (dokumentace).
- MP3 se do `dist/` kopírují **jen pokud** fyzicky existují v `assets/audio/` **a** jsou v manifestu.

### `npm run build:public`

- **Aktuálně:** **26** MP3 v `dist/assets/audio/` (Netlify build z committed `assets/audio/`).

### Netlify

- `publish = dist` beze změny.
- Redirect `/tools/*` → 404 zůstává.
- Po publikaci doplnit header `Content-Type: audio/mpeg` pro `/assets/audio/*`.

---

## 5. Staging workflow (před commitem MP3)

```powershell
node scripts/stage-public-audio.mjs
```

Skript:

1. Načte `content/meta/audio-manifest.json`
2. Ověří intake SHA-256 proti manifestu
3. Zkopíruje **pouze** 15 schválených souborů do `assets/audio/`
4. Ověří výstup (počet, checksum, validní MP3)
5. **Nepublikuje** – necommituje, nedeployuje

---

## 6. Runtime integrace (až po ownerském GO)

Plánované kroky **mimo M8.2**:

1. Nastavit `publicAudioEnabled: true` v manifestu (nebo env gate)
2. Implementovat veřejný přehrávač (`src/audio/public-audio-manifest.js` – připraveno, vypnuto)
3. Nastavit `audioId` u 15 slov v content JSON
4. Commit 15 MP3 + manifest + kód
5. `npm run build:public` → ověřit 15 MP3 v `dist/assets/audio/`
6. Deploy Netlify

**Lokální preview (M8.1)** zůstává: `local-prototype-audio.js` → intake cesta, pouze localhost.

---

## 7. Vyloučení Piper / Alba

| Zdroj | Veřejný build |
|-------|---------------|
| `tools/audio-prototype/output/*.wav` | ❌ blokováno |
| Piper modely / binárky | ❌ blokováno |
| TTSMaker intake v `tools/` | ❌ blokováno |
| TTSMaker produkce v `assets/audio/w-*.mp3` | ✅ pouze manifest allowlist |

---

## 8. Odkazy

- Schválení: `content/meta/ttsmaker-audio-approval.json`
- Manifest: `content/meta/audio-manifest.json`
- Licence: `docs/M8_TTSMAKER_LICENSE_EVIDENCE.md`
- Checklist: `docs/M8_TTSMAKER_AUDIO_RELEASE_CHECKLIST.md`
- Banka (intake): `tools/audio-prototype/ttsmaker-2402/AUDIO_BANK.md`
