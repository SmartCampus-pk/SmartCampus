# SmartCampus - Entity Relationship Diagram (ERD)

## Overview
Ten dokument opisuje schemat bazy danych aplikacji SmartCampus oraz relacje między kluczowymi bytami.

## Entities (Byty)

### 1. **Users** (Użytkownicy)
Główna kolekcja użytkowników systemu z funkcją uwierzytelniania.

**Kluczowe pola:**
- `email` - unikalne, używane do logowania
- `firstName`, `lastName` - dane personalne
- `role` - rola w systemie (student, org-admin, staff, super-admin)
- `organization` - **relacja N:1 do Organizations**
- `studentId` - numer indeksu (unikalne, indeksowane)
- `faculty`, `fieldOfStudy`, `yearOfStudy` - dane akademickie
- `interests` - zainteresowania użytkownika
- `isActive` - status konta

**Indeksy:**
- `role` - filtrowanie po rolach
- `organization` - szybkie wyszukiwanie użytkowników organizacji
- `studentId` - wyszukiwanie po numerze indeksu
- `isActive` - filtrowanie aktywnych użytkowników

---

### 2. **Organizations** (Organizacje)
Kolekcja organizacji studenckich, kół naukowych, wydziałów itp.

**Kluczowe pola:**
- `name` - nazwa organizacji
- `slug` - URL-friendly identyfikator (unikalne, indeksowane)
- `type` - typ organizacji (scientific-circle, student-organization, faculty, etc.)
- `status` - status (active, inactive, pending, suspended)
- `description`, `fullDescription` - opisy
- `logo`, `coverImage` - grafiki
- `contactEmail`, `contactPhone` - dane kontaktowe
- `socialMedia` - linki do mediów społecznościowych
- `location` - fizyczna lokalizacja
- `memberCount` - liczba członków
- `featured` - wyróżnienie na stronie głównej

**Indeksy:**
- `slug` - unikalne ID dla URL
- `type` - filtrowanie po typach organizacji
- `status` - filtrowanie aktywnych organizacji
- `featured` - wyświetlanie wyróżnionych

---

### 3. **Events** (Wydarzenia)
Kolekcja wydarzeń organizowanych przez organizacje.

**Kluczowe pola:**
- `title` - tytuł wydarzenia
- `slug` - URL-friendly identyfikator (unikalne, indeksowane)
- `organization` - **relacja N:1 do Organizations** (wymagane)
- `eventDate`, `endDate` - daty wydarzenia
- `location`, `locationDetails` - lokalizacja (fizyczna lub online)
- `category` - kategoria (workshop, conference, seminar, etc.)
- `capacity`, `registeredCount` - limity uczestników
- `registrationRequired`, `registrationDeadline` - rejestracja
- `status` - status (upcoming, ongoing, completed, cancelled)
- `featured` - wyróżnienie na stronie głównej
- `organizers` - lista organizatorów (relacja do Users)
- `sponsors` - sponsorzy wydarzenia

**Indeksy:**
- `slug` - unikalne ID dla URL
- `title` - wyszukiwanie pełnotekstowe
- `organization` - filtrowanie wydarzeń organizacji
- `eventDate` - sortowanie i filtrowanie po dacie
- `category` - filtrowanie po kategoriach
- `status` - filtrowanie po statusie
- `featured` - wyświetlanie wyróżnionych

---

### 4. **Media** (Pliki medialne)
Kolekcja przechowująca obrazy i inne pliki multimedialne.

**Kluczowe pola:**
- `alt` - tekst alternatywny dla obrazów
- Automatyczne pola dla przesyłanych plików (URL, rozmiar, typ MIME, etc.)

---

## Relationships (Relacje)

### **1:N Organization → Events**
Każda organizacja może mieć wiele wydarzeń.
- W kolekcji `Events` pole `organization` jest relacją do `Organizations`
- Jest to pole **wymagane** (każde wydarzenie musi być powiązane z organizacją)
- Pole jest **indeksowane** dla wydajnego filtrowania wydarzeń danej organizacji

```typescript
// W Events
{
  name: 'organization',
  type: 'relationship',
  relationTo: 'organizations',
  required: true,
  index: true,
}
```

**Przykładowe zapytania:**
- Wszystkie wydarzenia organizacji X
- Liczba wydarzeń na organizację
- Nadchodzące wydarzenia organizacji Y

---

### **N:1 User → Organization** (opcjonalne)
Wielu użytkowników może należeć do jednej organizacji.
- W kolekcji `Users` pole `organization` jest relacją do `Organizations`
- Jest to pole **opcjonalne** (nie każdy użytkownik musi być w organizacji)
- Pole jest **indeksowane** dla wydajnego filtrowania członków organizacji

```typescript
// W Users
{
  name: 'organization',
  type: 'relationship',
  relationTo: 'organizations',
  index: true,
}
```

**Przykładowe zapytania:**
- Wszyscy członkowie organizacji X
- Administratorzy danej organizacji
- Użytkownicy bez przypisanej organizacji

---

### **M:N Event → Users** (organizers)
Wydarzenie może mieć wielu organizatorów, użytkownik może organizować wiele wydarzeń.
- W kolekcji `Events` pole `organizers` jest tablicą relacji do `Users`
- Pozwala to na elastyczne przypisywanie zespołów organizacyjnych do wydarzeń

```typescript
// W Events
{
  name: 'organizers',
  type: 'array',
  fields: [
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
```

---

### **M:N Media Relations**
Media mogą być używane w wielu miejscach:
- `Users.avatar` → `Media`
- `Organizations.logo`, `Organizations.coverImage` → `Media`
- `Events.image`, `Events.gallery` → `Media`
- `Events.sponsors[].logo` → `Media`

---

## Database Indexes Summary

### Critical Indexes (dla wydajności filtrowania)

**Users:**
- `role` - filtrowanie po rolach
- `organization` - relacja
- `studentId` - wyszukiwanie po numerze indeksu
- `isActive` - filtrowanie aktywnych

**Organizations:**
- `slug` - unikalne, dla URL
- `type` - filtrowanie po typach
- `status` - filtrowanie aktywnych
- `featured` - strona główna

**Events:**
- `slug` - unikalne, dla URL
- `title` - wyszukiwanie
- `organization` - relacja
- `eventDate` - sortowanie/filtrowanie
- `category` - filtrowanie
- `status` - filtrowanie
- `featured` - strona główna

---

## Visual ERD

```
┌─────────────────────┐
│   Organizations     │
│                     │
│ - name              │
│ - slug (unique)     │
│ - type (indexed)    │
│ - status (indexed)  │
│ - description       │
│ - logo              │
│ - contactEmail      │
│ - socialMedia       │
│ - memberCount       │
│ - featured          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ├─────────────────────────┐
           │                         │
           │                         │
    ┌──────▼──────────┐     ┌───────▼─────────┐
    │     Events      │     │      Users      │
    │                 │     │                 │
    │ - title         │     │ - email         │
    │ - slug (unique) │     │ - firstName     │
    │ - organization  │◄────┤ - lastName      │
    │ - eventDate     │ M:N │ - role          │
    │ - location      │     │ - organization  │
    │ - category      │     │ - studentId     │
    │ - status        │     │ - faculty       │
    │ - capacity      │     │ - interests     │
    │ - organizers[]  ├────►│ - isActive      │
    │ - featured      │     │                 │
    └────┬────────────┘     └─────────────────┘
         │
         │ M:N
         │
    ┌────▼──────┐
    │   Media   │
    │           │
    │ - alt     │
    │ - file    │
    └───────────┘
```

---

## Payload CMS Features Used

1. **Relationships** - `type: 'relationship'` z `relationTo`
2. **Indexes** - `index: true` dla optymalizacji zapytań
3. **Unique Constraints** - `unique: true` dla slug i email
4. **Authentication** - `auth: true` dla Users
5. **Uploads** - `upload: true` dla Media
6. **Rich Text** - `type: 'richText'` dla treści
7. **Drafts & Versions** - `versions: { drafts: true }`
8. **Timestamps** - `timestamps: true`
9. **Groups** - `type: 'group'` dla zagnieżdżonych danych
10. **Arrays** - `type: 'array'` dla list
11. **Conditional Fields** - `condition` dla dynamicznych pól
12. **Admin Customization** - `admin.group`, `admin.position`, etc.

---

## Common Query Patterns

### 1. Get all events for an organization
```typescript
const events = await payload.find({
  collection: 'events',
  where: {
    organization: {
      equals: organizationId
    }
  }
})
```

### 2. Get all members of an organization
```typescript
const members = await payload.find({
  collection: 'users',
  where: {
    organization: {
      equals: organizationId
    }
  }
})
```

### 3. Get featured events with organization details
```typescript
const featuredEvents = await payload.find({
  collection: 'events',
  where: {
    featured: {
      equals: true
    },
    status: {
      equals: 'upcoming'
    }
  },
  depth: 2, // Include organization and organizers
  sort: 'eventDate'
})
```

### 4. Get active organizations by type
```typescript
const organizations = await payload.find({
  collection: 'organizations',
  where: {
    status: {
      equals: 'active'
    },
    type: {
      equals: 'scientific-circle'
    }
  }
})
```

---

## Performance Considerations

1. **Indexes są skonfigurowane** na wszystkich polach używanych do:
   - Filtrowania (status, type, category, featured)
   - Sortowania (eventDate)
   - Relacji (organization)
   - Unikalności (slug, email, studentId)

2. **Depth control** - używaj parametru `depth` w zapytaniach aby kontrolować głębokość relacji

3. **Pagination** - Payload automatycznie paginuje wyniki

4. **Caching** - rozważ dodanie cache'owania dla często używanych zapytań

---

## Future Enhancements

Możliwe rozszerzenia schematu:
1. **Attendees** - osobna kolekcja dla uczestników wydarzeń
2. **Comments** - komentarze do wydarzeń
3. **Notifications** - system powiadomień
4. **Calendar Integration** - integracja z kalendarzem
5. **RSVP System** - zaawansowany system rejestracji
6. **Analytics** - statystyki i metryki
7. **Permissions** - bardziej granularne uprawnienia

