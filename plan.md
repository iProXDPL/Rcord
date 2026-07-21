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
- **RNNoise (Rust)**: Sieć neuronowa zintegrowana w kodzie Rust (Tauri backend) do usuwania szumów tła z mikrofonu w czasie rzeczywistym.

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
  - **Gry wbudowane (React/HTML5)**: Punkty będą przyznawane za wygraną (więcej punktów) i przegraną (mniej punktów).
  - **Wykrywanie gier w tle**: Aplikacja Tauri na desktopie będzie monitorować aktywne procesy gier i naliczać punkty za sam czas spędzony w grze.

### 2. System Tworzenia Botów
- Wdrożymy **klasyczne API i połączenie WebSocket** (Opcja B). System będzie generował tokeny botów. Zewnętrzne boty będą mogły łączyć się z naszym serwerem WebSocket i wysyłać komendy przez REST API.

### 3. Nakładka (Overlay) i wersja Mobilna
- **Nakładka (Overlay)** będzie działać **tylko na komputerach stacjonarnych (Windows, Linux)**.
- Na **Androidzie** skupiamy się wyłącznie na standardowym interfejsie czatu, kanałach tekstowych, rozmowach głosowych i wideo.

### 4. Tymczasowe Kanały i Uprawnienia
- System uprawnień na serwerach będzie kontrolować tworzenie kanałów.
- Użytkownicy ze specjalnymi uprawnieniami w danej grupie kanałów będą mieli możliwość tworzenia kanałów tymczasowych (które automatycznie znikają, gdy wszyscy je opuszczą).

### 5. Backend i Docker
- **Docker jest zainstalowany i skonfigurowany.** Wykorzystamy oficjalny **Supabase CLI** do lokalnego uruchomienia bazy w Dockerze, co uprości migracje i testy offline.

---

## 🗄️ Projekt Bazy Danych (Szkic Schematu)

## 🎯 Podjęte Decyzje Projektowe (Runda 2)

### 1. Rejestracja i logowanie (Auth)
- Skonfigurujemy standardowe logowanie Email + Hasło oraz przygotujemy integrację z dostawcami OAuth w Supabase:
  - **Google Auth**
  - **Twitch Auth**
  - **Discord Auth**

### 2. Centrum Gier (Gry wbudowane)
Na start wdrożymy trzy gry wbudowane (React + Tailwind):
- **Saper (Minesweeper)**
- **Szachy (Chess)**
- **Snake**
Punkty będą naliczane za wyniki (zwycięstwo daje więcej punktów, przegrana mniej).

### 3. Gry w tle (System Anty-AFK)
Tauri w Rust będzie monitorować uruchomione procesy popularnych gier, ale z zabezpieczeniem przed zdobywaniem punktów za AFK/menu:
- Będziemy sprawdzać, czy okno gry jest oknem **aktywnym (w focusie)**.
- Będziemy mierzyć aktywność użytkownika (ruch myszką/klawiatura w grze, o ile system na to pozwoli bez uprawnień roota, lub po prostu aktywność okna i brak bezczynności).

### 4. Estetyka, Motywy i Sklep
- **Na start**: Czysty **Jasny (Light)** oraz **Ciemny (Dark)** motyw z dwoma akcentami kolorystycznymi do wyboru przez użytkownika.
- **Dodatki w sklepie (np. Cyberpunk)**: Specjalne, animowane motywy (np. neonowy styl Cyberpunk z customową czcionką) oraz animowane obramowania profilu kupowane za punkty w sklepie.

### 5. Struktura Serwerów i Kanałów
Serwery (gildie) będą posiadały:
- **Kanały i Kategorie (Grupy kanałów)**.
- **Uprawnienia i Role** dla użytkowników.
- **Zaproszenia (Invite Links)**: Generowanie unikalnych linków do dołączania.
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
