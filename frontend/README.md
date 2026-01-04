# Spexadmin Frontend

React + TypeScript + Tailwind CSS v4 frontend med ESLint/Prettier enligt Airbnb Style Guide.

## Installation

```bash
npm install
```

## Utveckling

```bash
npm run dev
```

Öppna http://localhost:5173 i din webbläsare.

## Bygga och förhandsgranska

```bash
npm run build     # Bygg produktion
npm run preview   # Förhandsgranska byggd app
```

## Lint & format

```bash
npm run lint      # Kontrollera lint
npm run lint:fix  # Auto-fixa lintfel
npm run format    # Prettier-formattering
```

## Teknisk stack

- React 18 (SPA med React Router)
- TypeScript
- Vite (dev-server/build)
- Tailwind CSS v4
- ESLint + Airbnb TypeScript
- Prettier

## Miljövariabler & API

- `VITE_API_BASE_URL`: Bas-URL till backend (ex. `https://spexadmin.onrender.com`).
  - Tips: undvik avslutande slash (t.ex. `.../onrender.com`, inte `.../onrender.com/`).
- Om variabeln saknas:
  - I produktion: fallback till `https://spexadmin.onrender.com`.
  - I utveckling: fallback till `http://localhost:3000`.
- 401-svar från API triggar automatisk utloggning och redirect till `/login`.

## Layout och navigering

- Header/Footer:
  - Döljs på `/` (start), `/login` och `/register` för ren inloggning/registrering.
  - Visas på övriga sidor.
- Rollbaserad navigation (styr vad användaren ser):
  - `Dashboard`: endast `admin` eller `manager`.
  - `Events`: alla inloggade.
  - `Groups`: `admin`, `manager` eller `groupmanager`.
  - `Users`: endast `admin`.
  - `Profile` och `Settings`: alla inloggade.
  - `Register`-länkar är borttagna från header/footer.

## Sitemap (Routing)

- `/` → Start (renderar LoginPage)
- `/login` → Inloggning (utan header/footer)
- `/register` → Registrering (utan header/footer)
- `/profile` → Profil (kräver inloggning)
- `/settings` → Inställningar (kräver inloggning)
- `/events` → Evenemangslista
- `/events/:id` → Evenemangsdetaljer
- `/groups` → Grupphantering (admin/manager/groupmanager)
- `/users` → Användarhantering (admin)
- `/dashboard` → Översikt (admin/manager)

## Sidor och beteende

- LoginPage: sparar `{ token, user }` i `localStorage` och redirectar till `/profile` vid lyckad inloggning.
- RegisterPage: vid lyckad registrering sparas auth och redirect till `/profile`.
- SettingsPage: hanterar profil, lösenord och preferenser; stöd för `foodpreference`/`allergys` som sträng eller lista.
- ProfilePage: hämtar aktuell användare (`/api/users/me`), redirectar till `/login` om obehörig.

## Backend-anslutning (dev)

- Kör backend på port 3000 eller ange `VITE_API_BASE_URL` till korrekt host.
- API-anrop centraliseras i `src/utils/api.ts` (hanterar headers, auth, felmeddelanden).

## Kodstandarder

- Airbnb JavaScript/TypeScript Style Guide
- React best practices
