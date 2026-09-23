# READ IT! – Third-party knihovny (M3)

Všechny knihovny jsou nainstalovány přes npm a pro prohlížeč vendoringovány v `src/vendor/` (kde je to potřeba).

| Knihovna | Verze | Licence | Účel |
|----------|-------|---------|------|
| [lz-string](https://github.com/pieroxy/lz-string) | 1.5.0 | MIT / WTFPL | Komprese custom lesson config v URL |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 2.0.4 | MIT | Lokální generování QR kódů (vendoring: `src/vendor/qrcode-generator.mjs`) |

Žádné runtime CDN, placené API ani externí QR služby.
