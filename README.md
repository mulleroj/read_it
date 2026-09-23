# READ IT! – English Reading Lab

Interaktivní výuková aplikace pro výuku anglického pravopisu a výslovnosti určená pro české studenty 1. ročníku středních škol (primárně odborné obory, úroveň A1–A2).

## Stav projektu

**Verze aplikace:** `1.0.0-m3`  
**Dokončené milníky:** M0 (architektura), M1 (kostra), M1.5 (UI), M2A (5 typů cvičení), M3 (Lesson Builder, QR/URL sdílení)  
**Plánování obsahu:** M6A schváleno – [`docs/CONTENT_PLAN.md`](docs/CONTENT_PLAN.md)  
**Plánování audia:** M6A – [`docs/AUDIO_PLAN.md`](docs/AUDIO_PLAN.md) (prototyp ještě negenerován)  
**Repozitář:** [github.com/mulleroj/read_it](https://github.com/mulleroj/read_it)

### Co funguje dnes

- Hash routing: `#/home`, `#/teacher`, `#/student`, `#/builder`
- 5 digitálních typů cvičení: find-pattern, odd-one-out, sort-words, build-word, exit-ticket
- Demo obsah (Vowel Teams, 15 slov, bez audio souborů)
- **Lesson Builder** – výběr cvičení, pořadí, režim zpětné vazby, odhad délky
- **Sdílení lekce** – preset ID nebo komprimovaná URL (`v1.` + lz-string), lokální QR
- **Lesson player** – průchod lekcí v režimu učitele i studenta
- Ukládání custom lekcí v `localStorage`, export/import JSON

### Co zatím nefunguje / není implementováno

- Audio přehrávání (plánováno; `audioId` v datech je `null`)
- PWA / offline (M4), tisk (M5), plný obsahový balíček (M6B)
- Nasazení na Netlify (zatím neautorizováno)

## Spuštění a testy

```bash
npm install
npm test          # unit testy (Node test runner)
npm run serve     # lokální server na http://localhost:3000
```

Otevřete `http://localhost:3000` a vyzkoušejte `#/builder` nebo demo preset `#/student?lesson=les-vowel-teams-demo`.

## Klíčové vlastnosti (cílový produkt)

- **Bez AI**, **bez placených API**, **bez účtů** a **bez backendu**
- Lokální JSON obsah; audio a obrázky jako statická aktiva (audio zatím chybí)
- Režimy: učitel (projekce), student (mobil/PC); další režimy v plánu (hra, tisk, knihovna)
- Sdílení lekcí přes **QR kód** a odkaz (generované lokálně v prohlížeči)
- Cíl: jedna znovupoužitelná **30min smíšená lekce** pokrývající 5 oblastí pravopisu

## Dokumentace

| Dokument | Obsah |
|----------|-------|
| [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) | Požadavky, vzdělávací obsah, režimy aplikace |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technická architektura, datový model |
| [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) | Milníky vývoje |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Schválená architektonická rozhodnutí |
| [docs/CONTENT_PLAN.md](docs/CONTENT_PLAN.md) | Plán vzdělávacího obsahu (M6A) |
| [docs/AUDIO_PLAN.md](docs/AUDIO_PLAN.md) | Plán audio prototypu (Piper/Kokoro) |
| [docs/THIRD_PARTY.md](docs/THIRD_PARTY.md) | Vendoringované knihovny |

## Technologie

Statická webová aplikace (HTML, CSS, vanilla JavaScript, ES modules). Závislosti pouze pro vývoj a vendoring (`lz-string`, `qrcode-generator`). Bez runtime CDN.

## Licence a provoz

Licence projektu bude doplněna. Provozní náklady: **0 Kč** (statický hosting nebo lokální soubory). Finální audio vyžaduje ověření licence zvoleného TTS hlasu – viz `docs/AUDIO_PLAN.md`.
