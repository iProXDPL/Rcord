# Zadania - Projekt Rcord

## Faza 1: Inicjalizacja i Konfiguracja (ZAKOŃCZONA)
- `[x]` Konfiguracja GitHub Repo i pierwszego commitu (`gh repo create`)
- `[x]` Inicjalizacja projektu Tauri v2 (Rust + React + TypeScript)
- `[x]` Instalacja paczek i konfiguracja Tailwind CSS / PostCSS
- `[x]` Inicjalizacja lokalnego środowiska Supabase (`supabase init` i start)
- `[x]` Utworzenie i wdrożenie migracji bazy danych (tabele, relacje, unikalne tagi, RLS, stored procedures)
- `[x]` Dodanie licencji MIT oraz podstawowej konfiguracji

## Faza 2: Uwierzytelnianie, Profile i Nawigacja
- `[x]` Integracja klienta Supabase w React (konfiguracja zmiennych środowiskowych i klienta JS)
- `[ ]` Stan Zustand dla uwierzytelniania (`authStore.ts`)
  - `[ ]` Inicjalizacja sesji i nasłuchiwanie `onAuthStateChange`
  - `[ ]` Logowanie za pomocą email i hasła
  - `[ ]` Rejestracja z przesyłaniem metadanych (nazwa, data urodzenia)
  - `[ ]` Pobieranie rekordu profilu użytkownika (`public.profiles`) w czasie rzeczywistym
- `[ ]` Ekrany logowania i rejestracji (UI w React)
  - `[ ]` Formularz Logowania (styl glassmorphic, walidacja email i hasła)
  - `[ ]` Formularz Rejestracji (pole nazwy, email, hasło, data urodzenia, obsługa walidacji wieku)
- `[ ]` Dostosowanie CSS i motywów (`index.css` i Tailwind)
  - `[ ]` Zmienne CSS dla motywów (ciemny, jasny, cyberpunk)
  - `[ ]` Style dla niestandardowych suwaków (scrollbars) i efektów neonowych
- `[ ]` Podstawowy 4-kolumnowy Layout Komunikatora (`MainLayout.tsx`)
  - `[ ]` Kolumna 1: ServerSidebar (przycisk Home + lista serwerów z Drag & Drop)
  - `[ ]` Kolumna 2: ChannelSidebar (nagłówek serwera, lista wydarzeń, kategorie/kanały, dolna karta profilu)
  - `[ ]` Kolumna 3: ActiveView (obszar czatu)
  - `[ ]` Kolumna 4: MemberSidebar (lista członków grupy)
  - `[ ]` Mechanizm zwijania/rozwijania paska kanałów (Kolumna 2) i paska członków (Kolumna 4) wraz z przyciskami
- `[ ]` Zustand dla Serwerów i Kanałów (`serverStore.ts`, `channelStore.ts`)
  - `[ ]` Pobieranie listy serwerów i kanałów aktywnego użytkownika
  - `[ ]` Zarządzanie wyborem aktywnego serwera/kanału
  - `[ ]` Modale tworzenia serwerów i kanałów (ze wsparciem wyboru kategorii i kanałów tymczasowych)
- `[ ]` Systemowe Dźwięki UI
  - `[ ]` Integracja odtwarzacza audio w Zustand/React
  - `[ ]` Odtwarzanie dźwięków wyciszenia mikrofonu i słuchawek (`microfon-mute.mp3`, `headphones-mute.mp3`)
  - `[ ]` Odtwarzanie powiadomień i wzmianek (`Bip.mp3`, `Bip-bip.mp3`)
- `[ ]` Plakietka BOT
  - `[ ]` Renderowanie plakietki `BOT` obok nicku użytkownika w interfejsie (czat, profile, listy)

## Faza 3: Czaty tekstowe, wiadomości i załączniki
- `[ ]` System wiadomości w czasie rzeczywistym (Supabase Realtime) z reakcjami emoji i reply
- `[ ]` Renderowanie wiadomości (obsługa Markdown)
- `[ ]` Wklejanie bezpośrednio ze schowka (`Ctrl+V`) tekstu oraz zdjęć do inputu czatu
- `[ ]` Automatyczne embedy (YouTube, fxtwitter/vxtwitter, imgur, OpenGraph przez Tauri Rust)
- `[ ]` Przesyłanie plików (upload do Supabase Storage, karty pobierania)
- `[ ]` Podgląd i kolorowanie kodu programów (np. `.py`, `.js` w mini scroll-okienkach) oraz uproszczony podgląd `.txt` z pobieraniem
- `[ ]` System DMs i znajomych (lista kontaktów, wysyłanie zaproszeń po tagu, deep-linking `rcord://`)

## Faza 4: Kanały głosowe, wideo i redukcja szumów
- `[ ]` Uruchomienie lokalnego kontenera LiveKit SFU (docker-compose)
- `[ ]` Integracja LiveKit SDK w React do rozmów głosowych/wideo i screen-share
- `[ ]` Redukcja szumów WASM RNNoise w AudioWorklet
- `[ ]` Opcje aktywacji głosowej (VAD oraz Push-to-Talk)
- `[ ]` Przenoszenie użytkowników (drag & drop / menu) między kanałami przez admina (nawet na ukryte)
- `[ ]` Aktywności na kanałach głosowych: Tablica (Whiteboard) oraz wspólne oglądanie wideo (Watch Together) z synchronizacją (Post-MVP)

## Faza 5: Nakładka (Overlay) i System Sklepu
- `[ ]` Stworzenie przezroczystego okna nakładki w Tauri (click-through)
- `[ ]` Rejestracja globalnych skrótów klawiszowych w Rust (konfigurowalne skróty w ustawieniach)
- `[ ]` Sklep z motywami i ramkami (kupowanie za punkty, transakcje SQL)
- `[ ]` System anty-AFK (śledzenie procesów gier w tle w Rust)
