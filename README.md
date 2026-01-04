# Spexadmin

Fullstack-applikation för Spexadmin.

## Projektstruktur

```
spexadmin/
├── backend/              # Fastify backend (TypeScript)
│   ├── src/
│   │   ├── index.ts      # Main server file
│   │   └── routes/
│   │       └── index.ts  # API routes
│   ├── dist/             # Compiled JavaScript
│   ├── .eslintrc.json    # ESLint configuration
│   ├── .prettierrc.json  # Prettier configuration
│   ├── tsconfig.json     # TypeScript configuration
│   ├── .gitignore
│   ├── package.json
│   └── .env.example
└── README.md
```

## Backend

Backend är byggd med Fastify, TypeScript och MongoDB och följer Airbnb JavaScript/TypeScript Style Guide.

### Installation
```bash
cd backend
npm install
```

### MongoDB Setup
Ensure MongoDB is running locally or configure your connection string in `.env`:
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/spexadmin

# Or MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spexadmin
```

### Konfiguration
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### Användning
```bash
cd backendGet all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
npm run dev    # Development mode (tsx watch)
npm run build  # Build TypeScript to JavaScript
npm start      # Production mode (runs compiled code)
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
- **Airbnb TypeScript Style Guide**: https://github.com/airbnb/javascript
- **ESLint**: Konfigurerad med Airbnb base + TypeScript config
- **Prettier**: För konsekvent kodformattering
- **TypeScript**: För typsäkerhet och bättre utvecklarupplevelse