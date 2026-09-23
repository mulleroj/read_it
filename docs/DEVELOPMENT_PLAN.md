# READ IT! – Plán vývoje

## Přehled milníků

| Milník | Název | Cíl | Odhad |
|--------|-------|-----|-------|
| **M0** | Schválení architektury | Odsouhlasení DECISIONS.md | 1 týden |
| **M1** | Kostra aplikace | Shell, routing, content loader, 1 ukázkové cvičení | 1–2 týdny |
| **M2** | Jádro aktivit | 5 typů cvičení, auto-check, teacher + student režim | 2–3 týdny |
| **M3** | Lekce a sdílení | Lesson Builder, preset lekce, QR/URL codec | 1–2 týdny |
| **M4** | Offline a PWA | Service Worker, manifest, cache strategie | 1 týden |
| **M5** | Tisk a paper mode | Print CSS, 3 tiskové šablony | 1 týden |
| **M6** | Obsah a knihovna | 1 kompletní tematický balíček (vowel teams), Teacher Library UI | 2 týdny |
| **M7** | Game mode + a11y | Týmová hra, klávesnice, ARIA audit | 1 týden |
| **M8** | Testování a pilot | E2E testy, opravy, pilotní hodina ve třídě | 1–2 týdny |

**Celkový odhad:** 10–14 týdnů (průběžná práce, ne full-time).

---

## M0 – Schválení ✅ (2026-09-23)

- [x] Projektová specifikace
- [x] Architektonický návrh
- [x] Schválení rozhodnutí v DECISIONS.md
- [x] MVP = Vowel Teams; finální produkt = 5 oblastí
- [x] Hosting: Netlify + GitHub (deploy později)

**Výstup:** M1 autorizováno.

---

## M1 – Kostra aplikace (aktuální fáze)

### Rozsah

- `index.html`, základní CSS (layout, typografie, mobil)
- Hash router (`#/home`, `#/teacher`, `#/student`)
- Content loader + verzovaný datový model (5 kategorií definováno, demo obsah Vowel Teams)
- Minimal Activity Engine + registry
- **1 aktivita:** `find-pattern` s ukázkovými slovy (bez audio)
- Okamžitá zpětná vazba u demo cvičení
- Unit testy (Node test runner)

### Kritéria dokončení

- Aplikace startuje přes lokální HTTP server (`npx serve`)
- Navigace a načtení demo obsahu funguje
- `find-pattern` interaktivní na desktopu i úzkém mobilu
- Testy pro implementovanou logiku procházejí
- Žádné externí CDN, API, audio soubory

### Mimo rozsah M1

- QR, Lesson Builder, PWA/SW, tisk, game mode, další aktivity, plný obsah

---

## M2 – Jádro aktivit

### Prioritní aktivity (MVP)

1. `listen-choose`
2. `find-pattern`
3. `odd-one-out`
4. `sort-words`
5. `exit-ticket`

### Rozsah

- Activity registry + společné UI komponenty (tlačítka, feedback)
- Auto-check s vizuální zpětnou vazbou
- Teacher mode: velké písmo, skrytí odpovědí (toggle)
- Student mode: touch, okamžitá kontrola
- Obtížnost: filtrování položek dle `difficulty`

### Kritéria dokončení

- 5 typů funguje ve teacher + student režimu
- Min. 10 cvičení v mock datech (2 na typ)

---

## M3 – Lekce a sdílení ✅ (2026-09-23)

### Rozsah (dokončeno)

- 1 ukázkový preset (`les-vowel-teams-demo`) – **ne** plný 30min modul
- Lesson Builder (`#/builder`) – výběr, pořadí, practice/assessment override
- localStorage + export/import JSON
- URL codec v1 (`v1.` + lz-string) + lokální QR (qrcode-generator)
- Lesson player pro `#/teacher|student?lesson=…` nebo `?cfg=…`

### Kritéria dokončení

- [x] Učitel sestaví lekci, vygeneruje QR a odkaz
- [x] Student otevře sdílený odkaz ve stejném prohlížeči (localhost)
- [x] Preset URL < 80 znaků
- [ ] Ověření QR z fyzického telefonu – vyžaduje nasazení (M3 neautorizovalo deploy)

---

## M4 – Offline a PWA

### Rozsah

- `manifest.webmanifest`, ikony
- Service Worker: precache shell + content index
- Runtime cache pro audio
- UI indikátor offline/online
- Instalační prompt (kde prohlížeč podporuje)

### Kritéria dokončení

- Po prvním načtení aplikace funguje bez sítě (kromě dosud nenačteného audio)
- Lighthouse PWA audit: installable + offline pass

---

## M5 – Tisk a Paper Mode

### Rozsah

- `print.css` pro pracovní listy a klíče
- Paper mode render pro: listen-choose, memory matching, exit-ticket
- Metodický list lekce (teacher notes)

### Kritéria dokončení

- Tisk z Chrome/Edge dává použitelný A4 list
- Klíč odpovědí na separátní stránce

---

## M6 – Obsah a knihovna

### Rozsah

- Kompletní balíček **Vowel teams** (vzory, min. 40 slov, audio)
- Teacher Library UI: procházení kategorií, náhled cvičení
- Vocabulary review workflow (manuální checklist, ne automat)

### Kritéria dokončení

- 1 preset 30min lekce plně obsazená reálným obsahem
- Audio pro všechna slova v balíčku

---

## M7 – Game mode a přístupnost

### Rozsah

- Game mode: team competition (lokální skóre, 2–4 týmy)
- Klávesnicová navigace v teacher mode
- ARIA live regions, focus management
- `prefers-reduced-motion`

### Kritéria dokončení

- Lighthouse accessibility score ≥ 90
- Ovládání MCQ pouze klávesnicí

---

## M8 – Testování a pilot

### Rozsah

- Unit testy: url-codec, validator
- Content validation script (CI)
- 3 E2E scénáře: student QR flow, teacher projection, offline
- Opravy z pilotní hodiny
- Dokumentace pro učitele (1 stránka quick start)

### Kritéria dokončení

- Pilotní 30min hodina bez blokujících chyb
- Všechny E2E testy zelené

---

## Po MVP (backlog)

| Priorita | Položka |
|----------|---------|
| P1 | Další obsahové balíčky (r-controlled, diphthongs, …) |
| P1 | Zbývající typy aktivit |
| P2 | Vocational English extensions |
| P2 | Create your own challenge |
| P3 | Client-side PDF export |
| P3 | Import/export custom lekcí jako soubor (.readit.json) |

---

## Pracovní principy

1. **Malé PR / commity** – jeden milníkový kus najednou
2. **Obsah oddělen od kódu** – učitelé/editoři mohou doplňovat JSON
3. **Nejdřív funkce, pak polish** – vizuální design až po M3
4. **Testovat na reálném mobilu** každý milník od M2
5. **Žádné nové závislosti** bez záznamu v DECISIONS.md

---

## Definice „hotovo" pro celý projekt

Aplikace je připravena k opakovanému ročnímu použití, pokud:

- [ ] 5 obsahových oblastí má alespoň základní balíček *(nebo schválený reduced scope)*
- [ ] Min. 10 typů aktivit digitálně funkčních
- [ ] 3 preset 30min lekce
- [ ] Lesson Builder + QR sdílení
- [ ] Offline + tisk
- [ ] Dokumentace pro učitele
- [ ] Automatizované testy v CI

*Poznámka: Plný rozsah obsahu (5 oblastí) může být fáze 2 – nutné odsouhlasit v M0.*
