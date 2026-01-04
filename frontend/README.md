# Spexadmin Frontend

React + TypeScript + Tailwind CSS v4 frontend med ESLint och Prettier konfiguration enligt Airbnb Style Guide.

## Installation

```bash
npm install
```

## Användning

### Development mode
```bash
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i din webbläsare.

### Build
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

### Linting
```bash
npm run lint      # Check linting
npm run lint:fix  # Auto-fix linting errors
```

### Formattering
```bash
npm run format
```

## Teknisk stack

- **React 18** - UI bibliotek
- **TypeScript** - Type-safe utveckling
- **Vite** - Build tool och dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Linting med Airbnb style guide
- **Prettier** - Code formatting

## API Integration

Frontenden är konfigurerad att kommunicera med backend via proxy:
- `/api/*` routes proxas till `http://localhost:3000`

Se till att backend körs på port 3000.

## Kodstandarder

Projektet följer:
- **Airbnb JavaScript Style Guide**
- **Airbnb TypeScript Style Guide**
- **Airbnb CSS Style Guide**
- **React Best Practices**
