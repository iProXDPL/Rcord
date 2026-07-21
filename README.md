# Rcord - Klon Discorda o bogatej funkcjonalności

Projekt **Rcord** to nowoczesny, wydajny i multiplatformowy klon komunikatora Discord z zaawansowanymi funkcjami społecznościowymi, redukcją szumów, systemem nakładki (overlay), wbudowanym centrum minigier z punktami, sklepem ze skórkami i animowanymi profilami oraz systemem botów.

## 🚀 Architektura i Technologie

Aplikacja opiera się na nowoczesnym i bezpiecznym stosie technologicznym:

1. **Frontend**: [SolidJS](https://solidjs.com/) z TypeScript + customowy, wysoce responsywny system stylizacji w Vanilla CSS w celu uzyskania maksymalnej płynności animacji (60 FPS) na urządzeniach stacjonarnych i mobilnych.
2. **Desktop & Mobile Client Core**: [Tauri v2](https://v2.tauri.app/) (napędzany językiem **Rust**).
   - Rust obsługuje system nakładki systemowej, obsługę skrótów klawiszowych, automatyczną redukcję szumów oraz integrację z systemem operacyjnym.
   - Tauri v2 pozwala na natywne kompilowanie aplikacji na systemy: **Windows**, **Linux** oraz **Android** (telefon/tablet).
3. **Backend & Baza Danych**: [Supabase](https://supabase.com/).
   - PostgreSQL do zarządzania relacjami (sklep, zakupy skórek, ekwipunek, punkty użytkowników).
   - Row-Level Security (RLS) dla bezpieczeństwa kanałów i wiadomości.
   - Realtime (WebSockets) do komunikacji w czasie rzeczywistym.
   - Supabase Storage na awatary i media.
   - Supabase Edge Functions na webhooki oraz automatyczną logikę botów.
4. **Głos & Wideo**: WebRTC zintegrowane za pomocą platformy **LiveKit** (obsługa pokojów rozmów, kamer internetowych i udostępniania ekranu).
5. **Redukcja szumów**: **RNNoise** zintegrowany bezpośrednio w kodzie Rust w Tauri.

---

## 📂 Struktura Projektu

- `/src` - Kod źródłowy frontendu (SolidJS, ekrany czatu, sklep, profil, gry).
- `/src-tauri` - Kod źródłowy backendu klienta w języku Rust (integracja z systemem, RNNoise, okna nakładki).
- `/src-tauri/capabilities` - Pliki konfigurujące uprawnienia bezpieczeństwa Tauri v2.

---

## 🛠️ Wymagania i Uruchomienie

### Wymagania wstępne

Aby zbudować i uruchomić projekt lokalnie, potrzebujesz zainstalowanych:
- [Node.js](https://nodejs.org/) (zalecana wersja LTS)
- [Rust & Cargo](https://www.rust-lang.org/)
- Zależności Tauri dla Twojego systemu operacyjnego (zobacz [Przewodnik Tauri](https://v2.tauri.app/start/prerequisites/))
- SDK systemu Android (jeśli chcesz budować na systemy mobilne Android)

### Instrukcja uruchomienia

1. Zainstaluj zależności NPM:
   ```bash
   npm install
   ```

2. Uruchom wersję deweloperską na desktop (Windows/Linux):
   ```bash
   npm run tauri dev
   ```

3. Zainicjalizuj i uruchom wersję deweloperską na emulatorze/urządzeniu Android:
   ```bash
   npm run tauri android init
   npm run tauri android dev
   ```

---

## 🌟 Główne Funkcjonalności (Faza Rozwoju)

- **Czat tekstowy & Kanały głosowe**: Kanały stałe oraz tymczasowe (automatycznie usuwane po wyjściu wszystkich).
- **Przesyłanie wideo**: Kamerki oraz udostępnianie ekranu (desktop).
- **Redukcja Szumów (Noise Suppression)**: Inteligentne filtrowanie szumów tła mikrofonu.
- **System Nakładki (Overlay)**: Półprzezroczyste okno wyświetlane nad grami.
- **Centrum Gier & Sklep**: Możliwość grania w mini-gry, zdobywania punktów oraz kupowania kosmetyków (np. animowanych ramek awatarów).
- **Boty & Webhooki**: Przychodzące webhooki dla zewnętrznych integracji oraz zaawansowane skrypty botów.
