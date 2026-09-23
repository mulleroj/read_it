# READ IT! – M6C.1 Audio Release Gate a integrační návrh

**Verze:** 2026.1-gate  
**Stav:** Design + licence – **bez integrace, bez publikace MP3**  
**Baseline:** `main` @ `0d12d2f0e3ec28c2f9d838ca2596c0e8d9d15e17`  
**Prototyp:** Piper `2023.11.14-2` (Windows amd64), hlas `en_GB-alba-medium` – 10× WAV schváleno pedagogicky (M6A.2)

> **Disclaimer:** Tento dokument je technicko-právní orientace pro plánování, **ne právní poradenství**.

---

## 1. Ověřená licence a atribuce (fakta se zdroji)

### 1.1 Piper engine (lokální generátor)

| Fakt | Zdroj |
|------|-------|
| Projekt **rhasspy/piper**, licence **MIT** (Copyright Michael Hansen, 2022) | [LICENSE.md](https://github.com/rhasspy/piper/blob/master/LICENSE.md) |
| Windows balíček použitý v prototypu: release tag **`2023.11.14-2`**, asset **`piper_windows_amd64.zip`** | [GitHub Release 2023.11.14-2](https://github.com/rhasspy/piper/releases/tag/2023.11.14-2) |
| Piper **neukládá extra restrikce na hlasy**; licence hlasu určuje **MODEL_CARD** daného hlasu | [Piper README – Voices](https://github.com/rhasspy/piper/blob/master/README.md) (viz též [piper-docs/voices](https://tderflinger.github.io/piper-docs/about/voices/)) |
| Phonemizer **espeak-ng** (přes piper-phonemize) je **GPL v3** – týká se toolchainu, ne nutně výstupního WAV | [GitHub Discussion #271](https://github.com/rhasspy/piper/discussions/271) (maintainer synesthesiam) |

### 1.2 Hlas `en_GB-alba-medium`

| Fakt | Zdroj |
|------|-------|
| Jazyk: en_GB, kvalita medium, 22 050 Hz | [MODEL_CARD alba/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alba/medium) |
| Tréninkový dataset: **Alba speech corpus**, University of Edinburgh | [Datashare 10283/3270](https://datashare.ed.ac.uk/handle/10283/3270) |
| Licence datasetu: **CC BY 4.0** | [readme.txt corpusu](https://datashare.ed.ac.uk/bitstream/handle/10283/3270/readme.txt) |
| CC BY 4.0 u datasetu **neovlivňuje morální práva voice talent**; „derogatory“ použití je zakázáno | [readme.txt – moral rights](https://datashare.ed.ac.uk/bitstream/handle/10283/3270/readme.txt) |
| Alba model je **fine-tuned z** `en_US-lessac-medium` | [MODEL_CARD alba/medium](https://huggingface.co/rhasspy/piper-voices/raw/main/en/en_GB/alba/medium/MODEL_CARD) |

### 1.3 Hlas `en_US-lessac-medium` (řetězec předků)

| Fakt | Zdroj |
|------|-------|
| Trénován **from scratch** na Blizzard 2013 Lessac datech | [MODEL_CARD lessac/medium](https://huggingface.co/rhasspy/piper-voices/raw/main/en/en_US/lessac/medium/MODEL_CARD) |
| Licence datasetu: **Blizzard 2013 Research Licence** (Voice Factory + Lessac Technologies) | [license.html](https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html) |
| Materiály jsou licencovány výhradně pro **„Research Purposes“** | [license.html §1.1](https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html) |
| Licence **vylučuje komerční účel**, včetně „development, marketing, commercialisation, sale or licensing of voice synthesis … products or services“ | [license.html – Research Purposes definition](https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html) |
| Audio rights v nahrávkách zůstávají majetkem Voice Factory / Lessac | [license.html – úvod](https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html) |

### 1.4 Co zdroje **ne** říkají (důležité)

| Chybí explicitní tvrzení | Poznámka |
|--------------------------|----------|
| **Redistribuce syntetizovaných MP3/WAV** z Alba modelu | MODEL_CARD uvádí CC BY 4.0 u **tréninkového datasetu**, ne u výstupů inference |
| **Komerční publikace** aplikace s Alba audiem | Piper maintainer: „responsibility of the end user to make the ultimate judgement“ | [Discussion #271](https://github.com/rhasspy/piper/discussions/271) |
| **Právní vliv fine-tune z Lessac** na Alba | MODEL_CARD uvádí lineage, ale **ne** právní posouzení kompatibility s CC BY 4.0 |

---

## 2. Nevyřešené otázky (Lessac / Alba / výstupy)

| # | Otázka | Proč je nevyřešená |
|---|--------|-------------------|
| Q1 | Platí CC BY 4.0 Alba corpusu na **syntetizované nahrávky** distribuované ve statické webové aplikaci? | CC BY 4.0 standardně licencuje **Licensed Material** (dataset); generované klipy nejsou v MODEL_CARD výslovně označeny |
| Q2 | Fine-tune z **Lessac** (Blizzard research-only) **přenáší restrikce** na Alba a její výstupy? | MODEL_CARD uvádí lineage; Blizzard licence vylučuje komerční voice synthesis produkty; **žádný autoritativní právní závěr** v repozitáři Piper |
| Q3 | Je READ IT! (open statická app pro školy) **„komerční voice synthesis product“** ve smyslu Blizzard licence? | Definice je široká; bez právního posouzení nelze potvrdit ani vyloučit |
| Q4 | Stačí atribuce CC BY 4.0 (Edinburgh corpus) pro **10 MP3 v `assets/audio/`**? | Atribuční požadavky pro dataset ≠ potvrzená permission pro derived audio outputs |
| Q5 | Vyžaduje Alba **jméno voice talent** (moral rights) u TTS výstupů? | readme.txt corpusu chrání talent proti „derogatory“ použití; rozsah u syntézy nejasný |

**Komunitní kontext (ne autorita):** V [Discussion #271](https://github.com/rhasspy/piper/discussions/271) účastník StoryHack uvádí, že Blizzard licence je restriktivní a „will not allow any derivative to be used commercially“ – **neoficiální názor**, ne rozhodnutí licencora.

---

## 3. Public release gate

### Verdikt: **BLOCKED**

| Kritérium | Stav | Důvod |
|-----------|------|-------|
| Pedagogická kvalita 10 slov | ✅ PASS | Schváleno vlastníkem projektu (M6A.2) |
| Technická připravenost návrhu integrace | ✅ PASS | Viz §4 |
| **Právní jistota redistribuce MP3** | ❌ **FAIL** | Viz tabulka níže |

**Odůvodnění BLOCKED:**

1. **CC BY 4.0 u Alba datasetu ≠ potvrzené právo veřejně distribuovat generované MP3.** MODEL_CARD neadresuje output redistribution.
2. **Lessac lineage:** Alba je fine-tuned z hlasu trénovaného na Blizzard 2013 datech s **research-only** licencí vylučující komercializaci voice synthesis produktů.
3. **Piper maintainer** explicitně přesouvá rozhodnutí na koncového uživatele – projekt neposkytuje clearance.
4. **Žádný písemný souhlas** Voice Factory / Lessac / University of Edinburgh pro bundling syntetizovaných klipů v READ IT! neexistuje v ověřených zdrojích.

**Co by odblokovalo PUBLIC RELEASE (nutné všechny relevantní body):**

- [ ] Písemné právní posouzení (školní/organizační právník) pro: Alba fine-tune lineage + statická distribuce MP3 + školní provoz
- [ ] **Nebo** alternativní hlas s jednoznačnou licencí výstupů (např. model trénovaný from scratch na CC BY / public domain datech **bez** Blizzard lineage, s explicitní MODEL_CARD pro outputs)
- [ ] **Nebo** písemný souhlas držitelů práv (Lessac/Voice Factory / Edinburgh) pro konkrétní use case
- [ ] Aktualizace `docs/THIRD_PARTY.md` a atribuce schválená právníkem
- [ ] Explicitní schválení vlastníka projektu po právním clearance

---

## 4. Minimální integrace – 10 schválených slov

**Rozsah:** pouze prototypová desítka z `tools/audio-prototype/words.txt`, **ne** 33 slov M6B, **ne** banka 80–120.

### 4.1 Principy

| Požadavek | Návrh |
|-----------|-------|
| Production-time generace | Piper + ffmpeg **mimo runtime** (`tools/audio-prototype/` → build script) |
| Bundled statické soubory | `assets/audio/{wordId}.mp3` |
| Bez cloudu / API / účtu | HTML5 `<audio>`, lokální URL |
| Mapování wordId → audio | `word.audioId === word.id` (nebo `audioId` = basename souboru) |
| Student Play / Listen | Tlačítko u slova v aktivitách; `aria-label` cs/en |
| Učitel | Stejné tlačítko + klávesová zkratka (mezerník) v teacher mode |
| Fallback bez audia | Skrýt/disable tlačítko; IPA + text zůstává; žádné 404 v konzoli |
| PWA/offline ready | Relativní cesty; později precache manifest (M4) |

### 4.2 Mapování 10 slov → wordId v repozitáři

| Slovo | wordId | Soubor JSON |
|-------|--------|-------------|
| rain | `w-rain` | `content/words/demo-vowel-teams.json` |
| day | `w-day` | `content/words/demo-vowel-teams.json` |
| car | `w-car` | `content/words/mixed-read-it.json` |
| bird | `w-bird` | `content/words/mixed-read-it.json` |
| coin | `w-coin` | `content/words/mixed-read-it.json` |
| cow | `w-cow` | `content/words/mixed-read-it.json` |
| city | `w-city` | `content/words/mixed-read-it.json` |
| gym | `w-gym` | `content/words/mixed-read-it.json` |
| happy | `w-happy` | `content/words/mixed-read-it.json` |
| letter | `w-letter` | `content/words/mixed-read-it.json` |

**Cílová cesta:** `assets/audio/w-rain.mp3` … `assets/audio/w-letter.mp3`

### 4.3 Změny v architektuře (implementace až po odblokování gate)

#### Obsah a validace

| Soubor | Změna |
|--------|-------|
| `content/words/demo-vowel-teams.json` | `audioId: "w-rain"`, `audioId: "w-day"` u 2 slov (zbytek `null`) |
| `content/words/mixed-read-it.json` | `audioId` u 8 slov výše; ostatní zůstanou `null` |
| `content/meta/audio-manifest.json` | **Nový** – seznam `{ wordId, path, durationMs? }` pro CI validaci |
| `src/core/content-loader.js` | `validateContentReferences`: pokud `audioId != null`, ověřit přítomnost v manifestu (ne hardcoded error) |
| `content/meta/version.json` | Bump `contentVersion` při prvním audio release |

#### Runtime moduly

| Soubor | Změna |
|--------|-------|
| `src/audio/player.js` | **Nový** – singleton `<audio>`, `playWord(wordId)`, preload, error handling, user-gesture guard |
| `src/audio/manifest.js` | **Nový** – načtení `audio-manifest.json`, `hasAudio(wordId)` |
| `src/ui/word-audio-control.js` | **Nový** – `<button>` Play/Listen, stavy loading/unavailable/playing |
| `src/i18n.js` | Klíče: `audioPlay`, `audioListen`, `audioUnavailable`, `audioPlaying` |
| `src/activities/sort-words.js` | Audio tlačítko u word-chip |
| `src/activities/find-pattern.js` | Audio u zobrazeného slova |
| `src/activities/build-word.js` | Audio u cílového slova (po reveal / teacher) |
| `src/activities/exit-ticket.js` | Audio u spelling (volitelné; assessment – bez spoilera) |
| `src/lessons/lesson-player.js` | Teacher poslechový blok – seznam 5 slov s přehrávačem (rain, car, coin, city, happy) |
| `styles/main.css` | `.word-audio-btn`, focus ring, disabled stav |

#### Produkční assety a build

| Soubor | Změna |
|--------|-------|
| `assets/audio/` | **Nový adresář** – 10× MP3 (až po gate PASS) |
| `assets/audio/README.md` | Atribuce, engine, hlas, datum generace |
| `tools/audio-prototype/export-mp3.ps1` | **Nový** – WAV → MP3 → kopie do `assets/audio/` (pouze v build fázi) |
| `.gitignore` | Prototyp `output/` zůstává ignorován; produkční MP3 **commitovány** až po gate |

#### Dokumentace a atribuce

| Soubor | Změna |
|--------|-------|
| `docs/THIRD_PARTY.md` | Piper MIT, en_GB-alba-medium, Edinburgh CC BY 4.0, espeak-ng GPL (toolchain only), Lessac lineage disclosure |
| `docs/AUDIO_PLAN.md` | Odkaz na tento gate doc; stav integrace |

#### Testy

| Soubor | Změna |
|--------|-------|
| `tests/audio-manifest.test.js` | **Nový** – každý `audioId` v obsahu ∈ manifest; manifest ⊆ existující soubory (mock FS nebo fixture list) |
| `tests/content-loader.test.js` | Aktualizace: s manifestem `audioId` nevyvolává error |
| `tests/mixed-content.test.js` | 8 mixed slov s audioId; zbytek null |
| `tests/word-audio-control.test.js` | **Nový** (volitelně) – render disabled bez manifest entry |
| `tests/lesson-teacher-notes.test.js` | ✅ hard-g guidance (M6C.1 text fix) |

### 4.4 Co se **nemění** v minimálním kroku

- Celá banka 33/80–120 slov
- Runtime TTS / cloud API
- PWA Service Worker (M4 – paralelní track)
- `audioId: null` u slov bez audia (žádné broken reference)

---

## 5. LOCAL PROTOTYPE vs PUBLIC RELEASE

| Kritérium | LOCAL PROTOTYPE (M6A.2) | PUBLIC RELEASE (M6C+) |
|-----------|-------------------------|------------------------|
| Umístění | `tools/audio-prototype/output/*.wav` (gitignored) | `assets/audio/*.mp3` (v repo / deploy) |
| Review | ✅ Lingvistická kvalita schválena | Vyžaduje **právní gate PASS** |
| Distribuce | Pouze lokální poslech učitele (`review.html`) | Statický hosting, ZIP, PWA |
| `audioId` v JSON | Zůstává **`null`** | Nastavit u 10 slov |
| Piper binárka / ONNX | Lokálně, gitignored | **Ne** bundlovat do app – jen MP3 |
| Commit MP3 | ❌ Ne | ✅ Až po gate |
| espeak-ng GPL | Pouze v dev toolchain | Nesmí být v browser bundle |

**LOCAL PROTOTYPE gate:** ✅ **PASS** (pedagogický poslech)  
**PUBLIC RELEASE gate:** ❌ **BLOCKED** (licence výstupů)

---

## 6. Explicitní schválení pro další krok

Vlastník projektu musí **písemně** rozhodnout jednu z větví:

### Větev A – Pokračovat s Albou (doporučeno až po právním review)

1. Objednat právní posouzení Q1–Q5 (§2) pro české školní nasazení.
2. Po **PASS** právníka: schválit M6C.2 implementaci dle §4.
3. Spustit `export-mp3.ps1` → commit 10 MP3 + manifest + kód.

### Větev B – Bez právního rizika (alternativa)

1. Vybrat hlas **bez Blizzard/Lessac lineage** s explicitní licencí výstupů (např. LJSpeech-based, Apache 2.0 Kokoro, nebo lidské nahrávky).
2. Opakovat 10-slovný prototyp + review.
3. Teprve potom M6C.2 integrace.

### Větev C – Pouze učitelský lokální poslech (současný stav)

- Zachovat `tools/audio-prototype/` pro učitele.
- **Ne** publikovat MP3 v aplikaci.
- Gate zůstává BLOCKED; integrace se neimplementuje.

**Doporučený nejbližší krok:** **Větev A krok 1** (právní review) **nebo** **Větev B** pokud právní review není k dispozici – **neimplementovat** `assets/audio/` dokud gate ≠ PASS.

---

## 7. Odkazy

| Zdroj | URL |
|-------|-----|
| Piper | https://github.com/rhasspy/piper |
| Piper Release 2023.11.14-2 | https://github.com/rhasspy/piper/releases/tag/2023.11.14-2 |
| Alba MODEL_CARD | https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alba/medium |
| Lessac MODEL_CARD | https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium |
| Alba corpus (Edinburgh) | https://datashare.ed.ac.uk/handle/10283/3270 |
| Blizzard 2013 Lessac licence | https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html |
| CC BY 4.0 | https://creativecommons.org/licenses/by/4.0/ |
| Piper licensing discussion | https://github.com/rhasspy/piper/discussions/271 |
| READ IT! AUDIO_PLAN | [`docs/AUDIO_PLAN.md`](AUDIO_PLAN.md) |
| READ IT! ARCHITECTURE §7 | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) |
