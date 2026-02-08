# Urban Home School Frontend

React + TypeScript + Tailwind CSS frontend for the Urban Home School application.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Modern development setup with ESLint and TypeScript checking
- Ready for API integration with backend

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── utils/         # Utility functions
├── App.tsx        # Main app component
├── main.tsx       # Application entry point
└── index.css      # Global styles
```

## Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

### Custom Styles

Add custom styles to `src/App.css` or create new CSS modules.

## API Integration

The frontend is configured to work with the FastAPI backend running on `localhost:8000`.

Example API service structure:

```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:8000/api';

export const studentService = {
  getAll: () => fetch(`${API_BASE}/students`).then(res => res.json()),
  getById: (id: number) => fetch(`${API_BASE}/students/${id}`).then(res => res.json()),
  create: (student: Student) => fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  }).then(res => res.json())
};
```

## Development

### Code Formatting

The project uses ESLint for code quality. Run:

```bash
npm run lint
```

### Type Checking

TypeScript provides type safety. Run:

```bash
npx tsc --noEmit
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

The project is ready for deployment to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Azure Static Web Apps