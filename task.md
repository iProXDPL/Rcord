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
- `[x]` Stan Zustand dla uwierzytelniania (`authStore.ts`)
  - `[x]` Inicjalizacja sesji i nasłuchiwanie `onAuthStateChange`
  - `[x]` Logowanie za pomocą email i hasła
  - `[x]` Rejestracja z przesyłaniem metadanych (nazwa, data urodzenia)
  - `[x]` Pobieranie rekordu profilu użytkownika (`public.profiles`) w czasie rzeczywistym
- `[x]` Ekrany logowania i rejestracji (UI w React)
  - `[x]` Formularz Logowania (styl glassmorphic, walidacja email i hasła)
  - `[x]` Formularz Rejestracji (pole nazwy, email, hasło, data urodzenia, obsługa walidacji wieku)
- `[/]` Wdrożenie Magazynu plików (Storage) i Profilu Użytkownika
  - `[x]` Konfiguracja wiader `avatars` oraz `banners` z politykami RLS w bazie danych
  - `[ ]` Automatyczne pobieranie i zapisywanie zewnętrznych awatarów Google na nasz serwer storage przy pierwszym logowaniu
  - `[ ]` Wgrywanie plików awataru i baneru z lokalnego komputera w oknie ustawień (zamiast wklejania linków)
  - `[ ]` Przebudowanie okna Ustawień na estetyczny wyskakujący dialog (modal popup) z wyszukiwarką, kategoriami i przewijaniem zawartości
- `[x]` Dostosowanie CSS i motywów (`index.css` i Tailwind)
  - `[x]` Zmienne CSS dla motywów (ciemny, jasny, cyberpunk)
  - `[x]` Style dla niestandardowych suwaków (scrollbars) i efektów neonowych
  - `[ ]` Opcjonalnie: Badanie i integracja systemu komponentów Astryx (Design System od Meta) dla UI i obsługi przez agentów AI
- `[x]` Podstawowy 4-kolumnowy Layout Komunikatora (`MainLayout.tsx`)
  - `[x]` Kolumna 1: ServerSidebar (przycisk Home + lista serwerów z Drag & Drop)
  - `[x]` Kolumna 2: ChannelSidebar (nagłówek serwera, lista wydarzeń, kategorie/kanały, dolna karta profilu)
  - `[x]` Kolumna 3: ActiveView (obszar czatu)
  - `[x]` Kolumna 4: MemberSidebar (lista członków grupy)
  - `[x]` Mechanizm zwijania/rozwijania paska kanałów (Kolumna 2) i paska członków (Kolumna 4) wraz z przyciskami
- `[x]` Zustand dla Serwerów i Kanałów (`serverStore.ts`, `channelStore.ts`)
  - `[x]` Pobieranie listy serwerów i kanałów aktywnego użytkownika
  - `[x]` Zarządzanie wyborem aktywnego serwera/kanału
  - `[x]` Modale tworzenia serwerów i kanałów (ze wsparciem wyboru kategorii i kanałów tymczasowych)
- `[x]` Systemowe Dźwięki UI
  - `[x]` Integracja odtwarzacza audio w Zustand/React
  - `[x]` Odtwarzanie dźwięków wyciszenia mikrofonu i słuchawek (`microfon-mute.mp3`, `headphones-mute.mp3`)
  - `[x]` Odtwarzanie powiadomień i wzmianek (`Bip.mp3`, `Bip-bip.mp3`)
- `[x]` Plakietka BOT
  - `[x]` Renderowanie plakietki `BOT` obok nicku użytkownika w interfejsie (czat, profile, listy)

## Faza 3: Czaty tekstowe, wiadomości i załączniki
- `[ ]` Subskrypcja wiadomości w czasie rzeczywistym i Stan Zustand (`messageStore.ts`)
  - `[ ]` Pobieranie historii wiadomości dla wybranego kanału z paginacją (limit 50)
  - `[ ]` Subskrypcja Supabase Realtime (nasłuchiwanie `INSERT`, `UPDATE`, `DELETE` na tabeli `messages`)
  - `[ ]` Integracja systemu reakcji emoji (tabela `message_reactions` i Realtime)
  - `[ ]` System odpowiedzi na wiadomości (pole `parent_message_id` w bazie i UI)
- `[ ]` Renderowanie wiadomości z obsługą Markdown
  - `[ ]` Parsowanie tekstu (pogrubienie, kursywa, przekreślenie, bloki kodu)
  - `[ ]` Bezpieczne renderowanie HTML w React (zapobieganie XSS)
- `[ ]` Obsługa schowka systemowego (Wklejanie Ctrl+V)
  - `[ ]` Nasłuchiwanie zdarzenia `paste` na inpucie czatu
  - `[ ]` Detekcja grafik w schowku (zamiana na plik do wysłania) i tekstu bez formatowania
- `[ ]` Automatyczne embedy i parser linków
  - `[ ]` Wykrywanie linków w tekście wiadomości (YouTube, Twitter/x, Imgur)
  - `[ ]` Integracja dedykowanych komponentów odtwarzaczy dla wklejonych mediów
- `[ ]` Upload załączników do Supabase Storage
  - `[ ]` Wysyłanie plików do kubełka `attachments` (walidacja rozmiaru do 10MB)
  - `[ ]` Generowanie podpisanego URL (Signed URL) dla prywatnych plików
  - `[ ]` Renderowanie kart plików z ikoną pobierania i nazwą
- `[ ]` Kolorowanie kodu i podgląd plików tekstowych
  - `[ ]` Podgląd kodu dla plików programistycznych (np. `.py`, `.js`, `.rs`) z podświetlaniem składni
  - `[ ]` Uproszczone wyświetlanie zawartości plików `.txt` w małym okienku z przewijaniem
- `[ ]` System DMs (Wiadomości Prywatne) i Znajomych (`friendsStore.ts`)
  - `[ ]` Pobieranie i tworzenie kanałów typu `dm` oraz `group_dm`
  - `[ ]` Zakładki panelu znajomych (Aktywni, Wszyscy, Oczekujący, Zablokowani)
  - `[ ]` Wysyłanie zaproszeń do znajomych przy użyciu nazwy z tagiem `#XXXX`
  - `[ ]` Rejestracja obsługi protokołu `rcord://` (deep-linking) w Tauri

## Faza 4: Kanały głosowe, wideo i redukcja szumów
- `[ ]` Konfiguracja LiveKit SFU
  - `[ ]` Konfiguracja pliku `livekit.yaml` do poprawnej pracy lokalnej i zewnętrznej
  - `[ ]` Generowanie tokenów dostępowych (LiveKit JWT) w backendzie Rust
- `[ ]` Integracja LiveKit SDK w React (`voiceStore.ts`)
  - `[ ]` Podłączanie do pokoju głosowego po kliknięciu na kanał typu `voice`
  - `[ ]` Renderowanie listy uczestników wewnątrz kanału w `ChannelSidebar`
  - `[ ]` Wizualny wskaźnik mówienia (Speech Indicator) przy użyciu detekcji głośności
  - `[ ]` Udostępnianie ekranu (Screen Share) oraz przesyłanie strumienia wideo z kamery
- `[ ]` Filtrowanie szumów i Aktywacja Głosowa
  - `[ ]` Integracja biblioteki RNNoise (WASM) w procesie AudioWorklet
  - `[ ]` Konfiguracja progu aktywacji głosowej (VAD) oraz trybu Push-to-Talk (skróty klawiszowe)
- `[ ]` Zarządzanie użytkownikami (Administracja)
  - `[ ]` Przenoszenie użytkowników (drag & drop) między kanałami głosowymi przez administratora
  - `[ ]` Wyciszanie i ogłuszanie użytkowników na poziomie serwera (Server Mute/Deafen)
- `[ ]` Aktywności i Gry
  - `[ ]` Wspólna interaktywna tablica (Whiteboard) z synchronizacją stanu (Canvas)
  - `[ ]` Wspólny odtwarzacz wideo (Watch Together) z pełną synchronizacją odtwarzania (Play/Pause/Seek)

## Faza 5: Nakładka (Overlay) i System Sklepu
- `[ ]` Tauri Overlay Window
  - `[ ]` Konfiguracja przezroczystego okna nakładki w Rust (ignoring mouse events/click-through)
  - `[ ]` Renderowanie powiadomień i listy mówiących nad grą w czasie rzeczywistym
- `[ ]` Globalne Skróty Klawiszowe (Keybinds)
  - `[ ]` Rejestracja skrótów do wyciszania (Mute/Deafen) i aktywacji Push-to-Talk w Rust
- `[ ]` Sklep i Kosmetyki Profilu
  - `[ ]` Wdrożenie bazy danych sklepu (kupowanie obramowań i motywów)
  - `[ ]` Bezpieczna autoryzacja transakcji za punkty po stronie bazy danych
- `[ ]` System Anty-AFK i detekcja gier
  - `[ ]` Skanowanie procesów w systemie operacyjnym (Rust) w celu wykrywania uruchomionych gier
  - `[ ]` Wyświetlanie nazwy gry jako status (Rich Presence) profilu użytkownika

