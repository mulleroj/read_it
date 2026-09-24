# READ IT! – M8 TTSMaker public audio release checklist



**Stav:** **PREPARED – NOT DEPLOYED** – MP3 zatím necommitovat / nedeployovat bez ownerského GO.



Odděleně od Piper/Alba gate: `docs/M6C_AUDIO_RELEASE_GATE.md` (**BLOCKED**).



---



## Dokončeno (M8.1 + M8.2)



- [x] **15 / 15 souborů** v intake (`scan-inventory.mjs` → `allValid: true`)

- [x] Každý soubor ne prázdný, validní MP3, bez duplicit

- [x] **Pedagogické schválení 15 / 15** – explicitní prohlášení vlastníka v ChatGPT (**2026-09-24**)

- [x] Záznam schválení: `content/meta/ttsmaker-audio-approval.json`

- [x] Release manifest se SHA-256: `content/meta/audio-manifest.json`

- [x] Licenční evidence (kontrola 2026-09-24): `docs/M8_TTSMAKER_LICENSE_EVIDENCE.md`

- [x] Release design: `docs/M8_TTSMAKER_PUBLIC_AUDIO_RELEASE.md`

- [x] Mapování wordId → `assets/audio/{wordId}.mp3`

- [x] Public surface allowlist – pouze manifest MP3, ne `tools/`

- [x] Staging skript: `npm run stage:audio`

- [x] **`npm test`** – zelená test suite včetně `public-audio-release.test.js`



---



## Před publikací (zbývá)



- [ ] Vlastník potvrdí **GO** ke commitu 15 MP3 + deploy

- [ ] `npm run stage:audio` → ověřit 15 souborů v `assets/audio/`

- [ ] `npm run build:public` → ověřit 15 MP3 v `dist/assets/audio/`, stále 0 WAV/onnx/tools

- [ ] Runtime: zapnout veřejné audio (`publicAudioEnabled`, player, `audioId` v JSON)

- [ ] Aktualizovat `docs/THIRD_PARTY.md` (TTSMaker atribuce)

- [ ] Deploy Netlify – ověřit MIME `audio/mpeg` a absence `/tools/*`

- [ ] Volitelně: právní review pro české školní nasazení

- [ ] Volitelně: archiv snapshot TTSMaker podmínek z doby generace (**neexistuje** k 2026-09-24)



---



## Co se **nesmí**



- Commitovat Piper/Alba WAV nebo modely

- Kopírovat celý `tools/audio-prototype/` do `dist/`

- Považovat marketing FAQ za náhradu licenční evidence

- Tvrdit, že review.html export proběhl, pokud neproběhl


