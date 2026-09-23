# READ IT! – Plán audio prototypu (M6A)

**Verze:** 2026.1-plan  
**Stav:** Plánování – **negenerovat audio, neinstalovat modely, neměnit runtime** bez dalšího schválení  
**Vazba:** `docs/CONTENT_PLAN.md` (2026.2-plan, schváleno), `docs/DECISIONS.md` D6/D7, `docs/ARCHITECTURE.md` §7

---

## 1. Účel a rozsah

Tento dokument plní úkol **AUDIO PROTOTYPE PLANNING** mezi schválením M6A a startem M6B.

| Co plán řeší | Co plán **neřeší** |
|--------------|-------------------|
| Výběr lokálního TTS enginu pro britskou angličtinu | Plnou audio knihovnu (80–120 slov) |
| Licence enginu, hlasu a redistribuce MP3 | Implementaci přehrávače v aplikaci |
| Postup testu na **10 slovech** | M6B wordlist / JSON obsah |
| Lingvistický review workflow | Runtime TTS, cloud API, browser speech |

**Primární produkt zůstává:** jedna smíšená 30min lekce (`les-read-it-30-mixed`) pokrývající všech 5 oblastí – viz `CONTENT_PLAN.md`.

**Formát finálního audia (D6):** MP3 v `assets/audio/{wordId}.mp3`, mapování přes `audioId` v JSON.

---

## 2. Výslovnostní standard

| Parametr | Požadavek |
|----------|-----------|
| **Varieta** | Současná **standardní britská angličtina** (RP jako referenční model pro výuku v CZ SŠ) |
| **Non-rhotic** | RP: *r* po samohlásce nemá být silně artikulováno (*car*, *bird*, *letter* – kvalita vokálu, ne americký rhotic) |
| **Konzistence** | Jeden schválený hlas / engine pro celou banku; IPA v JSON musí odpovídat schválenému audiu |
| **Vyloučit** | Regionální dialekty (např. „Northern English“, „Southern English“ u Piper) jako hlavní model pro školu |
| **IPA** | Opora pro učitele; **není náhrada poslechu** (schváleno v M6A) |

---

## 3. Deset testovacích slov

Seznam vychází z **`CONTENT_PLAN.md` §7.1** (sort-words: **2 slova × 5 oblastí**) a jádrových příkladů v **§3.3** (*rain, car, coin, city, happy*).

| # | Slovo | Oblast | Vzor (návrh) | Proč v prototypu |
|---|-------|--------|--------------|------------------|
| 1 | **rain** | Vowel Teams | `pat-ai` | Jádrové slovo; /eɪ/ |
| 2 | **day** | Vowel Teams | `pat-ay` | Kontrast *ai* vs *ay* |
| 3 | **car** | R-Controlled | `pat-ar` | Jádrové; RP non-rhotic /ɑː/ |
| 4 | **bird** | R-Controlled | `pat-ir` | Stejná „barva“ jako *er/ur*, jiný zápis |
| 5 | **coin** | Diphthongs | `pat-oi` | Jádrové; /ɔɪ/ |
| 6 | **cow** | Diphthongs | `pat-ow-diph` | /aʊ/ – ne plést s *ow* /əʊ/ |
| 7 | **city** | Soft C/G | `pat-soft-c` | Jádrové; měkké *c* |
| 8 | **gym** | Soft C/G | `pat-soft-g` | Měkké *g* (kontrast k *gift* později) |
| 9 | **happy** | Double Consonants | `pat-pp` | Jádrové; geminát jako **pravopis**, ne „dvojité vyslovení“ |
| 10 | **letter** | Double Consonants | `pat-tt` | Geminát *tt*; kontrola krátkého vokálu |

**Poznámka:** Finální IPA pro tato slova **nejsou v tomto plánu uváděny** – doplní je lingvistický review před zápisem do wordlistu (M6B). Prototyp testuje **kvalitu syntézy**, ne hotový obsahový balíček.

**Kontext v lekci:** Těchto 10 slov odpovídá jedné sort-words sadě ve smíšené hodině; nereprezentuje celou banku 80–120 slov.

---

## 4. Kandidáti: Piper vs Kokoro

Oba enginy splňují požadavek **plně lokální** syntézy (bez runtime API v READ IT!). Oba vyžadují **samostatný build/generátor mimo aplikaci** – runtime READ IT! se nemění.

### 4.1 Piper (rhasspy/piper)

| Aspekt | Hodnocení |
|--------|-----------|
| **Engine** | MIT ([LICENSE.md](https://github.com/rhasspy/piper/blob/master/LICENSE.md)) |
| **Typ** | VITS / ONNX; rychlý na CPU |
| **en_GB hlasy** | alba, alan, cori, jenny_dioco, vctk, … – **licence per MODEL_CARD** |
| **Velikost modelu** | Typicky **~60–65 MB** na medium hlas (např. `en_GB-alba-medium`) + espeak-ng data |
| **Kvalita (RP)** | Střední; vhodné pro krátká izolovaná slova; hlas závisí na datasetu |
| **Integrace do pipeline** | CLI `piper --model … --output_file`; batch skript → WAV → ffmpeg → MP3 |
| **Phonemizer** | **espeak-ng** (GPL) přes piper-phonemize – viz §6 |

**Doporučený hlas pro licenční review (ne instalovat bez schválení):**

| Hlas | Dataset licence | Poznámka |
|------|-----------------|----------|
| **en_GB-alba-medium** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (Edinburgh data) | Nejjasnější licence mezi kontrolovanými en_GB hlasy |
| en_GB-alan-medium | „See URL“ (Mycroft mimic3) | **Ne** pro komerční/redistribuci bez právní kontroly |
| en_GB-jenny_dioco-medium | „See URL“ | Totéž |

### 4.2 Kokoro (hexgrad/Kokoro-82M)

| Aspekt | Hodnocení |
|--------|-----------|
| **Model** | **Apache 2.0** ([model card](https://huggingface.co/hexgrad/Kokoro-82M)) |
| **Inference knihovna** | Apache 2.0 (`kokoro`); alternativa `kokoro-onnx` MIT |
| **Typ** | StyleTTS2-based, ~82M parametrů |
| **en_GB hlasy** | 8 hlasů (`bf_*`, `bm_*`), `lang_code='b'` |
| **Velikost** | ~**300 MB** plný model; kvantizovaný ONNX **~80 MB** |
| **Kvalita (RP)** | Obecně přirozenější než Piper u vět; u **izolovaných slov** nutný test |
| **Integrace** | Python pipeline lokálně; export WAV → MP3 |
| **Phonemizer** | Standardně **misaki + espeak-ng**; ONNX cesta může espeak omezit – ověřit před schválením |

**Doporučené hlasy pro prototyp (po schválení stažení):**

| Hlas | Kvalita (VOICES.md) | Poznámka |
|------|---------------------|----------|
| **bf_emma** | B- | Nejsilnější britská varianta v dokumentaci |
| bm_fable | C | Mužská alternativa |

---

## 5. Srovnávací matice

| Kritérium | Piper (alba) | Kokoro (bf_emma) |
|-----------|--------------|------------------|
| Lokální provoz | ✅ | ✅ |
| en_GB | ✅ | ✅ |
| Velikost downloadu | ~65 MB | ~80–300 MB |
| CPU-only škola | ✅ vhodné | ✅ (pomalejší) |
| Licence modelu | CC BY 4.0 (dataset) | Apache 2.0 |
| Licence enginu | MIT | Apache 2.0 / MIT (onnx wrapper) |
| Redistribuce MP3 | ⚠️ závisí na MODEL_CARD vybraného hlasu | ⚠️ závisí na Apache 2.0 + ověření konkrétního hlasu |
| espeak-ng (GPL) | ✅ ano | ✅ typicky ano |
| Izolovaná slova (bez kontextu) | Nutný test | Nutný test |
| Jednotný hlas pro 80–120 slov | Ano | Ano |

**Prozatímní doporučení pro fázi prototypu:** ověřit **oba** enginy na stejných 10 slovech; pro finální produkci vybrat **jeden** schválený stack po lingvistickém review.

---

## 6. Licence – engine, hlas, redistribuce nahrávek

> **Disclaimer:** Toto je technicko-právní orientace pro plánování, **ne právní poradenství**. Před publikací audio v READ IT! doporučena kontrola školním/organizačním právníkem.

### 6.1 Piper

| Komponenta | Licence | Redistribuce generovaného MP3 |
|------------|---------|-------------------------------|
| Piper binary / kód | MIT | Volná (s copyright notice) |
| Voice model (alba) | Dataset **CC BY 4.0** | **Pravděpodobně ano** s atribucí – **ověřit MODEL_CARD** před release |
| Voice model (alan, …) | Různé / nejasné | **Ne** bez explicitního schválení a právní kontroly |
| espeak-ng (phonemizer) | **GPL v3** | Generované audio obvykle **není** odvozené dílo; **nesmí** se však redistribuovat espeak-ng binárka v produktu bez compliance |
| Piper projekt | „Neukládá extra restrikce na hlasy“ – **MODEL_CARD rozhoduje** | Per hlas |

### 6.2 Kokoro

| Komponenta | Licence | Redistribuce generovaného MP3 |
|------------|---------|-------------------------------|
| Kokoro-82M weights | **Apache 2.0** | **Pravděpodobně ano** (NOTICE) – **ověřit** u zvoleného hlasu a toolchainu |
| `kokoro` / `kokoro-onnx` | Apache 2.0 / MIT | Ano |
| espeak-ng (pokud použit) | GPL v3 | Stejná poznámka jako u Piper |
| Tréninková data | „Permissive/non-copyrighted“ + CC BY u části | Model Apache umožňuje deploy |

### 6.3 READ IT! – závazek pro `docs/THIRD_PARTY.md`

Po schválení enginu doplnit do [`docs/THIRD_PARTY.md`](THIRD_PARTY.md):

- TTS engine (Piper **nebo** Kokoro) – pouze v **build/generátor** nástroji, ne v browser bundle
- Konkrétní hlasový model + odkaz na MODEL_CARD
- espeak-ng (pokud součást toolchainu)
- Atribuce CC BY / Apache v dokumentaci projektu nebo `assets/audio/README` (TBD)

**Generovaná MP3** v `assets/audio/` jsou **projektová aktiva** – redistribuovatelná **až po ověření licence** konkrétně zvoleného hlasu/modelu (MODEL_CARD + právní review).

---

## 7. Kritické pravidlo: syntéza ≠ správná výslovnost

Úspěšné vygenerování souboru **negarantuje** pedagogicky správnou výslovnost.

Typická rizika u TTS (platí pro oba enginy):

| Riziko | Příklad u testovacích slov |
|--------|---------------------------|
| Rhotic / non-rhotic | *car*, *bird* – nesprávná artikulace *r* |
| Diphthong reduction | *coin*, *cow* – zploštění |
| Soft *g* | *gym* vs /ɡ/ |
| Geminát | *happy*, *letter* – umělé „dvojité“ souhlásky |
| Prosodie izolovaného slova | Příliš dramatický nebo nesouvislý přízvuk |

**Povinný krok:** každé slovo projde **lingvistickým poslechem** (min. 1 reviewer s RP) před zařazením do produkční banky. Neprošlá slova → ruční nahrávka nebo jiný hlas / engine.

---

## 8. Workflow audio prototypu (fáze po schválení tohoto plánu)

Tato fáze **není M6B** a **negeneruje** knihovnu pro aplikaci automaticky.

```
Schválení enginu + hlasu + velikosti modelu
        ↓
Lokální instalace (mimo READ IT! runtime) – viz §9
        ↓
Batch syntéza 10 slov → WAV (stejné parametry: sample rate, normalizace)
        ↓
Konverze → MP3 (D6), pojmenování dle wordId (návrh: w-rain-proto.mp3 …)
        ↓
Lingvistický review checklist (§10)
        ↓
Rozhodnutí: schválit stack / zvolit alternativu / zvážit lidské nahrávky
        ↓
Zápis do THIRD_PARTY.md + autorizace M6B nebo M6A.2-exec
```

**Umístění artefaktů prototypu (návrh):** `tools/audio-prototype/output/` – **ne** `assets/audio/` (to až po schválení pro produkci).

**Runtime READ IT!:** beze změny; `audioId` zůstává `null` v demo datech.

---

## 9. Velikosti modelů – schválení před instalací

| Položka | Odhad | Vyžaduje schválení |
|---------|-------|-------------------|
| Piper `en_GB-alba-medium` | ~65 MB | Ano |
| Piper espeak-ng data | ~10–40 MB | Ano |
| Kokoro plný | ~300 MB | **Ano – větší** |
| Kokoro ONNX q4 | ~80 MB | Ano |
| Python venv (kokoro/piper deps) | ~200–500 MB | Ano |

**V tomto milníku (M6A planning):** žádné modely **neinstalovat**.

---

## 10. Lingvistický review checklist (10 slov)

Pro každé slovo reviewer vyplní:

- [ ] Shoda s **RP** (non-rhotic kde přísluší)
- [ ] Shoda s cílovým **fonémem / vzorem** (oblast)
- [ ] Srozumitelnost pro A1 studenta (izolované slovo)
- [ ] Konzistence s ostatními slovy **stejného hlasu**
- [ ] Absence amerického artefaktu
- [ ] IPA (až bude v wordlistu) odpovídá schválenému audiu
- [ ] Verdikt: **schválit / přegenerovat / nahradit lidským hlasem**

---

## 11. Vazba na smíšenou 30min lekci

| Aspekt | Vazba |
|--------|-------|
| Prototyp | Testuje reprezentativní vzorky ze **všech 5 oblastí** sort-words sady |
| Finální produkt | 100 % banky 80–120 slov s audio (CONTENT_PLAN §9) |
| Fáze 4 lekce (poslech) | Teacher mode přehrávání – **M2B+** (player v runtime) |
| Scope | Prototyp **nerozšiřuje** lekci ani banku |

---

## 12. Co explicitly neprovádět

- ❌ M6B, wordlist, JSON obsah
- ❌ Plná knihovna MP3
- ❌ Úpravy `src/`, `index.html`, activity engine
- ❌ Browser TTS, cloud TTS API, runtime AI
- ❌ Commit / push / deploy (pokud není explicitně požádáno)
- ❌ Stažení velkých modelů bez schválení velikosti a hlasu

---

## 13. Rozhodnutí k schválení (pedagog + technický)

1. **Primární TTS stack:** Piper (alba) / Kokoro (bf_emma) / oba v prototypu / jiný lokální (TBD)
2. **Schválení stažení modelu** (konkrétní MB)
3. **Přijetí licenčního rizika** espeak-ng GPL v build toolchainu
4. **Schválení 10 testovacích slov** (tabulka §3)
5. **Fallback strategie:** lidské nahrávky pro slova, která TTS neprojde review

---

## 14. Doporučený další krok

**M6A.2 – Audio prototype execution** (po schválení §13):

1. Instalace **jednoho** schváleného modelu (nebo obou po menších modelech).
2. Generace 10 testovacích MP3 mimo `assets/audio/`.
3. Lingvistický review + krátký report (srovnání Piper vs Kokoro).
4. Aktualizace `docs/THIRD_PARTY.md`.
5. Teprve poté autorizace **M6B** (wordlist + obsah smíšené lekce).

---

## Příloha A – Technický návrh generátoru (bez implementace)

Izolovaný adresář mimo runtime, např.:

```
tools/audio-prototype/
  README.md           # postup, licence, příkazy
  words.txt           # 10 slov
  generate.sh / .ps1  # wrapper (až po schválení)
  output/             # gitignore
```

Konverze: `ffmpeg -i word.wav -codec:a libmp3lame -qscale:a 2 word.mp3` (ffmpeg musí být lokálně; není součást READ IT! bundle).

---

## Příloha B – Odkazy

| Zdroj | URL |
|-------|-----|
| Piper | https://github.com/rhasspy/piper |
| Piper voices | https://huggingface.co/rhasspy/piper-voices |
| Alba MODEL_CARD | https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alba/medium |
| Kokoro-82M | https://huggingface.co/hexgrad/Kokoro-82M |
| Kokoro VOICES | https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md |
| READ IT! THIRD_PARTY | [`docs/THIRD_PARTY.md`](THIRD_PARTY.md) |
