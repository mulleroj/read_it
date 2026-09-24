# READ IT! – TTSMaker licenční evidence (M8.2)

**Datum kontroly podmínek:** 2026-09-24  
**Kontrolované zdroje:** veřejné webové stránky TTSMaker (viz níže)  
**Rozsah:** redistribuce **26** schválených MP3 ve statické školní aplikaci READ IT!  
**Odděleně od:** Piper / Alba gate (`docs/M6C_AUDIO_RELEASE_GATE.md`) – **stále BLOCKED**

> Tento dokument je **evidenční záznam**, ne právní poradenství. Neobsahuje snapshot podmínek z doby generace klipů (ta nebyla zachycena).

---

## 1. Kontrolované URL

| Dokument | URL | Výsledek kontroly 2026-09-24 |
|----------|-----|------------------------------|
| Terms of Service | https://ttsmaker.com/terms-of-service | **Načteno** – plný text |
| Commercial License Terms | https://ttsmaker.com/copyright_and_commercial_license_terms | **Cloudflare ověření** – přímé načtení v automatizovaném fetch selhalo; relevantní pasáže doplněny z veřejně indexovaného obsahu ste Liz URL (viz §2) |

---

## 2. Relevantní ustanovení (TTSMaker Terms of Service)

Citace v angličtině odpovídá načtenému znění k datu kontroly.

| Téma | Citace / shrnutí |
|------|------------------|
| Vlastnictví výstupu | „You **fully own** the audio files you create and the content you use to create them.“ |
| Komerční použití | Sekce **Commercial Rights**: „You may use sounds created by TTSMaker for **commercial purposes**, and you may **distribute or make them available to third parties** for commercial purposes.“ |
| Vstupní text | Uživatel si ponechává vlastnictví obsahu; TTSMaker má omezené dočasné právo ke zpracování za účelem služby. |
| Compliance | Uživatel nesmí porušovat platné zákony ani práva třetích stran. |
| Změny podmínek | TTSMaker si vyhrazuje právo podmínky měnit; pokračující použití = souhlas s aktualizací. |

**Vzdělávací použití:** Terms of Service výslovně neuvádějí „education-only“ restrikci pro vygenerované audio. Komerční + distribuce třetím stranám jsou povoleny za podmínky zákonného použití – statické hostování MP3 ve školní app spadá pod „distribute / make available“, nikoli pod kopírování TTSMaker technologie.

---

## 3. Relevantní ustanovení (Commercial License Terms)

Z veřejně dostupného znění ste Liz URL (kontrola 2026-09-24, bez archivního snapshotu z doby generace):

| Téma | Shrnutí |
|------|---------|
| Vlastnictví | TTSMaker **nenárokuje vlastnictví** konkrétního vygenerovaného audia uživatele. |
| Technologie | TTSMaker si ponechává práva k **technologii, voice modelům a systémům**. |
| Licence uživatele | Uživatel získává **usage rights**, nikoli nutně copyright ownership na syntézu. |
| Podmínky | Použití za podmínky dodržení **místních zákonů**; uživatel odpovídá za neporušení práv třetích stran. |
| Odpovědnost | Vygenerovaný obsah nevyjadřuje názory TTSMaker; uživatel nese odpovědnost za použití. |
| Dočasné úložiště | Server dočasně uchovává soubory (FAQ uvádí krátké okno pro stažení) – **ne** licence pro redistribuci; lokálně stažené MP3 jsou mimo TTSMaker hosting. |
| Změny | TTSMaker může podmínky kdykoli upravit a zveřejnit na webu. |

---

## 4. Co z evidence **nevyplývá**

| Nevyřešeno | Poznámka |
|-----------|----------|
| Snapshot podmínek v okamžiku generace (2026-09-24) | **Neexistuje** – nelze tvrdit, že klipy byly generovány pod právě načteným zněním |
| Právní posouzení pro konkrétní české SŠ / GDPR / školní provoz | Mimo rozsah tohoto technického záznamu |
| Piper / Alba | **Oddělená licence** – gate zůstává **BLOCKED** (`docs/M6C_AUDIO_RELEASE_GATE.md`) |
| Atribuce TTSMaker | Terms nevyžadují povinnou atribuci pro YouTube apod.; pro READ IT! doporučena dobrovolná zmínka v `docs/THIRD_PARTY.md` po publikaci |

---

## 5. Závěr pro READ IT! (M8.2)

| Kritérium | Stav |
|-----------|------|
| Veřejné TTSMaker podmínky zkontrolovány | ✅ 2026-09-24 |
| Redistribuce statických MP3 podporována zněním ToS (Commercial Rights) | ✅ orientačně ano |
| Usage rights vs. copyright ownership | ⚠️ dokumentováno – usage rights, ne nutně výhradní copyright |
| Snapshot podmínek z doby generace | ❌ chybí |
| Právní review pro školní nasazení | ❌ doporučeno před finálním deployem |
| Piper/Alba | ❌ **BLOCKED** – nesmí se míchat |

**PUBLIC AUDIO RELEASE (TTSMaker):** nasazeno **2026-09-24** – 26 MP3 v `assets/audio/` na https://readit-stsul.netlify.app/ ; viz `docs/M8_TTSMAKER_PUBLIC_AUDIO_RELEASE.md`.
