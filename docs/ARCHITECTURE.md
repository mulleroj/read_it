# READ IT! – Technická architektura

## 1. Doporučená architektura

**Statická webová aplikace (SPA-lite)** postavená na HTML, CSS a vanilla JavaScript (ES modules).

```
┌─────────────────────────────────────────────────────────┐
│                    Prohlížeč (klient)                    │
├─────────────┬──────────────┬──────────────┬─────────────┤
│   Router    │ Activity     │ Lesson       │ Print / QR  │
│   (hash)    │ Engine       │ Builder      │ Module      │
├─────────────┴──────────────┴──────────────┴─────────────┤
│              Content Store (JSON + cache)                │
├─────────────────────────────────────────────────────────┤
│   Audio Player  │  Local Storage  │  Service Worker    │
└─────────────────────────────────────────────────────────┘
         ▲                    ▲
         │                    │
   content/*.json      assets/audio, images
```

### Proč tento přístup

| Výhoda | Omezení | Provozní náklady |
|--------|---------|------------------|
| Nulový backend, statický hosting | Složitější sdílení stavu mezi zařízeními | 0 Kč povinných služeb (Netlify free tier + GitHub) |
| Plná offline podpora přes SW | Service Worker vyžaduje HTTPS (nebo localhost) | 0 Kč |
| Snadná údržba – jen soubory | Velký objem assetů = větší initial download | Diskové místo na serveru/PC |
| Bez build kroku (fáze 1) | Později může být potřeba bundler pro minifikaci | 0 Kč |

**Alternativy zamítnuté:** Electron (nadměrná složitost), React/Vue (zbytečná závislost pro daný rozsah), backend + DB (porušuje požadavky).

### PWA – doporučení

PWA **doporučujeme** pro:
- Cache statických assetů a obsahu
- „Přidat na plochu" na mobilech
- Spolehlivější offline než samotný localStorage

PWA **negarantuje** offline sama o sobě – vyžaduje správně napsaný Service Worker a precache strategii.

---

## 2. Struktura projektu

```
Read_it/
├── index.html                 # Vstupní bod
├── manifest.webmanifest       # PWA manifest
├── sw.js                      # Service Worker
├── README.md
├── docs/
├── public/                    # Statické assety (kopírovány beze změny)
│   ├── icons/
│   └── fonts/                 # Volitelné webfonty (lokálně)
├── assets/
│   ├── audio/                 # MP3/OGG soubory
│   │   └── {wordId}.mp3
│   └── images/
│       └── {imageId}.webp
├── content/
│   ├── schema/                # JSON Schema pro validaci
│   ├── meta/
│   │   └── version.json       # Verze obsahu a kompatibility
│   ├── patterns/              # Pravopisné vzory
│   ├── words/                 # Slovní databáze (po částech)
│   ├── exercises/             # Definice cvičení
│   ├── lessons/               # Preset lekce
│   └── categories/            # Tematické oblasti
├── src/
│   ├── main.js                # Bootstrap aplikace
│   ├── router.js              # Hash-based routing
│   ├── config.js              # Konstanty, verze API
│   ├── core/
│   │   ├── content-loader.js  # Načítání a cache JSON
│   │   ├── storage.js         # localStorage wrapper
│   │   ├── validator.js       # Validace odpovědí
│   │   └── i18n.js            # UI texty (cs/en)
│   ├── modes/
│   │   ├── teacher.js
│   │   ├── student.js
│   │   ├── game.js
│   │   ├── paper.js
│   │   ├── builder.js
│   │   └── library.js
│   ├── activities/            # Jeden modul na typ aktivity
│   │   ├── registry.js
│   │   ├── listen-repeat.js
│   │   ├── listen-choose.js
│   │   └── ...
│   ├── share/
│   │   ├── url-codec.js       # Serializace/deserializace konfigurace
│   │   └── qr.js              # Lokální generování QR
│   ├── audio/
│   │   └── player.js
│   └── print/
│       └── templates.js
├── styles/
│   ├── main.css
│   ├── modes/
│   └── print.css              # @media print
└── tests/
    ├── unit/
    └── e2e/
```

**Princip:** `content/` = data, `src/` = logika, `assets/` = binární soubory. Žádná duplikace obsahu mezi režimy.

---

## 3. Datový model obsahu

### 3.1 Identifikátory

Stabilní, neměnné ID ve formátu `kebab-case` s prefixem:

- `pat-silent-e` – pattern
- `w-cat-001` – word
- `ex-listen-choose-001` – exercise
- `les-vowel-teams-30` – lesson preset

Verze schématu v `content/meta/version.json`:

```json
{
  "schemaVersion": "1.0.0",
  "contentVersion": "2026.1",
  "minAppVersion": "1.0.0"
}
```

### 3.2 Pattern (pravopisný vzor)

```json
{
  "id": "pat-ai-ei",
  "categoryId": "cat-vowel-teams",
  "label": { "cs": "Vowel team: ai / ay", "en": "ai / ay" },
  "description": { "cs": "..." },
  "graphemes": ["ai", "ay"],
  "phoneme": "/eɪ/",
  "notes": { "cs": "Konvence: ai uprostřed, ay na konci" },
  "exampleWordIds": ["w-rain-001", "w-day-001"]
}
```

### 3.3 Word (slovo)

```json
{
  "id": "w-rain-001",
  "spelling": "rain",
  "ipa": "/reɪn/",
  "patternIds": ["pat-ai-ei"],
  "audioId": "audio-w-rain-001",
  "imageId": null,
  "difficulty": "easy",
  "tags": ["vocational-weather"],
  "distractors": ["rein", "rane"]
}
```

### 3.4 Exercise (cvičení)

```json
{
  "id": "ex-listen-choose-001",
  "type": "listen-choose",
  "title": { "cs": "Poslechni a vyber" },
  "patternId": "pat-ai-ei",
  "difficulty": "medium",
  "durationMinutes": 5,
  "items": [
    {
      "promptWordId": "w-rain-001",
      "options": ["rain", "rein", "rane", "ran"],
      "correctIndex": 0
    }
  ],
  "autoCheck": true,
  "printable": true
}
```

### 3.5 Lesson (lekce)

```json
{
  "id": "les-vowel-teams-30",
  "title": { "cs": "Vowel teams – 30 minut" },
  "preset": true,
  "totalMinutes": 30,
  "blocks": [
    { "exerciseId": "ex-listen-repeat-001", "minutes": 5 },
    { "exerciseId": "ex-find-pattern-001", "minutes": 10 },
    { "exerciseId": "ex-exit-ticket-001", "minutes": 5 }
  ],
  "teacherNotes": { "cs": "..." }
}
```

### 3.6 Custom Lesson Config (ucitelem sestavená)

Uloženo v localStorage + serializovatelné do URL:

```json
{
  "v": 1,
  "kind": "lesson",
  "title": "Moje lekce – diphthongs",
  "exercises": [
    { "id": "ex-listen-choose-003", "difficulty": "hard" }
  ],
  "createdAt": "2026-09-23T15:00:00Z"
}
```

---

## 4. Activity Engine (motor cvičení)

### Princip

Každý typ aktivity je modul implementující společné rozhraní:

```javascript
// Konceptuální rozhraní (implementace až ve fázi vývoje)
{
  type: 'listen-choose',
  render(container, exercise, context),   // context: mode, difficulty override
  bindEvents(container, handlers),
  checkAnswer(itemIndex, userInput) → { correct, feedback },
  getPrintView(exercise) → HTMLElement | null,
  supportsMode(mode) → boolean
}
```

### Registry

`activities/registry.js` mapuje `exercise.type` → modul. Přidání nové aktivity = nový soubor + registrace, bez změny jádra.

### Automatická kontrola

| Typ | Kontrola |
|-----|----------|
| listen-choose, odd-one-out, sort | Deterministická – porovnání s `correctIndex` / `correctOrder` |
| find-mistakes | Diff proti `correctSpelling` |
| build-word | Permutace písmen |
| listen-repeat | **Bez auto-check** – učitel/student hodnotí sami |
| pair-work, team-competition | Manuální / hra bez scoring API |

### Režimová adaptace

Stejný `exercise` objekt, různé `context.mode`:
- `teacher` – velké UI, ovládání klávesnicí, skryté odpovědi
- `student` – dotykové ovládání, okamžitá zpětná vazba
- `game` – týmové skóre v sessionStorage
- `paper` – render do tiskové šablony

---

## 5. Lesson Builder

### Tok

1. Učitel vybere kategorii / vzory
2. Filtruje cvičení dle typu a obtížnosti
3. Přidává bloky, aplikace počítá odhadovaný čas
4. Varování při odchylce od 30 min (±5 min tolerance)
5. Uložení: localStorage (`readit-lessons-custom`)
6. Export: URL + QR

### UI komponenty

- Seznam dostupných cvičení (z `content/exercises/`)
- Náhled vybrané lekce (timeline)
- Tlačítka: Uložit, Sdílet QR, Tisk metodického listu, Spustit

### Preset vs. custom

| Typ | URL strategie |
|-----|---------------|
| Preset lekce | `#/play?lesson=les-vowel-teams-30` (krátké) |
| Custom lekce | `#/play?cfg={compressed}` nebo uložené ID + localStorage sync |

---

## 6. QR a sdílení – architektura

### URL schéma (hash routing – bez serverové konfigurace)

```
https://example.school.cz/readit/#/play?lesson=les-vowel-teams-30
https://example.school.cz/readit/#/play?ex=ex-listen-choose-001&d=medium
https://example.school.cz/readit/#/play?cfg=BASE64URL(LZ-string(JSON))
```

**Hash routing** (`#/...`) zajišťuje, že konfigurace neopouští klienta a funguje na statickém hostingu.

### Komprese custom konfigurace

1. JSON → UTF-8
2. Komprese: **lz-string** (malá knihovna, MIT, bundlována lokálně)
3. Base64url encoding
4. Verzní prefix: `v1.` + payload

Odhad délky: 10 cvičení ≈ 200–400 znaků → QR úroveň M, čitelný na projekci.

### Validace

- Kontrola `schemaVersion` / `v` pole
- Whitelist ID cvičení proti načtenému indexu
- Validace dekódované konfigurace (typ, verze, ID, pořadí, obtížnost, nastavení)
- Graceful fallback: „Lekce nenalezena" + odkaz na knihovnu

**Implementace od M3** – v M1 se QR/URL sdílení neimplementuje.

### QR generace

Knihovna **qrcode** (nebo ekvivalent, MIT) – generování `<canvas>` v prohlížeči, žádné API.

### Offline chování

| Scénář | Chování |
|--------|---------|
| Preset ID, SW aktivní | Plně offline |
| Custom cfg v URL | Offline po cache obsahu |
| První návštěva přes QR | Potřeba stáhnout HTML/JS/content/audio |
| Uložená custom lekce jen v localStorage učitele | Student potřebuje cfg v URL, ne localStorage učitele |

**Důležité:** Custom lekce pro studenty **musí** být v URL (ne spoléhat na localStorage učitele).

---

## 7. Audio – strategie

### Formát

- **Primární:** MP3 (široká podpora v mobilních prohlížečích)
- **Volitelně:** OGG fallback pro starší Firefox (jeden soubor navíc jen pokud testy ukáží potřebu)

### Pojmenování

`assets/audio/{wordId}.mp3` – 1:1 mapování s `word.audioId`

### Přehrávání

- HTML5 `<audio>` element + wrapper pro preload a error handling
- Učitelský režim: klávesové zkratky (mezerník = přehrát)
- Preload: `metadata` defaultně, `auto` pro aktuální cvičení

### Objem dat

Odhad: ~50 KB/slovo → 200 slov ≈ 10 MB. Přijatelné pro školní offline balíček.

### Offline

Service Worker precache audio pro aktivní lekci; lazy fetch pro zbytek knihovny.

---

## 8. Tisk a PDF

### Strategie (doporučená)

**CSS `@media print` + nativní dialog prohlížeče** – bez PDF knihovny v MVP.

| Výhoda | Omezení |
|--------|---------|
| Nulová závislost | Vzhled závisí na prohlížeči |
| Učitel zná „Tisk → PDF" | Méně kontroly nad stránkováním |

### Paper Mode výstupy

- Pracovní list (student)
- Klíč odpovědí (učitel, separátní stránka s `display: none` na obrazovce)
- Metodický list lekce
- Karty pro memory matching (CSS grid, rozřezání)

### Volitelná fáze 2

Client-side PDF přes **pdfmake** nebo **jsPDF** – pouze pokud nativní tisk nestačí.

---

## 9. Offline provoz

### Čtyři režimy distribuce (nesmí se zaměňovat)

| Režim | Popis | Offline schopnost |
|-------|-------|-------------------|
| **Online hosting** | Netlify / školní HTTPS web | Vyžaduje síť (kromě cache prohlížeče) |
| **Nainstalovaná PWA** | SW + manifest, „Přidat na plochu" | Plný offline po precache (**M4**) |
| **Archiv souborů** | ZIP / složka na disku | Soubory jsou lokální, ale `file://` **neaktivuje SW** |
| **Spustitelný offline** | Lokální HTTP server nebo nainstalovaná PWA | Skutečný provoz bez sítě |

**Důležité:** Otevření `index.html` přes `file://` negarantuje PWA ani spolehlivé načítání ES modulů ve všech prohlížečích. Doporučený offline start: lokální server (`npx serve`) nebo nainstalovaná PWA po M4.

### Vrstvy (implementace M4)

1. **Service Worker** – cache shell (HTML, JS, CSS, manifest)
2. **Runtime cache** – JSON content, audio, obrázky on-demand
3. **localStorage** – custom lekce, rozpracované výsledky studenta

### Strategie cache (M4)

```
install  → precache app shell + content index + meta/version.json
activate → cleanup starých cache
fetch    → cache-first pro assets, network-first pro content updates (volitelně)
```

### Distribuce offline balíčku

- ZIP + lokální HTTP server (IT ve škole)
- PWA instalace po první návštěvě HTTPS (M4)
- Netlify deploy pro online přístup (bez placených služeb)

### Aktualizace obsahu

`content/meta/version.json` – při vyšší verzi SW stáhne nové JSON soubory.

### Audio v M1

Datový model obsahuje volitelné `audioId`. M1 prototyp funguje bez audio souborů – žádné TTS, externí API ani neověřené nahrávky.

---

## 10. Mobilní kompatibilita

- **Mobile-first CSS**, breakpointy: 480 / 768 / 1024 px
- Dotykové cíle min. 44×44 px
- Viewport meta, `touch-action` pro drag aktivit
- Testovací prohlížeče: Chrome Android, Safari iOS, Samsung Internet
- Bez hover-only interakcí

---

## 11. Přístupnost (a11y)

- Sémantické HTML (`main`, `nav`, `button`, `fieldset`)
- ARIA: `aria-live` pro zpětnou vazbu, `aria-label` u audio tlačítek
- Klávesnicová navigace: Tab, Enter, Escape, šipky v MCQ
- Kontrast min. WCAG AA
- Respektovat `prefers-reduced-motion`
- Audio: vizuální alternativa (text/IPA vždy viditelný)

---

## 12. Automatizované testování

### Návrh (implementace od milníku M4)

| Vrstva | Nástroj | Co testovat |
|--------|---------|-------------|
| Unit | **Vitest** nebo **Node test runner** | url-codec, validator, registry |
| Content | JSON Schema (**Ajv**) | Validita všech content souborů |
| E2E | **Playwright** | QR flow, cvičení, offline SW |

Testy spouštět lokálně a v CI (GitHub Actions – volitelně, zdarma).

Bez CDN v testech – lokální statický server (`npx serve`).

---

## 13. Third-party knihovny (plánované, bundlované lokálně)

| Knihovna | Účel | Licence |
|----------|------|---------|
| lz-string | Komprese URL config | MIT |
| qrcode | Generování QR | MIT |
| Ajv | Validace JSON (dev/build) | MIT |

Všechny licence v `docs/THIRD_PARTY.md` (vytvoří se při implementaci).

**Za běhu aplikace:** žádné CDN, vše v `src/vendor/` nebo bundlu.

---

## 14. Technická rizika

| Riziko | Dopad | Mitigace |
|--------|-------|----------|
| Příliš dlouhé URL pro custom lekce | Nečitelný QR | Preset ID, komprese, limit počtu cvičení v jednom QR |
| Velikost audio balíčku | Pomalé první načtení | Lazy load, lekce-specifický precache |
| iOS omezení Service Worker / autoplay | Slabší offline / audio | User gesture pro první audio, test na iOS |
| Tiskové styly v různých prohlížečích | Rozbitý layout | Test Chrome + Edge, jednoduché layouty |
| Lingvistické chyby v obsahu | Pedagogická škoda | Review workflow, oddělení obsahu od kódu |
| Scope creep (16 aktivit najednou) | Nedokončené MVP | Prioritizace 5 aktivit pro MVP |

---

## 15. Rozhodnutí náročná na změnu později

1. **Formát dat (JSON schéma)** – změna ID nebo struktury rozbije URL a cache
2. **URL codec verze (`v1`)** – nutná zpětná kompatibilita navždy
3. **Hash vs. history routing** – hash doporučen pro statický hosting
4. **Audio formát a pojmenování** – přejmenování = broken cache
5. **Activity registry interface** – všechny aktivity na něm závisí

Tyto body jsou detailněji v [DECISIONS.md](DECISIONS.md).
