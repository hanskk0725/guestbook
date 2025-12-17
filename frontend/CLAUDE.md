# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

This is a Next.js 16 frontend for a guestbook application using React 19 and Tailwind CSS v4.

### Tech Stack
- Next.js 16 with App Router
- React 19 with hooks (useState, useEffect)
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin

### Project Structure
- `app/` - Next.js App Router directory
  - `layout.js` - Root layout component
  - `page.js` - Main guestbook page (client component)
  - `globals.css` - Tailwind CSS import

### Backend Integration
- API endpoint: `http://localhost:8080/api/guestbook`
- Requires the Spring Boot backend to be running on port 8080
- Uses fetch API for GET (list) and POST (create) operations

### Tailwind CSS v4 Configuration
This project uses Tailwind CSS v4 which has a different setup than v3:
- PostCSS uses `@tailwindcss/postcss` plugin instead of `tailwindcss`
- CSS imports use `@import "tailwindcss"` syntax