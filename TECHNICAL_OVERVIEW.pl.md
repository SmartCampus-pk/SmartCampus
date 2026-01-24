# SmartCampus — Przegląd techniczny

## Spis treści
- Opis projektu
- Stos technologiczny
- Uruchomienie lokalne (FE + BE + DB)
- Wymagane zmienne środowiskowe
- Struktura projektu
- Główne moduły: Events, Organizations, Participation, Notifications, Stats
- Przepływ danych (krótko)
- API (skrót)

## Opis projektu
SmartCampus to aplikacja do zarządzania wydarzeniami kampusowymi. Umożliwia organizacjom studenckim tworzenie wydarzeń, zapisy uczestników, wysyłanie powiadomień oraz analizę statystyk uczestnictwa.

## Stos technologiczny
- Frontend: Next.js 15 (App Router), React 19, TypeScript
- Backend / CMS: Payload CMS 3.x (headless) + Node.js
- Baza danych: MongoDB (Mongoose adapter)
- Testy: Playwright (E2E), Vitest (integracja)
- Opcjonalnie: Docker + docker-compose

## Uruchomienie lokalne
1. Sklonuj repozytorium:

```bash
git clone <repo-url>
cd SmartCampus
```

2. Zainstaluj zależności:

```bash
pnpm install
```

3. Skonfiguruj zmienne środowiskowe:

```bash
cp .env.example .env
# edytuj .env zgodnie z wymaganiami
```

4a. Uruchom lokalnie (bez Dockera):

```bash
pnpm dev
# otwórz http://localhost:3000
```

4b. Uruchom z Dockerem:

```bash
# ustaw DATABASE_URI=mongodb://mongo/smartcampus w .env
docker-compose up -d
```

## Wymagane zmienne środowiskowe
- `DATABASE_URI` — connection string do MongoDB (np. `mongodb://127.0.0.1/smartcampus`)
- `PAYLOAD_SECRET` — sekret JWT (min. 32 znaki)
Opcjonalne:
- `NODE_OPTIONS`, `PORT`

Nie umieszczaj w repo wrażliwych wartości.

## Struktura projektu (skrót)
- `src/app/` — strony Next.js, custom API routes
- `src/collections/` — definicje kolekcji Payload (Users, Events, Organizations, EventParticipations, Notifications, itp.)
- `src/lib/` — utilities (api client, stats, slugify)
- `src/components/` — UI (EventCard, JoinEventButton, EventStatsCard)
- `src/payload.config.ts` — konfiguracja Payload

## Główne moduły
- Events — tworzenie i zarządzanie wydarzeniami (slug, data, status, soft-delete)
- Organizations — organizacje hostujące wydarzenia; role i zarządzanie członkami
- Participation (EventParticipations) — relacja użytkownik↔wydarzenie; pola: `event`, `user`, `status` (`going`/`interested`/`cancelled`), `createdAt`; unikalność pary `(event,user)` realizowana w hooku
- Notifications — powiadomienia dla użytkowników (typy `event_update` i `announcement`); per-user read/unread; endpointy do pobierania i oznaczania
- Stats — usługi obliczające statystyki eventów i organizacji (liczba uczestników, trendy, rejestracje w ostatnich 7 dniach)

## Przepływ danych (skrót)
- FE (Next.js) komunikuje się z BE przez REST (custom endpoints + Payload REST API). Autoryzacja przez JWT w nagłówku `Authorization: Bearer <token>`.
- Serwer używa Payload CMS do operacji CRUD nad kolekcjami oraz do generowania admin panelu.

## Wybrane endpointy (skrót)
- `POST /api/events/:id/join` — dołączenie do wydarzenia (JWT wymagany). Zwraca `participantsCount`.
- `POST /api/events/:id/leave` — wycofanie udziału.
- `GET /api/events/:id/participants` — lista uczestników.
- `GET /api/events/:id/stats` — statystyki eventu.
- `GET /api/notifications/me` — pobierz powiadomienia zalogowanego użytkownika.

## Gdzie są kolekcje Payload
Wszystkie kolekcje znajdują się w katalogu `src/collections/` i są rejestrowane w `src/payload.config.ts`.

## Szybkie polecenia
- Uruchom dev: `pnpm dev`
- Buduj: `pnpm build`
- Testy integracyjne: `pnpm test:int`
- Generuj typy Payload: `pnpm generate:types`

---

Jeśli chcesz, mogę:
- przetłumaczyć również `TECHNICAL_OVERVIEW.md` w całości (jeśli obecna wersja zawiera dodatkowe szczegóły),
- dodać polskie kopie README i USER_GUIDE (jeśli chcesz osobne pliki z sufiksem `.pl.md`),
- albo wstawić sekcję językową w już istniejących plikach.

Które rozwiązanie preferujesz?