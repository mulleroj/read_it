# Produkční audio – TTSMaker Robert 2402 (M8.2 / M8.5)



Tato složka je **jediné** povolené místo pro veřejně redistribuované MP3 ve statickém buildu READ IT!.



## Obsah



Přesně **26 souborů** (viz `content/meta/audio-manifest.json`):



- **Batch 1:** 15 individuálních nahrávek (schváleno 2026-09-24)

- **Batch 2:** 11 split nahrávek z `ttsmaker-file-2026-9-24-17-36-11.mp3` (schváleno 2026-09-24)



## Staging



```powershell

npm run stage:audio

npm run verify:audio

```



Kopíruje schválené soubory z `tools/audio-prototype/ttsmaker-2402/` po ověření SHA-256 proti manifestu.



## Stav (M8.5 lokálně)



- **Manifest:** 26 záznamů, `extendedReleaseEnabled: true`

- **MP3 v repozitáři:** 26 souborů v této složce (připraveno k commitu)

- **Deploy:** zatím **ne** – čeká na ownerské GO



**Nepoužívat** Piper/Alba WAV z `tools/audio-prototype/output/`.

