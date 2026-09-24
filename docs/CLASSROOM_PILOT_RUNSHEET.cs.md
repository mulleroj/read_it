# READ IT! – Run sheet: pilot ve třídě (30 min)

**Preset:** `les-read-it-30-mixed`  
**Cíl:** jeden učitel + projekce, studenti na telefonech, **30 minut**  
**Audio:** PUBLIC AUDIO RELEASE zůstává **BLOCKED** – poslech je učitelský blok mimo app

---

## Dva režimy serveru (důležité)

| Příkaz | Adresa | Kdo | Co servíruje |
|--------|--------|-----|--------------|
| **`npm run serve:pilot`** | `http://0.0.0.0:3000` (LAN) | **Pilot ve třídě** | Jen `index.html`, `styles/`, `src/`, `content/` – **bez** `tools/`, WAV, modelů |
| **`npm run serve`** | `http://127.0.0.1:3000` (localhost) | **Učitel – příprava** | Celý repozitář včetně lokálního M6A.2 audia pro test na projekci |

⚠️ **Nikdy** nepoužívejte `npm run serve` (localhost dev) pro QR studentům – ani na LAN IP v prohlížeči by stejně nešlo servírovat bezpečně celý kořen repa.

---

## Před hodinou (~5 min)

1. `npm install`
2. Spusťte **`npm run serve:pilot`** (ne `serve`).
3. Zjistěte **LAN IP** učitelova PC ve školní Wi-Fi (např. `192.168.1.42`).
4. Otevřete **`http://<LAN-IP>:3000/#/builder?preset=les-read-it-30-mixed`**
5. Zkontrolujte odkaz pro studenty – musí obsahovat **LAN IP**, ne localhost.
6. QR na projekci (**Celá obrazovka**) nebo odkaz do chatu.
7. Učitel: **`#/teacher?lesson=les-read-it-30-mixed`**

**Volitelná příprava audia (mimo pilot server):** na localhost spusťte `npm run serve` a v prohlížeči otevřete `#/teacher?lesson=…` – lokální prototyp funguje jen z `127.0.0.1`, ne z telefonů studentů.

| Přístup | Telefony studentů |
|---------|-------------------|
| `localhost` / `127.0.0.1` | ❌ |
| `http://<LAN-IP>:3000` + **`serve:pilot`** | ✅ |
| veřejná URL (Netlify…) | 🔶 až po nasazení |

---

## Plán hodiny – realistických 30 min

Odhad aplikace: **~33 min** (25 min cvičení + 3 min přestupy + 3 min úvod + 2 min závěr).  
Níže **30min varianta** – zkrácení tempa a volitelných bloků, **bez mazání cvičení**.

| Fáze | Plán 30 min | Kdo | Co |
|------|-------------|-----|-----|
| **0. Úvod** | **2 min** | učitel | Cíl, QR/odkaz; 5 oblastí jen stručně |
| **1. Najdi vzor** | **8 min** | studenti | 6 slov – udržet tempo (~1 min/položka) |
| **2. Roztřiď slova** | **4 min** | studenti | 10 slov – bez opakování celé sady |
| **3. Sestav slovo** | **5 min** | studenti | rain, bell, clock |
| **4. Poslech** | **3 min** | učitel | rain, car, coin, city, happy – **ústně** |
| **5. Exit ticket** | **5 min** | studenti | bird, cow, gym, gift, boat |
| **6. Závěr** | **1 min** | učitel | gift = hard g; hotovo |

### Co zkrátit (označeno volitelné / zkracitelné)

| Položka | Normální | Při časové tísni |
|---------|----------|------------------|
| Úvod – board s 5 oblastmi | ~3 min | **2 min** – jen seznam oblastí |
| Přestupy mezi cvičeními (×3) | ~3 min | **~1 min** – krátké „další úkol" |
| Najdi vzor (6 položek) | ~9 min | **8 min** – méně diskuse u tree |
| Poslech učitele | ~4 min | **3 min** – 5 slov bez opakování |
| Závěr + diskuse gift | ~2 min | **1 min** – jen klíčová věta |
| *Volitelné guided příklady* (teacher notes: turn, wait, play, brown, rice, sock, miss) | mimo app | **vynechat** |
| *Volitelné* delší vysvětlení digrafu ck | během build-word | **1 věta** |

**Nepřeskakovat:** hard-g kontrast (get, girl) před exit ticketem – stačí 30 s.

---

## Tipy během hodiny

- **Projekce:** režim učitele – ruční odhalení, metodický panel.
- **Studenti:** okamžitá zpětná vazba u cvičení 1–3; exit ticket až na konci.
- **Poslech:** pilot server **neposkytuje** WAV soubory; tlačítka Poslech se na LAN ** nezobrazí** a aplikace ** nevolá** audio URL.
- **Gift:** neprozrazovat před odpovědí; po ticketu vysvětlit hard g.

---

## Rychlé URL (nahraďte `<LAN-IP>`)

```
Builder:  http://<LAN-IP>:3000/#/builder?preset=les-read-it-30-mixed
Učitel:   http://<LAN-IP>:3000/#/teacher?lesson=les-read-it-30-mixed
Student:  http://<LAN-IP>:3000/#/student?lesson=les-read-it-30-mixed
```

---

## Když něco nefunguje

| Problém | Řešení |
|---------|--------|
| Telefon nenačte stránku | Stejná Wi-Fi? Běží `serve:pilot`? Odkaz má LAN IP? |
| QR nefunguje | Builder otevřen z LAN IP, ne localhost |
| Student nevidí „Další cvičení" | Dokončit všechny položky v cvičení |
| Chybí Poslech | **Očekávané** na pilot serveru – učitel modeluje ústně |

---

*M7.1 – pilot server servíruje jen veřejné soubory aplikace. Produkční audio zůstává BLOCKED.*
