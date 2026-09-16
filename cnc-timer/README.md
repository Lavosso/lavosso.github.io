# CNC Timer (PWA)

Minimalistyczna aplikacja PWA do pilnowania czasu obróbki na kilku frezarkach CNC jednocześnie.

## Co potrafi (V1)

- 3 domyślne karty maszyn: Frezarka 1, 2 i 3
- Timer oparty o rzeczywisty czas (`timestamp startu + czas trwania`)
- Statusy: **GOTOWA / PRACUJE / ZAKOŃCZONA**
- Duży pozostały czas, procent, progress bar i ETA zakończenia
- Przyciski: **START / GOTOWE / EDYTUJ / RESET**
- Trwały stan w `localStorage` (po odświeżeniu i powrocie z tła wszystko się odtwarza)
- Działanie offline po pierwszym uruchomieniu dzięki Service Worker

## Struktura

```text
cnc-timer/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── service-worker.js
├── README.md
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Uruchomienie lokalne

> Uwaga: PWA i Service Worker wymagają uruchomienia przez HTTP(S), nie przez samo otwarcie pliku `index.html`.

1. Wejdź do katalogu projektu:
   ```bash
   cd cnc-timer
   ```
2. Uruchom prosty serwer statyczny (np. Python):
   ```bash
   python3 -m http.server 8080
   ```
3. Otwórz w przeglądarce:
   ```text
   http://localhost:8080
   ```

## Instalacja PWA na Androidzie

1. Otwórz aplikację w Chrome na Androidzie.
2. Poczekaj na pełne załadowanie (żeby SW zcache'ował pliki).
3. Wejdź w menu przeglądarki i wybierz **Zainstaluj aplikację** / **Dodaj do ekranu głównego**.
4. Uruchamiaj aplikację z ikony jak natywną apkę.

## Wdrożenie na GitHub Pages

1. Wypchnij katalog `cnc-timer/` do repozytorium.
2. W ustawieniach repozytorium włącz GitHub Pages (branch: `main`, folder: `/root` lub `/docs` zgodnie z konfiguracją repo).
3. Otwórz URL:
   - jeśli strona główna repo: `https://<user>.github.io/`
   - jeśli podkatalog: `https://<user>.github.io/cnc-timer/`
4. Sprawdź w Chrome DevTools:
   - **Application > Manifest**
   - **Application > Service Workers**
   - **Application > Storage**

## Notatki techniczne

- Timer jest odporny na odświeżenie i przejście aplikacji do tła, bo opiera się na różnicy czasu systemowego.
- `localStorage` przechowuje pełny stan maszyn.
- Po osiągnięciu zera maszyna przechodzi w status **ZAKOŃCZONA**, karta jest podświetlana, a komunikat jest widoczny na karcie.
