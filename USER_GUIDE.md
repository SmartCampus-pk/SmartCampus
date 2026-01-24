# SmartCampus - User Guide 📖

Przewodnik dla organizatorów i administratorów systemu zarządzania wydarzeniami.

## Table of Contents

- [Dla Organizatorów](#dla-organizatorów)
  - [Logowanie](#logowanie)
  - [Dodawanie Wydarzenia](#dodawanie-wydarzenia)
  - [Edytowanie Wydarzenia](#edytowanie-wydarzenia)
  - [Sprawdzanie Uczestników](#sprawdzanie-uczestników)
  - [Dashboard Statystyk](#dashboard-statystyk)
- [Dla Administratorów](#dla-administratorów)
  - [Zarządzanie Użytkownikami](#zarządzanie-użytkownikami)
  - [Zarządzanie Rolami](#zarządzanie-rolami)
  - [Tworzenie Organizacji](#tworzenie-organizacji)
  - [Rozwiązywanie Problemów](#rozwiązywanie-problemów)

---

## Dla Organizatorów

### Logowanie

#### Krok 1: Przejdź do strony logowania
1. Otwórz przeglądarkę i przejdź do: `http://localhost:3000` (lub URL twojej instancji)
2. Kliknij **"Zaloguj się"** w górnym pasku nawigacji

#### Krok 2: Wpisz dane logowania
- **Email**: Twój adres e-mail
- **Hasło**: Twoje hasło

#### Krok 3: Zaloguj się
- Kliknij przycisk **"Zaloguj"**
- Po pomyślnym zalogowaniu zostaniesz przekierowany na stronę główną

#### Alternatywnie: Panel administratora
- Jeśli masz dostęp do panelu admin, przejdź do: `http://localhost:3000/admin`
- Zaloguj się tymi samymi danymi
- Będziesz widzieć wszystkie sekcje zarządzania

---

### Dodawanie Wydarzenia

#### Krok 1: Otwórz sekcję Eventos
1. Zaloguj się do panelu admin (`/admin`)
2. W lewym menu kliknij **"Events"** (lub **"Wydarzenia"**)
3. Zobaczysz listę istniejących wydarzeń

#### Krok 2: Utwórz nowe wydarzenie
1. Kliknij przycisk **"Create"** lub **"Dodaj Wydarzenie"** (zwykle zielony przycisk w prawym górnym rogu)
2. Otworzy się formularz nowego wydarzenia

#### Krok 3: Wypełnij formularz

| Pole | Opis | Obowiązkowe? |
|------|------|------------|
| **Title** | Nazwa wydarzenia (np. "Hackeraton 2026") | ✅ Tak |
| **Description** | Opis, co się będzie działo, dla kogo, itp. | ✅ Tak |
| **Event Date** | Data i godzina rozpoczęcia | ✅ Tak |
| **Location** | Miejsce (budynek, sala, adres) | ❌ Nie |
| **Organization** | Wybierz organizację, która organizuje | ✅ Tak |
| **Status** | `draft` (robocze), `active` (aktywne), `cancelled` (odwołane) | ✅ Tak |
| **Slug** | URL-friendly nazwa (auto-generowana) | ✅ Tak |

#### Krok 4: Zapisz событие
1. Przewiń do dołu formularza
2. Kliknij **"Save"** lub **"Zapisz"**
3. Zobaczysz potwierdzenie: "Event created successfully"

#### Przykład wypełnienia:
```
Title:       "Warsztaty Programowania Python"
Description: "Zapraszamy na warsztaty dla początkujących i zaawansowanych."
Event Date:  "2026-02-15 16:00"
Location:    "Budynek A, Sala 201"
Organization: "Student Coding Club"
Status:      "active"
```

---

### Edytowanie Wydarzenia

#### Krok 1: Znajdź wydarzenie
1. Zaloguj się do panelu admin
2. Przejdź do **Events**
3. Wyszukaj событие w liście (możesz użyć wyszukiwarki)
4. Kliknij na tytuł wydarzenia, aby go otworzyć

#### Krok 2: Edytuj pola
- Kliknij na dowolne pole, aby je zmienić
- Możesz zmienić:
  - Tytuł i opis
  - Datę i godzinę
  - Lokalizację
  - Status (draft → active → cancelled)

#### Krok 3: Zapisz zmiany
1. Kliknij **"Save"** lub **"Zaktualizuj"**
2. Zobaczysz potwierdzenie

#### ⚠️ Ważne:
- **Nie możesz zmienić organizacji** danego wydarzenia po jego utworzeniu
- **Nie możesz usunąć** wydarzenia (tylko je anulować - zmień Status na "cancelled")
- Zmiany są widoczne dla użytkowników od razu

---

### Sprawdzanie Uczestników

#### Metoda 1: W panelu admin

1. Przejdź do **Events** → kliknij na konkretne событие
2. Przewiń do sekcji **"Participants"** lub **"Uczestnicy"**
3. Zobaczysz listę ze statysem uczestników:
   - **Going** - przyjedzie
   - **Interested** - zainteresowany
   - **Cancelled** - wycofał udział

#### Metoda 2: Endpoint API

Jeśli potrzebujesz danych programmatycznie:
```bash
curl -X GET "http://localhost:3000/api/events/[EVENT_ID]/participants" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Odpowiedź:
```json
{
  "docs": [
    {
      "id": "user123",
      "email": "student@campus.edu",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "status": "going"
    },
    ...
  ],
  "totalDocs": 42,
  "limit": 10,
  "page": 1
}
```

#### Informacje dostępne:
- Liczba uczestników: `totalDocs`
- Imię i nazwisko każdego uczestnika
- Email (jeśli vidoczne)
- Status uczestnika

---

### Dashboard Statystyk

#### Krok 1: Otwórz widok statystyk
1. Zaloguj się do panelu admin
2. Przejdź do **Events** → kliknij na konkretne wydarzenie
3. W szczegółach eventu zobaczysz sekcję **"Statistics"** lub **"Statystyki"**

#### Krok 2: Dostępne statystyki

Dla każdego eventu widzisz:
- **Łącznie** (Total) - wszystkie rejestracje
- **Idzie** (Going) - potwierdzeni uczestnicy
- **Zainteresowani** (Interested) - zainteresowani ale niepotwierdeni
- **Uczestniczyło** (Attended) - byli na evencie

#### Krok 3: Dashboard Organizatora
1. Kliknij na swoją organizację w menu admin
2. Widok zawiera:
   - **Moje Eventy** - lista twoich najbliższych događeń
   - **Statystyki** - łączne liczby uczestników
   - **Rejestracje Last 7 Days** - nowe zapisy w ostatnim tygodniu
   - **Trend** - zmiana liczby uczestników w czasie

#### Krok 4: Eksport danych
1. Otwórz listę uczestników konkretnego eventu
2. Zaznacz wszystkich (Ctrl+A)
3. Skopiuj (Ctrl+C)
4. Wklej do Excel/Google Sheets

#### Dostępne metryki:

| Metryka | Opis | Gdzie? |
|---------|------|--------|
| Participants Count | Liczba potwierdzonych uczestników | Listing eventów |
| Going | Status "idzie" | Szczegóły eventu |
| Interested | Status "zainteresowany" | Szczegóły eventu |
| Total | Wszystkie rejestracje | Szczegóły eventu |
| Attendance Rate | % uczestników którzy przyszli | Dashboard organizatora |

#### Wskazówki:
- Odśwież stronę aby zobaczyć aktualne liczby
- Odczekaj 1-2 sekundy po zapisie się uczestnika
- Statystyki dotyczą samo potwierdzonych (Going)

---

### Powiadomienia

#### Krok 1: Dostęp do powiadomień
1. Zaloguj się na konto zwykłego użytkownika (student)
2. Kliknij ikonę dzwonka (🔔) w górnym pasku
3. Zobaczysz listę twoich powiadomień

#### Krok 2: Rodzaje powiadomień
- **Event Update** - zmiana w evencie, na który jesteś zapisany
- **Announcement** - ważne ogłoszenia od organizacji

#### Krok 3: Oznacz jako przeczytane
1. Kliknij na powiadomienie
2. Pojawi się opcja **"Oznacz jako przeczytane"**
3. Powiadomienie zmieni kolor (z niebieskiego na szary)

#### Krok 4: Usuń powiadomienie
1. Kliknij ikona kosza przy powiadomieniu
2. Powiadomienie zostanie usunięte

#### Zarządzanie (dla organizatorów):
- Wysyłaj powiadomienia poprzez panel admin
- Jeśli zmienisz event, uczestnicy dostaną automatyczne powiadomienie
- Możesz napisać własne ogłoszenie w sekcji "Notifications"

---

## Dla Administratorów

### Zarządzanie Użytkownikami

#### Krok 1: Otwórz sekcję Users
1. Zaloguj się do panelu admin
2. W lewym menu kliknij **"Users"** (lub **"Użytkownicy"**)
3. Zobaczysz listę wszystkich użytkowników

#### Krok 2: Przeglądaj użytkowników
- **Search** - wyszukaj po email, imię, nazwisko
- **Filter** - filtruj po roli
- **Sort** - sortuj po dacie rejestracji

#### Krok 3: Edytuj użytkownika
1. Kliknij na email lub wiersz użytkownika
2. Otworzy się formularz edycji
3. Możesz zmienić:
   - Imię i nazwisko
   - **Rolę** (patrz sekcja poniżej)
   - **Organizację** (przypisanie do organizacji)
   - Adres e-mail
   - Hasło (reset)

#### Krok 4: Zapisz zmiany
- Kliknij **"Save"** lub **"Zaktualizuj"**

#### Krok 5: Usuń użytkownika (jeśli potrzeba)
- Kliknij przycisk **"Delete"** lub ikona kosza
- **⚠️ Ta operacja jest nieodwracalna!**
- Potwierdź usunięcie

---

### Zarządzanie Rolami

#### Dostępne role

| Rola | Opis | Uprawnienia |
|------|------|-----------|
| **student** | Zwykły student/użytkownik | Może dołączać do eventów, tworzyć eventy |
| **org-admin** | Administrator organizacji | Zarządza swoją organizacją i jej eventami |
| **staff** | Pracownik systemu | Tworzy organizacje, zarządza użytkownikami |
| **super-admin** | Administrator systemu | Pełny dostęp do wszystkiego |

#### Krok 1: Zmień rolę użytkownika
1. Otwórz sekcję **Users**
2. Kliknij na użytkownika
3. Znajdź pole **"Role"**
4. Kliknij dropdown i wybierz nową rolę:
   - `student`
   - `org-admin`
   - `staff`
   - `super-admin`

#### Krok 2: Przypisz do organizacji
- Jeśli rola = `org-admin`, musisz przypisać **Organization**
- Kliknij pole **"Organization"** i wybierz z listy
- Ten użytkownik będzie zarządzać tylko tą organizacją

#### Krok 3: Zapisz
- Kliknij **"Save"**

#### Przykład:
```
Użytkownik: Alice (alice@campus.edu)
Rola zmieniona z: student → org-admin
Organizacja: "Computer Science Club"
Rezultat: Alice może tworzyć i edytować eventy dla CS Club
```

#### ⚠️ Ważne notatki:
- `super-admin` ma dostęp do wszystkiego - przydzielaj ostrożnie
- `org-admin` widzi tylko swoją organizację
- `staff` może tworzyć nowe organizacje
- `student` ma podstawowy dostęp

### Tworzenie Organizacji

#### Krok 1: Otwórz sekcję Organizations
1. W lewym menu panelu admin kliknij **"Organizations"** (lub **"Organizacje"**)
2. Zobaczysz listę istniejących organizacji

#### Krok 2: Utwórz nową organizację
1. Kliknij przycisk **"Create"** lub **"Dodaj Organizację"**
2. Otworzy się formularz

#### Krok 3: Wypełnij formularz

| Pole | Opis | Obowiązkowe? |
|------|------|------------|
| **Name** | Nazwa organizacji (np. "Koło Naukowe Informatyki") | ✅ Tak |
| **Description** | Opis: cel, członkowie, itp. | ✅ Tak |
| **Type** | `club`, `association`, `department`, `other` | ✅ Tak |
| **Status** | `active` (vidoczna), `pending` (do zatwierdzenia), `inactive` | ✅ Tak |
| **Slug** | URL-friendly nazwa (auto-generowana) | ✅ Tak |

#### Krok 4: Przypisz administratora
- Po utworzeniu organizacji
- Przejdź do **Users**
- Zmień rolę użytkownika na `org-admin`
- Przypisz go do tej organizacji

#### Krok 5: Zapisz
- Kliknij **"Save"**

#### Przykład:
```
Name:        "AI & Machine Learning Society"
Description: "Club for students interested in AI/ML projects"
Type:        "club"
Status:      "active"
```

---

### Edytowanie Organizacji

#### Krok 1: Otwórz organizację
1. Przejdź do **Organizations**
2. Kliknij na nazwę organizacji

#### Krok 2: Edytuj
- Zmień nazwę, opis, typ, status
- Kliknij **"Save"**

#### ⚠️ Uwagi:
- **Nie możesz usunąć** organizacji, którą mają przypisane eventy
- Zmień status na `inactive`, aby ukryć organizację
- Członkowie organizacji muszą mieć przypisaną rolę `org-admin` lub być wskazani w Teams

### Zarządzanie Powiadomieniami (Admin)

#### Krok 1: Otwórz sekcję Notifications
1. Zaloguj się do panelu admin
2. W lewym menu kliknij **"Notifications"** (lub **"Powiadomienia"**)
3. Zobaczysz listę wszystkich powiadomień w systemie

#### Krok 2: Utwórz nowe powiadomienie
1. Kliknij **"Create"** lub **"Dodaj Powiadomienie"**
2. Wypełnij pola:
   - **User** - do kogo ma pójść (wybierz z listy)
   - **Title** - temat powiadomienia
   - **Message** - treść (może być długa)
   - **Type** - `event_update` lub `announcement`
   - **Related Event** - jeśli ma być powiązane z eventem

#### Krok 3: Zapisz
- Kliknij **"Save"**
- Powiadomienie zostanie wysłane do użytkownika
- Pojawi się w jego liście powiadomień

#### Krok 4: Edytuj lub usuń
- Otwórz powiadomienie
- Zmień treść i kliknij **"Save"** lub **"Delete"**

#### ⚠️ Ważne:
- Powiadomienia są tworzone automatycznie gdy zmienisz event
- Możesz tworzyć też ręczne ogłoszenia
- Każdy użytkownik widzi tylko swoje powiadomienia

### Widok Statystyk (Admin)

#### Krok 1: Dostęp do statystyk
1. Zaloguj się jako admin
2. Przejdź do **Events** → wybierz konkretny event
3. W szczegółach eventu zobaczysz sekcję **"Event Stats"**

#### Krok 2: Metryki dostępne

```
┌─────────────────────────────────┐
│    EVENT STATISTICS             │
├─────────────────────────────────┤
│  Łącznie: 42      │  Idzie: 38  │
│  Zainteresowani: 3│  Uczestni: 1│
└─────────────────────────────────┘
```

#### Krok 3: Dashboard Organizatora
- Jako org-admin, przejdź do sekcji **"Dashboard"** 
- Widzisz zagregowane statystyki dla wszystkich swoich eventów
- Możesz analizować trendy i porównywać eventy

#### Wskazówki:
- Odśwież stronę aby zobaczyć aktualne liczby
- Export: skopiuj tabelę uczestników i wklej do Excel
- Archiwizuj stare eventy aby zmniejszyć szum w dashboardzie

---

## Rozwiązywanie Problemów

### Problem: Użytkownik nie widzi swoich eventów

**Przyczyny**:
- Użytkownik ma rolę `student` - nie powinien mieć dostępu do panelu admin
- Event został usunięty lub ma status `draft`
- Event należy do innej organizacji

**Rozwiązanie**:
1. Sprawdź rolę użytkownika: `Users` → kliknij użytkownika → sprawdź **Role**
2. Sprawdź organizację: czy user ma przypisaną `org-admin` do tej organizacji
3. Sprawdź status eventu: czy ma status `active`
4. Jeśli wszystko OK, wyczyść cache przeglądarki (Ctrl+Shift+Delete)

---

### Problem: "Access Denied" dla org-admin

**Przyczyny**:
- Użytkownik nie ma przypisanej organizacji
- Organizacja użytkownika nie zgadza się z organizacją eventu

**Rozwiązanie**:
1. Przejdź do `Users` → kliknij użytkownika
2. Sprawdź pole **Organization** - czy jest wypełnione?
3. Jeśli brak, przypisz organizację:
   - Kliknij **Organization** dropdown
   - Wybierz organizację
   - Kliknij **Save**

---

### Problem: Użytkownik widzi cudze eventy

**Przyczyny**:
- Użytkownik ma rolę `staff` lub `super-admin` (mają dostęp do wszystkiego)
- To prawidłowe zachowanie

**Rozwiązanie**:
- Zmień rolę na `student` jeśli ma mieć ograniczony dostęp
- `staff` i `super-admin` powinni widzieć wszystkie eventy

---

### Problem: Nie mogę zmienić roli użytkownika

**Przyczyny**:
- Brak uprawnień (musisz być `super-admin`)
- Użytkownik ma tego samego `super-admin` (ograniczenie bezpieczeństwa)

**Rozwiązanie**:
1. Zaloguj się na konto `super-admin`
2. Spróbuj ponownie
3. Jeśli dalej nie działa, skontaktuj się z administratorem systemu

---

### Problem: Nie ma przycisku "Create" dla Events

**Przyczyny**:
- Brak uprawnień (role `student` nie może tworzyć)
- Brak organizacji przypisanej (dla `org-admin`)

**Rozwiązanie**:
1. Zmień rolę użytkownika na `staff` lub wyżej
2. Lub przypisz użytkownikowi organizację (jeśli `org-admin`)
3. Odśwież stronę (Ctrl+R lub F5)

---

### Problem: Event nie pokazuje się na stronie głównej

**Przyczyny**:
- Status eventu to `draft` (tylko vidoczny dla admina)
- Event jest przeszły (przeszła data)
- Organizacja ma status `inactive`

**Rozwiązanie**:
1. Zmień status eventu na `active`
2. Sprawdź datę: powinna być w przyszłości
3. Sprawdź organizację: powinna mieć status `active`
4. Kliknij **Save**
5. Odczekaj sekundę i odśwież stronę

---

### Problem: Uczestnik nie może dołączyć do eventu

**Przyczyny**:
- Event jest `cancelled` (anulowany)
- Event nie istnieje (URL błędny)
- Uczestnik nie jest zalogowany

**Rozwiązanie**:
1. Sprawd status eventu: powinien być `active`
2. Sprawdź URL eventu
3. Poproś uczestnika aby się zalogował
4. Spróbuj z innej przeglądarki/urządzenia

---

### Problem: Liczba uczestników się nie aktualizuje

**Przyczyny**:
- Cache przeglądarki
- Event nie został zapisany prawidłowo
- Strona się nie odświeżyła

**Rozwiązanie**:
1. Odśwież stronę: Ctrl+Shift+R (hard refresh)
2. Wyczyść cache: Ctrl+Shift+Delete
3. Zaloguj się ponownie
4. Spróbuj z incognito/private window

---

### Problem: Nie mogę znaleźć użytkownika w panelu Users

**Przyczyny**:
- Użytkownik nie istnieje (jeszcze się nie zarejestrował)
- Używasz złe kryterium wyszukiwania
- Filtr jest ustawiony na inną rolę

**Rozwiązanie**:
1. Wyczyszcz wyszukiwarkę (jeśli coś jest)
2. Wyczyszcz filtry (jeśli są ustawione)
3. Poproś użytkownika aby się zarejestował: `/register`
4. Poczekaj chwilę, odśwież stronę

---

## Szybkie Linki

| Strona | URL | Kto ma dostęp? |
|--------|-----|----------------|
| Strona główna | `/` | Wszyscy |
| Logowanie | `/login` | Wszyscy (niezalogowani) |
| Rejestracja | `/register` | Wszyscy (niezalogowani) |
| Moje konto | `/me` | Zalogowani |
| Panel admin | `/admin` | org-admin, staff, super-admin |
| Eventy (admin) | `/admin/events` | staff, super-admin |
| Użytkownicy (admin) | `/admin/users` | super-admin |
| Organizacje (admin) | `/admin/organizations` | staff, super-admin |

---

## Tips & Tricks

### Tip 1: Szybkie edytowanie
- Kliknij na dowolne pole w liście (jeśli jest edytowalne)
- Zmień wartość
- Kliknij Enter lub poza pole
- Zmiana zostanie zapisana automatycznie

### Tip 2: Export danych
- Otwórz listę (Users, Events, Organizations)
- Kliknij prawy przycisk myszy na kolumnę
- Wybierz "Copy all"
- Wklej do Excel: Ctrl+V

### Tip 3: Wyszukiwanie zaawansowane
- Użyj nawiasów: `"Jan Kowalski"`
- Użyj symboli: `student@*` (wildcard)
- Wiele kryteriów: `Jan OR Jan`

### Tip 4: Bulk operations
- Zaznacz wiele wierszy (Ctrl+Click)
- Kliknij akcję (np. "Change Role")
- Stosuje się do wszystkich zaznaczonych

### Tip 5: Resetowanie hasła
- Jeśli użytkownik zapomni hasła
- Na stronie logowania: kliknij "Zapomniałem hasła"
- Lub jako admin: `Users` → kliknij użytkownika → zmień Password pole

---

## Kontakt i Pomoc

- **Błędy/Bugs**: Zgłoś na GitHub Issues
- **Pytania**: Skontaktuj się z zespołem dev
- **Feature Requests**: Dodaj do backlogu

---

**Wersja**: 1.0  
**Ostatnia aktualizacja**: Styczeń 2026  
**Kompatybilność**: SmartCampus v1.0+
