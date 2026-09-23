# READ IT! – Rozhodnutí

Dokument shrnuje architektonická rozhodnutí projektu. **M0 schváleno 2026-09-23.** M1 autorizováno se specifikovanými upřesněními.

---

## D1 – Architektura: Statická webová aplikace (vanilla JS)

| | |
|---|---|
| **Doporučení** | Ano – HTML + CSS + ES modules, bez frameworku v MVP |
| **Výhody** | Nulový backend, minimální závislosti, dlouhá životnost, snadný hosting |
| **Nevýhody** | Více ruční organizace kódu; složitější stav v rozsáhlém UI |
| **Alternativa** | Vite + vanilla nebo Preact – zvážit od M3, pokud roste složitost UI |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Vysoký** – přepis na framework = týdny práce |

**Potřebujeme schválení:** Ano

---

## D2 – Routing: Hash-based (`#/path`)

| | |
|---|---|
| **Doporučení** | Ano – hash routing pro statický hosting bez server rewrite pravidel |
| **Výhody** | Funguje na GitHub Pages, lokálních souborech, školním webu bez konfigurace |
| **Nevýhody** | Méně „čisté" URL; sdílení může vypadat neobvykle |
| **Alternativa** | History API + `_redirects` / `.htaccess` – vyžaduje kontrolu nad serverem |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Střední** – URL v QR kódech by se rozbily |

**Potřebujeme schválení:** Ano

---

## D3 – Datový formát: JSON + JSON Schema

| | |
|---|---|
| **Doporučení** | Ano – JSON soubory verzované v repozitáři |
| **Výhody** | Čitelné, diff-friendly, validovatelné, bez databáze |
| **Nevýhody** | Velká slovní databáze = mnoho souborů nebo velké soubory |
| **Alternativa** | YAML (čitelnější, ale horší nativní podpora v prohlížeči) |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Velmi vysoký** – migrace ID, URL codec, cache |

**Potřebujeme schválení:** Ano

---

## D4 – Sdílení lekcí: Preset ID + komprimovaná URL (v1)

| | |
|---|---|
| **Schváleno** | Preset lekce = krátké ID; custom lekce = verzované schéma + komprese v URL hash |
| **Výhody** | Bez backendu, deterministické, QR generovatelné lokálně |
| **Nevýhody** | Limit délky URL (~800 znaků pro spolehlivý QR); custom lekce nelze „centralizovaně" aktualizovat |
| **Upřesnění** | Sdílení přesné konfigurace lekce (ID, pořadí, obtížnost, nastavení). Validace dekódované konfigurace. **Implementace od M3.** |
| **Alternativa** | Export `.readit.json` souboru místo dlouhého URL |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Vysoký** – existující QR kódy musí zůstat funkční |

**Potřebujeme schválení:** Ano

---

## D5 – Offline: PWA se Service Workerem

| | |
|---|---|
| **Schváleno** | Ano – PWA s Service Workerem (**milník M4**, ne M1) |
| **Výhody** | Skutečný offline provoz, instalace na plochu |
| **Nevýhody** | Vyžaduje HTTPS (ne file://); iOS má omezení; nutná údržba cache verzí |
| **Upřesnění** | Rozlišovat: online statický hosting, nainstalovaná PWA, archiv lokálních souborů a skutečný spustitelný offline režim. `file://` negarantuje PWA. Offline strategie bez placených služeb – viz ARCHITECTURE.md §9. |
| **Provozní náklady** | 0 Kč povinných služeb; hosting může mít limity free tieru |
| **Náklad na změnu později** | **Střední** |

**Potřebujeme schválení:** Ano

---

## D6 – Audio formát: MP3

| | |
|---|---|
| **Schváleno** | Ano – MP3, pouze schválená lokální audio aktiva |
| **Výhody** | Univerzální podpora na mobilech |
| **Nevýhody** | Patent historie (dnes irelevantní); mírně větší než Opus |
| **Upřesnění** | Datový model podporuje audio od začátku. M1 prototyp **bez audio** – žádné falešné soubory, TTS, externí API ani neověřené nahrávky. IPA lingvisticky ověřovat před vydáním obsahu. |
| **Provozní náklady** | 0 Kč; čas na nahrání/natočení audio |
| **Náklad na změnu později** | **Vysoký** – překódování celé knihovny |

**Potřebujeme schválení:** Ano

---

## D7 – Výslovnost: British English (RP) + IPA

| | |
|---|---|
| **Doporučení** | Ano – britská angličtina jako primární standard |
| **Výhody** | Konzistence s typickou výukou v CZ SŠ |
| **Nevýhody** | Americké varianty studenti znají z médií – nutné občasné poznámky |
| **Alternativa** | Dual audio (UK + US) – zdvojnásobí objem audio |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Střední** – doplnění audio, ne změna architektury |

**Potřebujeme schválení:** Ano (pedagogické rozhodnutí)

---

## D8 – Tisk: Nativní prohlížeč (CSS print), ne PDF knihovna

| | |
|---|---|
| **Doporučení** | Ano pro MVP |
| **Výhody** | Nulová závislost, učitelé umí „Tisk → PDF" |
| **Nevýhody** | Nekonzistentní mezi prohlížeči |
| **Alternativa** | pdfmake v M5+ |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Nízký** |

**Potřebujeme schválení:** Doporučeno, ne blokující

---

## D9 – Build systém: Bez buildu v M1–M2

| | |
|---|---|
| **Doporučení** | Nativní ES modules bez bundleru do M2; zvážit Vite od M3 |
| **Výhody** | Okamžitý start, žádná konfigurace |
| **Nevýhody** | Více HTTP requestů; vendor knihovny ručně |
| **Alternativa** | Vite od M1 |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Nízký** |

**Potřebujeme schválení:** Doporučeno

---

## D10 – Rozsah MVP obsahu

| | |
|---|---|
| **Schváleno** | MVP = **1 kompletní balíček (Vowel Teams)**; finální produkt = **všech 5 oblastí** |
| **Výhody** | Dokončitelný pilot; architektura připravená na plný rozsah |
| **Upřesnění** | Datový model a kategorie musí od M1 podporovat všech 5 oblastí. MVP rozsah **nesnižuje** finální požadavky. |
| **Provozní náklady** | Čas na tvorbu obsahu a audio |
| **Náklad na změnu později** | **Nízký** – obsah se přidává incrementálně |

---

## D11 – MVP aktivity: 5 typů first

| | |
|---|---|
| **Doporučení** | listen-choose, find-pattern, odd-one-out, sort-words, exit-ticket |
| **Výhody** | Pokrytí poslechu, vizuálního rozlišení, kontroly |
| **Nevýhody** | Chybí listen-repeat, memory, build-word do pilotu |
| **Alternativa** | Jiná sada dle preference učitele |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Nízký** |

**Potřebujeme schválení:** Ano (pedagogické)

---

## D12 – Hosting a distribuce

| | |
|---|---|
| **Schváleno** | **Netlify** = cílový statický hosting; **GitHub** = zdrojový kód a záloha (samostatný projekt READ IT!) |
| **Výhody** | HTTPS, jednoduché nasazení, oddělený repozitář |
| **Nevýhody** | Free tier může mít limity; škola může blokovat externí domény |
| **Alternativa** | Lokální ZIP / školní web |
| **Upřesnění** | Nasazení a vytvoření remote repozitáře **zatím neautorizováno**. Neuvádět hosting jako garantovaně bezplatný navždy. |
| **Provozní náklady** | 0 Kč povinných předplatných/API |
| **Náklad na změnu později** | **Nízký** |

**Potřebujeme schválení:** Ano (organizační)

---

## D13 – UI jazyk

| | |
|---|---|
| **Doporučení** | UI pro učitele **česky**; cvičení v **angličtině**; metodické poznámky česky |
| **Výhody** | Srozumitelné pro cílovou skupinu učitelů |
| **Nevýhody** | Dva jazyky v aplikaci |
| **Alternativa** | Plně anglické UI |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Nízký** |

**Potřebujeme schválení:** Doporučeno

---

## D14 – Testovací framework

| | |
|---|---|
| **Doporučení** | Playwright (E2E) + Node built-in test runner nebo Vitest (unit) od M4 |
| **Výhody** | Spolehlivé testy offline/PWA |
| **Nevýhody** | Dev závislosti (~100 MB node_modules) |
| **Alternativa** | Manuální testovací checklist bez automatizace |
| **Provozní náklady** | 0 Kč |
| **Náklad na změnu později** | **Nízký** |

**Potřebujeme schválení:** Doporučeno

---

## Souhrn – co schválit před M1

| ID | Rozhodnutí | Blokující? |
|----|------------|------------|
| D1 | Statická vanilla JS aplikace | Ano |
| D2 | Hash routing | Ano |
| D3 | JSON datový model | Ano |
| D4 | URL/QR sdílení v1 | Ano |
| D5 | PWA + Service Worker | Ano |
| D6 | MP3 audio | Ano |
| D7 | British English + IPA | Ano |
| D10 | MVP = 1 obsahový balíček | Ano |
| D11 | 5 prioritních aktivit | Ano |
| D12 | Způsob hostingu | Ano |
| D8, D9, D13, D14 | Ostatní | Doporučené |

---

## Záznam schválení

| ID | Stav | Datum | Poznámka |
|----|------|-------|----------|
| D1 | Schváleno | 2026-09-23 | Statická vanilla JS, ES modules, bez backendu/CDN/runtime AI |
| D2 | Schváleno | 2026-09-23 | Hash routing |
| D3 | Schváleno | 2026-09-23 | JSON + JSON Schema |
| D4 | Schváleno | 2026-09-23 | Verzované URL schéma v1 (`v1.` + lz-string); implementováno M3 |
| D5 | Schváleno | 2026-09-23 | PWA/SW v M4; ne file:// |
| D6 | Schváleno | 2026-09-23 | MP3; M1 bez audio souborů |
| D7 | Schváleno | 2026-09-23 | British English + IPA |
| D8 | Schváleno | 2026-09-23 | CSS print v MVP |
| D9 | Schváleno | 2026-09-23 | Bez buildu v M1 |
| D10 | Schváleno | 2026-09-23 | MVP 1 balíček; finálně 5 oblastí |
| D11 | Schváleno | 2026-09-23 | 5 aktivit pro MVP; M1 demo = `find-pattern` |
| D12 | Schváleno | 2026-09-23 | Netlify + GitHub; deploy později |
| D13 | Schváleno | 2026-09-23 | UI česky, cvičení anglicky |
| D14 | Schváleno | 2026-09-23 | Node test runner v M1; Playwright od M4 |

**M1 autorizováno:** 2026-09-23
