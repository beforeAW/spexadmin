# Spexadmin

Fullstack-applikation för Spexadmin. Denna README summerar frontend och backend, installation, miljövariabler samt routing.

## Struktur

```
spexadmin/
├── backend/   # Fastify + TypeScript + Mongoose
└── frontend/  # React + TypeScript + Vite + Tailwind
```

## Snabbstart

- Backend
	```bash
	cd backend
	npm install
	npm run dev
	```

- Frontend
	```bash
	cd frontend
	npm install
	npm run dev
	```

Öppna http://localhost:5173 för frontend. Backend lyssnar normalt på http://localhost:3000.

## Frontend (sammanfattning)

- Stack: React 18, TypeScript, Vite, Tailwind CSS v4, ESLint (Airbnb), Prettier.
- Miljövariabel: `VITE_API_BASE_URL` (ex. `https://spexadmin.onrender.com`).
	- Om saknas: i produktion fallback till `https://spexadmin.onrender.com`, i dev `http://localhost:3000`.
	- Tips: undvik avslutande slash.
- Auth: 401-svar loggar ut automatiskt och redirectar till `/login`.
- Header/Footer: döljs på `/`, `/login` och `/register`; visas på övriga sidor.
- Rollbaserad navigation:
	- Dashboard: `admin` eller `manager`
	- Events: alla inloggade
	- Groups: `admin`, `manager` eller `groupmanager`
	- Users: endast `admin`
	- Profile/Settings: alla inloggade
	- Register-länkar är borttagna från header/footer.

### Frontend-sitemap

- `/` → Start (renderar LoginPage)
- `/login` → Inloggning (utan header/footer)
- `/register` → Registrering (utan header/footer)
- `/profile` → Profil (kräver inloggning; login/registration redirect hit vid lyckad auth)
- `/settings` → Inställningar (kräver inloggning)
- `/events` → Evenemangslista
- `/events/:id` → Evenemangsdetaljer
- `/groups` → Grupphantering (admin/manager/groupmanager)
- `/users` → Användarhantering (admin)
- `/dashboard` → Översikt (admin/manager)

## Backend (sammanfattning)

- Stack: Fastify 4, TypeScript, JWT (`@fastify/jwt`), Helmet/CORS, MongoDB via Mongoose.
- Miljövariabler:
	- `PORT` (default 3000), `HOST` (default `0.0.0.0`)
	- `JWT_SECRET` (krävs i produktion)
	- `MONGODB_URI` (server-URI; utan databassökväg rekommenderas)
	- `MONGODB_DB_NAME` (explicit databasnamn; undviker case-konflikter)
- Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`, `npm run lint:fix`, `npm run format`.

### API-översikt

- Bas: `GET /` (API-info), `GET /health`, `GET /favicon.ico` (204)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Current user: `GET/PUT /api/users/me`, `PUT /api/users/me/password`, `PUT /api/users/me/preferences`
- Users: `GET /api/users`, `POST /api/users` (admin), `GET/PUT/DELETE /api/users/:id`
- Admin: `GET /api/admin/users`, `GET /api/admin/users/:userId`, `POST /api/admin/users`
- Groups: `GET/POST /api/groups`, `GET/PUT/DELETE /api/groups/:groupId`, members/managers add/remove
- Events: `GET/POST /api/events`, `GET/PUT/DELETE /api/events/:id`, `GET /api/events/search`
- RSVPs: `POST/DELETE /api/events/:eventId/rsvp/:userId`, `GET /api/users/:userId/events`, `GET /api/users/:userId/available-events`
- Dashboard: `GET /api/dashboard/stats` (admin/manager)

## Kodstandarder

- Airbnb JavaScript/TypeScript Style Guide
- ESLint + Prettier
- React best practices