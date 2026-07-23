# Smart Office Library Frontend

Production-ready frontend foundation for an enterprise React application.

## Tech Stack

- React 19
- TypeScript
- Vite
- Material UI
- React Router v7
- TanStack Query
- Axios
- React Hook Form
- Zod

## Architecture

```
src/
  components/
  pages/
  layouts/
  routes/
  hooks/
  context/
  services/
  api/
  utils/
  types/
  assets/
```

## Implemented Foundation

- App-level routing with protected route handling
- Theme provider with centralized MUI theme
- Authentication context and custom auth hook
- Enterprise shell components: sidebar, navbar, layout
- Shared loading screen
- Error page and not found page
- Axios instance with request/response interceptors
- ESLint configuration for React + TypeScript + Vite
- Prettier formatting configuration

## Environment Variables

Create `.env` file in frontend root:

```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- No business features are implemented by design.
- Service layer and route placeholders are ready for module expansion.
