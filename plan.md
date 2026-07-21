# Plan Wdrożenia Projektu Rcord (Klon Discorda z grami, botami i nakładką)

Ten dokument zawiera plan architektury, wdrożenia oraz rozwoju aplikacji **Rcord** – cross-platformowego komunikatora (Windows, Linux, Android) z zaawansowanymi funkcjami głosowymi, redukcją szumów, systemem nakładki, wbudowanymi grami, sklepem i botami.

---

## 🛠️ Stos Technologiczny (Zaktualizowany)

Zgodnie z wymaganiami, aplikacja będzie korzystać z następujących technologii:

### 1. Klient (Desktop & Mobile)
- **Tauri v2**: Wykorzystanie **Rust** do logiki systemowej (zarządzanie oknami, nakładka, przetwarzanie audio, redukcja szumów, globalne skróty klawiszowe) oraz mobilnego portu na Androida.
- **React + Tailwind CSS (shadcn/ui)**: Interfejs użytkownika zbudowany w React z użyciem Tailwind CSS oraz **shadcn/ui** jako zestawu gotowych, profesjonalnych komponentów (mimo wyższego narzutu na telefonach, bogaty ekosystem shadcn/ui znacząco przyspieszy budowanie interfejsu).
- **Zustand**: Lekki i wydajny system zarządzania stanem w React (idealny do komunikacji w czasie rzeczywistym i synchronizacji okien nakładki).
- **Bun**: Menedżer pakietów i środowisko uruchomieniowe (zamiast Node.js) dla szybszego instalowania zależności i budowania frontendu.

### 2. Backend & Baza Danych (Lokalnie)
- **Supabase Local (CLI)**: Lokalne środowisko Supabase uruchamiane w kontenerach Docker.
  > [!NOTE]
  > **Docker został pomyślnie zainstalowany na systemie!** Będziemy mogli w pełni korzystać z Supabase Local przy użyciu kontenerów lokalnych.
  - **PostgreSQL**: Relacyjna baza danych obsługująca transakcje zakupu skórek, tabele użytkowników, punkty i uprawnienia.
  - **Realtime**: Komunikacja przez WebSockets do przesyłania wiadomości w czasie rzeczywistym i aktualizacji statusów.
  - **Supabase Storage**: Lokalne przechowywanie plików (awatary użytkowników, grafiki skórek, załączniki).
  - **Edge Functions (Deno/Bun)**: Logika biznesowa, obsługa webhooków i komend botów.

### 3. Komunikacja Głosowa & Wideo
- **WebRTC (LiveKit)**: Do przesyłania wideo, dźwięku z mikrofonu oraz udostępniania ekranu. LiveKit oferuje stabilne SDK dla React i Rust.
- **Adaptacyjny streaming wideo (Simulcast)**: Integracja z LiveKit obsługuje Simulcast – nadawca wysyła trzy wersje jakościowe strumienia (Low, Medium, High). Serwer LiveKit dynamicznie decyduje, którą wersję wysłać do danego odbiorcy na podstawie jego łącza oraz rozmiaru okna wideo na ekranie (np. smartfony odbierają wersję o niskim bitrate, oszczędzając baterię i transfer).
- **Przetwarzanie audio i redukcja szumów (RNNoise, AEC, AGC)**:
  - Zintegrowany filtr WASM RNNoise w AudioWorklet wewnątrz Webview (React), co gwarantuje spójne, ultra-lekkie działanie bez szumów tła na Windowsie, Linuksie i Androidzie. Użytkownik może go włączyć/wyłączyć jednym przyciskiem w ustawieniach.
  - Wykorzystamy wbudowane w przeglądarkowy standard WebRTC filtry **AEC (Acoustic Echo Cancellation - kasowanie echa)** oraz **AGC (Automatic Gain Control - automatyczna kontrola głośności)**, które będą aktywne domyślnie, aby zapobiec powstawaniu sprzężeń i echa (szczególnie u osób korzystających z głośników zamiast słuchawek).
- **Metody Aktywacji Mikrofonu**:
  - **Aktywacja Głosowa (VAD - Voice Activity Detection)**: Automatyczne nadawanie po przekroczeniu progu decybeli.
  - **Naciśnij i Mów (PTT - Push-to-Talk)**: Nadawanie po wciśnięciu klawisza. Na desktopie Tauri rejestruje globalny skrót klawiszowy w Rust (używając `@tauri-apps/plugin-global-shortcut`), dzięki czemu klawisz działa podczas grania w gry w tle.

---

## 📂 Struktura Folderów Projektu

Projekt jest podzielony na czyste podkatalogi rozdzielające poszczególne warstwy aplikacji:

```text
/Rcord (Katalog Główny)
├── /frontend               # Aplikacja React + TypeScript + Tailwind CSS (Vite)
│   ├── /src                # Kod interfejsu (komponenty shadcn, Zustand, ekrany)
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── /backend                # Kod natywny Tauri v2 w języku Rust (Rust Core)
│   ├── /src                # Kod Rust (lib.rs, main.rs, global hotkeys, audio)
│   ├── Cargo.toml
│   └── tauri.conf.json     # Konfiguracja Tauri (powiązana z katalogiem frontend)
├── /database               # Konfiguracja lokalnej bazy danych Supabase (Docker)
│   ├── config.toml
│   └── /migrations         # Skrypty migracji PostgreSQL (initial_schema.sql)
├── /bot-example            # Szablon przykładowego bota w Node.js/TypeScript
├── docker-compose.yml      # Kontenery deweloperskie (LiveKit SFU)
├── livekit.yaml            # Konfiguracja LiveKit
├── LICENSE                 # Licencja MIT
├── plan.md                 # Plan projektu i architektura (ten plik)
└── README.md               # Dokumentacja techniczna dla deweloperów
```

---

## 🏗️ Architektura Systemu

```mermaid
graph TD
    A[Klient Tauri v2 - Rust] -->|Webview UI| B[React + Tailwind + shadcn/ui]
    A -->|Native Audio Input| C[RNNoise Filter w Rust]
    C -->|Czyste Audio| D[LiveKit WebRTC SDK]
    A -->|Overlay & Hotkeys| E[Native Desktop OS APIs]
    
    SubGraph Supabase Local - Docker
        B -->|Queries & Auth| F[Supabase Client]
        F --> G[PostgreSQL DB]
        F --> H[Storage & Realtime]
        I[Edge Functions] -->|Webhook Triggers| G
    End
```

---

## 🎯 Podjęte Decyzje Projektowe

### 1. Centrum Gier i naliczanie punktów
- Wdrożymy **oba rozwiązania**:
  - **Gry wbudowane (React/HTML5)**:
    - **Saper (Minesweeper)** i **Snake**: Gry jednoosobowe, naliczanie punktów za ukończone gry / długość węża (zabezpieczenie przed botami na punkty).
    - **Szachy (Chess)**: Gra wieloosobowa PvP online. Gracz może wysłać na wybranym kanale czatu kartę wyzwania ("Chcę zagrać w szachy!"). Dowolny inny użytkownik na kanale klika "Dołącz", co inicjuje mecz PvP synchronizowany w czasie rzeczywistym przez Supabase Realtime (z zegarami gry).
    - Punkty są przyznawane za wygraną (więcej) i przegraną (mniej).
  - **Wykrywanie gier w tle**: Aplikacja Tauri na desktopie będzie monitorować aktywne procesy gier i naliczać punkty za sam czas spędzony w grze.

### 2. System Tworzenia Botów
- Wdrożymy **klasyczne API i połączenie WebSocket** (Opcja B). System będzie generował tokeny botów. Zewnętrzne boty będą mogły łączyć się z naszym serwerem WebSocket i wysyłać komendy przez REST API.
- **Przykładowy Bot w Repozytorium**: W folderze `/bot-example` dołączymy gotowy, w pełni funkcjonalny szablon bota napisanego w Node.js/TypeScript. Będzie on pokazywał:
  - Autoryzację tokenem.
  - Odbieranie zdarzeń przez WebSocket (`MESSAGE_CREATE`).
  - Wysyłanie odpowiedzi przez REST API i obsługę komend (np. Slash Commands).
  - **Logikę Bota Muzycznego**: Pokazanie, jak bot dołącza do pokoju głosowego jako wirtualny uczestnik przy użyciu **LiveKit SDK** i streamuje dźwięk (np. plik audio lub pobierany z YouTube) bezpośrednio jako ścieżkę audio (mikrofon) do pokoju głosowego. Użytkownicy sterują nim za pomocą komend czatu (np. `/play`, `/skip`).

### 3. System Webhooków
- **Webhooki Przychodzące (Incoming Webhooks)**: Umożliwiają zewnętrznym aplikacjom (np. GitHub, GitLab, Jira) wysyłanie wiadomości oraz kart embedów do określonych kanałów tekstowych w Rcord przy użyciu prostego żądania HTTP POST z ciałem JSON (obsługiwane przez Supabase Edge Functions).
- **Webhooki Wychodzące (Outgoing Webhooks)**: Pozwalają subskrybować zdarzenia serwera i wysyłać powiadomienia (HTTP POST z ładunkiem JSON) na zewnętrzne adresy URL. Wspieramy standardowy zestaw zdarzeń wyzwalających:
  - `message_created`: przy wysłaniu nowej wiadomości na określonym kanale.
  - `member_joined`: przy dołączeniu nowego członka do serwera.
  - `member_left`: przy opuszczeniu serwera przez członka.


### 4. Nakładka (Overlay) i wersja Mobilna
- **Nakładka (Overlay)** będzie działać **tylko na komputerach stacjonarnych (Windows, Linux)**.
- Na **Androidzie** oraz w głównym oknie desktopowym skupiamy się na standardowym, dopracowanym interfejsie czatu.
- **Funkcje Okna Czatu**:
  - **Pełne wsparcie dla Markdown (MD)**: renderowanie pogrubień, kursywy, list, cytatów oraz bloków kodu z kolorowaniem składni (np. dla języków programowania).
  - **Automatyczne Embedy (Rich Embeds)**:
    - **YouTube**: Automatyczne renderowanie odtwarzacza wideo (iframe) pod wiadomością zawierającą link.
    - **Twitter/X**: Podgląd tweetów i mediów.
    - **Obrazy i Gify**: Bezpośrednie wyświetlanie obrazków (png, jpg, webp, gif) przesłanych jako linki.
    - **Inne linki (OpenGraph)**: Natywny kod Rust w Tauri pobiera metadane strony (tytuł, opis, miniatura), omijając zabezpieczenia CORS w przeglądarce, i przesyła je do frontendu React w celu wyświetlenia ramki podglądu.
  - **Przesyłanie plików i programów (załączniki)**: 
    - Pliki (dokumenty, archiwum `.zip`, instalatory `.exe`/`.deb` itp.) o rozmiarze do **50 MB** są przesyłane bezpośrednio do **Supabase Storage** (bucket `attachments`).
    - Na czacie wyświetla się elegancka karta załącznika pokazująca nazwę pliku, rozmiar, ikonę rozszerzenia oraz przycisk do pobrania. Obrazy i pliki wideo mają automatyczny podgląd (preview) wewnątrz czatu.
  - **Wyszukiwarka wiadomości z filtrami**:
    - Wyszukiwanie pełnotekstowe (Full Text Search) zintegrowane w bazie PostgreSQL (za pomocą kolumny `fts_search_vector` i szybkiego indeksu GIN), co pozwala na błyskawiczne przeszukiwanie historii czatu.
    - Obsługa filtrów wyszukiwania (np. `has:link` dla wiadomości zawierających linki URL, `has:image` dla wiadomości z obrazami, oraz `has:file` dla wiadomości z plikami załączników).

### 5. Tymczasowe Kanały i Uprawnienia
- System uprawnień na serwerach będzie kontrolować tworzenie kanałów.
- **Automatyczne kanały tymczasowe (Auto-cleanup)**: Użytkownicy z uprawnieniami mogą tworzyć kanały tymczasowe (`is_temporary = true`). Ich cykl życia jest w pełni zautomatyzowany po stronie bazy danych:
  - Gdy użytkownik dołącza do kanału głosowego, jego stan jest zapisywany w tabeli `voice_states`.
  - Gdy ostatni użytkownik opuści kanał (liczba rekordów w `voice_states` dla tego `channel_id` spadnie do 0), trigger PostgreSQL (`on_voice_state_left`) automatycznie usunie ten kanał z tabeli `channels`, odciążając klienty.

### 6. Backend i Docker
- **Docker jest zainstalowany i skonfigurowany.**
- Wykorzystamy oficjalny **Supabase CLI** do lokalnego uruchomienia bazy w Dockerze.
- Dodatkowo, w folderze głównym projektu stworzymy `docker-compose.yml` do uruchomienia lokalnego serwera **LiveKit SFU** na porcie `7800` (z kluczem/sekretem deweloperskim), co ułatwi lokalne testowanie rozmów wideo i audio bez zależności od chmury.

---

## 🗄️ Projekt Bazy Danych (Szkic Schematu)

## 🎯 Podjęte Decyzje Projektowe (Runda 2)

### 1. Rejestracja i logowanie (Auth)
- Skonfigurujemy standardowe logowanie Email + Hasło oraz przygotujemy integrację z dostawcami OAuth w Supabase:
  - **Google Auth**
  - **Twitch Auth**
  - **Discord Auth**
- **Generator Nazw z Tagiem (`name#1234`)**: Przy rejestracji system automatycznie przydziela 4-cyfrowy unikalny identyfikator (tag) oddzielony znakiem `#` (np. `ipro#9482`). Pozwala to na powtarzanie się samych nazw użytkowników, zachowując unikalność w bazie, dokładnie tak jak na Discordzie.
- **Możliwość Zmiany Tagu**: Użytkownik może ręcznie zmienić swój tag na własny (np. literowy `#PSK` lub `#GAME`), pod warunkiem, że kombinacja `nowa_nazwa#nowy_tag` jest wolna w bazie. Tag musi być alfanumeryczny i mieć długość **od 2 do 5 znaków**.

### 2. Centrum Gier (Gry wbudowane)
Na start wdrożymy trzy gry wbudowane (React + Tailwind):
- **Saper (Minesweeper)**
- **Szachy (Chess)**
- **Snake**
Punkty będą naliczane za wyniki (zwycięstwo daje więcej punktów, przegrana mniej).

### 3. Gry w tle (System Anty-AFK, Skanowanie i Status aktywności)
Tauri w Rust będzie monitorować uruchomione procesy gier na podstawie **statycznej, wbudowanej listy najpopularniejszych gier** (np. Minecraft, Counter-Strike 2, League of Legends, GTA V, Fortnite, Valorant, Cyberpunk 2077).
- **Skanowanie launcherów (Steam/Epic Games)**: Przy uruchomieniu aplikacji Tauri skanuje systemowe ścieżki bibliotek (np. pliki manifestu `.acf` Steama oraz Epic Games) w celu automatycznego wykrycia, które z popularnych gier są zainstalowane na komputerze użytkownika.
- **Konfiguracja i prywatność w ustawieniach**: Wykryte gry zostaną wyświetlone w specjalnej sekcji ustawień gier, gdzie użytkownik może włączyć/wyłączyć wykrywanie poszczególnych gier oraz zdecydować o udostępnianiu statusu.
- **Status aktywności (Rich Presence)**: Kiedy gra z listy jest uruchomiona i aktywna, jej status (np. „Gra w Path of Exile od 45 min”) jest przesyłany w czasie rzeczywistym przez Supabase Realtime do członków serwera i znajomych (wyświetlany na liście użytkowników i w oknie profilu).
- **Zabezpieczenie anty-AFK**: Punkty są naliczane wyłącznie wtedy, gdy gra jest oknem **aktywnym (w focusie)**, a użytkownik wykazuje aktywność systemową (brak bezczynności).

### 4. Estetyka, Motywy i Sklep
- **Na start**: Czysty **Jasny (Light)** oraz **Ciemny (Dark)** motyw z dwoma akcentami kolorystycznymi do wyboru przez użytkownika.
- **Dodatki w sklepie (np. Cyberpunk)**: Specjalne, animowane motywy (np. neonowy styl Cyberpunk z customową czcionką) oraz animowane obramowania profilu kupowane za punkty w sklepie.
- **Tester Mikrofonu w Ustawieniach**: W sekcji ustawień dźwięku zaimplementujemy wizualny wskaźnik poziomu głośności (input volume meter). Użytkownik będzie mógł przetestować i zobaczyć w czasie rzeczywistym poziom dźwięku z mikrofonu przed i po przefiltrowaniu szumów przez filtr WASM RNNoise.

### 5. Struktura Serwerów, Kanałów i Relacji
Serwery (gildie) i kontakty będą posiadały:
- **Kanały i Kategorie (Grupy kanałów)** na serwerach.
- **Rozmowy Prywatne (DMs)** oraz **Grupowe Rozmowy Prywatne (Group DMs)**: Komunikacja poza serwerami, zintegrowana w tych samych tabelach wiadomości dzięki relacji z `channel_members` (kiedy `server_id` jest puste).
- **Lista Znajomych (Friends List)** i system relacji: wysyłanie zaproszeń do znajomych przy użyciu pełnego tagu (np. `friend#1122`), statusy: znajomi, zablokowani, oczekujące.
- **Zaawansowane Uprawnienia i Role**: Użytkownicy mogą posiadać wiele ról (np. Administrator, Moderator, Gracz), z których każda ma określony zestaw uprawnień. Kategorie kanałów mogą nadpisywać uprawnienia ról (overrides).
- **Widoczność i blokada pisania w kanałach (Read-Only)**:
  - Kanały mogą być prywatne (wyświetlane tylko dla określonych ról posiadających uprawnienie `view_channel` w danej kategorii).
  - Kanały mogą być tylko do odczytu (blokada pisania dla standardowych użytkowników poprzez wyłączenie uprawnienia `send_messages` dla danej roli, przy zachowaniu uprawnień dla Administratorów/Moderatorów – idealne pod kanały typu `#regulamin`, `#ogloszenia`).
- **Zaproszenia (Invite Links)**: Generowanie unikalnych linków do dołączania do serwerów. Oprócz tradycyjnego wklejania kodu w oknie dialogowym, Tauri zarejestruje systemowy protokół `rcord://` (np. `rcord://join/kod`). Kliknięcie takiego linku na stronie internetowej automatycznie uruchomi aplikację Rcord i dołączy gracza do serwera.
- **Wyszukiwarkę serwerów publicznych**: Serwery oznaczone jako `is_public` będą widoczne dla wszystkich użytkowników w sekcji odkrywania.

### 6. Licencja
- Projekt będzie wydany na licencji **MIT** lub **Apache 2.0** (otwarte oprogramowanie dla ludzi).

---

## 🗄️ Projekt Bazy Danych (Szczegółowy Schemat)

W Supabase PostgreSQL utworzymy następujące tabele (pliki migracji w folderze `supabase/migrations`):

1. **profiles**:
   - `id` (UUID, Primary Key, references auth.users)
   - `username` (text, unique)
   - `avatar_url` (text)
   - `points` (int, default 0)
   - `current_theme` (text, default 'dark')
   - `current_accent` (text, default 'purple')
   - `current_border_url` (text)
   - `created_at` (timestamp)

2. **servers**:
   - `id` (UUID, Primary Key, default gen_random_uuid())
   - `name` (text)
   - `owner_id` (UUID, references profiles(id))
   - `icon_url` (text)
   - `is_public` (boolean, default false)
   - `created_at` (timestamp)

3. **server_members**:
   - `server_id` (UUID, references servers(id) on delete cascade)
   - `user_id` (UUID, references profiles(id) on delete cascade)
   - `role` (text, default 'member') # np. 'owner', 'admin', 'member'
   - `joined_at` (timestamp)
   - *Primary Key: (server_id, user_id)*

4. **channel_categories**:
   - `id` (UUID, Primary Key, default gen_random_uuid())
   - `server_id` (UUID, references servers(id) on delete cascade)
   - `name` (text)
   - `position` (int, order)

5. **channels**:
   - `id` (UUID, Primary Key, default gen_random_uuid())
   - `server_id` (UUID, references servers(id) on delete cascade)
   - `category_id` (UUID, references channel_categories(id) on delete set null)
   - `name` (text)
   - `type` (text: 'text' lub 'voice')
   - `is_temporary` (boolean, default false)
   - `created_by` (UUID, references profiles(id))
   - `position` (int)

6. **server_invites**:
   - `code` (text, Primary Key) # np. 'aX8d3F'
   - `server_id` (UUID, references servers(id) on delete cascade)
   - `created_by` (UUID, references profiles(id))
   - `max_uses` (int)
   - `uses` (int, default 0)
   - `expires_at` (timestamp)
   - `created_at` (timestamp)

7. **messages**:
   - `id` (UUID, Primary Key, default gen_random_uuid())
   - `channel_id` (UUID, references channels(id) on delete cascade)
   - `user_id` (UUID, references profiles(id))
   - `content` (text)
   - `embeds` (jsonb)
   - `created_at` (timestamp)

8. **shop_items**:
   - `id` (UUID, Primary Key, default gen_random_uuid())
   - `name` (text)
   - `type` (text: 'border' lub 'theme' lub 'game_skin')
   - `price` (int)
   - `asset_url` (text)
   - `details` (jsonb) # np. kolory, czcionki dla motywu

9. **user_inventory**:
   - `user_id` (UUID, references profiles(id) on delete cascade)
   - `item_id` (UUID, references shop_items(id) on delete cascade)
   - `purchased_at` (timestamp)
   - *Primary Key: (user_id, item_id)*

10. **bot_tokens**:
    - `id` (UUID, Primary Key, default gen_random_uuid())
    - `name` (text)
    - `owner_id` (UUID, references profiles(id) on delete cascade)
    - `token_hash` (text, unique)
    - `created_at` (timestamp)

11. **chess_matches**:
    - `id` (UUID, Primary Key)
    - `player_white` (UUID, references profiles(id))
    - `player_black` (UUID, references profiles(id))
    - `board_state` (text, FEN representation)
    - `current_turn` (text: 'white'/'black')
    - `status` (text: 'active'/'white_win'/'black_win'/'draw')
    - `created_at` (timestamp)

12. **Procedury i Funkcje (PostgreSQL Stored Procedures)**:
    - **`buy_shop_item(user_id, item_id)`**: Bezpieczna funkcja wykonywana wewnątrz transakcji bazodanowej SQL. Sprawdza stan punktów użytkownika, pobiera cenę przedmiotu ze `shop_items`, sprawdza czy użytkownik ma wystarczającą ilość punktów, a następnie odejmuje punkty z tabeli `profiles` i wstawia rekord zakupu do `user_inventory`. Zapobiega oszustwom i double-spending.

---

## 📅 Plan Działań (Fazy)

### Faza 1: Konfiguracja Środowiska Lokalnego i Git/GitHub
1. Inicjalizacja git i podpięcie pod GitHub za pomocą `gh repo create Rcord --public --source=. --remote=origin` (wraz z licencją MIT).
2. Konfiguracja struktury projektu Tauri v2 za pomocą `Bun` (React + TypeScript + Tailwind CSS + shadcn/ui).
3. Inicjalizacja lokalnego Supabase (`supabase init` oraz uruchomienie przez `supabase start` w Dockerze).

### Faza 2: Podstawa Bazy Danych i Autoryzacji
1. Utworzenie tabel w PostgreSQL (skrypt migracji).
2. Konfiguracja Supabase Auth (rejestracja, logowanie email oraz makieta pod OAuth).
3. Implementacja Supabase Realtime do wiadomości.

### Faza 3: Kanały Głosowe, Wideo i Filtrowanie Szumów
1. Integracja LiveKit SDK.
2. Filtrowanie szumów RNNoise w Rust (Tauri).
3. Udostępnianie ekranu i wideo w React.

### Faza 4: Nakładka (Overlay) i System Sklepu
1. Przezroczyste okno nakładki dla Windows/Linux w Tauri (click-through).
2. Globalne skróty klawiszowe w Rust.
3. System sklepu (motywy jasny/ciemny, motyw cyberpunk, animowane ramki profili).

### Faza 5: Boty, Webhooki i Centrum Gier (Saper, Szachy, Snake)
1. Webhooki przychodzące i wychodzące w Supabase Edge Functions.
2. System połączeń botów (WebSockets).
3. Implementacja minigier w React (z przyznawaniem punktów za wygrane/przegrane).
4. Monitorowanie procesów w Rust (z wykrywaniem focusu okna gry w tle w celu naliczania punktów bez AFK).

---

## 📈 Weryfikacja i Testy

- **Testy multiplatformowe**: Uruchamianie wersji deweloperskiej na systemach Windows/Linux oraz na emulatorze Androida.
