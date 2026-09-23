# READ IT! – UI poznámky (M1.5)

## Design systém

- **Tokeny** v `styles/main.css` (`:root`) – barvy, spacing, typografie, stíny
- **Kategorie** – 5 CSS modifikátorů (`.cat-vowel-teams` … `.cat-double-consonants`) nastavují `--cat-color`, `--cat-soft`, `--cat-border`
- **Ikony** – inline SVG v `src/ui/icons.js`, bez CDN

## Režimy

| Režim | Vizualizace |
|-------|-------------|
| Učitel | Badge v hlavičce, větší text, metodický panel vpravo (≥768 px) |
| Student | Modrý badge, kompaktnější layout |

## Přístupnost

- Zpětná vazba: ikona + textový label (ne jen barva)
- Možnosti odpovědi: `aria-label` po vyhodnocení
- Progress bar: `role="progressbar"` + textový popis
- Focus stavy na všech interaktivních prvcích
- **sort-words:** klávesnice – Enter/Mezerník pro výběr slova, Tab + Enter pro přiřazení kategorii, Esc zruší výběr
- **Practice mode:** po vyhodnocení tlačítko „Další otázka“ (bez automatického přechodu)
- **Assessment mode:** odložená zpětná vazba, tlačítko „Další“ / „Dokončit“

## M3 – Lesson Builder

- Route `#/builder` – sestavení lekce, lokální uložení, export/import JSON
- Sdílení: preset = krátký `?lesson=ID`, custom = `?cfg=v1.…`
- QR: lokální canvas, fullscreen overlay pro projektor
- Odhad délky: transparentní součet (cvičení + úvod + přechody + závěr), upozornění při nedostatku obsahu

## Barvy kategorií

| Oblast | Barva |
|--------|-------|
| Vowel Teams | cyan `#0891b2` |
| R-Controlled | fialová `#7c3aed` |
| Diphthongs | oranžová `#ea580c` |
| Soft C / G | zelená `#059669` |
| Double Consonants | růžová `#be185d` |
