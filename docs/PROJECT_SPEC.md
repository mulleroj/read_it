# READ IT! – Specifikace projektu

## 1. Účel a cílová skupina

**READ IT! – English Reading Lab** je samostatná interaktivní aplikace pro výuku anglického pravopisu a výslovnosti.

| Parametr | Hodnota |
|----------|---------|
| Cílová skupina | Studenti 1. ročníku SŠ, primárně odborné obory |
| Jazyková úroveň | A1–A2 + náročnější úlohy |
| Forma využití | Učitelsky vedená hodina (~30 min) nebo samostatná práce |
| Opakované použití | Jednou ročně, několik školních let bez údržby |

## 2. Nefunkční požadavky (závazné)

1. **Bez AI** za běhu aplikace
2. **Bez placených API klíčů**
3. **Bez uživatelských účtů**
4. **Bez backend serveru a databáze**
5. Lokálně uložený obsah, audio a obrázky
6. Podpora projekce (učitel), mobilů (studenti), tisku
7. Sdílení cvičení/lekcí přes QR kód a odkaz
8. Hotové 30minutové scénáře + vlastní sestavení lekce
9. Tři úrovně obtížnosti
10. Automatická kontrola u vhodných typů cvičení
11. Offline provoz po instalaci/stažení assetů
12. Žádné centrální sledování studentů – výsledky zůstávají na zařízení

Online hosting je volitelný pro pohodlný přístup, nikoli podmínka provozu.

## 3. Vzdělávací obsah (počáteční oblasti)

Pracovní kategorie (ne nutně fonetické třídy – ověřovat lingvistickou přesnost):

1. Vowel teams a běžné vzory psaní samohlásek
2. R-controlled vowel patterns
3. Diphthongs
4. Soft C a Soft G
5. Double consonants a související vzory

### Lingvistické principy

- **Primární standard:** britská angličtina (Received Pronunciation jako referenční model)
- **IPA:** tam, kde je to pedagogicky vhodné
- **Rozlišovat:** pravopisné vzory, fonémy, výslovnost, konvence, výjimky
- **Nekopírovat slepě** nepřesnosti z referenčních materiálů

Kompletní slovní databáze se **negeneruje** v této fázi – pouze se navrhuje datový model.

## 4. Typy aktivit (banka cvičení)

| Aktivita | Digitálně | Tisk | Poznámka |
|----------|-----------|------|----------|
| Listen and repeat | ✓ | — | Audio + vizuální podpora |
| Read before you hear | ✓ | ✓ | Tisk: slovní seznam |
| Listen and choose | ✓ | ✓ | Tisk: MCQ |
| Find the pattern | ✓ | ✓ | |
| Sort the words | ✓ | ✓ | Drag & drop / třídicí karty |
| Odd one out | ✓ | ✓ | |
| Memory matching | ✓ | ✓ | Tisk: karty k vyříznutí |
| Build a word | ✓ | ✓ | |
| Find and correct mistakes | ✓ | ✓ | |
| Same or different sounds | ✓ | ✓ | |
| Reading challenge | ✓ | ✓ | |
| Pair work | ✓ | ✓ | Metodický list |
| Team competition | ✓ | ✓ | Skórovací tabule |
| Learning stations | ✓ | ✓ | Kombinace QR + karty |
| Create your own challenge | ✓ | — | Učitel/student, lokální uložení |
| Vocational English extensions | ✓ | ✓ | Odborná slovní zásoba |
| Exit ticket | ✓ | ✓ | Krátké shrnutí |

Ne každá aktivita musí být identická v obou režimech – důležitá je sdílená datová vrstva.

## 5. Režimy aplikace

| Režim | Kód | Popis |
|-------|-----|-------|
| **Teacher Mode** | `teacher` | Projekce, vedení hodiny, QR kód |
| **Student Mode** | `student` | Samostatná práce na PC/mobilu |
| **Game Mode** | `game` | Týmové aktivity ve třídě |
| **Paper Mode** | `paper` | Tiskové materiály a klíče |
| **Lesson Builder** | `builder` | Sestavení ~30min lekce |
| **Teacher Library** | `library` | Obsah, šablony, metodika, presety |

Všechny režimy sdílejí **jednu content databázi**.

## 6. QR kód a sdílení

Učitel musí umět:

- Sestavit lekci nebo vybrat cvičení
- Vygenerovat odkaz a QR kód **lokálně**
- Zobrazit QR na projekci, zkopírovat odkaz (Teams)
- Uložit a znovu použít konfiguraci lekce
- Sdílet jednotlivé cvičení nebo celou lekci

Student po otevření odkazu obdrží správnou konfiguraci. Výsledky zůstávají na zařízení studenta.

### Omezení

- Nově naskenovaný QR může vyžadovat internet při **prvním** načtení (stažení assetů)
- Délka URL ovlivňuje čitelnost QR – nutná strategie komprese a preset ID

## 7. Obtížnost

Tři úrovně: **easy**, **medium**, **hard**

- Filtrování slov, počet možností, délka textu, míra nápovědy
- Obtížnost je atribut na úrovni cvičení i jednotlivých položek

## 8. Mimo rozsah (záměrně)

- Centrální reporting a gradebook
- AI generování obsahu za běhu
- Uživatelské profily a synchronizace mezi zařízeními
- Externí analytika

## 9. Kritéria úspěchu MVP

1. Učitel spustí preset lekci na projekci za < 2 minuty
2. Student otevře QR odkaz na mobilu a dokončí cvičení
3. Aplikace funguje offline po prvním načtení
4. Učitel vytiskne pracovní list s klíčem
5. Minimálně 5 typů aktivit plně funkčních v digitální podobě
