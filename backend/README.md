# Spexadmin

Fullstack-applikation för Spexadmin.

## Projektstruktur

```
spexadmin/
├── backend/              # Fastify backend
│   ├── src/
│   │   ├── index.js      # Main server file
│   │   └── routes/
│   │       └── index.js  # API routes
│   ├── .eslintrc.json    # ESLint configuration
│   ├── .prettierrc.json  # Prettier configuration
│   ├── .gitignore
│   ├── package.json
│   └── .env.example
└── README.md
```

## Backend

Backend är byggd med Fastify och följer Airbnb JavaScript Style Guide.

### Installation
```bash
cd backend
npm install
```

### Konfiguration
```bash
cd backend
cp .env.example .env
```

### Användning
```bash
cd backend
npm run dev    # Development mode
npm start      # Production mode
npm run lint   # Check linting
npm run format # Format code
```

### API Endpoints
- `GET /health` - Health check
- `GET /api/hello` - Example endpoint
- `GET /api/users` - Example users endpoint

## Kodstandarder

Projektet följer:
- **Airbnb JavaScript Style Guide**: https://airbnb.io/projects/javascript/
- **ESLint**: Konfigurerad med Airbnb base config
- **Prettier**: För konsekvent kodformattering