# READ IT! – English Reading Lab

Interaktivní výuková aplikace pro výuku anglického pravopisu a výslovnosti určená pro české studenty 1. ročníku středních škol (primárně odborné obory, úroveň A1–A2).

## Stav projektu

**Fáze:** Inicializace a architektonické plánování  
**Implementace:** Zatím nezahájena

## Klíčové vlastnosti

- Funguje **bez AI**, **bez placených API**, **bez účtů** a **bez backendu**
- Obsah, audio a obrázky jsou uloženy lokálně
- Režimy: učitel (projekce), student (mobil/PC), hra, tisk, sestavení lekce, knihovna učitele
- Sdílení lekcí a cvičení přes **QR kód** a odkaz (generované lokálně)
- Podpora **offline** provozu po stažení/nainstalaci
- Tři úrovně obtížnosti, automatická kontrola odpovědí

## Dokumentace

| Dokument | Obsah |
|----------|-------|
| [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) | Požadavky, vzdělávací obsah, režimy aplikace |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technická architektura, datový model, klíčová rozhodnutí |
| [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) | Milníky vývoje a testování |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Rozhodnutí k odsouhlasení před implementací |

## Technologický směr (návrh)

Statická webová aplikace (HTML, CSS, JavaScript) s daty ve formátu JSON, volitelně jako Progressive Web App (PWA) pro offline cache. Bez runtime závislosti na CDN.

## Licence a provoz

Licence bude doplněna po odsouhlasení architektury. Provozní náklady: **0 Kč** (statický hosting nebo lokální soubory).

## Další krok

Projektový vlastník by měl projít [docs/DECISIONS.md](docs/DECISIONS.md) a schválit klíčová architektonická rozhodnutí před zahájením implementace.
