import { ACTIVITY_TYPE_LABELS } from '../config.js';

/**
 * @typedef {{ id: string, title: string, html: string, keywords?: string }} HelpSection
 */

/** @returns {HelpSection[]} */
export function getTeacherHelpSections() {
  const activities = Object.entries(ACTIVITY_TYPE_LABELS)
    .map(([type, label]) => `<li><strong>${label}</strong> (<code>${type}</code>)</li>`)
    .join('');

  return [
    {
      id: 'start',
      title: 'Začínáme',
      keywords: 'rychlý start preset lekce učitel qr',
      html: `
        <p class="teacher-help__lead">Krátký průvodce pro učitele, který READ IT! poprvé používá ve třídě.</p>
        <ol class="teacher-help__steps">
          <li>V horní liště otevřete <strong>Lekce</strong> a načtěte preset <em>READ IT! – smíšená 30min lekce</em>.</li>
          <li>V panelu sdílení zkopírujte <strong>Odkaz pro studenty</strong> nebo ukažte <strong>QR kód</strong> na projekci.</li>
          <li>Klikněte <strong>Spustit (učitel)</strong> a projděte lekci z tabule.</li>
          <li>Studenti otevřou odkaz na telefonu a stisknou <strong>Spustit lekci</strong>.</li>
        </ol>
        <p><a href="#help-quick-lesson">Podrobný postup hotové lekce →</a></p>
        <p>Veřejná adresa READ IT!: <strong><a href="https://readit-stsul.netlify.app/" target="_blank" rel="noopener noreferrer">readit-stsul.netlify.app</a></strong> – funguje odkudkoliv s internetem (odkaz i QR).</p>
        <p class="teacher-help__optional">Pilot ve školní síti bez závislosti na internetu studentů řeší správce – viz <a href="#help-pilot-admin">Spuštění pro správce sítě (pilot)</a>.</p>`,
    },
    {
      id: 'what-is',
      title: 'Co je READ IT!',
      keywords: 'a1 a2 oblasti ipa učitel student',
      html: `
        <p>READ IT! je interaktivní výuková aplikace pro <strong>anglický pravopis a výslovnost</strong> u studentů přibližně na úrovni <strong>A1–A2</strong> (1. ročník SŠ, odborné obory).</p>
        <ul>
          <li>Pokrývá <strong>pět oblastí</strong>: Vowel Teams, R-Controlled, Diphthongs, Soft C/G, Double Consonants.</li>
          <li><strong>Režim učitele</strong> – projekce, metodické poznámky, ruční odhalení odpovědí.</li>
          <li><strong>Režim studenta</strong> – samostatná práce na mobilu; <strong>účet není potřeba</strong>.</li>
          <li>U slov je k dispozici <strong>britská IPA</strong> (nápověda k výslovnosti).</li>
        </ul>
        <p class="teacher-help__note"><strong>Poslech (TTSMaker, britská angličtina)</strong> je u <strong>26 mapovaných slov</strong> – ne u celé databáze READ IT!. U ostatních slov modelujte výslovnost ústně nebo pomocí IPA.</p>`,
    },
    {
      id: 'quick-lesson',
      title: 'Nejrychlejší spuštění hotové lekce',
      keywords: 'mixed preset 30 minut builder spustit',
      html: `
        <p>Hotová lekce: <strong>READ IT! – smíšená 30min lekce</strong>.</p>
        <ol class="teacher-help__steps">
          <li>V navigaci klikněte <strong>Lekce</strong>.</li>
          <li>V sekci <strong>Ukázkové preset lekce</strong> zvolte <strong>Načíst do editoru</strong> u smíšené lekce.</li>
          <li>V panelu <strong>Sdílení lekce</strong> zkopírujte <strong>Odkaz pro studenty</strong> nebo otevřete <strong>Celá obrazovka (projektor)</strong> u QR kódu.</li>
          <li>Klikněte <strong>Spustit (učitel)</strong> – otevře se režim učitele s přehledem lekce a poznámkami.</li>
          <li>Na projekci klikněte <strong>Spustit lekci</strong> a postupujte cvičení po cvičení.</li>
          <li>Studenti na telefonech dokončí každé cvičení; teprve pak se jim odemkne <strong>Další cvičení</strong>.</li>
        </ol>
        <p>Lekce obsahuje 4 cvičení: Najdi vzor (6 položek), Roztřiď slova (10 slov), Sestav slovo (3 slova), Exit ticket (5 položek) + plánovaný poslechový blok (5 slov).</p>`,
    },
    {
      id: 'modes',
      title: 'Režim učitele a režim žáka',
      keywords: 'projekce poznámky assessment practice',
      html: `
        <h3 class="teacher-help__h3">Učitel</h3>
        <ul>
          <li>Větší text vhodný pro projekci.</li>
          <li><strong>Poznámky k lekci</strong> a metodický panel (jen učitel).</li>
          <li><strong>Zobrazit odpověď</strong> – ruční odhalení po diskusi ve třídě.</li>
          <li>Tlačítko <strong>Další cvičení</strong> je vždy dostupné (vedete tempo).</li>
        </ul>
        <h3 class="teacher-help__h3">Student</h3>
        <ul>
          <li>Samostatná interakce na mobilu nebo PC.</li>
          <li>Cvičení 1–3: <strong>Procvičování – okamžitá zpětná vazba</strong>.</li>
          <li>Exit ticket: <strong>Test – výsledky až na konci</strong>.</li>
          <li><strong>Poznámky k lekci se studentům nezobrazují.</strong></li>
        </ul>`,
    },
    {
      id: 'builder',
      title: 'Lesson Builder krok za krokem',
      keywords: 'uložit export import sdílení pořadí',
      html: `
        <ol class="teacher-help__steps">
          <li><strong>Vybrat cvičení</strong> – tlačítko Přidat u dostupných cvičení.</li>
          <li><strong>Pořadí</strong> – šipky ↑ ↓ u vybraných cvičení.</li>
          <li><strong>Odhad délky</strong> – zobrazí se pod názvem a plánem modulu.</li>
          <li><strong>Zpětná vazba</strong> u každého slotu: Procvičování nebo Test.</li>
          <li><strong>Uložit lokálně</strong> – jen v tomto prohlížeči.</li>
          <li><strong>Exportovat JSON</strong> / <strong>Importovat JSON</strong> – přenos konfigurace souborem.</li>
          <li><strong>Sdílení lekce</strong> – odkaz pro studenty/učitele a QR kód.</li>
        </ol>
        <p class="teacher-help__note"><strong>Lokální uložení se nesynchronizuje mezi zařízeními.</strong> Student dostane lekci přes <strong>URL nebo QR</strong>, ne přes váš lokální úložiště v prohlížeči.</p>`,
    },
    {
      id: 'activities',
      title: 'Pět typů cvičení',
      keywords: 'find pattern sort build exit odd',
      html: `
        <p>Aplikace podporuje <strong>5 typů</strong> cvičení. Smíšená 30min lekce používá <strong>4 typy</strong> (bez Co nepatří).</p>
        <ul>${activities}</ul>
        <dl class="teacher-help__dl">
          <dt>Najdi vzor (find-pattern)</dt>
          <dd>Student vidí slovo a IPA, vybere správný pravopisný vzor tlačítkem.</dd>
          <dt>Co nepatří (odd-one-out)</dt>
          <dd>Vyberte slovo, které nepatří do sady (v demo lekci, ne ve smíšené).</dd>
          <dt>Roztřiď slova (sort-words)</dt>
          <dd><strong>Mobil:</strong> klepněte na slovo, pak na <strong>Přiřadit sem</strong> u kategorie. Po roztřídění všech slov stiskněte <strong>Ověřit</strong>.</dd>
          <dt>Sestav slovo (build-word)</dt>
          <dd>Klepněte na dílky ve správném pořadí; nápověda IPA pod sestaveným slovem.</dd>
          <dt>Exit ticket (exit-ticket)</dt>
          <dd>Test – student odpoví na všechny položky, výsledky a přehled až na konci cvičení.</dd>
        </dl>`,
    },
    {
      id: 'pilot-30',
      title: 'Pilot ve třídě – 30 minut',
      keywords: 'rain gift poslech exit ticket tempo',
      html: `
        <table class="teacher-help__table">
          <thead><tr><th>Fáze</th><th>Čas</th><th>Obsah</th></tr></thead>
          <tbody>
            <tr><td>Úvod</td><td>2 min</td><td>Cíl, QR/odkaz, stručně 5 oblastí</td></tr>
            <tr><td>Najdi vzor</td><td>8 min</td><td>rain, car, coin, city, happy, tree</td></tr>
            <tr><td>Roztřiď slova</td><td>4 min</td><td>10 slov do 5 kategorií</td></tr>
            <tr><td>Sestav slovo</td><td>5 min</td><td>rain, bell, clock</td></tr>
            <tr><td>Poslech</td><td>3 min</td><td>rain, car, coin, city, happy – tlačítko Poslech nebo ústně učitele</td></tr>
            <tr><td>Exit ticket</td><td>5 min</td><td>bird, cow, gym, gift, boat</td></tr>
            <tr><td>Závěr</td><td>1 min</td><td>Shrnutí – gift = hard g</td></tr>
          </tbody>
        </table>
        <p><strong>Před exit ticketem:</strong> ukažte kontrast hard g na slovech <strong>get</strong> a <strong>girl</strong> (cca 30 s). Odpověď k položce <strong>gift</strong> studentům <strong>neprozrazujte</strong>.</p>
        <p class="teacher-help__optional"><em>Volitelné</em> (vynechat při časové tísni): guided příklady turn, wait, play, brown, rice, sock, miss z poznámek učitele; delší rozbor digrafu ck u clock.</p>`,
    },
    {
      id: 'sharing',
      title: 'Sdílení a QR',
      keywords: 'odkaz qr wifi telefon studenti',
      html: `
        <p>Studenti nepotřebují účet – dostanou <strong>odkaz nebo QR kód</strong> z panelu sdílení v Lesson Builderu.</p>
        <h3 class="teacher-help__h3">Veřejná adresa (doporučeno)</h3>
        <ol class="teacher-help__steps">
          <li>Otevřete <strong><a href="https://readit-stsul.netlify.app/" target="_blank" rel="noopener noreferrer">readit-stsul.netlify.app</a></strong> a načtěte lekci v Builderu.</li>
          <li>V panelu <strong>Sdílení lekce</strong> zkopírujte <strong>Odkaz pro studenty</strong> nebo ukažte QR na projekci.</li>
          <li>Studenti otevřou odkaz na telefonu – stačí běžné internetové připojení.</li>
        </ol>
        <h3 class="teacher-help__h3">Alternativa: pilot ve školní síti</h3>
        <p>Pro test bez internetu studentů nebo izolovanou Wi-Fi viz <a href="#help-pilot-admin">Spuštění pro správce sítě (pilot)</a>. Odkaz v QR musí obsahovat LAN IP učitelova PC (<code>192.168.x.x</code>), ne <code>localhost</code>.</p>
        <p class="teacher-help__note">U LAN pilotu musí být telefony ve stejné Wi-Fi; některé sítě klienty izolují (viz FAQ).</p>`,
    },
    {
      id: 'pilot-admin',
      title: 'Spuštění pro správce sítě (pilot)',
      keywords: 'npm serve pilot localhost lan port admin',
      html: `
        <p class="teacher-help__note">Tato sekce je pro kolegu, který READ IT! na učitelově počítači spouští technicky (IT správce nebo příprava doma).</p>
        <table class="teacher-help__table">
          <thead><tr><th>Účel</th><th>Příkaz</th><th>Kdo</th></tr></thead>
          <tbody>
            <tr><td>Pilot ve třídě (telefony)</td><td><code>npm run serve:pilot</code></td><td>Síť školy – naslouchá na portu 3000</td></tr>
            <tr><td>Příprava učitele doma</td><td><code>npm run serve</code></td><td>Jen tento počítač (127.0.0.1)</td></tr>
          </tbody>
        </table>
        <ul>
          <li>Po spuštění pilot serveru otevřete Builder na <code>http://&lt;LAN-IP-učitele&gt;:3000</code>, ne na localhost.</li>
          <li>QR vygenerované z localhost <strong>nefunguje</strong> na telefonech studentů.</li>
          <li>Pro pilot ve třídě <strong>nepoužívejte</strong> běžný dev server (<code>npm run serve</code>) na síť – servíruje celý projekt včetně citlivých cest.</li>
        </ul>`,
    },
    {
      id: 'audio',
      title: 'Zvuk a výslovnost',
      keywords: 'wav poslech ipa ustni pilot',
      html: `
        <ul>
          <li><strong>IPA</strong> (britská) je v aplikaci u slov.</li>
          <li><strong>Poslech (TTSMaker Robert 2402)</strong> – schválené MP3 u <strong>26 mapovaných slov</strong> (15 individuálních nahrávek + 11 split z batch souboru). <strong>Ne</strong> u každého slova v databázi READ IT!.</li>
          <li>Ve smíšené lekci je plánovaný poslech u <strong>5 slov</strong>: rain, car, coin, city, happy – všechna mají tlačítko Poslech.</li>
          <li>Na veřejné adrese (<strong>readit-stsul.netlify.app</strong>) a v buildu s committnutými MP3 funguje Poslech u mapovaných slov i na telefonech studentů.</li>
          <li>Složka <code>tools/audio-prototype/</code> je jen pro vývoj – do produkce se nekopíruje.</li>
        </ul>
        <p class="teacher-help__note">Piper/Alba WAV z lokálního prototypu nejsou součástí aplikace.</p>`,
    },
    {
      id: 'faq',
      title: 'Nejčastější problémy',
      keywords: 'qr localhost další cvičení poslech wifi port',
      html: `
        <div class="teacher-help__faq-list">
          <details class="teacher-help__faq">
            <summary>Telefon studenta neotevře odkaz z QR</summary>
            <p>Jsou telefon i učitelův počítač ve stejné Wi-Fi? Odkaz v QR musí obsahovat síťovou adresu počítače (192.168…), ne localhost. Zkuste odkaz opsat ručně. Když to stále nejde, kontaktujte školní IT (viz další otázka).</p>
          </details>
          <details class="teacher-help__faq">
            <summary>QR kód obsahuje localhost</summary>
            <p>Builder jste otevřeli na tomto počítači jako <code>127.0.0.1</code> nebo <code>localhost</code>. Požádejte správce, ať aplikaci spustí pro síť, a Builder otevřete znovu přes adresu <code>http://&lt;LAN-IP&gt;:3000</code>. QR vygenerujte znovu.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Student nevidí „Další cvičení“</summary>
            <p>Student musí dokončit všechny položky v aktuálním cvičení (zobrazí se souhrn). Teprve pak se odemkne přechod na další cvičení.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Chybí tlačítko Poslech</summary>
            <p>Tlačítko Poslech se zobrazí jen u <strong>26 mapovaných slov</strong> se schváleným TTSMaker audiem – ne u každého slova v cvičení. U ostatních slov použijte IPA nebo ústní modelování. Pokud u mapovaného slova Poslech chybí, zkontrolujte internet a že používáte build s nasazenými MP3 v <code>assets/audio/</code>.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Nevidím poznámky k lekci</summary>
            <p>Poznámky jsou jen v <strong>režimu učitele</strong> u preset lekce s metodickým textem. Student je nikdy nevidí.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Uložená lekce v Builderu chybí na jiném zařízení</summary>
            <p><strong>Uložit lokálně</strong> ukládá do prohlížeče na tomto PC. Pro sdílení použijte odkaz, QR nebo Export JSON.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Školní Wi-Fi blokuje přístup mezi zařízeními</summary>
            <p>Některé sítě izolují klienty (AP isolation). Kontaktujte <strong>školní IT</strong> – požádejte o propustnost mezi učitelovým PC a studentskými telefony na portu 3000. Nežádejte o obcházení bezpečnostních pravidel sítě.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Počítač nemá LAN IP / jen offline</summary>
            <p>Připojte PC ke školní Wi-Fi nebo ethernetu pro LAN pilot. Nebo použijte veřejnou adresu <strong><a href="https://readit-stsul.netlify.app/" target="_blank" rel="noopener noreferrer">readit-stsul.netlify.app</a></strong>, která nevyžaduje lokální server.</p>
          </details>
          <details class="teacher-help__faq">
            <summary>Port 3000 je obsazený</summary>
            <p>Na učitelově počítači už běží jiná instance READ IT! Ukončete ji (Správce úloh → ukončit starý proces) a spusťte znovu. Detaily viz sekce <a href="#help-pilot-admin">Spuštění pro správce sítě</a>.</p>
          </details>
        </div>`,
    },
  ];
}
