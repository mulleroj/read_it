# READ IT! – Plán vzdělávacího obsahu (M6A)

**Verze:** 2026.2-plan (korekce rozsahu)  
**Stav:** Návrh k pedagogickému schválení – **neimplementovat obsah bez odsouhlasení**  
**Vazba na aplikaci:** schéma `content/`, 5 digitálních typů cvičení (M2A), Lesson Builder a preset lekce (M3)

---

## Revize oproti 2026.1-plan

| Aspekt | Původní návrh | **Opravený rozsah (M6A korekce)** |
|--------|---------------|-----------------------------------|
| Produkt | 5× samostatných 30min lekcí (~150 min) | **1 hlavní smíšená 30min lekce** pokrývající všech 5 oblastí |
| Slovní banka | ~190 slov | **~80–120** pečlivě vybraných slov |
| Slova v jedné hodině | ≈ velikost banky | **~25–40** různých slov; jádro **~12–15** opakovaně |
| Tematické presety | Paralelně s jádrem | **Volitelné rozšíření** po vydání hlavní lekce |
| Audio | Cíl M6 | **Povinné** pro finální vzdělávací produkt |

---

## 1. Celkový vzdělávací cíl

### 1.1 Primární produkt

**READ IT! je především jedna znovupoužitelná 30minutová anglická lekce** pro studenty 1. ročníku SŠ (A1, standard A1–A2, challenge pro pokročilé).

Lekce poskytuje **praktický přehled všech pěti vzdělávacích oblastí** v jednom modulu, vhodný k **ročnímu opakování** s různými metodami (učitel, student, stanice, tisk…).

Student po hodině:

- **rozpozná** základní pravopisné vzory ve známých slovech ze všech pěti oblastí,
- **spojí** zápis s referenční výslovností (současná standardní britská angličtina, IPA jako opora po review),
- **liší** podobné zápisy tam, kde je to v A1–A2 realistické,
- **použije** vzor při čtení nového slova (bez nároku na perfektní produkci).

Modul **není** kurz konverzace ani gramatiky – zaměřuje se na **decoding + spelling awareness**.

### 1.2 Volitelná rozšíření (mimo jádro produktu)

| Rozšíření | Popis | Priorita |
|-----------|--------|----------|
| Tematické presety | 5× ~30 min, každý jedna oblast do hloubky | Po hlavní smíšené lekci |
| Rozšířená banka | >120 slov pro variace a vocational | Architektura umožní, ne cíl M6B |
| Review / zkrácené lekce | 15–20 min opakování | Volitelně |

**Projekt není primárně pětidílný 150minutový kurz.** Architektura kategorií a Lesson Builderu to umožňuje, ale **první kompletní release = smíšená lekce**.

---

## 2. Rozsah pěti oblastí

Oblasti jsou **didaktické skupiny pravopisných vzorů** (spelling patterns). **Nejsou to automaticky ekvivalentní fonetické kategorie.** Každý vzor má:

- **`primaryCategoryId`** – hlavní zařazení v UI a sort-words,
- volitelně **`relatedCategoryIds`** / poznámku – křížový odkaz bez duplikace obsahu.

IPA a konkrétní transkripce **nejsou v tomto dokumentu vymýšleny** – projdou lingvistickým review před M6B.

| ID | Oblast | Pedagogický fokus | Vzorů v hlavní lekci | Vzorů v bance (max.) |
|----|--------|-------------------|----------------------|---------------------|
| `cat-vowel-teams` | Vowel Teams | Týmy písmen pro dlouhé samohlásky | 2 | 5–6 |
| `cat-r-controlled` | R-Controlled | Písmeno *r* mění čtení předchozího vokálu (RP, non-rhotic) | 2 | 4–5 |
| `cat-diphthongs` | Diphthongs | Zápis dvojhlásek | 1–2 | 3–4 |
| `cat-soft-cg` | Soft C / Soft G | Měkké *c/g* před *e, i, y* | 1 | 2–3 |
| `cat-double-consonants` | Double Consonants | **Pravopisný** geminát / *ck* – ne nutně „dvojité vyslovení“ | 1 | 3–4 |

### 2.1 Vowel Teams

| Položka | Návrh |
|---------|--------|
| **Cíl v smíšené lekci** | Ukázat 1–2 týmy (např. *ai/ay*, *ee*); pozice ve slově. |
| **Vzory (banka)** | `pat-ai`, `pat-ay`, `pat-ee`, `pat-ea-long-e`, `pat-oa`, `pat-igh` |
| **Slov v bance** | **18–24** |
| **Typy cvičení** | find-pattern, odd-one-out, sort-words, build-word, exit-ticket |

### 2.2 R-Controlled Vowels

| Položka | Návrh |
|---------|--------|
| **Cíl v smíšené lekci** | *ar* a *er/ir/ur* jako spelling; **RP non-rhotic** – *r* se v RP neartikuluje silně po samohlásce, ale **mění kvalitu vokálu** (učitel to vysvětlí, ne simulovat fonetiku bez audio). |
| **Vzory (banka)** | `pat-ar`, `pat-or`, `pat-er`, `pat-ir`, `pat-ur` |
| **Slov v bance** | **14–18** |
| **Poznámka** | Vyhnout se slovům, kde by student zaměnil „výslovnost r“ za americký rhotic model. |

### 2.3 Diphthongs

| Položka | Návrh |
|---------|--------|
| **Cíl v smíšené lekci** | Jedna dvojhláska v zápisu (např. *oi/oy* nebo *ou/ow* diphthong). |
| **Vzory (banka)** | `pat-oi`, `pat-oy`, `pat-ou`, `pat-ow-diph` |
| **Slov v bance** | **12–16** |

### 2.4 Soft C / Soft G

| Položka | Návrh |
|---------|--------|
| **Cíl v smíšené lekci** | Pravidlo + 1 kontrastní výjimka (*gift*, *gym*). |
| **Vzory (banka)** | `pat-soft-c`, `pat-soft-g`, `pat-hard-c-g` (kontrast) |
| **Slov v bance** | **10–14** |
| **Výjimky** | *get, give, girl, gift* – **explicitně** v sadě pro odd-one-out, ne jako „porušení pravidla bez vysvětlení“. |

### 2.5 Double Consonants

| Položka | Návrh |
|---------|--------|
| **Cíl v smíšené lekci** | Dvojité písmeno jako **pravopisný vzor** (krátká samohláska, *ck*); učitel **ne** tvrdí, že se souhláska vždy „vyslovuje dvakrát“. |
| **Vzory (banka)** | `pat-ll`, `pat-ss`, `pat-ck`, `pat-double-medial` |
| **Slov v bance** | **10–14** |

### 2.6 Klasifikace překrývajících se vzorů

Každý grafém má **jedno primární** `patternId`. Při jiné výslovnosti nebo sekundární didaktické roli se uvádí `relatedPatternIds` nebo teacher note – **bez duplicitních slov v databázi**.

| Grafém / pár | Primární oblast | Výslovnostní role | Didaktická poznámka |
|--------------|-----------------|-------------------|---------------------|
| **ea** | Vowel Teams (`pat-ea-long-e`) | /iː/ v *eat* | *tree* patří k `pat-ee`, ne k *ea*. Sekundární: `pat-ea-short-e` /e/ (*head, bread*) – **jiný patternId**, v hlavní lekci max. 1 slovo /e/ jako kontrast |
| **ow** | **Diphthongs** (`pat-ow-diph`) pro /aʊ/ (*cow, brown*) | /aʊ/ | Vowel team `pat-ow-long-o` /əʊ/ (*snow, grow*) – **samostatný pattern**; ve smíšené lekci **ne oba najednou** |
| **oi / oy** | Diphthongs | /ɔɪ/ | *oi* uprostřed, *oy* na konci – **jeden foném, dva grafémy** (`pat-oi`, `pat-oy`) |
| **au / aw** | Vowel Teams (`pat-aw`, `pat-au`) | /ɔː/ (*saw, law*) – **monoftong**, ne dvojhláska | V bance volitelně 2–3 slova; nepatří do oblasti Diphthongs |
| **r-controlled** | R-Controlled | RP non-rhotic | Popisovat jako **spelling + vowel quality**, ne „silné r“; audio povinné pro model |
| **soft c/g** | Soft C/G | /s/, /dʒ/ | Výjimky hard *g* (*gift*) a hard *c* (*cat*) jako **kontrastní sada**, ne náhodné chyby |
| **double consonants** | Double Consonants | spelling convention | *ck*, *ll*, *ss* – vysvětlit **pravopis**, ne délku artikulace |

---

## 3. Distribuce obsahu

### 3.1 Hierarchie dat (beze změny)

```
category → pattern → word → exercise (items) → lesson (preset)
```

### 3.2 Cílový rozsah banky (M6)

| Vrstva | Hlavní release | Volitelné rozšíření |
|--------|----------------|---------------------|
| **Slova (banka)** | **80–120** | do ~180 |
| **Vzory** | **~15–18** | do ~25 |
| **Definice cvičení** | **~12–16** (sdílené mezi scénáři) | + tematické sady |
| **Preset lekcí** | **1 smíšená** (`les-read-it-30-mixed`) | +5 tematických |

Demo (M2A/M3): 15 slov, 1 ukázkový preset – technický vzorek.

### 3.3 Slova v jedné 30min lekci vs. celá banka

| Metrika | Hodnota |
|---------|---------|
| Různých slov v presetu | **25–40** |
| Jádro opakovaných slov | **~12–15** (např. *rain, car, coin, city, happy*) |
| Oblastí v lekci | **všech 5** (každá zastoupena min. 4–6 slovy v aktivitách) |
| Mastery v jedné hodině | Přehled + orientace, **ne** kompletní banka |

**Velikost banky ≠ počet slov k zvládnutí v jedné hodině.** Banka umožňuje variace (jiná metoda, jiný rok, stanice, tisk).

---

## 4. Úrovně obtížnosti

| Úroveň | Kód | Cílová úroveň |
|--------|-----|---------------|
| Easy | `easy` | A1 |
| Standard | `medium` | A1–A2 |
| Challenge | `hard` | náročnější úlohy |

**Smíšená lekce (standard):** cca 35 % easy · 50 % medium · 15 % hard.

---

## 5. Mapování cvičení na cíle

| Typ | Co cvičí | V hlavní smíšené lekci |
|-----|----------|------------------------|
| **find-pattern** | Identifikace vzoru ve slově | ✅ jádro „pattern discovery“ |
| **odd-one-out** | Diskriminace vzoru | ✅ |
| **sort-words** | Kategorizace (5 oblastí / vzory) | ✅ ideální pro přehled |
| **build-word** | Encoding grafémů | ✅ 2–3 slova z různých oblastí |
| **exit-ticket** | Závěrečné assessment | ✅ |

**Vyžaduje audio nebo pozdější vývoj:**

| Aktivita | Cíl | Stav |
|----------|-----|------|
| Poslech + výběr | listen-choose | 🔶 M2B+ |
| Poslech + opakování | listen-repeat | 🔶 M2B+ |
| Čtení před poslechem | read-before-hear | 🔶 M2B+ |
| Pair-work, game, paper | metodika / M5 / M7 | 🔶 |

Textové cvičení **nesmí** nahrazovat poslech bez audio.

---

## 6. Slovní banka – revidovaná velikost

| Metrika | Hodnota |
|---------|---------|
| **Celkem (cíl M6)** | **80–120 slov** |
| **Na oblast (orientačně)** | VT 18–24 · R 14–18 · Diph 12–16 · Soft 10–14 · DC 10–14 |
| **Rozšíření (později)** | architektura JSON to unese bez změny ID |
| **Audio (finální produkt)** | **100 %** slov v publikované bance |
| **Obrázky** | volitelně u A1 slov s abstraktním významem |

Wordlist **negenerovat** v M6A/M6A korekci.

---

## 7. Hlavní smíšená 30minutová lekce

**Preset ID (návrh):** `les-read-it-30-mixed`  
**Název (návrh):** „READ IT! – přehled anglických pravopisných vzorů“

> Odhad minut v tabulce je **orientační**. Součet v Lesson Builderu **negarantuje** skutečnou délku hodiny – tempo třídy, diskuse učitele a jazyková úroveň třídy ji mění.

### 7.1 Struktura hodiny

| Fáze | Čas (orient.) | Obsah | Technická podpora |
|------|---------------|-------|-------------------|
| **1. Úvod** | 4–5 min | Cíl hodiny, 5 oblastí na boardu, 2–3 ukázková slova | Teacher notes v presetu; část mimo app |
| **2. Pattern discovery** | 6–7 min | find-pattern: **5–6 položek** (min. 1 slovo z každé oblasti) | ✅ M3 |
| **3. Interaktivní praxe** | 10–12 min | sort-words: **1 sada ~10 slov** (2 slova × 5 oblastí) **nebo** 2× odd-one-out (4+4 položky); build-word: **2 slova** | ✅ M3 |
| **4. Čtení / poslech** | 4–5 min | **S audio:** učitel přehrává 4–6 slov, student čte (teacher mode) · **Bez audio (dev):** find-pattern s IPA | 🟡 audio M6 · ✅ text fallback |
| **5. Exit ticket** | 4–5 min | **4–5 položek** (assessment), mix oblastí | ✅ M3 |
| **6. Závěr** | 2–3 min | Shrnutí 5 oblastí, „co dál“ | Teacher notes |

**Položek v aplikaci celkem:** ~**20–24**  
**Různých slov:** ~**28–35** (s opakováním jádra v sort-words a exit ticket)

### 7.2 Konkrétní osnova (návrh pořadí – slova TBD po schválení)

| # | Blok | Typ | Oblasti (zastoupení) | Položek |
|---|------|-----|----------------------|---------|
| 1 | Discovery | find-pattern | VT, R, Diph, Soft, DC (rotace) | 6 |
| 2 | Přehled | sort-words | všech 5 kategorií | 1×10 slov |
| 3 | Encoding | build-word | VT + DC (krátká slova) | 2 |
| 4 | Poslech/čtení | teacher audio **nebo** find-pattern | mix | 4–6 |
| 5 | Assessment | exit-ticket | mix | 5 |

### 7.3 Co lekce záměrně neobsahuje

- Hloubkovou práci jedné oblasti (→ volitelný tematický preset).  
- Poslechové discriminační úlohy bez audio.  
- Více než ~40 nových slov v jedné hodině.

---

## 8. Vzdělávací variace (stejná banka, jiné podmnožiny)

Všechny scénáře čerpají ze **společné banky 80–120 slov**. Hlavní preset má prioritu; ostatní scénáře používají **subset**.

| Scénář | Podmnožina slov | Podpora | Priorita obsahu |
|--------|-----------------|---------|-----------------|
| **A. Učitel 30 min** | preset smíšená | ✅ M3 | **1. release** |
| **B. Student samostatně** | stejný preset, QR | ✅ M3 | **1. release** |
| **C. Pair-work** | ~12–16 slov / pár | 🔶 metodika / paper | 2 |
| **D. Týmová soutěž** | ~15 slov / kolo | 🔶 M7 game | 2 |
| **E. Stanice** | 4×6 slov / stanice | 🟡 Builder + QR · 🔶 orchestrace | 2 |
| **F. Tištěný list** | ~20–25 slov | 🔶 M5 paper | 2 |

Roční opakování: učitel může v Lesson Builderu vyměnit **10–20 % slov** z banky bez změny struktury lekce.

---

## 9. Požadavky na audio (povinné pro finální produkt)

| Požadavek | Detail |
|-----------|--------|
| **Standard** | Současná standardní britská angličtina (RP jako reference) |
| **Rozsah** | 100 % slov publikované banky |
| **Formát** | MP3 lokálně, `audioId` per word |
| **Konzistence** | IPA v JSON **musí odpovídat** audio po lingvistickém review |
| **Teacher mode** | Přehrání modelu (UI M2B+) |
| **Text-only fáze** | Přípustná pro vývoj a dílčí pedagogy; **není** finální stav produktu |

**M6A korekce:** audio **negenerovat**, IPA **nevymýšlet**.

Odhad objemu: 100 slov × ~50 KB ≈ **5 MB** (80–120 slov ≈ 4–6 MB).

---

## 10. Lingvistická rizika

| Riziko | Mitigace |
|--------|----------|
| Záměna spelling vs. pronunciation category | §2.6 primární + related pattern |
| *ea*, *ow* polyfonie | Oddělené patternId; limit v hlavní lekci |
| RP non-rhotic *r* | Teacher notes + audio; ne americký model |
| Soft *g* výjimky | Explicitní kontrastní sada |
| Double letters = „double sound“ | Didaktický text: **spelling pattern** |
| Nepřesná IPA | Review před importem |
| build-word tiles | Schválené dělení per slovo |

---

## 11. Kritéria přijetí obsahu (M6 – hlavní release)

Smíšená lekce a banka jsou **přijaty**, pokud:

1. **Wordlist 80–120 slov** schválen lingvisticky (IPA + audio script).  
2. **Preset `les-read-it-30-mixed`** pokrývá **všech 5 oblastí**, 20–24 položek, 25–40 různých slov.  
3. **Audio** pro 100 % slov v bance.  
4. Teacher + student průchod bez chybějících ID; QR preset funkční.  
5. Teacher notes vysvětlují non-rhotic *r*, *ea/ow* a double consonants správně.  
6. Odhad délky v app 27–35 min **s disclaimerem** – ne garance.  
7. Tematické presety **nejsou** podmínkou prvního release.

---

## Příloha A – Rozhodnutí k schválení před M6B

1. Schválit **smíšenou lekci** jako jediný povinný release.  
2. Schválit rozsah banky **80–120 slov**.  
3. Schválit klasifikaci §2.6 (*ea*, *ow*, *oi/oy*, *au/aw*).  
4. Potvrdit **povinné audio** před finálním pilotem.  
5. Vybrat konkrétní slova pro osnovu §7.2 (wordlist – samostatný dokument).

**Další krok po schválení:** M6B – wordlist + pattern JSON pro **smíšenou lekci** (ne celých 5 tematických balíčků najednou).

---

## Příloha B – Zastaralé vs. zachované (2026.1 → 2026.2)

| Zachováno | Zrušeno / přesunuto |
|-----------|---------------------|
| 5 oblastí, mapování cvičení, obtížnosti | Cíl ~190 slov |
| Scénáře A–F s legenda ✅/🟡/🔶 | 5× povinný 30min preset per oblast |
| Lingvistická rizika (rozšířeno §2.6) | Příloha A pouze Vowel Teams |
| Audio jako požadavek | Text-only jako finální stav |
