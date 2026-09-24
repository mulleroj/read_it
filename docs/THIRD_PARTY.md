# READ IT! – Third-party knihovny (M3)

Všechny knihovny jsou nainstalovány přes npm a pro prohlížeč vendoringovány v `src/vendor/` (kde je to potřeba).

| Knihovna | Verze | Licence | Účel |
|----------|-------|---------|------|
| [lz-string](https://github.com/pieroxy/lz-string) | 1.5.0 | MIT / WTFPL | Komprese custom lesson config v URL |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 2.0.4 | MIT | Lokální generování QR kódů (vendoring: `src/vendor/qrcode-generator.mjs`) |

## Audio (M8.2 – připraveno, ne nasazeno)

| Zdroj | Formát | Licence / evidence | Stav |
|-------|--------|-------------------|------|
| [TTSMaker](https://ttsmaker.com/) voice 2402 Robert (UK, male) | 15× MP3 | Usage rights dle ToS / Commercial License Terms – viz `docs/M8_TTSMAKER_LICENSE_EVIDENCE.md` (kontrola 2026-09-24) | **PREPARED – NOT DEPLOYED** |

**Piper / en_GB-alba-medium:** viz `docs/M6C_AUDIO_RELEASE_GATE.md` – **PUBLIC RELEASE BLOCKED** (nesmí se míchat s TTSMaker bankou).

Žádné runtime CDN, placené TTS API ani externí QR služby.
